
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Settings,
  LifeBuoy,
  Sun,
  Moon,
  Gavel,
  FileText,
  BookOpen,
  Landmark,
  Puzzle,
  ExternalLink,
  Github,
  Bell,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
  SidebarMenuBadge,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import announcementsData from '../../../data/announcements.json';

type SiteConfig = {
  SITE_NAME: string;
  SITE_FAVICON: string;
  URL_GITHUB: string;
};

export function SidebarNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const { state } = useSidebar();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    setConfig({
      SITE_NAME: 'MDC Panel+',
      SITE_FAVICON: '/img/logos/MDC-Panel-Favicon.svg',
      URL_GITHUB: 'https://github.com/biscuitgtaw/MDC-Panel',
    });
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        const lastReadId = parseInt(localStorage.getItem('last_read_announcement') || '0', 10);
        const newUnreadCount = announcementsData.announcements.filter(ann => ann.id > lastReadId).length;
        setUnreadCount(newUnreadCount);
      }
    };
    
    handleStorageChange(); // Initial check
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname]);


  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const siteName = config?.SITE_NAME.replace('+', '') || 'MDC Panel';

  return (
    <>
      <SidebarHeader>
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={
                  config?.SITE_FAVICON || '/img/logos/MDC-Panel-Favicon.svg'
                }
                width={40}
                height={40}
                alt="MDC Panel Logo"
              />
            </Link>
            {state === 'expanded' && (
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-semibold font-headline">
                  {siteName}
                </span>
                <span className="text-2xl font-bold text-primary drop-shadow-[0_0_3px_hsl(var(--primary)/0.5)]">
                  +
                </span>
              </div>
            )}
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/')}
              tooltip="Dashboard"
            >
              <Link href="/">
                <LayoutGrid />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/arrest-calculator')}
              tooltip="Arrest Calculator"
            >
              <Link href="/arrest-calculator">
                <Gavel />
                <span>Arrest Calculator</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/arrest-report')}
              tooltip="Arrest Report"
            >
              <Link href="/arrest-report">
                <FileText />
                <span>Arrest Report</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/paperwork-generators')}
              tooltip="Paperwork Generators"
            >
              <Link href="/paperwork-generators">
                <Puzzle />
                <span>Paperwork Generators</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/simplified-penal-code')}
              tooltip="Simplified Penal Code"
            >
              <Link href="/simplified-penal-code">
                <BookOpen />
                <span>Simplified Penal Code</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/caselaw')}
              tooltip="Caselaw & Legal Resources"
            >
              <Link href="/caselaw">
                <Landmark />
                <span>Caselaw &amp; Legal Resources</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <Separator className="my-2" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/settings')}
              tooltip="Settings"
            >
              <Link href="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/announcements')}
              tooltip="Announcements"
            >
              <Link href="/announcements">
                <Bell />
                <span>Announcements</span>
                {unreadCount > 0 && (
                    <SidebarMenuBadge className="bg-destructive text-destructive-foreground">{unreadCount}</SidebarMenuBadge>
                )}
                 {state === 'collapsed' && unreadCount > 0 && (
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
             <SidebarMenuButton
                asChild
                tooltip="Github"
             >
                <Link href={config?.URL_GITHUB || '#'} target="_blank">
                    <Github />
                    <span>Github</span>
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleTheme}
              tooltip={
                mounted ? (theme === 'light' ? 'Light Mode' : 'Dark Mode') : 'Dark Mode'
              }
            >
              {mounted ? theme === 'light' ? <Sun /> : <Moon /> : <Moon />}
              <span>
                {mounted
                  ? theme === 'light'
                    ? 'Light Mode'
                    : 'Dark Mode'
                  : 'Dark Mode'}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
