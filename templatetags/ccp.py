from functools import reduce

from django import template
from django.core.cache import cache
from django.utils.translation import get_language

from fh_cookiecontrol.models import PanelSetup, TrackingCategory, TrackingScript


register = template.Library()


@register.inclusion_tag("panel.html")
def ccp_panel(page):
    CACHE_KEY = f"ccp_settings_{get_language()}"

    settings = cache.get(CACHE_KEY)
    if not settings:
        settings = {
            "settings": {
                **ld2d(PanelSetup.objects.all()),
                "groups": ld2d(TrackingCategory.objects.all()),
                "cookies": ld2d(TrackingScript.objects.all()),
            },
        }
        cache.set(CACHE_KEY, settings)

    setup = PanelSetup.objects.select_related("legal_page").first()
    legal_page = setup.legal_page if setup else None

    """
    only show revoke button on legal_page and its translations
    """
    if legal_page and not (page == legal_page or page in legal_page.translations()):
        settings["settings"].pop("revoke")

    return settings


def ld2d(ld):
    return reduce(lambda x, y: {**x, **y}, [item.serializable for item in ld], {})
