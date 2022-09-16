from django import test
from django.template import Context, Template

from feincms3_cookiecontrol.external import render_external_consciously
from feincms3_cookiecontrol.models import get_conscious_embed_defaults


class ConsciousEmbedTest(test.TestCase):
    def test_consciously_render(self):
        iframe = "<iframe src='https://vimeo.com/'></iframe>"
        html = render_external_consciously(iframe)
        self.assertIn("vimeo.com/privacy", html)

    def test_conscious_embed(self):
        template = Template(
            "{% load feincms3_cookiecontrol %}"
            "{% conscious_embed %}"
            "<iframe src='https://youtube.com/'></iframe>"
            "{% endconscious_embed %}"
        )
        # TODO: script = "<iframe async src='https://youtu.be/'></iframe>"
        html = template.render(Context({}))
        self.assertIn("f3cc-embed", html)

    def test_defaults(self):
        # ./settings.py
        defaults = get_conscious_embed_defaults()
        self.assertIn("example.com", defaults)
