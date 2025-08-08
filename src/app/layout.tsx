import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { promises as fs } from 'fs';
import path from 'path';
import MaintenancePage from '@/components/layout/maintenance-page';

type SiteConfig = {
  SITE_LIVE: boolean;
  SITE_NAME: string;
  SITE_DESCRIPTION: string;
  SITE_VERSION: string;
};

// This function is marked as async because it fetches data.
export async function generateMetadata(): Promise<Metadata> {
  const file = await fs.readFile(
    path.join(process.cwd(), 'public/data/config.json'),
    'utf8'
  );
  const config: SiteConfig = JSON.parse(file);

  return {
    title: config.SITE_NAME,
    description: config.SITE_DESCRIPTION,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const file = await fs.readFile(
    path.join(process.cwd(), 'public/data/config.json'),
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
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
