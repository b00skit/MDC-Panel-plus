<p align="center">
  <img width="400px" src="https://raw.githubusercontent.com/CXDezign/MDC-Panel/9422146d3c4d902c141ad16b97c029f885bc3892/images/MDC-Panel.svg">
</p>

# MDC Panel+

MDC Panel+ is a multi-functional tool designed to assist roleplay communities' Law Enforcement Officers with their daily tasks. It provides a suite of tools, generators, and resources for official government use within a roleplaying context. The application is built with Next.js and Tailwind CSS, offering a modern, intuitive, and responsive user experience.

---

## ✨ Key Features

*   **Arrest Calculator**: Calculate arrest sentences and fines based on charges from a comprehensive and up-to-date penal code.
*   **Arrest Report Generator**: Create and manage both basic and advanced arrest reports, with functionality to pre-fill officer and charge details.
*   **Paperwork Generators**: Dynamically generate various types of paperwork from predefined templates. Includes a form builder to create custom templates.
*   **Simplified Penal Code**: An easy-to-navigate and searchable version of the official penal code.
*   **Caselaw & Legal Resources**: Access a database of relevant caselaw and other essential legal resources.
*   **AI Legal Search**: An experimental AI-powered search engine to query the penal code and caselaw.
*   **Interactive Map**: A searchable map of San Andreas with drawing tools, markers, and snapshot functionality.
*   **Log Parser**: A utility to filter GTA:World chat logs for specific character interactions.
*   **Report Archive**: Automatically saves submitted arrest reports and paperwork for future restoration.
*   **Customizable Settings**: Personalize your experience by setting default officer information, managing alternative characters, and controlling the visibility of faction-specific forms.
*   **Theming & Internationalization**: Switch between light and dark modes and multiple languages (English and Spanish supported).

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18.18.0 or higher)
*   npm or yarn
*   Docker and Docker Compose (for containerized setup)

### Installation

1.  Clone the repo:
    ```sh
    git clone https://github.com/b00skit/MDC-Panel-plus.git
    ```
2.  Navigate to the project directory:
    ```sh
    cd MDC-Panel-plus
    ```
3.  Install NPM packages:
    ```sh
    npm install
    ```
4.  Create a `.env` file in the root of the project and add your environment variables:
    ```env
    # Required for AI features
    GEMINI_API_KEY=your_google_ai_api_key_here

    # Optional: For logging errors and feedback to Discord
    DISCORD_LOGS_WEBHOOK_URL=your_error_webhook_url_here
    DISCORD_FEEDBACK_WEBHOOK_URL=your_feedback_webhook_url_here
    ```

---

## 🐳 Running with Docker

For a containerized setup, you can use the provided Docker configuration to run the application.

1.  Ensure you have **Docker** and **Docker Compose** installed on your system.

2.  Make sure you have created the `.env` file as described in the installation steps above.

3.  Build and run the container using Docker Compose:
    ```sh
    docker-compose up -d --build
    ```
