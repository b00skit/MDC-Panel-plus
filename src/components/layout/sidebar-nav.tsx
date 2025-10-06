
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
import { FeedbackDialog } from '../dashboard/feedback-dialog';
import { useLocale, useTranslations } from '@/i18n/translation-context';

type SiteConfig = {
  SITE_NAME: string;
  SITE_FAVICON: string;
  URL_GITHUB: string;
};

export function SidebarNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const { state } = useSidebar();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const nav = useTranslations('navigation');
  const tooltip = useTranslations('navigationTooltips');
  const t = useTranslations();
  const locale = useLocale();
  const withLocale = (path: string) => {
    if (path === '/') {
      return `/${locale}`;
    }
    return `/${locale}${path}`;
  };

  useEffect(() => {
    setMounted(true);
    setConfig({
      SITE_NAME: 'MDC Panel+',
      SITE_FAVICON: '/img/logos/MDC-Panel-Favicon.svg',
      URL_GITHUB: 'https://github.com/b00skit/MDC-Panel-plus',
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
    const targetPath = withLocale(path);
    return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
  };

  const siteName =
    config?.SITE_NAME.replace('+', '') || t('common.brand.name');

  return (
    <>
      <FeedbackDialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen} />
      <SidebarHeader>
        {state === 'collapsed' ? (
          // Collapsed: logo with trigger underneath
          <div className="flex w-full flex-col items-center gap-2 py-1">
            <Link href={`/${locale}`} className="flex items-center">
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
              <Link href={`/${locale}`} className="flex items-center gap-2">
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
                  <span className="text-2xl font-bold text-primary drop-shadow-[0_0_3px_hsl(var(--primary)/0.5)]">{t('common.brand.suffix')}</span>
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
              tooltip={tooltip('dashboard')}
            >
              <Link href={withLocale('/')}>
                <LayoutGrid />
                <span>{nav('dashboard')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/legal-search')}
              tooltip={tooltip('legalSearch')}
            >
              <Link href={withLocale('/legal-search')}>
                <Search />
                <span>{nav('legalSearch')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/arrest-calculator')}
              tooltip={tooltip('arrestCalculator')}
            >
              <Link href={withLocale('/arrest-calculator')}>
                <Gavel />
                <span>{nav('arrestCalculator')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/arrest-report')}
              tooltip={tooltip('arrestReport')}
            >
              <Link href={withLocale('/arrest-report')}>
                <FileText />
                <span>{nav('arrestReport')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/paperwork-generators')}
              tooltip={tooltip('paperworkGenerators')}
            >
              <Link href={withLocale('/paperwork-generators')}>
                <Archive />
                <span>{nav('paperworkGenerators')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/simplified-penal-code')}
              tooltip={tooltip('simplifiedPenalCode')}
            >
              <Link href={withLocale('/simplified-penal-code')}>
                <BookOpen />
                <span>{nav('simplifiedPenalCode')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/caselaw')}
              tooltip={tooltip('caselaw')}
            >
              <Link href={withLocale('/caselaw')}>
                <Landmark />
                <span>{nav('caselaw')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/map')}
              tooltip={tooltip('map')}
            >
              <Link href={withLocale('/map')}>
                <Map />
                <span>{nav('map')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/log-parser')}
              tooltip={tooltip('logParser')}
            >
              <Link href={withLocale('/log-parser')}>
                <TextSearch />
                <span>{nav('logParser')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/report-archive')}
              tooltip={tooltip('reportArchive')}
            >
              <Link href={withLocale('/report-archive')}>
                <History />
                <span>{nav('reportArchive')}</span>
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
              tooltip={tooltip('settings')}
            >
              <Link href={withLocale('/settings')}>
                <Settings />
                <span>{nav('settings')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setIsFeedbackDialogOpen(true)}
              tooltip={tooltip('help')}
            >
              <LifeBuoy />
              <span>{nav('help')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/announcements')}
              tooltip={tooltip('announcements')}
            >
              <Link href={withLocale('/announcements')}>
                <Bell />
                <span>{nav('announcements')}</span>
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
                tooltip={tooltip('github')}
             >
                <Link href={config?.URL_GITHUB || '#'} target="_blank">
                    <Github />
                    <span>{nav('github')}</span>
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
