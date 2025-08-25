
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { promises as fs } from 'fs';
import path from 'path';
import MaintenancePage from '@/components/layout/maintenance-page';
import { Footer } from '@/components/layout/footer';
import { Layout } from '@/components/layout/layout';
import Script from 'next/script';

type SiteConfig = {
  SITE_LIVE: boolean;
  SITE_NAME: string;
  SITE_DESCRIPTION: string;
  SITE_VERSION: string;
  SITE_FAVICON?: string;
  SITE_IMAGE?: string;
};

// This function is marked as async because it fetches data.
export async function generateMetadata(): Promise<Metadata> {
  const file = await fs.readFile(
    path.join(process.cwd(), 'data/config.json'),
    'utf8'
  );
  const config: SiteConfig = JSON.parse(file);

  return {
    title: config.SITE_NAME,
    description: config.SITE_DESCRIPTION,
    icons: {
        icon: config.SITE_FAVICON || '/favicon.ico',
    },
    openGraph: {
        title: config.SITE_NAME,
        description: config.SITE_DESCRIPTION,
        type: 'website',
        images: config.SITE_IMAGE ? [
          {
            url: config.SITE_IMAGE,
            width: 1200,
            height: 630,
            alt: `${config.SITE_NAME} Logo`,
          },
        ] : [],
    },
    twitter: {
        card: 'summary_large_image',
        title: config.SITE_NAME,
        description: config.SITE_DESCRIPTION,
        images: config.SITE_IMAGE ? [config.SITE_IMAGE] : [],
    },
  };
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
        <body className="font-body antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <MaintenancePage />
          </ThemeProvider>
        </body>
      </html>
    );
  }


  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      <meta property="og:title" content={config.SITE_NAME} />
        <meta
          property="og:description"
          content={config.SITE_DESCRIPTION}
        />
        <meta
          property="og:image"
          content={config.SITE_IMAGE || '/img/logos/MDC-Panel.svg'}
        />
        <meta
          property="og:image:alt"
          content={`${config.SITE_NAME} logo`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={config.SITE_NAME} />
        <meta
          name="twitter:description"
          content={config.SITE_DESCRIPTION}
        />
        <meta
          name="twitter:image"
          content={config.SITE_IMAGE || '/img/logos/MDC-Panel.svg'}
        />
        <meta
          name="twitter:image:alt"
          content={`${config.SITE_NAME} logo`}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
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
        {process.env.NODE_ENV === 'production' && (
          <Script id="matomo-tracking" strategy="afterInteractive">
            {`
              var _paq = window._paq = window._paq || [];
              /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
              _paq.push(['trackPageView']);
              _paq.push(['enableLinkTracking']);
              (function() {
                var u="//sys.booskit.dev/analytics/";
                _paq.push(['setTrackerUrl', u+'matomo.php']);
                _paq.push(['setSiteId', '1']);
                var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
                g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
              })();
            `}
          </Script>
        )}
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Layout footer={<Footer />}>
            {children}
          </Layout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
