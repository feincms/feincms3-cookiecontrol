from django import test
from django.template import Context, Template
from django.test.utils import override_settings

from feincms3_cookiecontrol.embedding import embed
from feincms3_cookiecontrol.external import render_external_consciously
from feincms3_cookiecontrol.models import get_conscious_embed_defaults


class ConsciousEmbedTest(test.TestCase):
    def test_consciously_render(self):
        iframe = "<iframe src='https://vimeo.com/'></iframe>"
        html = render_external_consciously(iframe)
        self.assertIn("vimeo.com/privacy", html)

    def test_conscious_embed(self):
        template = Template(
            """\
{% load feincms3_cookiecontrol %}
{% conscious_embed %}<iframe src="https://youtube.com/"></iframe>{% endconscious_embed %}
"""
        )
        html = template.render(Context({}))
        self.assertIn("f3cc-embed", html)
        self.assertIn(
            '<template class="f3cc-embed__template"><iframe src="https://youtube.com/"></iframe></template>',
            html,
        )

    @override_settings(
        CONSCIOUS_EMBED_PROVIDERS={"example.com": "https://example.com/privacy/"}
    )
    def test_defaults(self):
        # ./settings.py
        defaults = get_conscious_embed_defaults()
        self.assertIn("example.com", defaults)

    def test_embed_vimeo_url(self):
        html = embed("https://vimeo.com/455728498")
        self.assertIn('href="https://vimeo.com/privacy', html)
        self.assertIn("455728498", html)

    def test_embed_youtube_url(self):
        html = embed("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        self.assertIn('href="https://policies.google.com/privacy"', html)
        self.assertIn("dQw4w9WgXcQ", html)

    def test_embed_unknown(self):
        self.assertEqual(embed("https://example.com"), "")
