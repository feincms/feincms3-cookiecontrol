from functools import reduce

from django import template
from django.conf import settings
from django.core.cache import cache
from django.utils.translation import get_language

from feincms3_cookiecontrol.models import CookieCategory, CookieScript


register = template.Library()


COOKIECONTROL_PANEL_DEFAULTS = {"panel_heading": _("..."), "panel_content": _("...")}


@register.inclusion_tag("feincms3_cookiecontrol/panel.html")
def ccp_panel(page):
    CACHE_KEY = f"feincms3_cookiecontrol_settings_{get_language()}"

    panel = cache.get(CACHE_KEY)
    if not panel:
        panel = COOKIECONTROL_PANEL_DEFAULTS.copy()
        panel.update()
        panel = {
            **COOKIECONTROL_PANEL_DEFAULTS,
            **getattr(settings, "COOKIECONTROL_PANEL_DEFAULTS", {}),
            "groups": [t.serialize() for t in CookieCategory.objects.all()],
            "cookies": [t.serialize() for t in CookieScript.objects.all()],
        }
        cache.set(CACHE_KEY, panel)

    legal_page = panel.legal_page if panel else None

    """
    only show revoke button on legal_page and its translations
    """
    if legal_page and not (page == legal_page or page in legal_page.translations()):
        panel.pop("revoke")

    return panel
