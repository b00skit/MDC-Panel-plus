
'use client';

import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from '@/i18n/translation-context';

type LayoutProps = {
  children: ReactNode;
  footer: ReactNode;
};

export function Layout({ children, footer }: LayoutProps) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <div
          className="fixed top-0 bottom-0 right-0 left-0 md:left-[var(--sidebar-width)] z-0 flex items-center justify-center pointer-events-none"
        >
            <div className="relative w-[60%] h-[60%]">
                <Image
                    src="/img/logos/Logo-SanAndreasSeal.png"
                    alt="San Andreas Seal"
                    fill
                    style={{ objectFit: 'contain' }}
                    className="opacity-5"
                />
            </div>
        </div>
        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="md:hidden sticky top-0 z-20 border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/75">
            <div className="flex items-center justify-between">
              <SidebarTrigger className="-ml-2" />
              <Link href={`/${locale}`} className="flex items-baseline gap-1 font-headline text-lg font-semibold">
                <span>{t('common.brand.name')}</span>
                <span className="text-primary">{t('common.brand.suffix')}</span>
              </Link>
              <div className="w-9" aria-hidden />
            </div>
          </div>
          <div className="flex-grow">
            {children}
          </div>
          {footer}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
