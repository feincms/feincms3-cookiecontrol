from django import template
from django.conf import settings
from django.core.cache import cache
from django.utils.translation import get_language, pgettext_lazy

from feincms3_cookiecontrol.models import CookieCategory


register = template.Library()


COOKIECONTROL_PANEL_DEFAULTS = {
    "panel": {
        "heading": pgettext_lazy("f3cc", "Your Cookie Settings Protect Your Privacy"),
        "content": pgettext_lazy("f3cc", "Panel content"),
        "buttonSave": pgettext_lazy("f3cc", "Save settings"),
        "buttonCancel": pgettext_lazy("f3cc", "Cancel"),
    },
    "banner": {
        "heading": pgettext_lazy("f3cc", "Cookies on Our Website"),
        "content": pgettext_lazy("f3cc", "Banner content"),
        "buttonAccept": pgettext_lazy("f3cc", "Accept all"),
        "buttonPanel": pgettext_lazy("f3cc", "Modify settings"),
    },
    "revoke": {
        "buttonPanel": pgettext_lazy("f3cc", "Modify/revoke cookie settings"),
    },
    "legalPage": None,
}

CACHE_TIMEOUT = 60 * 60 * 24


def panel_data():
    setup = COOKIECONTROL_PANEL_DEFAULTS
    setup.update(getattr(settings, "COOKIECONTROL", {}))
    categories = CookieCategory.objects.prefetch_related("cookiescript_set")
    return {
        **setup,
        "categories": {t.name: t.serialize() for t in categories},
    }


@register.inclusion_tag("feincms3_cookiecontrol/panel.html")
def feincms3_cookiecontrol_panel(page):
    CACHE_KEY = f"feincms3_cookiecontrol_settings_{get_language()}"

    panel = cache.get(CACHE_KEY)
    if not panel:
        panel = panel_data()
        cache.set(CACHE_KEY, panel, timeout=CACHE_TIMEOUT)

    # only show revoke button on legal_page
    if (
        panel["legalPage"]
        and hasattr(page, "translations")
        and panel["legalPage"] not in {p.id for p in page.translations()}
    ):
        panel.pop("revoke")

    return {"panel": panel}
