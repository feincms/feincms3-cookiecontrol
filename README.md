# FeinCMS3 Cookie Control Panel
## Integration

- Install (until further packaging) `venv/bin/pip install --editable git+ssh://git@github.com/feinheit/fh-cookiecontrol.git#egg=feincms3-cookiecontrol`
- Add "feincms3_cookiecontrol" to settings.py
- Add CookiePanelMixin to your pages model
- Add `CookiePanelMixin.admin_fieldset()` to your admin fieldsets
- Makemigrations
- Configure cookie scripts, cookie categories and page settings to override default panel configurations (e.g. on the root page)
- include templatetag:

```html
<!-- e.g. base.html -->
{% load feincms3_cookiecontrol %}

<body>
    ...
    {% feincms3_cookiecontrol_panel page %}
    ...
</body>
```

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

Cookie categories and scripts are defined in the CMS, exactly as it is done now.
