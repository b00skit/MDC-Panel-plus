import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import Image from 'next/image';
import { Separator } from '../ui/separator';

type LayoutProps = {
  children: ReactNode;
};

function Footer() {
    return (
      <footer className="relative z-10 mt-auto py-6">
        <Separator className="my-4 bg-transparent" />
        <div className="container mx-auto flex flex-col items-center justify-center gap-4">
            <Image 
                src="/img/logos/MDC-Panel.svg"
                width={80}
                height={40}
                alt="MDC Panel Logo"
            />
          <p className="text-center text-sm text-muted-foreground">
            &copy; 2025-{new Date().getFullYear() + 1} MDC Panel. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <div className="absolute inset-0 z-0">
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
            <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
