const es = {
  common: {
    brand: {
      name: 'Panel MDC',
      nameWithSuffix: 'Panel MDC+',
      suffix: '+',
    },
    actions: {
      goToLive: 'Ir al sitio principal',
      exportData: 'Exportar datos',
    },
    notSet: 'No establecido',
  },
  maintenance: {
    title: 'En mantenimiento',
    message: 'Estamos realizando tareas de mantenimiento programadas. Volveremos a estar en línea en breve.',
  },
  beta: {
    title: 'El acceso beta ha finalizado',
    message: 'Esta versión beta ya no está activa. Utiliza el sitio principal.',
    toastTitle: 'Datos exportados',
    toastDescription: 'Se descargó un archivo con tus datos.',
  },
  navigation: {
    dashboard: 'Panel de control',
    legalSearch: 'Búsqueda legal',
    arrestCalculator: 'Calculadora de arrestos',
    arrestReport: 'Informe de arresto',
    paperworkGenerators: 'Generadores de documentos',
    simplifiedPenalCode: 'Código penal simplificado',
    caselaw: 'Jurisprudencia y recursos legales',
    map: 'Mapa interactivo',
    logParser: 'Analizador de registros',
    reportArchive: 'Archivo de informes',
    settings: 'Configuración',
    help: 'Ayuda y comentarios',
    announcements: 'Anuncios',
    github: 'GitHub',
  },
  navigationTooltips: {
    dashboard: 'Panel de control',
    legalSearch: 'Búsqueda legal',
    arrestCalculator: 'Calculadora de arrestos',
    arrestReport: 'Informe de arresto',
    paperworkGenerators: 'Generadores de documentos',
    simplifiedPenalCode: 'Código penal simplificado',
    caselaw: 'Jurisprudencia y recursos legales',
    map: 'Mapa interactivo',
    logParser: 'Analizador de registros',
    reportArchive: 'Archivo de informes',
    settings: 'Configuración',
    help: 'Ayuda y comentarios',
    announcements: 'Anuncios',
    github: 'GitHub',
  },
  footer: {
    rights: 'Todos los derechos reservados.',
    versionLabel: 'Versión',
    about: 'Acerca de',
    credits: 'Créditos y colaboradores',
  },
  about: {
    metadataTitle: 'Acerca de',
    header: {
      title: 'Acerca de Panel MDC+',
      description: 'Un proyecto hecho con cariño para ayudar.',
    },
    intro: {
      heading: '¿De qué se trata todo esto?',
      paragraphs: [
        '¡Hola! Soy un desarrollador independiente que creó esta herramienta con el deseo sincero de ayudar a los agentes de nuestra comunidad de rol. Mi objetivo era sencillo: hacer que la burocracia y la búsqueda de recursos fueran un poco más fáciles y eficientes.',
        'Este proyecto es un trabajo de amor, creado para agilizar tareas diarias y ofrecer un centro unificado con herramientas esenciales. Ya sea que calcules una sentencia, redactes un informe o busques jurisprudencia, espero que este panel haga tu experiencia más fluida.',
      ],
    },
    tech: {
      heading: 'Detalles técnicos',
      description: 'Un vistazo rápido bajo el capó.',
      cards: {
        openSourceTitle: 'Código abierto',
        openSourceText: 'Todo el proyecto es de código abierto. Puedes ver el código, sugerir cambios o incluso contribuir tú mismo en el <a href="{github}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">repositorio de GitHub</a>.',
        aiTitle: 'Desarrollo asistido por IA',
        aiText: 'Para acelerar el desarrollo y explorar prácticas modernas, esta aplicación se construyó con la ayuda de IA, específicamente Firebase Studio de Google.',
      },
      table: {
        siteVersion: {
          label: 'Versión del sitio',
          tooltip: 'La versión pública actual de la aplicación.',
        },
        cacheVersion: {
          label: 'Versión de caché',
          tooltip: 'Controla la caché del navegador; se actualiza en cambios mayores para forzar la descarga de nuevos recursos.',
        },
        localStorageVersion: {
          label: 'Versión de almacenamiento local',
          tooltip: 'Controla los datos locales; se actualiza en cambios mayores para limpiar configuraciones obsoletas.',
        },
        cdn: {
          label: 'CDN',
          tooltip: 'La URL base desde la que se sirven los recursos estáticos como el código penal.',
        },
        github: {
          label: 'Repositorio de GitHub',
          tooltip: 'El código fuente público de este proyecto.',
        },
        discord: {
          label: 'Comunidad de Discord',
          tooltip: 'La comunidad oficial y el servidor de soporte.',
        },
      },
    },
    support: {
      heading: 'Apoyo y donaciones',
      description: 'Agradezco tu apoyo, pero compartamos el reconocimiento.',
      body: 'Aunque agradezco cualquier donación, primero te invito a apoyar a las plataformas y personas que hicieron posible este proyecto. Considera donar a <a href="https://gta.world/" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">GTA:World</a> por mantener viva a nuestra comunidad, o al creador original del Panel MDC, <strong>CXDezign</strong>, cuya base utilicé.',
      founderCta: 'Apoyar al fundador',
      donateCta: 'Donarme en Ko-fi',
    },
    contact: {
      heading: 'Contacto y comentarios',
      body: 'El responsable actual es <strong>{contact}</strong>. Si tienes preguntas, encuentras un error o tienes una sugerencia, contáctame por Discord o usa el formulario de comentarios disponible en el sitio.',
    },
  },
};

export default es;
