from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import format_html, mark_safe
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


def embed(url):
    for provider, config in _providers.items():
        if (handler := config["handler"]) and (html := handler(url)) is not None:
            return _render(html, provider, config)
    return ""


def wrap(provider, html):
    return _render(html, provider, _providers[provider])


def _render(html, provider, config):
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
