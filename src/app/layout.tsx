import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { promises as fs } from 'fs';
import path from 'path';
import FullScreenMessage from '@/components/layout/maintenance-page';
import { Footer } from '@/components/layout/footer';
import { Layout } from '@/components/layout/layout';
import { ClientLayout } from '@/components/layout/client-layout';
import { Matomo } from '@/components/matomo';

type SiteConfig = {
  SITE_LIVE: boolean;
  SITE_NAME: string;
  SITE_DESCRIPTION: string;
  SITE_VERSION: string;
  SITE_FAVICON?: string;
  SITE_IMAGE?: string;
  CACHE_VERSION?: string;
  LOCAL_STORAGE_VERSION?: string;
};

// ---- Next.js Metadata (the "Next.js way") ----
export async function generateMetadata(): Promise<Metadata> {
  const file = await fs.readFile(
    path.join(process.cwd(), 'data/config.json'),
    'utf8'
  );
  const config: SiteConfig = JSON.parse(file);

  return {
    title: config.SITE_NAME,
    description: config.SITE_DESCRIPTION,
    keywords: [
      'booskit','booskit.dev','MDC','MDC Panel','Mobile','Data','Computer','Panel',
      'GTA5','GTAV','GTAO','GTA RP','Roleplay','RP','GTA World','GTAW','GTA:World','GTA:W',
      'LSPD','LSSD','LSFD','Government','Penal Code','Los Santos Police Department',
      "Los Santos Fires Department","Los Santos Sheriff's Department",
      'Los Santos','Department','Agencies','Agency','Factions'
    ],
    robots: {
      index: true,
      follow: true,
      // Emits <meta name="googlebot" content="all">
      googleBot: 'all',
    },
    manifest: '/img/favicon/site.webmanifest',
    themeColor: '#131313',
    icons: {
      icon: config.SITE_FAVICON || '/img/favicon/favicon.ico',
      shortcut: '/img/favicon/favicon.ico',
    },
    openGraph: {
      title: config.SITE_NAME,
      description: config.SITE_DESCRIPTION,
      type: 'website',
      images: config.SITE_IMAGE
        ? [
            {
              url: config.SITE_IMAGE,
              width: 1200,
              height: 630,
              alt: `${config.SITE_NAME}`,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: config.SITE_NAME,
      description: config.SITE_DESCRIPTION,
      images: config.SITE_IMAGE ? [config.SITE_IMAGE] : [],
    },
  };
}

// Reusable <head> bits that Metadata API doesn't cover
function ExtraHead() {
  return (
    <head>
      {/* Not available via Metadata API */}
      <meta name="googlebot-news" content="all" />

      {/* msapplication meta */}
      <meta name="msapplication-TileColor" content="#131313" />
      <meta name="msapplication-TileImage" content="/img/favicon/mstile-144x144.png" />
      <meta name="msapplication-config" content="/img/favicon/browserconfig.xml" />

      {/* Fonts & CSS (keep here for convenience) */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet-search@4.0.0/dist/leaflet-search.min.css"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css"
      />

      {/* Not handled by Metadata API */}
      <link
        rel="mask-icon"
        href="/img/favicon/safari-pinned-tab.svg"
        color="#e2b055"
      />

    </head>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const file = await fs.readFile(
    path.join(process.cwd(), 'data/config.json'),
    'utf8'
  );
  const config: SiteConfig = JSON.parse(file);

  if (!config.SITE_LIVE) {
    return (
      <html lang="en" suppressHydrationWarning>
        <ExtraHead />
        <body className="font-body antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <FullScreenMessage
              title="Under Maintenance"
              message="We are currently performing scheduled maintenance. We should be back online shortly."
            />
          </ThemeProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <ExtraHead />
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Matomo />
          <ClientLayout
            cacheVersion={config.CACHE_VERSION}
            localStorageVersion={config.LOCAL_STORAGE_VERSION}
          >
            <Layout footer={<Footer />}>{children}</Layout>
            <Toaster />
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
