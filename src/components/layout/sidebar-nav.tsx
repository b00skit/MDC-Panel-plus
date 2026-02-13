'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid, Settings, LifeBuoy, Gavel, FileText, BookOpen, Landmark,
  Archive, Github, Bell, Map, History, Search, TextSearch, LayoutTemplate, Snowflake
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useScopedI18n } from '@/lib/i18n/client';

import {
  SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem,
  SidebarMenuButton, SidebarFooter, SidebarTrigger, useSidebar, SidebarMenuBadge
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

  const isHoliday = configData.ENABLE_HOLIDAY_MODE;

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
    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [pathname]);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');
  const siteName = config?.SITE_NAME.replace('+', '') || 'MDC Panel';

  if (!mounted) return null;

  return (
    <>
      <FeedbackDialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen} />

      {isHoliday && (
        <div className="absolute top-0 left-0 w-full overflow-hidden h-10 pointer-events-none z-[100] opacity-70">
          <div className="relative flex justify-around items-start px-4 w-full h-full">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={cn("w-2 h-3 rounded-full animate-pulse shadow-[0_0_8px_currentColor]", i % 3 === 0 ? "text-red-500 bg-red-500" : i % 3 === 1 ? "text-yellow-400 bg-yellow-400" : "text-blue-400 bg-blue-400")}
                style={{ animationDuration: `${1.5 + (i * 0.2)}s`, marginTop: i % 2 === 0 ? '8px' : '14px' }}
              />
            ))}
          </div>
        </div>
      )}

      <SidebarHeader className={cn(isHoliday && "mt-2")}>
        <div className={cn("flex w-full items-center justify-between", state === 'collapsed' && "flex-col gap-2 py-1")}>
          <div className="flex items-center gap-2.5">
            <Link href="/" className="relative flex items-center gap-2 group">
              {/* --- ШАПКА САНТЫ --- */}
              {isHoliday && (
                <span className={cn("absolute z-10 select-none transition-transform", state === 'collapsed' ? "-top-1 -right-1 text-base" : "-top-3 -left-2 text-xl -rotate-12")}>🎅</span>
              )}
              <Image src={config?.SITE_FAVICON || '/img/logos/MDC-Panel-Favicon.svg'} width={40} height={40} alt="Logo" />
            </Link>
            {state === 'expanded' && (
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-semibold font-headline">{siteName}</span>
                <span className={cn("text-2xl font-bold transition-colors", isHoliday ? "text-red-500 animate-pulse" : "text-primary")}>+</span>
              </div>
            )}
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {[
            { path: '/', icon: LayoutGrid, label: tNav('dashboard') },
            { path: '/legal-search', icon: Search, label: tNav('legalSearch') },
            { path: '/arrest-calculator', icon: Gavel, label: tNav('arrestCalculator') },
            { path: '/arrest-report', icon: FileText, label: tNav('arrestReport') },
            { path: '/paperwork-generators', icon: Archive, label: tNav('paperworkGenerators') },
            { path: '/simplified-penal-code', icon: BookOpen, label: tNav('simplifiedPenalCode') },
            { path: '/caselaw', icon: Landmark, label: tNav('caselaw') },
          ].map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton asChild isActive={isActive(item.path)} tooltip={item.label}
                className={cn(isActive(item.path) && isHoliday && "bg-red-500/10 text-red-600 dark:text-red-400 border-r-2 border-red-500")}
              >
                <Link href={item.path}>
                  <item.icon className={cn(isActive(item.path) && isHoliday && "text-red-500 animate-bounce")} />
                  <span>{item.label}</span>
                  {isActive(item.path) && isHoliday && <Snowflake className="ml-auto h-3 w-3 animate-spin opacity-40" />}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

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

          {config?.CASEBOARD_ENABLED ? (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Caseboard">
                <a href={config.URL_CASEBOARD} target="_blank" rel="noopener noreferrer">
                  <LayoutTemplate /><span>Caseboard</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/map')} tooltip={tNav('map')}
                className={cn(isActive('/map') && isHoliday && "bg-red-500/10 text-red-600 dark:text-red-400 border-r-2 border-red-500")}
              >
                <Link href="/map">
                  <Map className={cn(isActive('/map') && isHoliday && "text-red-500 animate-bounce")} />
                  <span>{tNav('map')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/log-parser')} tooltip={tNav('logParser')}
              className={cn(isActive('/log-parser') && isHoliday && "bg-red-500/10 text-red-600 dark:text-red-400 border-r-2 border-red-500")}
            >
              <Link href="/log-parser">
                <TextSearch className={cn(isActive('/log-parser') && isHoliday && "text-red-500 animate-bounce")} />
                <span>{tNav('logParser')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/report-archive')} tooltip={tNav('reportArchive')}
              className={cn(isActive('/report-archive') && isHoliday && "bg-red-500/10 text-red-600 dark:text-red-400 border-r-2 border-red-500")}
            >
              <Link href="/report-archive">
                <History className={cn(isActive('/report-archive') && isHoliday && "text-red-500 animate-bounce")} />
                <span>{tNav('reportArchive')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <Separator className={cn("my-2", isHoliday && "bg-red-500/20")} />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/settings')} tooltip={tNav('settings')}>
              <Link href="/settings"><Settings /><span>{tNav('settings')}</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => setIsFeedbackDialogOpen(true)} tooltip={tNav('help')}>
              <LifeBuoy /><span>{tNav('help')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/announcements')} tooltip={tNav('announcements')}>
              <Link href="/announcements" className="relative">
                <Bell className={cn(unreadCount > 0 && isHoliday && "animate-shake text-yellow-500")} />
                <span>{tNav('announcements')}</span>
                {unreadCount > 0 && (
                  <SidebarMenuBadge className={cn(isHoliday ? "bg-red-600 animate-pulse" : "bg-destructive")}>
                    {unreadCount}
                  </SidebarMenuBadge>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={tNav('github')}>
              <Link href={config?.URL_GITHUB || '#'} target="_blank">
                <Github /><span>{tNav('github')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(8deg); }
          75% { transform: rotate(-8deg); }
        }
        .animate-shake { animation: shake 0.6s ease-in-out infinite; }
      `}</style>
    </>
  );
}
