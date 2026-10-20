======================
feincms3-cookiecontrol
======================

Despite its name and the fact that it is documented as a part of
feincms3, feincms3-cookiecontrol can also be used standalone.

.. image:: docs/banner.png
   :width: 400
   :alt: The cookie banner


Cookie control
==============

Some jurisidictions require the the users' consent before adding analytics
scripts and tracking cookies. While it may be best to not use any analytics and
tracking at all this may not be possible or even desirable in all
circumstances.

Many solutions exist for adding a consent banner to the website. Some of those
banners require loading JavaScript and other assets from external servers. This
raises some questions because loading those scripts may also be seen as
tracking already. It is certainly safer to implement a cookie control panel
locally. It would be boring to start from scratch on each site.

This guide explains how to use `feincms3-cookiecontrol <https://github.com/feincms/feincms3-cookiecontrol/>`__.

Installation
~~~~~~~~~~~~

Install the package:

.. code-block:: shell

    pip install feincms3-cookiecontrol

Add ``feincms3_cookiecontrol`` to ``INSTALLED_APPS``:

.. code-block:: python

    INSTALLED_APPS = [
        # ...
        "feincms3_cookiecontrol",
    ]

Apply the initial migration:

.. code-block:: shell

    python manage.py migrate

Add the panel to the template, e.g. in ``base.html`` at the end of the
``<body>`` element:

.. code-block:: html+django

    <!doctype html>
    <html>
      ...
      <body>
        ...
        {% load feincms3_cookiecontrol %}{% feincms3_cookiecontrol %}
      </body>
    </html>

You'll have to add all tracking scripts yourself now.

The presentation of the panel is a fixed banner at the bottom of the
viewport. Once any cookies have been accepted (essential cookies have to be
accepted, e.g. the CSRF cookie) the banner is replaced by a single button which
allows showing the control panel again.


Customize the appearance
~~~~~~~~~~~~~~~~~~~~~~~~

The default colors of the control panel may not fit into your site. The best
way to customize the appearance is to set a few CSS variables, e.g.:

.. code-block:: css

    .f3cc {
      --f3cc-background: #e9e9e9;
      --f3cc-foreground: #000000;
      --f3cc-button-background: #cbcbcb;
      --f3cc-accept-background: #90f690;
      --f3cc-button-foreground: #cbcbcb;
      --f3cc-accept-foreground: #cbcbcb;
    }

It's recommended to set all variables if you set a single one; the exception is
``--f3cc-button-foreground`` which defaults to the value of
``--f3cc-foreground`` and ``--f3cc-accept-foreground`` which defaults to the
value of ``--f3cc-button-foreground``.


Hiding the modify button
~~~~~~~~~~~~~~~~~~~~~~~~

You may want to suppress the button to modify the consent on some pages, for
example on all pages except for the privacy policy. A good way to achieve this
follows.

Let's assume you're using page types as described in the feincms3 templates and
regions guide. Let's also assume that your privacy policy page uses the
standard page type described in the guide:

.. code-block:: python

    class Page(AbstractPage, PageTypeMixin):
        TYPES = [
            TemplateType(
                key="standard",
                title=_("standard"),
                template_name="pages/standard.html",
                regions=[
                    Region(key="main", title=_("Main")),
                ],
            ),
        ]

We will add an additional page type which can be used as a marker. Since we're
using feincms3 apps be sure to read the introduction to feincms3 apps if you
haven't done this already. You may also want to take a look at the feincms3
root passthru reference.

.. code-block:: python

    class Page(AbstractPage, PageTypeMixin):
        TYPES = [
            TemplateType(
                key="standard",
                title=_("standard"),
                template_name="pages/standard.html",
                regions=[
                    Region(key="main", title=_("Main")),
                ],
            ),
            ApplicationType(
                key="privacy-policy",
                title=_("privacy policy"),
                urlconf="feincms3.root.passthru",
                template_name="pages/standard.html",
                regions=[
                    Region(key="main", title=_("Main")),
                ],
            ),
        ]

.. note::
   We cannot just use a new ``TemplateType`` because we **only** want to hide
   the button on all other pages if a privacy policy page actually exists!

Now you can extend the ``page_context`` helper:

.. code-block:: python

    from feincms3.root.passthru import reverse_passthru

    def page_context(request, *, page=None):
        ...
        context = {
            ...
        }
        if url := reverse_passthru("privacy-policy", fallback=None):
            context["privacy_policy_url"] = request.build_absolute_uri(url)
        return context

Now you can use this additional variable in the template:

.. code-block:: html+django

    <!doctype html>
    <html>
      ...
      <body>
        ...
        {% load feincms3_cookiecontrol %}
        {% feincms3_cookiecontrol privacy_policy_url=privacy_policy_url %}
      </body>
    </html>

