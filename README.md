# feincms3 Cookie Control Panel

## Integration

- Install `venv/bin/pip install feincms3-cookiecontrol`
- Add ``"feincms3_cookiecontrol"`` to settings.py
- Define ``MIGRATION_MODULES = {"feincms3_cookiecontrol": "..."}`` and run
  ``./manage.py makemigrations feincms3_cookiecontrol``.
- Configure cookie scripts, cookie categories and page settings to override
  default panel configurations
- Include template tag:

```html
<!-- e.g. base.html -->
{% load feincms3_cookiecontrol %}

<body>
    ...
    {% feincms3_cookiecontrol_panel page %}
    ...
</body>
```
