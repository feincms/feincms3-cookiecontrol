from django.conf import settings
from django.template.loader import render_to_string
from feincms3.embedding import embed_vimeo, embed_youtube


CONSCIOUS_EMBED_PROVIDERS = [
    {
        "handler": embed_youtube,
        "provider": "YouTube",
        "privacy_policy_url": "https://policies.google.com/privacy",
    },
    {
        "handler": embed_vimeo,
        "provider": "Vimeo",
        "privacy_policy_url": "https://vimeo.com/privacy",
    },
]


def get_providers():
    return (
        getattr(settings, "CONSCIOUS_EMBED_PROVIDERS", []) + CONSCIOUS_EMBED_PROVIDERS
    )


def embed(url):
    for provider in get_providers():
        if (html := provider["handler"](url)) is not None:
            return render_to_string(
                "feincms3_cookiecontrol/conscious_embed.html",
                {
                    "embedded_html": html,
                    **provider,
                },
            )
    return ""