The frontend code will automatically add a link to the privacy policy to the
banner's content and will only show the modify button if the current location
matches the privacy policy's URL.


Using the panel from a different site
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The panel can be integrated into another site by following these steps.

Set the domain for the cookie so that the cookie is available on subdomains (be
sure to check the relevant guides to understand what the problems may be when
doing this and what restrictions you have to honor):

.. code-block:: python

    COOKIECONTROL = {"domain": "example.com"}

Add the view and optionally provide the privacy policy URL:

.. code-block:: python

    from feincms3.root.passthru import reverse_passthru_lazy
    from feincms3_cookiecontrol.views import inject

    urlpatterns = [
        # Base case
        path("f3cc-inject.js", inject),

        # Using reverse_passthru_lazy.
        # NOTE! The inject view uses `request.build_absolute_uri` to
        # complete the URL, you do not have to add the domain and
        # protocol yourself here.
        path(
            "f3cc-inject.js",
            inject,
            {"privacy_policy_url": reverse_passthru_lazy("privacy-policy", fallback="/")},
        ),
    ]

Embed the script:

.. code-block:: html

    <script async src="https://example.com/f3cc-inject.js"></script>

.. note::
   The preferred way to embed the panel is using the template tag. The template
   tag method only requires an additional request for a static asset while the
   method using a view requires an additional request to a view.


Google Consent Mode
~~~~~~~~~~~~~~~~~~~

Google Tag Manager and the Google tags it loads expect to be told about the
visitor's consent through `Consent Mode
<https://developers.google.com/tag-platform/security/concepts/consent-mode>`__.
Google describes two ways of implementing it, basic and advanced. Use one or
the other, never both.

**Basic:** Google's scripts are only loaded after the visitor has accepted all
cookies, which is what the package does anyway. GTM doesn't go into your
templates at all; ``base.html`` only contains the banner as usual:

.. code-block:: html+django

    {% load feincms3_cookiecontrol %}
    <!doctype html>
    <html>
      <head>
        ...
      </head>
      <body>
        ...
        {% feincms3_cookiecontrol %}
      </body>
    </html>

Add a cookie control script in the Django admin instead, containing the
consent defaults followed by the GTM snippet. All four consent signals are
``granted``, which is the truth by the time the script is injected:

.. code-block:: html

    <script>
      window.dataLayer = window.dataLayer || []
      function gtag() { dataLayer.push(arguments) }
      gtag("consent", "default", {
        ad_user_data: "granted",
        ad_personalization: "granted",
        ad_storage: "granted",
        analytics_storage: "granted",
      })
    </script>
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>

**Advanced:** GTM is loaded on every page, with all signals defaulting to
``denied``. Until the visitor accepts, Google sets no cookies and sends
cookieless pings instead, which Google uses to model the conversions it
doesn't observe. Load ``f3cc/consent-mode-advanced.js`` synchronously in the
``<head>``, *before* the GTM snippet, and add the GTM snippet to the template
itself instead of to a cookie control script (and don't add the basic mode's
script either):

.. code-block:: html+django

    {% load feincms3_cookiecontrol static %}
    <!doctype html>
    <html>
      <head>
        ...
        <script src="{% static 'f3cc/consent-mode-advanced.js' %}"></script>
        <!-- Google Tag Manager -->
        <script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
      </head>
      <body>
        ...
        {% feincms3_cookiecontrol %}
      </body>
    </html>

The banner tag stays where it always is, at the end of the ``<body>``
element; it dispatches the events which ``consent-mode-advanced.js`` turns
into consent updates.

The script sets the defaults to ``denied`` and enables
``ads_data_redaction``. It updates the signals to ``granted`` when the
visitor accepts all cookies (or has done so on an earlier visit), and back to
``denied`` when they withdraw their consent using the modify button.

.. warning::
   Advanced mode means that Google is contacted **before and regardless of**
   the visitor's decision. Loading GTM transmits the IP address, the user
   agent and the page URL on every page view, and the cookieless pings send
   the consent state, the page URL and the user agent. "Denied" only means
   that no cookies are set and that the data isn't used for personalised
   advertising.

   Whether that's acceptable is a legal question, not a technical one. It is
   contested under the ePrivacy directive in the EU, and it changes what the
   "refuse" button in the banner actually means. Make that decision
   deliberately and describe it accurately in your privacy policy.

The banner's default texts are written for the basic case; refusing
non-essential cookies stays literally true, but the description suggests
that nothing is sent to Google without consent. Adjust at least the
description through the ``COOKIECONTROL`` setting, e.g.:

.. code-block:: python

    from django.utils.translation import gettext_lazy as _

    COOKIECONTROL = {
        "description": _(
            "We use Google Tag Manager on every page. Without your consent,"
            " Google sets no cookies, but still receives technical data such as"
            " your IP address and the visited page. Read our {link_start}privacy"
            " policy{link_end} to find out more."
        ),
    }

