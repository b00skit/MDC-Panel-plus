import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import Image from 'next/image';

type DashboardLayoutProps = {
  children: ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <div className="absolute inset-0 z-0">
          <Image
            src="/img/logos/Logo-SanAndreasSealTransparent.png"
            alt="San Andreas Seal"
            fill
            style={{ objectFit: 'contain' }}
            className="opacity-5"
          />
        </div>
        <div className="relative z-10">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
