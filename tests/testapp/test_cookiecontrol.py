import types

from django import test
from django.core.exceptions import ValidationError
from django.template import Context, Template
from django.test.utils import override_settings

from feincms3_cookiecontrol.checks import check_settings
from feincms3_cookiecontrol.models import CookieCategory, CookieScript


# from .models import Model
# from django.utils.functional import lazy


class CookieControlTest(test.TestCase):
    def test_panel_setup_defaults_provided(self):
        t = Template(
            """
            {% load feincms3_cookiecontrol %}
            {% feincms3_cookiecontrol_panel page %}
            """
        )

        CookieScript.objects.create(
            category=CookieCategory.objects.create(name="category1"),
            name="script1",
        )
        CookieScript.objects.create(
            category=CookieCategory.objects.create(name="category2"),
            name="script2",
        )

        with self.assertNumQueries(2):  # One query for categories, one for all scripts
            html = t.render(
                Context(
                    {
                        "page": types.SimpleNamespace(id=-1),
                    }
                )
            )
            # print(html)

        self.assertIn('id="f3cc-data"', html)

        with self.assertNumQueries(0):  # Cached
            html = t.render(
                Context(
                    {
                        "page": types.SimpleNamespace(id=-1),
                    }
                )
            )
            # print(html)

    def test_correct_setup_for_active_language(self):
        pass

    @override_settings(MIGRATION_MODULES={})
    def test_missing_migration_modules(self):
        errors = check_settings(None)
        self.assertEqual(
            [error.id for error in errors],
            ["feincms3_cookiecontrol.E001"],
        )

    def test_erroneous_scripts(self):
        category = CookieCategory.objects.create()

        # No exceptions
        CookieScript(
            category=category,
            name="script-name",
            inject_if="",
            inject_else="",
        ).full_clean()
        CookieScript(
            category=category,
            name="script-name",
            inject_if=" <script>bla</script>",
            inject_else="",
        ).full_clean()

        with self.assertRaises(ValidationError) as cm:
            CookieScript(
                category=category,
                name="script-name",
                inject_if="function(){}",
                inject_else="function(){}",
            ).full_clean()

        self.assertEqual(
            [m.message for m in cm.exception.error_dict["inject_if"]],
            [
                "This doesn't look right. Please start with a HTML tag"
                " (e.g. <script>, <div>)."
            ],
        )
        self.assertEqual(
            [m.message for m in cm.exception.error_dict["inject_else"]],
            [
                "This doesn't look right. Please start with a HTML tag"
                " (e.g. <script>, <div>)."
            ],
        )

    def test_serialize(self):
        category = CookieCategory.objects.create()
        script = CookieScript.objects.create(
            category=category,
            name="script-name",
            inject_if="inject-if",
            inject_else="inject-else",
        )

        self.assertEqual(
            category.serialize(),
            {
                "title": "",
                "description": "",
                "preselected": False,
                "disabled": False,
                "cookies": ["script-name"],
            },
        )
        self.assertEqual(
            script.serialize(),
            {"inject_else": "inject-else", "inject_if": "inject-if"},
        )

    def test_str(self):
        self.assertEqual(str(CookieCategory(name="test")), "test")
        self.assertEqual(str(CookieScript(name="test")), "test")
