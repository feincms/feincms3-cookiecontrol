from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import format_html
from django.utils.translation import pgettext, pgettext_lazy
from feincms3.embedding import embed_vimeo, embed_youtube


__all__ = ["embed", "wrap"]


# This isn't a list of recommended third party providers.
# Additions are welcome, especially those including a handler.
_providers = {
    "youtube": {
        "handler": embed_youtube,
        "title": "YouTube",
        "privacy_policy_url": "https://policies.google.com/privacy",
    },
    "vimeo": {
        "handler": embed_vimeo,
        "title": "Vimeo",
        "privacy_policy_url": "https://vimeo.com/privacy",
    },
    "google": {
        "handler": None,
        "title": "Google",
        "privacy_policy_url": "https://policies.google.com/privacy",
    },
    "mailchimp": {
        "handler": None,
        "title": "Mailchimp",
        "privacy_policy_url": "https://mailchimp.com/legal/privacy/",
    },
    "cleverreach": {
        "handler": None,
        "title": "CleverReach",
        "privacy_policy_url": "http://www.cleverreach.com/privacy-policy/",
    },
    "raisenow": {
        "handler": None,
        "title": "RaiseNow",
        "privacy_policy_url": "https://www.raisenow.com/privacy-policy",
    },
}
_providers.update(getattr(settings, "EMBED_PROVIDERS", {}))

_default_description = pgettext_lazy(
    "f3cc",
    "We would like to show you content from the provider %(title)s, but respect your privacy. If you agree to the provider's privacy policy, please click the following button to view the content.",
)
_default_button = pgettext_lazy("f3cc", "Show the content")


def embed(url):
    for provider, config in _providers.items():
        if (handler := config["handler"]) and (html := handler(url)) is not None:
            return _render(html, provider, config)
    return ""


def wrap(provider, html, **kwargs):
    return _render(html, provider, _providers[provider], **kwargs)


def oembed(url):
    from feincms3.plugins.external import oembed_json

    if (data := oembed_json(url)) and (html := data.get("html")):
        provider_name = data.get("provider_name", "")
        return render_to_string(
            "feincms3_cookiecontrol/embed.html",
            {
                "embedded_html": f'<div class="responsive-embed widescreen">{html}</div>',
                "provider": provider_name,
                "privacy_policy_link": "",
                "description": _default_description % {"title": provider_name},
                "button": _default_button,
            },
        )
    return ""


def _render(html, provider, config, *, description=None, button=None):
    return render_to_string(
        "feincms3_cookiecontrol/embed.html",
        {
            "embedded_html": html,
            "provider": provider,
            "privacy_policy_link": format_html(
                '<a href="{}" target="_blank" rel="noopener">{}</a>',
                config["privacy_policy_url"],
                pgettext("f3cc", "Privacy policy"),
            ),
            "description": description or (_default_description % config),
            "button": button or _default_button,
            **config,
        },
    )
