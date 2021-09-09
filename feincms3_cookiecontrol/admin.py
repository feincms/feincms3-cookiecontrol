from django.contrib import admin
from translated_fields import TranslatedFieldAdmin

from feincms3_cookiecontrol.models import CookieCategory, CookieScript


@admin.register(CookieCategory)
class CookieCategoryAdmin(TranslatedFieldAdmin, admin.ModelAdmin):
    list_display = ("__str__",)
    search_fields = ("name",)


@admin.register(CookieScript)
class CookieScriptAdmin(TranslatedFieldAdmin, admin.ModelAdmin):
    list_display = (
        "__str__",
        "category",
    )
    search_fields = ("name",)
    list_filter = ("category",)
