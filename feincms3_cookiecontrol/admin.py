from django.contrib import admin

from feincms3_cookiecontrol import models


@admin.register(models.CookieScript)
class CookieScriptAdmin(admin.ModelAdmin):
    list_display = ["name"]
    search_fields = ["name"]
