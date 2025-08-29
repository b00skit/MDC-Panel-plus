<p align="center">
  <img width="400px" src="https://raw.githubusercontent.com/CXDezign/MDC-Panel/9422146d3c4d902c141ad16b97c029f885bc3892/images/MDC-Panel.svg">
</p>

# MDC Panel+

MDC Panel+ is a multi-functional tool designed to assist roleplay communities' Law Enforcement Officers with their daily tasks. It provides a suite of tools, generators, and resources for official government use within a roleplaying context. The application is built with Next.js and Tailwind CSS, offering a modern, intuitive, and responsive user experience.

---

## ✨ Key Features

* **Arrest Calculator**: Calculate arrest sentences and fines based on charges from a comprehensive and up-to-date penal code.
* **Arrest Report Generator**: Create and manage both basic and advanced arrest reports, with functionality to pre-fill officer and charge details.
* **Paperwork Generators**: Dynamically generate various types of paperwork from predefined templates. Includes a form builder to create custom templates.
* **Simplified Penal Code**: An easy-to-navigate and searchable version of the official penal code.
* **Caselaw & Legal Resources**: Access a database of relevant caselaw and other essential legal resources.
* **Customizable Settings**: Personalize your experience by setting default officer information, managing alternative characters, and controlling the visibility of faction-specific forms.
* **Theming**: Switch between light and dark modes to suit your preference.

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js (v18.18.0 or higher)
* npm or yarn
* Docker and Docker Compose (for containerized setup)

### Installation

1.  Clone the repo:
    ```sh
    git clone [https://github.com/b00skit/MDC-Panel-plus.git](https://github.com/b00skit/MDC-Panel-plus.git)
    ```
2.  Navigate to the project directory:
    ```sh
    cd MDC-Panel-plus
    ```
3.  Install NPM packages:
    ```sh
    npm install
    ```
4.  Create a `.env` file in the root of the project and add your Discord Webhook URL and Matomo settings:
    ```
    DISCORD_WEBHOOK_URL=your_webhook_url_here
    NEXT_PUBLIC_MATOMO_URL=https://your-matomo-domain.example/
    NEXT_PUBLIC_MATOMO_SITE_ID=1
    ```
    * `NEXT_PUBLIC_MATOMO_URL` should point to your Matomo server and end with a trailing slash.
    * `NEXT_PUBLIC_MATOMO_SITE_ID` must match the site ID configured in that Matomo instance.

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

* `npm run dev`: Runs the app in development mode. Open [http://localhost:9002](http://localhost:9002) to view it in the browser.
* `npm run build`: Builds the app for production to the `.next` folder.
* `npm run start`: Starts a Next.js production server.
* `npm run lint`: Runs ESLint to find and fix problems in your code.

---

## 🛠️ Tech Stack

This project is built with a modern tech stack to ensure a high-quality and maintainable application.

* **Framework**: [Next.js](https://nextjs.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) with `tailwindcss-animate`
* **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
* **State Management**: [Zustand](https://github.com/pmndrs/zustand)
* **Form Handling**: [React Hook Form](https://react-hook-form.com/)
* **Icons**: [Lucide React](https://lucide.dev/)

---

## ⚙️ Configuration

The application's core settings are managed through the `data/config.json` file. This includes the site name, version, descriptions, and feature flags like enabling the form builder.

The visual theme, colors, and layout are defined in `tailwind.config.ts` and `src/app/globals.css`, following the design principles outlined in the project's blueprint.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.
