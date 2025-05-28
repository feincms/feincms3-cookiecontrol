import os

import pytest

from feincms3_cookiecontrol.models import Script


# Set Django async unsafe to allow database operations in tests
os.environ.setdefault("DJANGO_ALLOW_ASYNC_UNSAFE", "true")


@pytest.fixture
def test_scripts():
    """Create test scripts that will be injected"""
    ga_script = Script.objects.create(
        name="google_analytics",
        script='<script>window.ga_injected = true; console.log("GA script injected");</script>',
    )
    fb_script = Script.objects.create(
        name="facebook_pixel",
        script='<script>window.fb_injected = true; console.log("FB script injected");</script>',
    )
    return ga_script, fb_script


@pytest.mark.django_db(transaction=True)
@pytest.mark.e2e
class TestBannerE2E:
    def _create_test_page(self, page, live_server):
        """Helper to create a test page with cookie control"""
        # Use the Django test view which properly renders the template
        page.goto(f"{live_server.url}/test-page/")

    def test_cookie_banner_appears_on_page_load(self, page, live_server, test_scripts):
        """Test that the cookie banner appears when visiting a page with cookie control"""
        self._create_test_page(page, live_server)

        # Wait for the banner to appear - the banner is created by JavaScript dynamically
        # so we need to wait for the .f3cc-banner class which is what the JS creates
        banner = page.locator(".f3cc-banner")
        banner.wait_for(state="visible", timeout=5000)

        # Check that banner contains expected text
        banner_text = banner.text_content()
        assert "Cookies on Our Website" in banner_text

        # Check for buttons - these are created as <a> tags, not <button> tags
        accept_button = page.locator("a.f3cc-button.accept").first
        assert accept_button.is_visible()

        reject_button = page.locator("a.f3cc-button.reject").first
        assert reject_button.is_visible()

    def test_accept_cookies_injects_scripts(self, page, live_server, test_scripts):
        """Test that accepting cookies injects the configured scripts"""
        self._create_test_page(page, live_server)

        # Wait for banner and click accept
        accept_button = page.locator("a.f3cc-button.accept").first
        accept_button.wait_for(state="visible", timeout=5000)
        accept_button.click()

        # Wait a moment for scripts to be injected
        page.wait_for_timeout(1000)

        # Check that scripts were injected
        ga_injected = page.evaluate("() => window.ga_injected")
        fb_injected = page.evaluate("() => window.fb_injected")

        assert ga_injected is True, "Google Analytics script should be injected"
        assert fb_injected is True, "Facebook Pixel script should be injected"

        # Check that banner is hidden after acceptance
        banner = page.locator(".f3cc-banner")
        assert not banner.is_visible(), "Banner should be hidden after acceptance"

    def test_reject_cookies_does_not_inject_scripts(
        self, page, live_server, test_scripts
    ):
        """Test that rejecting cookies does not inject non-essential scripts"""
        self._create_test_page(page, live_server)

        # Wait for banner and click reject
        reject_button = page.locator("a.f3cc-button.reject").first
        reject_button.wait_for(state="visible", timeout=5000)
        reject_button.click()

        # Wait a moment
        page.wait_for_timeout(1000)

        # Check that scripts were NOT injected
        ga_injected = page.evaluate("() => window.ga_injected")
        fb_injected = page.evaluate("() => window.fb_injected")

        assert ga_injected is None, "Google Analytics script should NOT be injected"
        assert fb_injected is None, "Facebook Pixel script should NOT be injected"

        # Check that banner is hidden after rejection
        banner = page.locator(".f3cc-banner")
        assert not banner.is_visible(), "Banner should be hidden after rejection"
