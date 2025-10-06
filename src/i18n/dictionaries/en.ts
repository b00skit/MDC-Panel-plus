const en = {
  common: {
    brand: {
      name: 'MDC Panel',
      nameWithSuffix: 'MDC Panel+',
      suffix: '+',
    },
    actions: {
      goToLive: 'Go to Live Site',
      exportData: 'Export Data',
    },
    notSet: 'Not Set',
  },
  maintenance: {
    title: 'Under Maintenance',
    message: 'We are currently performing scheduled maintenance. We should be back online shortly.',
  },
  beta: {
    title: 'Beta Access has Ended',
    message: 'This beta version is no longer active. Please use the main site.',
    toastTitle: 'Data Exported',
    toastDescription: 'A file with your data has been downloaded.',
  },
  navigation: {
    dashboard: 'Dashboard',
    legalSearch: 'Legal Search',
    arrestCalculator: 'Arrest Calculator',
    arrestReport: 'Arrest Report',
    paperworkGenerators: 'Paperwork Generators',
    simplifiedPenalCode: 'Simplified Penal Code',
    caselaw: 'Caselaw & Legal Resources',
    map: 'Interactive Map',
    logParser: 'Log Parser',
    reportArchive: 'Report Archive',
    settings: 'Settings',
    help: 'Help & Feedback',
    announcements: 'Announcements',
    github: 'GitHub',
  },
  navigationTooltips: {
    dashboard: 'Dashboard',
    legalSearch: 'Legal Search',
    arrestCalculator: 'Arrest Calculator',
    arrestReport: 'Arrest Report',
    paperworkGenerators: 'Paperwork Generators',
    simplifiedPenalCode: 'Simplified Penal Code',
    caselaw: 'Caselaw & Legal Resources',
    map: 'Interactive Map',
    logParser: 'Log Parser',
    reportArchive: 'Report Archive',
    settings: 'Settings',
    help: 'Help & Feedback',
    announcements: 'Announcements',
    github: 'GitHub',
  },
  footer: {
    rights: 'All rights reserved.',
    versionLabel: 'Version',
    about: 'About Page',
    credits: 'Credits and Contributions',
  },
  about: {
    metadataTitle: 'About',
    header: {
      title: 'About MDC Panel+',
      description: 'A passion project designed to help.',
    },
    intro: {
      heading: "What's this all about?",
      paragraphs: [
        "Hello! I'm a solo developer who created this tool out of a genuine desire to assist our roleplay community's law enforcement officers. My goal was simple: make the paperwork and resource-gathering aspects of the job a little easier and more efficient.",
        'This project is a labor of love, built to streamline daily tasks and provide a centralized hub for essential LEO tools. Whether you\'re calculating a sentence, writing a report, or looking up a piece of caselaw, I hope this panel makes your experience smoother.',
      ],
    },
    tech: {
      heading: 'Technical Tidbits',
      description: 'A brief look under the hood.',
      cards: {
        openSourceTitle: 'Open Source',
        openSourceText: 'This entire project is open-source. You can view the code, suggest changes, or even contribute yourself over at the <a href="{github}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">GitHub repository</a>.',
        aiTitle: 'AI-Assisted Development',
        aiText: 'To accelerate development and explore modern coding practices, this application was built with the assistance of AI, specifically Google\'s Firebase Studio.',
      },
      table: {
        siteVersion: {
          label: 'Site Version',
          tooltip: 'The current public version of the application.',
        },
        cacheVersion: {
          label: 'Cache Version',
          tooltip: 'Controls browser cache; changes on major updates to force-fetch new assets.',
        },
        localStorageVersion: {
          label: 'Local Storage Version',
          tooltip: 'Controls local data; changes on major updates to clear outdated settings.',
        },
        cdn: {
          label: 'CDN',
          tooltip: 'The base URL from which static assets like penal codes are served.',
        },
        github: {
          label: 'GitHub Repository',
          tooltip: 'The public source code for this project.',
        },
        discord: {
          label: 'Discord Community',
          tooltip: 'The official community and support server.',
        },
      },
    },
    support: {
      heading: 'Support & Donations',
      description: "Your support is appreciated, but let's share the love.",
      body: 'While I truly appreciate any thought of a donation, I\'d first encourage you to support the platforms and people who made this project possible. Please consider donating to <a href="https://gta.world/" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">GTA:World</a> for keeping our community running, or to the original creator of the MDC Panel, <strong>CXDezign</strong>, whose foundation I built upon.',
      founderCta: 'Support the Founder',
      donateCta: 'Donate to me on Ko-fi',
    },
    contact: {
      heading: 'Contact & Feedback',
      body: 'The current maintainer is <strong>{contact}</strong>. If you have any questions, find a bug, or have a suggestion, please feel free to reach out via Discord or use the feedback form available on the site.',
    },
  },
};

export default en;
