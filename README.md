# feincms3 Cookie Control Panel

## Integration

- Install (until further packaging) `venv/bin/pip install --editable git+ssh://git@github.com/feinheit/fh-cookiecontrol.git#egg=feincms3-cookiecontrol`
- Add ``"feincms3_cookiecontrol"`` to settings.py
- Define ``MIGRATION_MODULES = {"feincms3_cookiecontrol": "..."}`` and run
  ``./manage.py makemigrations feincms3_cookiecontrol``.
- Configure cookie scripts, cookie categories and page settings to override
  default panel configurations (e.g. on the root page)
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
