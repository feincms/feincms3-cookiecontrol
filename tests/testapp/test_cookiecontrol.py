import types

from django import test
from django.template import Context, Template


# from .models import Model
# from django.test.utils import override_settings
# from django.utils.functional import lazy


class CookieControlTest(test.TestCase):
    def test_panel_setup_defaults_provided(self):
        t = Template(
            """
            {% load feincms3_cookiecontrol %}
            {% feincms3_cookiecontrol_panel page %}
            """
        )

        with self.assertNumQueries(1):  # No categories, no scripts to prefetch
            html = t.render(
                Context(
                    {
                        "page": types.SimpleNamespace(id=-1),
                    }
                )
            )
            # print(html)

        self.assertIn('id="feincms3-cookiecontrol-data"', html)

    def test_correct_setup_for_active_language(self):
        pass
