from django import test
from django.template import Context, Template, TemplateSyntaxError
from django.test.utils import override_settings

from feincms3_cookiecontrol.embedding import embed, get_providers, wrap


class ConsciousEmbedTest(test.TestCase):
    def test_known_wrap(self):
        iframe = "<iframe src='https://vimeo.com/'></iframe>"
        html = wrap("vimeo", iframe)
        self.assertIn('href="https://vimeo.com/privacy"', html)

    def test_conscious_embed(self):
        template = Template(
            """\
{% load feincms3_cookiecontrol %}
{% conscious_embed 'youtube' %}<iframe src="https://youtube.com/"></iframe>{% endconscious_embed %}
"""
        )
        html = template.render(Context({}))
        self.assertIn("f3cc-embed", html)
        self.assertIn(
            '<template class="f3cc-embed__template"><iframe src="https://youtube.com/"></iframe></template>',
            html,
        )

    def test_template_syntax_error(self):
        with self.assertRaises(TemplateSyntaxError):
            Template(
                """
                {% load feincms3_cookiecontrol %}
                {% conscious_embed %}{% endconscious_embed %}
                """
            )

    @override_settings(
        CONSCIOUS_EMBED_PROVIDERS={
            "example.com": {"blub": "https://example.com/privacy/"}
        }
    )
    def test_defaults(self):
        # ./settings.py
        providers = get_providers()
        self.assertIn("example.com", providers)

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

    @override_settings(
        CONSCIOUS_EMBED_PROVIDERS={
            "mailchimp": {
                # No handler
                "title": "Mailchimp",
                "privacy_policy_url": "https://mailchimp.com/legal/privacy/",
            },
        }
    )
    def test_mailchimp_wrap(self):
        template = """
{% load feincms3_cookiecontrol %}{% conscious_embed "mailchimp" %}<script type='text/javascript' src='//s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js'></script>{% endconscious_embed %}
"""
        html = Template(template).render(Context({}))
        self.assertIn('href="https://mailchimp.com/legal/privacy/"', html)
        self.assertIn(
            """<template class="f3cc-embed__template"><script type='text/javascript' src='//s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js'></script></template>""",
            html,
        )

        self.assertEqual(embed("https://example.com"), "")  # No crash
