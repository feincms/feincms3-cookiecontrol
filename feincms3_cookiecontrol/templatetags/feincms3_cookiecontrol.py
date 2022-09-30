from django import template

from feincms3_cookiecontrol.embedding import embed, wrap
from feincms3_cookiecontrol.models import cookiecontrol_data


register = template.Library()


@register.inclusion_tag("feincms3_cookiecontrol/banner.html")
def feincms3_cookiecontrol(*, hide_modify_button=False, privacy_policy_url=None):
    data = cookiecontrol_data()
    if hide_modify_button:
        data.pop("buttonModify")
    data["privacyPolicyURL"] = privacy_policy_url
    return {"data": data}


class ConsciousWrapNode(template.Node):
    def __init__(self, provider, nodelist):
        self.provider = template.Variable(provider)
        self.nodelist = nodelist

    def render(self, context):
        return wrap(self.provider.resolve(context), self.nodelist.render(context))


@register.tag(name="wrap")
def do_wrap(parser, token):
    try:
        tag_name, provider = token.split_contents()
    except ValueError:
        raise template.TemplateSyntaxError(
            "%r tag requires exactly one argument", str(token.contents).split()[0]
        )

    nodelist = parser.parse(("endwrap",))
    parser.delete_first_token()
    return ConsciousWrapNode(provider, nodelist)


@register.simple_tag(name="embed")
def do_embed(url):
    return embed(url)
