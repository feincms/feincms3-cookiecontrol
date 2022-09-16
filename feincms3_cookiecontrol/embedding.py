from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import format_html, mark_safe
from feincms3.embedding import embed_vimeo, embed_youtube


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
}


def get_providers():
    return {
        **EMBED_PROVIDERS,
        **getattr(settings, "EMBED_PROVIDERS", {}),
    }


def embed(url):
    for provider, config in get_providers().items():
        if (handler := config.get("handler")) and (html := handler(url)) is not None:
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
