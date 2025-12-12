## 2025-12-12 - [XSS via Handlebars noEscape]
**Vulnerability:** Found `dangerouslySetInnerHTML` populated by `Handlebars.compile` with `{ noEscape: true }`. This allowed any user input (which was injected into the template) to contain executable scripts if the template structure itself was HTML.
**Learning:** The developer likely used `noEscape: true` to preserve the HTML structure of the template, not realizing it also disables escaping of user variables.
**Prevention:** Use `noEscape: false` (default) for HTML templates, allowing Handlebars to escape variables while preserving template structure. Only use `noEscape: true` for plain text targets (like input values or textareas) where HTML entities are undesirable.
