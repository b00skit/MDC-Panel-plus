
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Settings,
  LifeBuoy,
  Gavel,
  FileText,
  BookOpen,
  Landmark,
  Archive,
  ExternalLink,
  Github,
  Bell,
  MessageSquare,
  Map,
  History,
  Search,
  TextSearch,
  LayoutTemplate,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useScopedI18n } from '@/lib/i18n/client';

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
import { FeedbackDialog } from '../dashboard/feedback-dialog';
import configData from '../../../data/config.json';

type SiteConfig = {
  SITE_NAME: string;
  SITE_FAVICON: string;
  URL_GITHUB: string;
  CASEBOARD_ENABLED: boolean;
  URL_CASEBOARD: string;
};

export function SidebarNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const { state } = useSidebar();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const tNav = useScopedI18n('navigation');

  useEffect(() => {
    setMounted(true);
    setConfig({
      SITE_NAME: 'MDC Panel+',
      SITE_FAVICON: '/img/logos/MDC-Panel-Favicon.svg',
      URL_GITHUB: 'https://github.com/b00skit/MDC-Panel-plus',
      CASEBOARD_ENABLED: configData.CASEBOARD_ENABLED,
      URL_CASEBOARD: configData.URL_CASEBOARD,
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

  const siteName = config?.SITE_NAME.replace('+', '') || 'MDC Panel';

  return (
    <>
      <FeedbackDialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen} />
      <SidebarHeader>
        {state === 'collapsed' ? (
          // Collapsed: logo with trigger underneath
          <div className="flex w-full flex-col items-center gap-2 py-1">
            <Link href="/" className="flex items-center">
              <Image
                src={config?.SITE_FAVICON || '/img/logos/MDC-Panel-Favicon.svg'}
                width={40}
                height={40}
                alt="MDC Panel Logo"
              />
            </Link>
            <SidebarTrigger />
          </div>
        ) : (
          // Expanded: logo+name on the left, trigger on the right
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src={config?.SITE_FAVICON || '/img/logos/MDC-Panel-Favicon.svg'}
                  width={40}
                  height={40}
                  alt="MDC Panel Logo"
                />
              </Link>
              {state === 'expanded' && (
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-semibold font-headline">{siteName}</span>
                  <span className="text-2xl font-bold text-primary drop-shadow-[0_0_3px_hsl(var(--primary)/0.5)]">+</span>
                </div>
              )}
            </div>
            <SidebarTrigger />
          </div>
        )}
      </SidebarHeader>


      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/')}
              tooltip={tNav('dashboard')}
            >
              <Link href="/">
                <LayoutGrid />
                <span>{tNav('dashboard')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/legal-search')}
              tooltip={tNav('legalSearch')}
            >
              <Link href="/legal-search">
                <Search />
                <span>{tNav('legalSearch')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/arrest-calculator')}
              tooltip={tNav('arrestCalculator')}
            >
              <Link href="/arrest-calculator">
                <Gavel />
                <span>{tNav('arrestCalculator')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/arrest-report')}
              tooltip={tNav('arrestReport')}
            >
              <Link href="/arrest-report">
                <FileText />
                <span>{tNav('arrestReport')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/paperwork-generators')}
              tooltip={tNav('paperworkGenerators')}
            >
              <Link href="/paperwork-generators">
                <Archive />
                <span>{tNav('paperworkGenerators')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/simplified-penal-code')}
              tooltip={tNav('simplifiedPenalCode')}
            >
              <Link href="/simplified-penal-code">
                <BookOpen />
                <span>{tNav('simplifiedPenalCode')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/caselaw')}
              tooltip={tNav('caselaw')}
            >
              <Link href="/caselaw">
                <Landmark />
                <span>{tNav('caselaw')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {config?.CASEBOARD_ENABLED ? (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Caseboard">
                <a href={config.URL_CASEBOARD} target="_blank" rel="noopener noreferrer">
                  <LayoutTemplate />
                  <span>Caseboard</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            ) : (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/map')}
                tooltip={tNav('map')}
              >
                <Link href="/map">
                  <Map />
                  <span>{tNav('map')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            )}
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/log-parser')}
              tooltip={tNav('logParser')}
            >
              <Link href="/log-parser">
                <TextSearch />
                <span>{tNav('logParser')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/report-archive')}
              tooltip={tNav('reportArchive')}
            >
              <Link href="/report-archive">
                <History />
                <span>{tNav('reportArchive')}</span>
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
              tooltip={tNav('settings')}
            >
              <Link href="/settings">
                <Settings />
                <span>{tNav('settings')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setIsFeedbackDialogOpen(true)}
              tooltip={tNav('help')}
            >
              <LifeBuoy />
              <span>{tNav('help')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/announcements')}
              tooltip={tNav('announcements')}
            >
              <Link href="/announcements">
                <Bell />
                <span>{tNav('announcements')}</span>
                {unreadCount > 0 && (
                  <SidebarMenuBadge className="bg-destructive text-destructive-foreground">
                    {unreadCount}
                  </SidebarMenuBadge>
                )}
                {state === 'collapsed' && unreadCount > 0 && (
                  <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={tNav('github')}>
              <Link href={config?.URL_GITHUB || '#'} target="_blank">
                <Github />
                <span>{tNav('github')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
