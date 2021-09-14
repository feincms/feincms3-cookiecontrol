from django.db import models
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _
from feincms3.inline_ckeditor import InlineCKEditorField
from translated_fields import TranslatedField


class CookieCategory(models.Model):
    name = models.SlugField(_("technical name"), unique=True)
    title = TranslatedField(
        models.CharField(_("title"), max_length=200, default="", blank=True)
    )
    description = TranslatedField(InlineCKEditorField(_("description"), blank=True))
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
            # XXX why not serialize?
            "cookies": [o.name for o in self.cookiescript_set.all()],
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

    def serialize(self):
        return {
            "inject_if": mark_safe(self.inject_if),
            "inject_else": mark_safe(self.inject_else),
        }


def get_dict_from_config_list(config_list):
    return {key: value for key, value in config_list if value}
