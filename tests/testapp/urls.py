from django.urls import path

from feincms3_cookiecontrol.views import inject

from . import views


urlpatterns = [
    path("inject-f3cc.js", inject),
    path("inject-f3cc-with-ppu.js", inject, {"privacy_policy_url": "/privacy/"}),
    path("test-page/", views.test_page, name="test_page"),
]
