import pytest
from django.template import Context, Template, TemplateSyntaxError

from feincms3_cookiecontrol.embedding import embed


@pytest.mark.django_db
class TestConsciousEmbed:
    def test_wrap_tag(self):
        template = Template(
            """\
{% load feincms3_cookiecontrol %}
{% wrap 'youtube' %}<iframe src="https://example.com/"></iframe>{% endwrap %}
"""
        )
        html = template.render(Context({}))
        assert "f3cc-embed" in html
        assert (
            '<template><iframe src="https://example.com/"></iframe></template>' in html
        )

    def test_wrap_tag_template_syntax_error(self):
        with pytest.raises(TemplateSyntaxError):
            Template(
                """\
{% load feincms3_cookiecontrol %}{% wrap %}{% endwrap %}
"""
            )

    def test_show_me_the_good_stuff(self):
        template = Template(
            """\
{% load feincms3_cookiecontrol %}
{% wrap 'youtube' button="Show me the good stuff!" %}<iframe src="https://example.com/"></iframe>{% endwrap %}
"""
        )
        html = template.render(Context({}))
        assert "f3cc-embed" in html
        assert (
            '<template><iframe src="https://example.com/"></iframe></template>' in html
        )
        assert (
            '<button type="button" class="f3cc-button accept">Show me the good stuff!</button>'
            in html
        )

    def test_embed_vimeo_url(self):
        html = embed("https://vimeo.com/455728498")
        assert 'href="https://vimeo.com/privacy"' in html
        assert "455728498" in html

    def test_embed_youtube_url(self):
        html = embed("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        assert 'href="https://policies.google.com/privacy"' in html
        assert "dQw4w9WgXcQ" in html

    def test_embed_unknown(self):
        assert embed("https://example.com") == ""

    def test_embed_tag(self):
        template = Template("{% load feincms3_cookiecontrol %}{% embed url %}")
        html = template.render(Context({}))
        assert html == ""

        html = template.render(
            Context({"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"})
        )
        assert 'href="https://policies.google.com/privacy"' in html
        assert "dQw4w9WgXcQ" in html
