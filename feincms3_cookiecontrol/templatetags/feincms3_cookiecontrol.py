import warnings

from django import template

from feincms3_cookiecontrol.models import cookiecontrol_data


register = template.Library()


@register.inclusion_tag("feincms3_cookiecontrol/panel.html")
def feincms3_cookiecontrol_panel(page):
    warnings.warn(
        "The feincms3_cookiecontrol_panel template tag is deprecated. Use"
        " feincms3_cookiecontrol instead.",
        DeprecationWarning,
    )

    panel = cookiecontrol_data()

    # only show modify button on legal_page
    if not panel["legalPage"]:
        return {"panel": panel}

    if hasattr(page, "translations") and panel["legalPage"] in {
        p.id for p in page.translations()
    }:
        return {"panel": panel}

    panel.pop("modify")
    return {"panel": panel}


@register.inclusion_tag("feincms3_cookiecontrol/panel.html")
def feincms3_cookiecontrol(*, hide_modify_button=False):
    panel = cookiecontrol_data()
    if hide_modify_button:
        panel.pop("modify")
    return {"panel": panel}
