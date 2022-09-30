from django import test
from django.template import Context, Template, TemplateSyntaxError

from feincms3_cookiecontrol.embedding import embed


class ConsciousEmbedTest(test.TestCase):
    def test_wrap_tag(self):
        template = Template(
            """\
{% load feincms3_cookiecontrol %}
{% wrap 'youtube' %}<iframe src="https://example.com/"></iframe>{% endwrap %}
"""
        )
        html = template.render(Context({}))
        self.assertIn("f3cc-embed", html)
        self.assertIn(
            '<template><iframe src="https://example.com/"></iframe></template>',
            html,
        )

    def test_wrap_tag_template_syntax_error(self):
        with self.assertRaises(TemplateSyntaxError):
            Template(
                """\
{% load feincms3_cookiecontrol %}{% wrap %}{% endwrap %}
"""
            )

    def test_embed_vimeo_url(self):
        html = embed("https://vimeo.com/455728498")
        self.assertIn('href="https://vimeo.com/privacy"', html)
        self.assertIn("455728498", html)

    def test_embed_youtube_url(self):
        html = embed("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        self.assertIn('href="https://policies.google.com/privacy"', html)
        self.assertIn("dQw4w9WgXcQ", html)

    def test_embed_unknown(self):
        self.assertEqual(embed("https://example.com"), "")

    def test_embed_tag(self):
        template = Template("{% load feincms3_cookiecontrol %}{% embed url %}")
        html = template.render(Context({}))
        self.assertEqual(html, "")

        html = template.render(
            Context({"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"})
        )
        self.assertIn('href="https://policies.google.com/privacy"', html)
        self.assertIn("dQw4w9WgXcQ", html)
