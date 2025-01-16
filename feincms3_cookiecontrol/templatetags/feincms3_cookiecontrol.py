from django import template
from django.template.base import token_kwargs

from feincms3_cookiecontrol.models import cookiecontrol_data


register = template.Library()


@register.inclusion_tag("feincms3_cookiecontrol/banner.html")
def feincms3_cookiecontrol(*, hide_modify_button=False, privacy_policy_url=None):
    data = cookiecontrol_data(privacy_policy_url=privacy_policy_url)
    if hide_modify_button:
        data.pop("buttonModify")
    return {"data": data}


@register.simple_tag(name="embed")
def do_embed(url):
    from feincms3_cookiecontrol.embedding import embed

    return embed(url)


class ConsciousWrapNode(template.Node):
    def __init__(self, provider, nodelist, kw):
        self.provider = template.Variable(provider)
        self.nodelist = nodelist
        self.kw = kw

    def render(self, context):
        from feincms3_cookiecontrol.embedding import wrap

        return wrap(
            self.provider.resolve(context),
            self.nodelist.render(context),
            **{key: value.resolve(context) for key, value in self.kw.items()},
        )


@register.tag(name="wrap")
def do_wrap(parser, token):
    try:
        tag_name, provider, *bits = token.split_contents()
    except ValueError as exc:
        raise template.TemplateSyntaxError(
            "%r tag requires exactly one argument", str(token.contents).split()[0]
        ) from exc

    kw = token_kwargs(bits, parser)

    nodelist = parser.parse(("endwrap",))
    parser.delete_first_token()
    return ConsciousWrapNode(provider, nodelist, kw)
