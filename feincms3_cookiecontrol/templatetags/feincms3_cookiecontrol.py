from django import template

from feincms3_cookiecontrol.models import panel_data


register = template.Library()


@register.inclusion_tag("feincms3_cookiecontrol/panel.html")
def feincms3_cookiecontrol_panel(page):
    panel = panel_data()

    # only show modify button on legal_page
    if not panel["legalPage"]:
        return {"panel": panel}

    if hasattr(page, "translations") and panel["legalPage"] in {
        p.id for p in page.translations()
    }:
        return {"panel": panel}

    panel.pop("modify")
    return {"panel": panel}
