from django.template.loader import render_to_string

from feincms3_cookiecontrol.models import get_conscious_embed_defaults


def conscious_embed_context(embedded_html):
    provider = None
    privacy_policy_url = None
    defaults = get_conscious_embed_defaults()

    for default_provider in defaults:
        # TODO: Maybe only search "src" attributes of "iframe" and "script" tags
        if default_provider in embedded_html:
            provider = default_provider
            privacy_policy_url = defaults[default_provider]
            break

    # TODO: Maybe warn if provider and privacy_policy_url are missing in defaults.

    return {
        "embedded_html": embedded_html,
        "provider": provider,
        "privacy_policy_url": privacy_policy_url,
    }


def render_external_consciously(embedded_html):
    """
    Wraps default external render functions e.g. feincms3.plugins.external.render_external.
    Returns embedded html with selective consent mode.
    """
    return render_to_string(
        "feincms3_cookiecontrol/conscious_embed.html",
        conscious_embed_context(embedded_html),
    )
