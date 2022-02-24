# Change log

## Unreleased

- Added support for setting subdomain cookies using `COOKIECONTROL = {"domain": "example.com"}`

## 0.1.5 (2022-02-15)

- Fix some dimensions to compensate non-standard root font-sizes.

## 0.1.4 (2022-02-05)

- Added a fixture containing two categories, `essential` and `analytics` with
  default texts for english, german, french and italian.

## 0.1.3 (2022-01-21)

- Used a CSS class instead of hardcoding values in the CSS to set body styles
  when the panel is open, specified the body width.
- Dropped the react config from pre-commit and ESLint.
- Dropped the strange bottom border from links.

## 0.1.2 (2022-01-06)

- Specified buttons' foreground color, not just their background color.

## 0.1.1 (2021-12-16)

- Added a `z-index` to the modify button.
- Raised the minimum version of django-admin-ordering to 0.14.2.

## 0.1 (2021-12-07)

- Added unittests for everything in the backend.
- Verified that the amount of SQL queries executed is as expected.
- Changed the JSON structure to keep categories and cookies in a single object.
- Namespaced translations using a gettext context.
- Added clobbering of the panel cache when updating categories or scripts.
- Switched from Webpack to esbuild for the bundled CSS and JavaScript.
- Started using pre-commit.
- Changed the panel to no longer allow revoking all consent but only modify it
  -- the former wasn't technically possible anyway because of essential
  cookies such as the CSRF cookie which is used on most sites.
- Added a dependency on django-admin-ordering so that categories can be
  reordered using drag-drop.
- Merged the two checkboxes `preselect` and `disabled` into a single
  `acceptance` choice field. The former allowed the nonsensical
  `preselect=false,disabled=true` configuration.
- Disallowed entering `<noscript>` tags.

## 0.0.10 (2021-12-04)

- **BACKWARDS INCOMPATIBLE:** Changed `inject_if` and `inject_else` to
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
