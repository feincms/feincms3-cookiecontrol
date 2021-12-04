# Change log

## 0.1 (Unreleased)

- Added unittests for everything in the backend.
- Verified that the amount of SQL queries executed is as expected.
- Changed the JSON structure to keep categories and cookies in a single object.
- Namespaced translations using a gettext context.
- Added clobbering of the panel cache when updating categories or scripts.


## 0.0.10 (2021-12-04)

- **BACKWARDS INCOMPATIBLE:** Changed ``inject_if`` and ``inject_else`` to
  allow HTML tags, not just inline scripts.


## 0.0.9 (2021-12-01)

- Changed translated fields to fall back to the primary language instead of
  crashing when having an unexpected active language.


## 0.0.8 (2021-12-01)

- Fixed scrolling when the panel was open and jumping when clicking categories.


## 0.0.5, 0.0.6, 0.0.7 (2021-12-01)

- Fixed a few spacing oddities and visual differences between Firefox and
  WebKit.
- Increased the specificity of our CSS to make accidental overrides less
  probable.
- Fixed a few styling oversights.
- Shortened our element IDs.


## 0.0.4 (2021-11-30)

- Added italian translations.
- Changed the default styles of the cookie panel to use slide switches.
- Added styles for disabled categories (e.g. for essential cookies).
- Added more CSS variables to allow restyling the panel. Withouot replacing the
  CSS.


## 0.0.3 (2021-09-23)

- Fix for generic pages


## 0.0.2 (2021-09-22)

- Readme
- Actually use app settings to override default panel configuration


## 0.0.1 (2021-08-17)
