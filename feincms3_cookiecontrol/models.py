from admin_ordering.models import OrderableModel
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
from feincms3.inline_ckeditor import InlineCKEditorField
from translated_fields import TranslatedField, fallback_to_default


COOKIECONTROL_PANEL_DEFAULTS = {
    "panel": {
        "heading": pgettext_lazy("f3cc", "Your Cookie Settings Protect Your Privacy"),
        "content": pgettext_lazy("f3cc", "Panel content"),
        "buttonSave": pgettext_lazy("f3cc", "Save settings"),
        "buttonCancel": pgettext_lazy("f3cc", "Cancel"),
    },
    "banner": {
        "heading": pgettext_lazy("f3cc", "Cookies on Our Website"),
        "content": pgettext_lazy("f3cc", "Banner content"),
        "buttonAccept": pgettext_lazy("f3cc", "Accept all"),
        "buttonPanel": pgettext_lazy("f3cc", "Modify settings"),
    },
    "modify": {
        "buttonPanel": pgettext_lazy("f3cc", "Modify cookie settings"),
    },
    "legalPage": None,
}
COOKIECONTROL_CACHE_TIMEOUT = 300


def clobber_panel_data(**kwargs):
    for code, name in settings.LANGUAGES:
        cache.delete(f"feincms3_cookiecontrol_settings_{code}")


def panel_data():
    CACHE_KEY = f"feincms3_cookiecontrol_settings_{get_language()}"

    panel = cache.get(CACHE_KEY)
    if not panel:
        panel = {
            **COOKIECONTROL_PANEL_DEFAULTS,
            **getattr(settings, "COOKIECONTROL", {}),
            "categories": {
                t.name: t.serialize()
                for t in CookieCategory.objects.prefetch_related("cookiescript_set")
            },
        }
        cache.set(CACHE_KEY, panel, timeout=COOKIECONTROL_CACHE_TIMEOUT)

    return panel


class CookieCategory(OrderableModel):
    class Acceptance(models.TextChoices):
        OPTIONAL = "optional", _("optional")
        RECOMMENDED = "recommended", _("recommended")
        MANDATORY = "mandatory", _("mandatory")

    name = models.SlugField(_("technical name"), unique=True)
    title = TranslatedField(
        models.CharField(_("title"), max_length=200, default="", blank=True),
        attrgetter=fallback_to_default,
    )
    description = TranslatedField(
        InlineCKEditorField(_("description"), blank=True),
        attrgetter=fallback_to_default,
    )
    acceptance = models.CharField(
        _("acceptance"),
        max_length=20,
        choices=Acceptance.choices,
        default=Acceptance.OPTIONAL,
    )

    class Meta(OrderableModel.Meta):
        verbose_name = _("cookie category")
        verbose_name_plural = _("cookie categories")

    def __str__(self):
        return self.name

    def serialize(self):
        acc = self.Acceptance
        return {
            "title": self.title or self.name,
            "description": mark_safe(self.description),
            "preselected": self.acceptance in {acc.RECOMMENDED, acc.MANDATORY},
            "disabled": self.acceptance == acc.MANDATORY,
            "cookies": [o.serialize() for o in self.cookiescript_set.all()],
        }


class CookieScript(models.Model):
    category = models.ForeignKey(CookieCategory, on_delete=models.CASCADE)
    name = models.SlugField(_("technical name"), unique=True)
    inject_if = models.TextField(
        _("inject if"),
        blank=True,
        help_text=_("HTML code to inject if cookie category is accepted."),
    )
    inject_else = models.TextField(
        _("inject else"),
        blank=True,
        help_text=_("HTML code to inject if cookie category is rejected."),
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
        if (stripped := self.inject_else.strip()) and stripped[0] != "<":
            errors["inject_else"] = msg

        msg = gettext("Entering <noscript> tags doesn't make sense.")
        if "<noscript" in self.inject_if:
            errors["inject_if"] = msg
        if "<noscript" in self.inject_else:
            errors["inject_else"] = msg

        if errors:
            raise ValidationError(errors)

    def serialize(self):
        return {
            "name": self.name,
            "inject_if": mark_safe(self.inject_if),
            "inject_else": mark_safe(self.inject_else),
        }


signals.post_save.connect(clobber_panel_data, sender=CookieCategory)
signals.post_save.connect(clobber_panel_data, sender=CookieScript)
signals.post_delete.connect(clobber_panel_data, sender=CookieCategory)
signals.post_delete.connect(clobber_panel_data, sender=CookieScript)