``{link_start}`` and ``{link_end}`` are replaced with a link to the privacy
policy if ``privacy_policy_url`` is passed to the template tag, and removed
otherwise. ``heading``, ``buttonAccept`` and ``buttonReject`` can be
overridden the same way.


Selectively embed iframes or other third party scripts
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. image:: docs/embed.png
   :width: 400
   :alt: Consciously embed a YouTube video

If users do not consent to your cookie policy, embedding third party scripts or
iframes might violate data protection laws, since personal data is transfered
to a third party without the users knowledge or consent. One way is to disable
third party content alltogether or selectively asking users to consent to the
data policies of specific providers. The letter is accomplished by the
'conscious embed' functionality.

You have to install the ``feincms3-cookiecontrol[embedding]`` extra for this to
work.

Extend default providers in your ``settings.py``:

.. code-block:: python

    EMBED_PROVIDERS = {
        "some-provider": {
            "title": "Mailchimp",
            "privacy_policy_url": "https://mailchimp.com/legal/privacy/",
        },
    }

Surround the embedded code with the template block ``embed``:

.. code-block:: html

    ...
    {% load feincms3_cookiecontrol %}
    ...
    <div class="container">
        {% wrap "mailchimp" %}
        <script src="https://some-provider.com/example.js"></script>
        {% endwrap %}
    </div>
    ...

Users that did not consent to your general cookie policy will now get asked to allow
embedding content of specific providers.

You can also wrap your default renderer for embedded content plugins like
``feincms3.plugins.external`` or ``feincms3.embedding``, but you have to
explicitly specify the provider (as above with the ``{% wrap %}``
template tag).

If HTML is added dynamically to the site which contains such embedded fragments
you have to call the ``f3ccRenderEmbeds()`` JavaScript function yourself to
embed the third party content which has already been accepted by the user.


Automatically embedding content using an URL only
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The ``feincms3_cookiecontrol.embedding`` module also offers an ``embed``
function where you can only pass an URL and either you get back the wrapped
embed code or nothing at all. You may also specify your own embed providers; in
this case you should also add a ``handler`` key to the ``EMBED_PROVIDERS``
setting; the function only receives the URL and returns either the embedding
HTML or ``None`` if the URL isn't using the provider at all. At the time of
writing the module supports embedding YouTube and Vimeo URLs.

You may use the ``embed`` shortcut as follows:

.. code-block:: python

    # ...
    from feincms3_cookiecontrol.embedding import embed
    # ...
    class EmbeddedVideo(plugins.external.External, PagePlugin):
        # ...
        def embedded_html(self):
            return embed(self.url)

The same functionality is also available directly in templates:

.. code-block:: html

    ...
    {% load feincms3_cookiecontrol %}
    {% embed plugin.url %}
    ...


Embedding arbitrary content using oEmbed
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

For URLs not handled by any of the providers above you can fall back to
``feincms3_cookiecontrol.embedding.oembed``. It fetches the embed code using
`oEmbed <https://oembed.com/>`__ and wraps it in a
``<div class="responsive-embed widescreen {provider}">`` element inside the
usual consent prompt. The provider is the slugified ``provider_name`` of the
oEmbed response, so consent is given per oEmbed provider.

By default ``oembed`` uses ``feincms3.plugins.external.oembed_json`` which asks
`Noembed <https://noembed.com/>`__ for the embed code. Asking a third party
service may not be what you want; pass your own ``oembed_json`` callable
instead. It receives the URL and has to return the oEmbed response as a
dictionary, or a falsy value if the URL cannot be embedded. Using
`micawber <https://micawber.readthedocs.io/>`__ which talks to the providers
directly:

.. code-block:: python

    # app/oembed.py
    from django.core.cache import cache
    from micawber import ProviderException, bootstrap_basic, bootstrap_oembed

    providers = bootstrap_oembed(cache, registry=bootstrap_basic(), timeout=5)


    def oembed_json(url):
        try:
            return providers.request(url)
        except ProviderException:
            return None

Try the built-in providers first and only fall back to oEmbed afterwards, e.g.
in a renderer for a plugin with an ``url`` field:

.. code-block:: python

    from feincms3_cookiecontrol.embedding import embed, oembed

    from app.oembed import oembed_json


    def render_external(plugin, context):
        return embed(plugin.url) or oembed(plugin.url, oembed_json=oembed_json)

Both functions return an empty string if they cannot embed the URL. Note that
the embed code is used as-is, so only use ``oembed`` with URLs entered by
trusted users. You probably want some CSS to size the embeds, for example:

.. code-block:: css

    .responsive-embed,
    .f3cc-embed {
      aspect-ratio: 16 / 9;
    }

    .responsive-embed {
      position: relative;
    }

    .responsive-embed iframe {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
