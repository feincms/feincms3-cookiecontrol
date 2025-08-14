import pytest
from django.core.exceptions import ValidationError
from django.template import Context, Template
from django.test import Client, TestCase
from django.utils.translation import activate

from feincms3_cookiecontrol.models import Script, clobber_cookiecontrol_data
from feincms3_cookiecontrol.templatetags.feincms3_cookiecontrol import (
    cookiecontrol_data,
    feincms3_cookiecontrol,
)


@pytest.mark.django_db
class TestCookieControl:
    def setup_method(self):
        activate("en")
        clobber_cookiecontrol_data()
        self.client = Client()

    def test_setup_defaults_provided(self):
        t = Template("{% load feincms3_cookiecontrol %}{% feincms3_cookiecontrol %}")

        Script.objects.create(
            name="script1",
        )
        Script.objects.create(
            name="script2",
        )

        with TestCase().assertNumQueries(1):  # One query for all scripts
            html = t.render(Context({}))
            # print(html)

        assert 'id="f3cc-data"' in html

        with TestCase().assertNumQueries(0):  # Cached
            html = t.render(Context({}))
            # print(html)

    def test_correct_setup_for_active_language(self):
        pass

    def test_erroneous_scripts(self):
        # No exceptions
        Script(
            name="script-name",
            script="",
        ).full_clean()
        Script(
            name="script-name",
            script=" <script>bla</script>",
        ).full_clean()

        with pytest.raises(ValidationError) as exc_info:
            Script(
                name="script-name",
                script="function(){}",
            ).full_clean()

        assert [m.message for m in exc_info.value.error_dict["script"]] == [
            "This doesn't look right. Please start with a HTML tag"
            " (e.g. <script>, <div>)."
        ]

        with pytest.raises(ValidationError) as exc_info:
            Script(
                name="script-name",
                script="<script>...</script><noscript>Please JS</noscript>",
            ).full_clean()

        assert [m.message for m in exc_info.value.error_dict["script"]] == [
            "Entering <noscript> tags doesn't make sense."
        ]

    def test_serialize(self):
        Script.objects.create(
            name="script-name",
            script="inject-if",
        )

        data = cookiecontrol_data(privacy_policy_url=None)
        assert set(data.keys()) == {
            "heading",
            "description",
            "buttonAccept",
            "buttonReject",
            "buttonModify",
            "cookies",
            "domain",
            "ppu",
        }
        assert data["cookies"] == [
            {
                "name": "script-name",
                "script": "inject-if",
            },
        ]

    def test_str(self):
        assert str(Script(name="test")) == "test"

    def test_feincms3_cookiecontrol_tag(self):
        result = feincms3_cookiecontrol(hide_modify_button=True)
        assert "buttonModify" not in result["data"]

        result = feincms3_cookiecontrol(hide_modify_button=False)
        assert "buttonModify" in result["data"]

    def test_view(self):
        response = self.client.get("/inject-f3cc.js")
        assert response.status_code == 200
        assert "window.f3ccData" in response.content.decode()
        assert ".createElement" in response.content.decode()
        assert response["content-type"] == "text/javascript; charset=UTF-8"
        assert '"ppu":null' in response.content.decode()
        # print(response)
        # print(response.content.decode("utf-8"))
        # open("test.js", "w").write(response.content.decode("utf-8"))

        response = self.client.get("/inject-f3cc-with-ppu.js")
        # print(response)
        # print(response.content.decode("utf-8"))
        assert response.status_code == 200
        assert '"ppu":"http://testserver/privacy/"' in response.content.decode()
