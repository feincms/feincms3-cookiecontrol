from django.db import models
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _
from feincms3.plugins.richtext import RichText as RichTextField
from translated_fields import TranslatedField


class PanelSetup(models.Model):
    # Panel
    panel_heading = TranslatedField(
        models.CharField(_("panel heading"), max_length=200, default="", blank=True)
    )
    panel_content = TranslatedField(RichTextField(_("panel content"), blank=True))
    panel_button_save = TranslatedField(
        models.CharField(_("panel button save"), max_length=200, default="", blank=True)
    )
    panel_button_cancel = TranslatedField(
        models.CharField(
            _("panel button cancel"), max_length=200, default="", blank=True
        )
    )

    # Banner
    banner_heading = TranslatedField(
        models.CharField(_("banner heading"), max_length=200, default="")
    )
    banner_content = TranslatedField(RichTextField(_("banner content"), blank=True))
    banner_button_panel = TranslatedField(
        models.CharField(
            _("banner button panel"), max_length=200, default="", blank=True
        )
    )
    banner_button_accept = TranslatedField(
        models.CharField(
            _("banner button accept"), max_length=200, default="", blank=True
        )
    )

    # Revoke
    revoke_button_panel = TranslatedField(
        models.CharField(_("revoke button"), max_length=200, default="", blank=True)
    )
    legal_page = models.ForeignKey(
        "pages.Page",
        verbose_name=_("legal page"),
        default="1",
        on_delete=models.CASCADE,
        blank=True,
    )

    def __str__(self):
        return self.banner_heading

    @property
    def serializable(self):
        return {
            "panel": {
                "heading": self.panel_heading,
                "content": mark_safe(self.panel_content),
                "buttonSave": self.panel_button_save,
                "buttonCancel": self.panel_button_cancel,
            },
            "banner": {
                "heading": self.banner_heading,
                "content": mark_safe(self.banner_content),
                "buttonAccept": self.banner_button_accept,
                "buttonPanel": self.banner_button_panel,
            },
            "revoke": {
                "buttonPanel": self.revoke_button_panel,
            },
        }

    class Meta:
        verbose_name = _("panel Setting")
        verbose_name_plural = _("panel Settings")


class CookieCategory(models.Model):
    name = models.CharField(_("technical_name"), max_length=200)
    title = TranslatedField(
        models.CharField(_("title"), max_length=200, default="", blank=True)
    )
    description = TranslatedField(RichTextField(_("description"), blank=True))
    preselect = models.BooleanField(default=False)
    disabled = models.BooleanField(default=False)
    ordering = models.IntegerField(_("ordering"), default=0)

    def __str__(self):
        return self.name

    @property
    def serializable(self):
        return {
            self.name: {
                "title": self.title,
                "description": mark_safe(self.description),
                "preselected": self.preselect,
                "disabled": self.disabled,
                "cookies": [o.name for o in CookieSkript.objects.filter(category=self)],
            }
        }

    class Meta:
        ordering = ("ordering",)
        verbose_name = _("cookie category")
        verbose_name_plural = _("cookie categories")


class CookieSkript(models.Model):
    category = models.ForeignKey(CookieCategory, on_delete=models.CASCADE)
    name = models.CharField(
        _("technical name"),
        max_length=200,
        blank=True,
    )
    inject_if = models.TextField(
        _("inject if"),
        blank=True,
    )
    inject_else = models.TextField(
        _("inject else"),
        blank=True,
    )

    def __str__(self):
        return self.name

    @property
    def serializable(self):
        return {
            self.name: {
                "inject_if": mark_safe(self.inject_if),
                "inject_else": mark_safe(self.inject_else),
            }
        }

    class Meta:
        ordering = ("name",)
        verbose_name = _("cookie script")
        verbose_name_plural = _("cookie scripts")
