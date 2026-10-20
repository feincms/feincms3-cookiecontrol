from django.urls import path

from feincms3_cookiecontrol.views import inject

from . import views


urlpatterns = [
    path("inject-f3cc.js", inject),
    path("inject-f3cc-with-ppu.js", inject, {"privacy_policy_url": "/privacy/"}),
    path("test-page/", views.test_page, name="test_page"),
    path("test-embed-page/", views.test_embed_page, name="test_embed_page"),
    path(
        "test-consent-mode-advanced-page/",
        views.test_consent_mode_advanced_page,
        name="test_consent_mode_advanced_page",
    ),
]
