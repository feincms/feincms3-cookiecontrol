from django.urls import path

from feincms3_cookiecontrol.views import inject


urlpatterns = [
    path("inject-f3cc.js", inject),
]
