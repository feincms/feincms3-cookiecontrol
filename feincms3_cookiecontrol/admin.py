from django.contrib import admin

from feincms3_cookiecontrol import models


@admin.register(models.CookieScript)
class CookieScriptAdmin(admin.ModelAdmin):
    list_display = ["name", "acceptance"]
    list_filter = ["acceptance"]
    radio_fields = {"acceptance": admin.HORIZONTAL}
    search_fields = ["name"]
