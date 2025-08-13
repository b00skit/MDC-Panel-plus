
'use client';

import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import Image from 'next/image';

type LayoutProps = {
  children: ReactNode;
  footer: ReactNode;
};

export function Layout({ children, footer }: LayoutProps) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <div className="fixed inset-y-20 inset-x-16 z-0 md:inset-x-32 lg:inset-x-64">
          <Image
            src="/img/logos/Logo-SanAndreasSeal.png"
            alt="San Andreas Seal"
            fill
            style={{ objectFit: 'contain' }}
            className="opacity-5"
          />
        </div>
        <div className="relative z-10 flex min-h-screen flex-col">
            <div className="flex-grow">
                {children}
            </div>
            {footer}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
