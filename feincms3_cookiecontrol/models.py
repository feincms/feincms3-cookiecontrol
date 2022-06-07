from django.conf import settings
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import signals
from django.utils.safestring import mark_safe
from django.utils.translation import (
    get_language,
    gettext,
    gettext_lazy as _,
    pgettext_lazy,
)


COOKIECONTROL_PANEL_DEFAULTS = {
    "banner": {
        "heading": pgettext_lazy("f3cc", "Cookies on Our Website"),
        "content": pgettext_lazy("f3cc", "Banner content"),
        "buttonAccept": pgettext_lazy("f3cc", "Accept all cookies"),
        "buttonReject": pgettext_lazy("f3cc", "Refuse non-essential cookies"),
    },
    "modify": {
        "buttonPanel": pgettext_lazy("f3cc", "Modify cookie settings"),
    },
    "legalPage": None,
    "domain": None,
}
COOKIECONTROL_CACHE_TIMEOUT = 300


def clobber_cookiecontrol_data(**kwargs):
    for code, name in settings.LANGUAGES:
        cache.delete(f"feincms3_cookiecontrol_settings_{code}")


def cookiecontrol_data():
    CACHE_KEY = f"feincms3_cookiecontrol_settings_{get_language()}"

    panel = cache.get(CACHE_KEY)
    if not panel:
        panel = {
            **COOKIECONTROL_PANEL_DEFAULTS,
            **getattr(settings, "COOKIECONTROL", {}),
            "cookies": [script.serialize() for script in CookieScript.objects.all()],
        }
        cache.set(CACHE_KEY, panel, timeout=COOKIECONTROL_CACHE_TIMEOUT)

    return panel


class CookieScript(models.Model):
    class Acceptance(models.TextChoices):
        OPTIONAL = "optional", _("optional")
        MANDATORY = "mandatory", _("mandatory")

    name = models.SlugField(_("technical name"), unique=True)
    acceptance = models.CharField(
        _("acceptance"),
        max_length=20,
        choices=Acceptance.choices,
        default=Acceptance.OPTIONAL,
    )
    inject_if = models.TextField(
        _("inject if"),
        blank=True,
        help_text=_("HTML code to inject if cookies are accepted."),
    )

    class Meta:
        ordering = ("name",)
        verbose_name = _("cookie script")
        verbose_name_plural = _("cookie scripts")

    def __str__(self):
        return self.name

    def clean(self):
        super().clean()

        msg = gettext(
            "This doesn't look right."
            " Please start with a HTML tag (e.g. <script>, <div>)."
        )
        errors = {}

        if (stripped := self.inject_if.strip()) and stripped[0] != "<":
            errors["inject_if"] = msg

        msg = gettext("Entering <noscript> tags doesn't make sense.")
        if "<noscript" in self.inject_if:
            errors["inject_if"] = msg

        if errors:
            raise ValidationError(errors)

    def serialize(self):
        return {
            "name": self.name,
            "acceptance": self.acceptance,
            "inject_if": mark_safe(self.inject_if),
        }


signals.post_save.connect(clobber_cookiecontrol_data, sender=CookieScript)
signals.post_delete.connect(clobber_cookiecontrol_data, sender=CookieScript)
