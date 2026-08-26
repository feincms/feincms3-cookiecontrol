# AGENTS.md

## Layout

- `feincms3_cookiecontrol/` — the Django app.
- `src/main.js`, `src/main.css`, `src/gcm.js` — frontend sources.
- `feincms3_cookiecontrol/static/f3cc.js` and `static/f3cc/gcm.js` — **generated**
  bundles which are committed to the repository. Never edit them by hand.
- `tests/testapp/` — the test project. Tests marked `e2e` drive a real browser
  through playwright.

## Building the frontend

```shell
yarn install && yarn build   # or: node esbuild.js
```

Always rebuild and commit `feincms3_cookiecontrol/static/f3cc.js` after changing
anything below `src/`; the Python tests and the end-to-end tests both run
against the committed bundle.

## Running the tests

```shell
tox                                # full matrix
pytest tests/testapp               # current environment
pytest tests/testapp -m "not e2e"  # skip the browser tests
```

The end-to-end tests need `playwright install chromium` once and the
`DJANGO_ALLOW_ASYNC_UNSAFE=true` environment variable (the test modules set it
via `os.environ.setdefault` at import time, so it is only required when running
individual e2e test files).

E2E tests should register a `pageerror` handler and assert that no uncaught
JavaScript exceptions occurred; several bugs used to hide behind lenient
assertions.

## Conventions

- Linting and formatting run through pre-commit: ruff + ruff-format for Python,
  biome for JavaScript/CSS/JSON. `pre-commit run -a` before committing.
- JavaScript is written without semicolons (biome/prettier configuration).
- User visible strings use the `f3cc` gettext context (`pgettext_lazy("f3cc", …)`).
- Add an entry to the `## Unreleased` section of `CHANGELOG.md` for every
  user visible change.

## Committing

- Commit feature by feature: one self contained change per commit, together
  with its tests and its `CHANGELOG.md` entry. Do not lump unrelated fixes into
  a single commit.
- Rebuilt bundles below `feincms3_cookiecontrol/static/` belong in the same
  commit as the `src/` change which produced them.
- Do not add attribution trailers to commit messages: no `Co-Authored-By`, no
  `Generated with ...` lines, no tool or assistant names.
