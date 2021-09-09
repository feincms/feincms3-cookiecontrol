# FeinCMS Cookie Control Panel

## Features

### Banner

### Panel

### Revoke Button

### Backend Setup

## Configuration

- Add to settings.py
- include templatetag




## Software design

### Mixin für feincms3 Pages

The following values may be defined on a feincms3 page and are inherited by descendants:

class CoookieControlMixin(models.Model):
    Panel heading
    Panel content
    Banner content
    legal_page = ForeignKey("self")

    class Meta:
        abstract = True

### Definition of cookie categories and scripts

Cookie groups and scripts are defined in the CMS, exactly as it is done now.