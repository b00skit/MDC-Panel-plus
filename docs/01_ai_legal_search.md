# **App Name**: AI Legal Search

## Instructions:
- Only do the implementation in phases, as provided by the developer. You may read the other phases for context but don't worry about implementation of other phases.

### Phase 1:
- In settings add an experimental feature called 'AI Legal Search' with the description 'A Search Engine that returns legal information based on the community's law'.
- When the feature is enabled, enable a new 'Legal Search' navitem.
- When the feature is enabled, disable both the penal code assistant and the caselaw assistant.

### Phase 2:
- Create the backend AI files for the legal search, it should allow a user to prompt a question and the search should search both the caselaw and penal code, similar to how the seperate assistants do but in one singular flow and prompt.
- Ensure the AI flow in the backend is prepared for Phase 3.

### Phase 3:
- Make the /legal-search page, which should look somewhat like a search engine, once you enter a prompt, it should give you a brief explenation before citing you either the penal code, or the caselaw from the data or by linking you to oyuz caselaw directly.