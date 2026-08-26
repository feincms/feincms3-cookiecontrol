import os

import pytest

from feincms3_cookiecontrol.models import Script


# Set Django async unsafe to allow database operations in tests
os.environ.setdefault("DJANGO_ALLOW_ASYNC_UNSAFE", "true")


@pytest.fixture
def youtube_script():
    """Create a YouTube script for third-party content"""
    script = Script.objects.create(
        name="youtube",
        script='<script>window.youtube_allowed = true; console.log("YouTube script loaded");</script>',
    )
    return script


@pytest.fixture
def page_errors(page):
    """Collect uncaught JavaScript exceptions"""
    errors = []
    page.on("pageerror", lambda exc: errors.append(str(exc)))
    return errors


@pytest.mark.django_db(transaction=True)
@pytest.mark.e2e
class TestEmbedE2E:
    def _create_embed_test_page(self, page, live_server):
        """Helper to create a test page with embed content"""
        # Use the Django test view which properly renders the template with the JavaScript
        page.goto(f"{live_server.url}/test-embed-page/")

    def test_embed_shows_placeholder_before_acceptance(
        self, page, live_server, youtube_script
    ):
        """Test that embed content shows a placeholder before user accepts the provider"""
        self._create_embed_test_page(page, live_server)

        # Check that placeholder is visible
        placeholder = page.locator(".f3cc-placeholder")
        placeholder.wait_for(state="visible", timeout=5000)
        placeholder_text = placeholder.text_content()
        assert (
            "To view this content, please accept YouTube cookies" in placeholder_text
        ), f"Expected placeholder text not found: {placeholder_text}"

        # Check that iframe is NOT visible (still in template)
        iframe = page.locator('iframe[src*="youtube.com"]')
        assert not iframe.is_visible(), "iframe should not be visible before acceptance"

        # Check that accept button is present
        accept_button = page.locator(".f3cc-embed .f3cc-button.accept")
        assert accept_button.is_visible(), "Accept button should be visible"
        accept_text = accept_button.text_content()
        assert "Accept YouTube" in accept_text, (
            f"Expected 'Accept YouTube' in button text: {accept_text}"
        )

    def test_embed_loads_content_after_provider_acceptance(
        self, page, live_server, youtube_script, page_errors
    ):
        """Test that embed content handles provider-specific acceptance"""
        self._create_embed_test_page(page, live_server)

        # Click the provider-specific accept button - need to be more specific to avoid global banner
        accept_button = page.locator(".f3cc-embed .f3cc-button.accept")
        accept_button.wait_for(state="visible", timeout=5000)

        # Verify the button is clickable and click it
        assert accept_button.is_enabled(), "Provider accept button should be enabled"
        accept_button.click()

        # Wait for JavaScript to execute
        page.wait_for_timeout(2000)

        assert not page_errors, f"Uncaught JavaScript errors: {page_errors}"

        # Check that the page structure is still intact and JavaScript executed
        f3cc_div = page.locator(".f3cc")
        assert f3cc_div.count() > 0, "Cookie control container should still exist"

        # The placeholder has been replaced by the actual embed
        assert page.locator('iframe[src*="youtube.com"]').count() == 1, (
            "iframe should be embedded after accepting the provider"
        )
        assert page.locator(".f3cc-placeholder").count() == 0, (
            "placeholder should be gone after accepting the provider"
        )

        # Verify that provider-specific data is stored (this tests the embed JS logic)
        # The JavaScript should store provider acceptance in localStorage
        providers_stored = page.evaluate("""
            () => {
                try {
                    const stored = localStorage.getItem('f3cc-embed-providers');
                    return stored ? JSON.parse(stored) : [];
                } catch {
                    return [];
                }
            }
        """)

        # After clicking provider accept, it should be stored
        assert "youtube" in providers_stored, (
            "YouTube provider should be stored after acceptance"
        )

    def test_embed_with_global_cookie_acceptance(
        self, page, live_server, youtube_script, page_errors
    ):
        """Test that global cookie acceptance enables embed content"""
        self._create_embed_test_page(page, live_server)

        # Wait for the global cookie banner and accept all cookies
        # Use force click to avoid interception issues
        global_accept = page.locator(".f3cc-banner a.f3cc-button.accept")
        global_accept.wait_for(state="visible", timeout=5000)
        global_accept.click(force=True)

        # Wait for JavaScript to execute and content to load
        page.wait_for_timeout(2000)

        # After global acceptance, the cookie should be set to "all"
        cookie_value = page.evaluate("""
            () => {
                const cookies = document.cookie.split('; ');
                for (let cookie of cookies) {
                    if (cookie.startsWith('f3cc=')) {
                        return decodeURIComponent(cookie.substring(5));
                    }
                }
                return null;
            }
        """)

        assert cookie_value == "all", (
            f"Cookie should be set to 'all' after global acceptance, got '{cookie_value}'"
        )

        assert not page_errors, f"Uncaught JavaScript errors: {page_errors}"

        # Check that the YouTube script was injected
        assert page.evaluate("() => window.youtube_allowed") is True, (
            "YouTube script should be injected after global acceptance"
        )

        # Accepting all cookies also embeds the third party content
        assert page.locator('iframe[src*="youtube.com"]').count() == 1, (
            "iframe should be embedded after global acceptance"
        )

        banner = page.locator(".f3cc-banner")
        assert not banner.is_visible(), "Banner should be hidden after acceptance"
