
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
            <div className="flex-grow">
                {children}
            </div>
            {footer}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
