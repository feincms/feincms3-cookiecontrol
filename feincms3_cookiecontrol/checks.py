from django.conf import settings
from django.core.checks import Error, register


@register
def check_settings(app_configs, **kwargs):
    errors = []
    if (
        not hasattr(settings, "MIGRATION_MODULES")
        or "feincms3_cookiecontrol" not in settings.MIGRATION_MODULES
    ):
        errors.append(
            Error(
                "Define a custom location for the migrations for"
                " feincms3_cookiecontrol using MIGRATION_MODULES."
                " This is necessary because feincms3_cookiecontrol builds"
                " on django-translated-fields and doesn't know the"
                " configured LANGUAGES in advance.",
                id="feincms3_cookiecontrol.E001",
            )
        )

    return errors