4.  The application will be available at [http://localhost:3003](http://localhost:3003).

5.  To stop the application, run:
    ```sh
    docker-compose down
    ```

---

## 📜 Available Scripts

In the project directory, you can run:

*   `npm run dev`: Runs the app in development mode. Open [http://localhost:9002](http://localhost:9002) to view it in the browser.
*   `npm run build`: Builds the app for production to the `.next` folder.
*   `npm run start`: Starts a Next.js production server.
*   `npm run lint`: Runs ESLint to find and fix problems in your code.

---

## 🛠️ Tech Stack

This project is built with a modern tech stack to ensure a high-quality and maintainable application.

*   **Framework**: [Next.js](https://nextjs.org/)
*   **Generative AI**: [Google AI & Genkit](https://firebase.google.com/docs/genkit)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) with `tailwindcss-animate`
*   **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
*   **Form Handling**: [React Hook Form](https://react-hook-form.com/)
*   **Mapping**: [Leaflet](https://leafletjs.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)

---

## ⚙️ Configuration

All runtime settings live in `data/config.json`. The application reads this file during server rendering and inside client components, so changes take effect without rebuilding the codebase. 

**Site lifecycle and identity**

* **`SITE_LIVE`** – When `false`, the root layout renders a maintenance screen instead of the dashboard, which is useful for taking the panel offline during upgrades. 
* **`SITE_NAME`, `SITE_DESCRIPTION`, `SITE_IMAGE`, `SITE_FAVICON`, `SITE_LOGO`, `SITE_VERSION`** – Populate metadata, OpenGraph/Twitter previews, and footer branding across the app. 
* **`SITE_URL`** – Sets the canonical base URL used for metadata construction and for redirecting beta users back to production. 
* **`SITE_LANGUAGE`** – Forces a specific locale to load regardless of browser preferences, allowing operators to pin the UI language. 
* **`SITE_DISCORD_CONTACT`** – Displayed on the About page so users know who to reach for support. 

**Release management and beta tooling**

* **`CACHE_VERSION`** – When incremented, the client clears browser caches/cookies and reloads to ensure users fetch new static data. 
* **`LOCAL_STORAGE_VERSION`** – Works like `CACHE_VERSION`, but specifically clears `localStorage` to invalidate persisted drafts or settings. 
* **`BETA_ENABLED`** and **`BETA_CODE`** – Gatekeep beta environments; if beta access is disabled, users on beta domains must enter the configured code to continue. 

**Feature toggles and calculator limits**

* **`ENABLE_FORM_BUILDER`** – Enables the Paperwork Generator Builder UI when set to `true`. 
* **`MAX_SENTENCE_DAYS`, `MAX_IMPOUND_DAYS`, `MAX_SUSPENSION_DAYS`** – Cap the arrest calculator outputs and show warnings when totals exceed policy. 
* **`PAROLE_VIOLATION_DEFINITION`** – Names the parole violation addition so calculators and reports can treat it specially. 

**External data delivery**

* **`CONTENT_DELIVERY_NETWORK`** – Base URL for fetching GTAW datasets when CDN delivery is allowed. 
* **`DISABLE_GTAW_CDN`** – Forces the app to serve GTAW data from its own API route instead of the CDN when `true`. 

**Link directory**

* All **`URL_*`** entries (e.g., `URL_DISCORD`, `URL_PENAL_CODE`, `URL_STREETS`) centralize outbound links so that content files such as `help.json` and `resources.json` can reference them by key. 

The visual theme, colors, and layout remain defined in `tailwind.config.ts` and `src/app/globals.css` following the project's design blueprint.

---

## 🌐 Internationalization (i18n)

Translations are stored as locale-specific JSON dictionaries under `data/i18n`. The Next.js config automatically reads the available files and exposes the list of locales to the client. 

At runtime the server resolves the active locale by checking `SITE_LANGUAGE`, then a `locale` cookie, and finally the browser's `Accept-Language` header, falling back to English when no match is found. 

Client components consume translations through the i18n provider, and the language switcher writes a `locale` cookie before refreshing the router so the new language is rendered across the app. 

**Adding a new language**

1. Create `data/i18n/<locale>.json` (copy `en.json` as a template) and translate each key. Keep the same nested structure so components can resolve strings. 
2. No manual wiring is needed—Next.js picks up new locale files automatically, and the locale list is published via `NEXT_PUBLIC_I18N_LOCALES`. 
3. Add human-readable labels for the new locale inside the language switcher or reuse the locale code directly. 
4. Optional: set `SITE_LANGUAGE` in `config.json` to force every visitor to use the new locale by default. 

Users can swap languages from the settings sidebar at any time; the selection persists in a long-lived cookie managed by the switcher component. 

---

## 📈 Analytics Tracking

Anonymous analytics are configured through `data/analytics.json`, which stores the Matomo endpoint and site ID.  The `Matomo` client component reads those values, honors the user's opt-out preference from local storage, and only initializes tracking during production builds. 

To point the panel at your own analytics server, update the URL and tracker ID in `analytics.json`. The opt-out toggle on the Settings page will continue to suppress tracking because the component checks the shared `site-settings-storage` state before sending events. 

---

## 📰 Announcements, Notices, and Changelog

These UI surfaces are powered entirely by JSON files in the `data/` directory.

* **Announcements** – `data/announcements.json` contains an ordered list of announcement cards with `id`, `date`, `title`, `content`, and optional button metadata. The sidebar compares the highest stored `id` against local storage to calculate an unread badge. 
* **Dashboard notice** – `data/notice.json` defines a single alert banner that can be dismissed per-session, including severity (`variant`), icon name, and optional CTA behavior. 
* **Changelog** – `data/changelog.json` tracks release history with version metadata and categorized change items. Editors can append entries at the top of the array; optional `cacheVersion` fields align with `CACHE_VERSION` to bust caches when large data migrations occur. 

Edit these files, commit the changes, and redeploy; the UI will automatically render the new content without additional wiring.

---

## 🆘 Help & Resource Content

Support content is also data-driven:

* `data/help.json` defines the quick links and FAQ entries for the Help page. Each resource item can either open a feedback dialog or resolve a URL key from `config.json`, while FAQs render Markdown-style emphasis. 
* `data/resources.json` supplies reusable resource cards on the Caselaw page, supporting external links, inline dialogs, and copy-to-clipboard actions. Each card can reference `config.json` URLs or embed its own content block. 

Update these JSON files to add, remove, or tweak help resources without touching React components.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.
