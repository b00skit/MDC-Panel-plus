import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { promises as fs } from 'fs';
import path from 'path';
import MaintenancePage from '@/components/layout/maintenance-page';
import { Footer } from '@/components/layout/footer';
import { Layout } from '@/components/layout/layout';

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
        images: config.SITE_IMAGE ? [config.SITE_IMAGE] : [],
    }
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
