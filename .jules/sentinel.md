## 2025-12-12 - [XSS via Handlebars noEscape]
**Vulnerability:** Found `dangerouslySetInnerHTML` populated by `Handlebars.compile` with `{ noEscape: true }`. This allowed any user input (which was injected into the template) to contain executable scripts if the template structure itself was HTML.
**Learning:** The developer likely used `noEscape: true` to preserve the HTML structure of the template, not realizing it also disables escaping of user variables.
**Prevention:** Use `noEscape: false` (default) for HTML templates, allowing Handlebars to escape variables while preserving template structure. Only use `noEscape: true` for plain text targets (like input values or textareas) where HTML entities are undesirable.

## 2025-02-20 - [Stored XSS in Custom Button Link]
**Vulnerability:** Found `javascript:` protocol execution vulnerability in `paperwork-submit-page.tsx`. The `custom_button_link` was rendered directly into an `<a>` tag `href` without sanitization. Since generator configs can be created by unauthenticated users, this allowed Stored XSS.
**Learning:** `Handlebars.compile` with `noEscape: true` (or just string concatenation) combined with `href` attributes requires explicit URL sanitization. React does not sanitize `href` protocols.
**Prevention:** Use a URL sanitizer that creates an allowlist of protocols (http, https, mailto, tel) and rejects `javascript:` and others.
