from django import template

from feincms3_cookiecontrol.models import cookiecontrol_data


register = template.Library()


@register.inclusion_tag("feincms3_cookiecontrol/banner.html")
def feincms3_cookiecontrol(*, hide_modify_button=False, privacy_policy_url=None):
    data = cookiecontrol_data()
    if hide_modify_button:
        data.pop("buttonModify")
    data["privacyPolicyURL"] = privacy_policy_url
    return {"data": data}
