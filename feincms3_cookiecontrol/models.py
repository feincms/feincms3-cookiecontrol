from django.db import models
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _
from feincms3.inline_ckeditor import InlineCKEditorField
from translated_fields import TranslatedField


class CookiePanelMixin(models.Model):
    # Panel
    panel_heading = models.CharField(
        _("panel heading"), max_length=200, default="", blank=True
    )

    panel_content = InlineCKEditorField(_("panel content"), blank=True)
    panel_button_save = models.CharField(
        _("panel button save"), max_length=200, default="", blank=True
    )

    panel_button_cancel = models.CharField(
        _("panel button cancel"), max_length=200, default="", blank=True
    )

    # Banner
    banner_heading = models.CharField(
        _("banner heading"), max_length=200, default="", blank=True
    )

    banner_content = InlineCKEditorField(_("banner content"), blank=True)
    banner_button_panel = models.CharField(
        _("banner button panel"),
        max_length=200,
        default="",
        blank=True,
        help_text=_("i.e. cookie settings panel button text"),
    )

    banner_button_accept = models.CharField(
        _("banner button accept"),
        max_length=200,
        default="",
        blank=True,
        help_text=_("i.e. accept all cookies button text"),
    )

    # Revoke
    revoke_button_panel = models.CharField(
        _("revoke button"), max_length=200, default="", blank=True
    )

    legal_page = models.ForeignKey(
        "pages.Page",
        verbose_name=_("legal page"),
        on_delete=models.CASCADE,
        blank=True,
        help_text=_("choose page which enables users to revoke cookie settings"),
    )

    class Meta:
        abstract = True

    @classmethod
    def admin_fieldset(cls, **kwargs):
        cfg = {
            "fields": (
                "panel_heading",
                "panel_content",
                "panel_button_save",
                "panel_button_cancel",
                "banner_heading",
                "banner_content",
                "banner_button_accept",
                "banner_button_panel",
                "revoke_button_panel",
                "legal_page",
            ),
            "classes": ("tabbed",),
        }
        cfg.update(kwargs)
        return (_("Cookie control"), cfg)

    def cookiecontrol_dict(self):
        panel = dict(
            (k, v)
            for k, v in [
                ("heading", self.panel_heading),
                ("content", mark_safe(self.panel_content)),
                ("buttonSave", self.panel_button_save),
                ("buttonCancel", self.panel_button_cancel),
            ]
            if v
        )
        banner = dict(
            (k, v)
            for k, v in [
                ("heading", self.banner_heading),
                ("content", mark_safe(self.banner_content)),
                ("buttonAccept", self.banner_button_accept),
                ("buttonPanel", self.banner_button_panel),
            ]
            if v
        )
        revoke = dict((k, v) for k, v in [("buttonPanel", self.revoke_button_panel)] if v)
        legal_page = self.legal_page.id if self.legal_page else None
        return dict(
            (k, v)
            for k, v in [
                ("panel", panel),
                ("banner", banner),
                ("revoke", revoke),
                ("legalPage", legal_page),
            ]
            if v
        )


class CookieCategory(models.Model):
    name = models.CharField(_("technical name"), max_length=200, unique=True)
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
            "title": self.title,
            "description": mark_safe(self.description),
            "preselected": self.preselect,
            "disabled": self.disabled,
            "cookies": [o.name for o in CookieScript.objects.filter(category=self)],
        }


class CookieScript(models.Model):
    category = models.ForeignKey(CookieCategory, on_delete=models.CASCADE)
    name = models.CharField(
        _("technical name"),
        max_length=200,
        blank=True,
        unique=True,
    )
    inject_if = models.TextField(
        _("inject if"), blank=True, help_text=_("inject if cookie group is accepted")
    )
    inject_else = models.TextField(
        _("inject else"), blank=True, help_text=_("inject if cookie group is denied")
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
