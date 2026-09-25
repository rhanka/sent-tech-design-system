# Theme privacy: what it means, and why a grep cannot check it

## The property

Every brand theme in this repository is **private**: it must not appear in the
documentation site's theme picker until a viewer presses **Ctrl+Shift+X**, and it must
appear once they have. Only the house theme and the governmental design systems are
public — `PUBLIC_THEME_IDS` in `apps/docs/src/lib/theme-catalog.ts`, today
`canada`, `dsfr`, `quebec`, `sent-tech`.

That list is a **whitelist**, deliberately: a theme absent from it is private by
construction, so a new brand clone cannot become public by omission. Three unit tests
hold the shape — the exact public list, an unknown id treated as private, and equality
between the runtime list and the pre-hydration allowlist in `apps/docs/src/app.html`.

## Why a grep on the built site proves nothing

Privacy is enforced at **render** time by that whitelist, not by keeping a theme out of
the bundle. **Every** theme ships in `apps/docs/build/_app`, public or not.

So grepping the build for a theme id is doubly sterile:

- finding the id proves **no leak** — it is there by design;
- not finding it would prove **no protection** — the whitelist, not the bundle, decides.

The cheap check can neither confirm nor refute the property, and it returns its verdict
with the same confidence in both directions. That is why the check runs in a browser:
not out of caution, but because the available cheap instrument measures a different
property than the one at stake.

## Running it

```
node scripts/serve-built-docs.mjs apps/docs/build 4173 &
node scripts/verify-theme-privacy.mjs http://localhost:4173/ "Carrefour" "Eiffage"
```

Pass theme **labels**, not ids. The script opens the picker with no shortcut, presses
Ctrl+Shift+X, reopens it, and prints `PRIVACY_CHECK_PASS` (exit 0) only when every named
label is absent before the shortcut, present after it, and the revealed picker is larger
than the public one. It also reports any page error it saw.

Environment overrides: `PW_CHROMIUM` (default `/snap/bin/chromium`), `PW_PROFILE`,
`PW_ROOT` (where `playwright-core` is resolved from; defaults to the repository root).

## Why this is not a CI gate

It needs a Chromium binary, which the pipeline does not carry. And the technical gate,
`skills check apps/docs/build --tech`, only exercises the site under its default theme,
so it never renders a brand theme and cannot see this property either.

This script therefore exists to be **findable and quotable**: when a lot states that its
themes are hidden, this is the thing that was run, and its JSON output is the evidence.
