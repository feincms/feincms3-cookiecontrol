import contextlib

from django.apps import AppConfig


class CookiecontrolConfig(AppConfig):
    name = "feincms3_cookiecontrol"
    verbose_name = "feincms3 Cookie Control Panel"
    default_auto_field = "django.db.models.AutoField"

    def ready(self):
        from feincms3_cookiecontrol.models import (  # noqa: PLC0415
            clobber_cookiecontrol_data,
        )

        with contextlib.suppress(Exception):
            clobber_cookiecontrol_data()
