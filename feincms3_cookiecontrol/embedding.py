import re

from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import format_html, mark_safe
from django.utils.translation import get_language
from feincms3.embedding import embed_vimeo, embed_youtube


RAISENOW_LEMA_RE = re.compile(
    r"""widget\.raisenow\.com/widgets/lema/(?P<code>[-\w]+)/js/dds-init-widget""",
    re.I,
)
RAISENOW_TAMARO_RE = re.compile(
    r"""tamaro\.raisenow\.com/(?P<code>[-\w+]+)/latest/widget.js""",
    re.I,
)


def embed_raisenow(url):
    if match := RAISENOW_LEMA_RE.search(url):
        d = match.groupdict()
        return mark_safe(
            f"""\
<div class="dds-widget-container" data-widget="lema"></div>
<script src="https://widget.raisenow.com/widgets/lema/{d["code"]}/js/dds-init-widget-{get_language()[:2]}.js"></script>
"""
        )
    if match := RAISENOW_TAMARO_RE.search(url):
        d = match.groupdict()
        return mark_safe(
            f"""\
<div class="rnw-widget-container"></div>
<script src="https://tamaro.raisenow.com/{d["code"]}/latest/widget.js"></script>
<script>window.rnw.tamaro.runWidget('.rnw-widget-container', {{ language: '{get_language()[:2]}' }})</script>
"""
        )
    return None


# This isn't a list of recommended third party providers.
# Additions are welcome, especially those including a handler.
EMBED_PROVIDERS = {
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
        "handler": embed_raisenow,
        "title": "RaiseNow",
        "privacy_policy_url": "https://www.raisenow.com/privacy-policy",
    },
}


def get_providers():
    return {
        **EMBED_PROVIDERS,
        **getattr(settings, "EMBED_PROVIDERS", {}),
    }


def embed(url):
    for provider, config in get_providers().items():
        if (handler := config["handler"]) and (html := handler(url)) is not None:
            return render_to_string(
                "feincms3_cookiecontrol/embed.html",
                {
                    "embedded_html": html,
                    "provider": provider,
                    "link_start": format_html(
                        '<a href="{}" target="_blank" rel="noopener">',
                        config["privacy_policy_url"],
                    ),
                    "link_end": mark_safe("</a>"),
                    **config,
                },
            )
    return ""


def wrap(provider, html):
    config = get_providers()[provider]
    return render_to_string(
        "feincms3_cookiecontrol/embed.html",
        {
            "embedded_html": html,
            "provider": provider,
            "link_start": format_html(
                '<a href="{}" target="_blank" rel="noopener">',
                config["privacy_policy_url"],
            ),
            "link_end": mark_safe("</a>"),
            **config,
        },
    )
