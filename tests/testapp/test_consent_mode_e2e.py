import os

import pytest


# Set Django async unsafe to allow database operations in tests
os.environ.setdefault("DJANGO_ALLOW_ASYNC_UNSAFE", "true")


DENIED = {
    "ad_user_data": "denied",
    "ad_personalization": "denied",
    "ad_storage": "denied",
    "analytics_storage": "denied",
}
GRANTED = dict.fromkeys(DENIED, "granted")


def consent_calls(page):
    """The gtag() calls in the data layer, as lists instead of arguments objects"""
    return page.evaluate("() => window.dataLayer.map((args) => Array.from(args))")


@pytest.mark.django_db(transaction=True)
@pytest.mark.e2e
class TestConsentModeAdvancedE2E:
    @pytest.fixture(autouse=True)
    def errors(self, page):
        errors = []
        page.on("pageerror", lambda exc: errors.append(str(exc)))
        yield errors
        assert errors == []

    def _goto(self, page, live_server):
        page.goto(f"{live_server.url}/test-consent-mode-advanced-page/")
        page.locator(".f3cc").first.wait_for(state="attached", timeout=5000)

    def test_everything_is_denied_by_default(self, page, live_server):
        self._goto(page, live_server)

        assert consent_calls(page) == [
            ["consent", "default", DENIED],
            ["set", "ads_data_redaction", True],
        ]

    def test_accepting_grants_consent(self, page, live_server):
        self._goto(page, live_server)
        page.locator("a.f3cc-button.accept").first.click()

        assert consent_calls(page)[-1] == ["consent", "update", GRANTED]

    def test_rejecting_denies_consent(self, page, live_server):
        self._goto(page, live_server)
        page.locator("a.f3cc-button.reject").first.click()

        assert consent_calls(page)[-1] == ["consent", "update", DENIED]

    def test_revoking_consent_denies_it_again(self, page, live_server):
        self._goto(page, live_server)
        page.locator("a.f3cc-button.accept").first.click()
        page.locator("a.f3cc-button.modify").click()
        page.locator("a.f3cc-button.reject").first.click()

        assert consent_calls(page)[-2:] == [
            ["consent", "update", GRANTED],
            ["consent", "update", DENIED],
        ]

    def test_an_existing_consent_is_granted_right_away(self, page, live_server):
        page.context.add_cookies(
            [{"name": "f3cc", "value": "all", "url": live_server.url}]
        )
        self._goto(page, live_server)

        assert consent_calls(page) == [
            ["consent", "default", DENIED],
            ["set", "ads_data_redaction", True],
            ["consent", "update", GRANTED],
        ]

    def test_an_essential_only_consent_stays_denied(self, page, live_server):
        page.context.add_cookies(
            [{"name": "f3cc", "value": "essential", "url": live_server.url}]
        )
        self._goto(page, live_server)

        assert consent_calls(page) == [
            ["consent", "default", DENIED],
            ["set", "ads_data_redaction", True],
        ]
