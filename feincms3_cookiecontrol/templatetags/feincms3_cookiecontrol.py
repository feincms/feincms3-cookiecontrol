from django import template

from feincms3_cookiecontrol.external import conscious_embed_context
from feincms3_cookiecontrol.models import cookiecontrol_data


register = template.Library()


@register.inclusion_tag("feincms3_cookiecontrol/banner.html")
def feincms3_cookiecontrol(*, hide_modify_button=False, privacy_policy_url=None):
    data = cookiecontrol_data()
    if hide_modify_button:
        data.pop("buttonModify")
    data["privacyPolicyURL"] = privacy_policy_url
    return {"data": data}


class ConsciousEmbedNode(template.Node):
    def __init__(self, nodelist):
        self.nodelist = nodelist

    def render(self, context):
        embedded_html = self.nodelist.render(context)

        return template.loader.render_to_string(
            "feincms3_cookiecontrol/conscious_embed.html",
            conscious_embed_context(embedded_html),
        )


@register.tag
def conscious_embed(parser, token):
    nodelist = parser.parse("endconscious_embed")
    parser.delete_first_token()
    return ConsciousEmbedNode(nodelist)
