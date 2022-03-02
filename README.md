# feincms3 Cookie Control Panel

## Integration

- Install `venv/bin/pip install feincms3-cookiecontrol`
- Add `"feincms3_cookiecontrol"` to settings.py
- Define `MIGRATION_MODULES = {"feincms3_cookiecontrol": "..."}` and run
  `./manage.py makemigrations feincms3_cookiecontrol`.
- Configure cookie scripts, cookie categories and app settings to override
  default panel configurations
- Include template tag:

```html
<!-- e.g. base.html -->
{% load feincms3_cookiecontrol %}

<body>
  ... {% feincms3_cookiecontrol %} ...
</body>
```

- Override CSS variables in a `#f3cc { ... }` block.
- Run `./manage.py loaddata f3cc-categories --ignorenonexistent` to create
  an essential and an analytics cookie category, if this suits you.
- Optionally add a `COOKIECONTROL = {...}` setting if you want to override
  individual settings.
- Optionally include `{% feincms3_cookiecontrol hide_modify_button=True %}` on
  pages where you do not want to show the modify button if some cookies have
  already been accepted.
