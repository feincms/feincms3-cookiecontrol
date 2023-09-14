# Change log

## Unreleased

- Started clobbering the cookie control data on app startup.
- Updated the pre-commit hooks.
- Updated the esbuild version.
- Changed the build step to also send the CSS through esbuild's minificator.
- Added spanish translations of the cookie banner.

## 1.4 (2023-08-15)

- Allowed overriding the `oembed_json` callable used by the conscious oEmbed
  utility; you could e.gg. use `import micawber; providers = micawber.bootstrap_oembed(); embed(..., oembed_json=providers.request)` now.
- Stopped generating an empty `<div class="f3cc"></div>` element if there's
  nothing to add inside.
- Moved the privacy policy link into the text instead of adding another
  "privacy policy" title at the end.

## 1.3 (2023-04-25)

- Switched to hatchling.
- Switched to ruff.
- Stopped crashing when `oembed` doesn't succeed.
- Added the slugified provider name to the CSS class of the
  `<div class="responsive-embed">` element when using `oembed`.
- Added `rm` (Romansh) translations.
- Further reduced the size of the generated JavaScript.
- Renamed the JavaScript file from `feincms3_cookiecontrol/build.js` to
  `f3cc.js` because it's nicer.
- Dropped compatibility with Python 3.8.

## 1.2 (2023-03-24)

- Updated pre-commit hooks.
- Added Django 4.2a1 and Python 3.11 to the CI.
- Django 5.0 will require Python 3.10 or better, updated the CI to take this
  into account.
- Documented a better way to integrate the inject view. (Still only really
  useful for special cases.)
- Code golfed the generated JavaScript a bit to shave off a few bytes.
- Added a `oembed` embedder to `feincms3_cookiecontrol.embedding`.

## 1.1 (2022-11-22)

- Added the `--f3cc-accept-foreground` CSS variable.
- Made it possible to override the default description and button text when
  using the `{% wrap %}` template tag.

## 1.0 (2022-10-28)

- Stopped needlessly post-processing the script tags of embeds, thanks
  @yoshson.
- Tweaked texts and spacing of embeds.
- Completed the translations.
- Changed the modify button rendering logic: If a HTML element with
  `class="f3cc-modify"` exists anywhere on the page (e.g. `<button type="button" class="f3cc-modify">Modify cookie settings</button>`) the
  banner revealing functionality is bound to this element and the fixed button
  in the bottom right side of the viewport isn't added at all.
- Introduced `{% embed %}` and `{% wrap %}` tags mirroring the embedding
  functions.
- Added Google to the list of well-known providers.
- Removed the `*-color` suffix from `--f3cc-background` and
  `--f3cc-foreground`.
- Made overriding the CSS variables less confusing. Setting the variables using
  `:root {}` now works.
- Added the `--f3cc-button-foreground` CSS variable. It defaults to
  `var(--f3cc-foreground)` for backwards compatibility.

## 0.99.0 (2022-09-19)

- Started showing the banner again when encountering unknown cookie values.
- Included the required CSS in the JavaScript file.
- Moved the root `#f3cc` div creation into the JavaScript code.
- Changed the modify button behavior: When `privacyPolicyURL` is given the
  modify button is only shown if the current URL equals the privacy policy URL
  (protocol, host and pathname have to match).
- Updated the translations.
- Added a view which generates a JavaScript file for embedding the cookie panel
  on other sites, e.g. subdomains.
- Imported the docs from the feincms3 repository and updated them.
- Rewrote `getCookie()` to actually return the full cookie value.
- Added some infrastructure code to consciously embed content from third party
  providers if users give their consent.
- Added `feincms3_cookiecontrol.embedding.embed` which wraps
  `feincms3.embedding` with a privacy-conscious version.

## 0.9.0 (2022-08-19)

- Completely reworked the panel into a banner-only solution with only two
  buttons, "accept all" and "reject all". The deprecated `{% feincms3_cookiecontrol_panel %}` template tag has been removed. The database
  model has been recreated from scratch. If you want to keep the old script
  configuration you can copy paste the following SQL into the SQL console
  (after removing `feincms3_cookiecontrol` from `MIGRATION_MODULES` if it's
  still in there and running migrations of course!):

      insert into feincms3_cookiecontrol_script (name, script) select name, inject_if from feincms3_cookiecontrol_cookiescript;
      drop table feincms3_cookiecontrol_cookiescript cascade ;
      drop table feincms3_cookiecontrol_cookiecategory cascade ;

- Added Django 4.1 to the CI matrix.
- Removed recommended cookies in preparation of the simplification of the panel
  to only allow required and optional cookies, nothing else.
- Removed the `inject_else` field because it was always unused and nothing
  should be injected if users do not consent.

## 0.2.1 (2022-03-09)

- Fixed a problem with our use of `100vh` by adding some padding as a temporary
  (ha!) workaround.

## 0.2 (2022-03-02)

- Deprecated the `feincms3_cookiecontrol_panel` template tag.
- Changed the `{% feincms3_cookiecontrol modify_button=True %}` to `{% feincms3_cookiecontrol hide_modify_button=False %}`. This makes the default
  case of only hiding the modify button under certain circumstances more
  straightforward.

## 0.1.6 (2022-03-01)

- Added support for setting subdomain cookies using `COOKIECONTROL = {"domain": "example.com"}`
- Added a new `{% feincms3_cookiecontrol modify_button=True %}` templatetag
  which allows directly controlling whether the modify button is shown or not.

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
