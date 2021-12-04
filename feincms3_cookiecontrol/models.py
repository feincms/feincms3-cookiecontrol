from django.core.exceptions import ValidationError
from django.db import models
from django.utils.safestring import mark_safe
from django.utils.translation import gettext, gettext_lazy as _
from feincms3.inline_ckeditor import InlineCKEditorField
from translated_fields import TranslatedField, fallback_to_default


class CookieCategory(models.Model):
    name = models.SlugField(_("technical name"), unique=True)
    title = TranslatedField(
        models.CharField(_("title"), max_length=200, default="", blank=True),
        attrgetter=fallback_to_default,
    )
    description = TranslatedField(
        InlineCKEditorField(_("description"), blank=True),
        attrgetter=fallback_to_default,
    )
    preselect = models.BooleanField(default=False)
    disabled = models.BooleanField(default=False)
    ordering = models.IntegerField(_("ordering"), default=0)

    class Meta:
        ordering = ("ordering",)
        verbose_name = _("cookie category")
        verbose_name_plural = _("cookie categories")

    def __str__(self):
        return self.name

    def serialize(self):
        return {
            "title": self.title or self.name,
            "description": mark_safe(self.description),
            "preselected": self.preselect,
            "disabled": self.disabled,
            "cookies": [o.serialize() for o in self.cookiescript_set.all()],
        }


class CookieScript(models.Model):
    category = models.ForeignKey(CookieCategory, on_delete=models.CASCADE)
    name = models.SlugField(_("technical name"), unique=True)
    inject_if = models.TextField(
        _("inject if"), blank=True, help_text=_("inject if cookie category is accepted")
    )
    inject_else = models.TextField(
        _("inject else"), blank=True, help_text=_("inject if cookie category is denied")
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

        if errors:
            raise ValidationError(errors)

    def serialize(self):
        return {
            "name": self.name,
            "inject_if": mark_safe(self.inject_if),
            "inject_else": mark_safe(self.inject_else),
        }
