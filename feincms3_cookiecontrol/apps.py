from django.apps import AppConfig


class feincms3CookiecontrolConfig(AppConfig):
    name = "feincms3_cookiecontrol"
    verbose_name = "feincms3 Cookie Control Panel"
    default_auto_field = "django.db.models.AutoField"

    def ready(self):
        import feincms3_cookiecontrol.checks  # noqa
