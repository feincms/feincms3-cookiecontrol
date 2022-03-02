import types

from django import test
from django.core.exceptions import ValidationError
from django.template import Context, Template
from django.test.utils import override_settings
from django.utils.translation import activate

from feincms3_cookiecontrol.checks import check_settings
from feincms3_cookiecontrol.models import (
    CookieCategory,
    CookieScript,
    clobber_panel_data,
)
from feincms3_cookiecontrol.templatetags.feincms3_cookiecontrol import (
    feincms3_cookiecontrol,
    feincms3_cookiecontrol_panel,
    panel_data,
)


# from .models import Model
# from django.utils.functional import lazy


class CookieControlTest(test.TestCase):
    def setUp(self):
        activate("en")
        clobber_panel_data()

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

        with self.assertRaises(ValidationError) as cm:
            CookieScript(
                category=category,
                name="script-name",
                inject_if="<script>...</script><noscript>Please JS</noscript>",
                inject_else="<script>...</script><noscript>Please JS</noscript>",
            ).full_clean()

        self.assertEqual(
            [m.message for m in cm.exception.error_dict["inject_if"]],
            ["Entering <noscript> tags doesn't make sense."],
        )
        self.assertEqual(
            [m.message for m in cm.exception.error_dict["inject_else"]],
            ["Entering <noscript> tags doesn't make sense."],
        )

    def test_serialize(self):
        category = CookieCategory.objects.create()
        CookieScript.objects.create(
            category=category,
            name="script-name",
            inject_if="inject-if",
            inject_else="inject-else",
        )

        panel = panel_data()
        self.assertEqual(
            set(panel.keys()),
            {"panel", "banner", "modify", "legalPage", "categories", "domain"},
        )
        self.assertEqual(
            panel["categories"],
            {
                "": {
                    "title": "",
                    "description": "",
                    "preselected": False,
                    "disabled": False,
                    "cookies": [
                        {
                            "name": "script-name",
                            "inject_if": "inject-if",
                            "inject_else": "inject-else",
                        },
                    ],
                }
            },
        )

    def test_str(self):
        self.assertEqual(str(CookieCategory(name="test")), "test")
        self.assertEqual(str(CookieScript(name="test")), "test")

    @override_settings(COOKIECONTROL={"legalPage": 42})
    def test_modify(self):
        class DummyPage:
            def __init__(self, ids):
                self.ids = ids

            def translations(self):
                return [types.SimpleNamespace(id=id) for id in self.ids]

        result = feincms3_cookiecontrol_panel(DummyPage([1]))
        self.assertNotIn("modify", result["panel"])

        result = feincms3_cookiecontrol_panel(DummyPage([42]))
        self.assertIn("modify", result["panel"])

    def test_feincms3_cookiecontrol(self):
        result = feincms3_cookiecontrol(hide_modify_button=True)
        self.assertNotIn("modify", result["panel"])

        result = feincms3_cookiecontrol(hide_modify_button=False)
        self.assertIn("modify", result["panel"])
