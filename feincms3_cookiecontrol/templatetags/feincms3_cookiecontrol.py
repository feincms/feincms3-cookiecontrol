from django import template

from feincms3_cookiecontrol.models import cookiecontrol_data


register = template.Library()


@register.inclusion_tag("feincms3_cookiecontrol/panel.html")
def feincms3_cookiecontrol(*, hide_modify_button=False):
    panel = cookiecontrol_data()
    if hide_modify_button:
        panel.pop("buttonModify")
    return {"panel": panel}
