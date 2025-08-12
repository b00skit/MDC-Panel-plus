
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from './page-header';
import { ModuleCard, type ModuleCardProps } from './module-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Gavel, FileText, BookOpen, Landmark, Settings, Archive, X, Info, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '../ui/button';
import Link from 'next/link';
import { FeedbackDialog } from './feedback-dialog';

const modules: ModuleCardProps[] = [
  {
    title: "Arrest Calculator",
    description: "Calculate arrest sentences based on charges.",
    icon: <Gavel className="w-8 h-8 text-primary" />,
    href: "/arrest-calculator",
    dataAiHint: "calculator gavel"
  },
  {
    title: "Arrest Report",
    description: "Create and manage arrest reports.",
    icon: <FileText className="w-8 h-8 text-primary" />,
    href: "/arrest-report",
    dataAiHint: "report document"
  },
   {
    title: "Paperwork Generators",
    description: "Generate different types of paperwork.",
    icon: <Archive className="w-8 h-8 text-primary" />,
    href: "/paperwork-generators",
    dataAiHint: "document generator"
  },
  {
    title: "Simplified Penal Code",
    description: "Browse a simplified version of the penal code.",
    icon: <BookOpen className="w-8 h-8 text-primary" />,
    href: "/simplified-penal-code",
    dataAiHint: "law book"
  },
  {
    title: "Caselaw & Legal Resources",
    description: "Access caselaw and other legal resources.",
    icon: <Landmark className="w-8 h-8 text-primary" />,
    href: "/caselaw",
    dataAiHint: "court building"
  },
  {
    title: "Settings",
    description: "Manage your application settings and data.",
    icon: <Settings className="w-8 h-8 text-primary" />,
    href: "/settings",
    dataAiHint: "settings gear"
  },
];

const ICONS: { [key: string]: React.ReactNode } = {
    Info: <Info className="h-4 w-4" />,
    AlertTriangle: <AlertTriangle className="h-4 w-4" />,
    CheckCircle: <CheckCircle className="h-4 w-4" />,
};

type Notice = {
    enabled: boolean;
    dismissible: boolean;
    variant: 'default' | 'destructive' | 'warning';
    icon: string;
    title: string;
    content: string;
    button?: {
        text: string;
        href?: string;
        type: 'href' | 'function';
        action?: 'open_feedback_dialog';
    }
} | null;

interface DashboardPageProps {
    notice: Notice;
}

const ModuleCardSkeleton = () => (
  <div className="p-6 flex flex-col justify-between rounded-lg border bg-card h-[190px]">
    <div className="flex items-start justify-between">
      <Skeleton className="h-10 w-10 rounded-lg" />
    </div>
    <div className="space-y-3 mt-4">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
    </div>
  </div>
);

export function DashboardPage({ notice }: DashboardPageProps) {
  const [loading, setLoading] = useState(true);
  const [isNoticeVisible, setIsNoticeVisible] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    if (notice?.enabled) {
        if(notice.dismissible) {
            const noticeDismissed = sessionStorage.getItem('notice_dismissed');
            if (noticeDismissed !== 'true') {
                setIsNoticeVisible(true);
            }
        } else {
            setIsNoticeVisible(true);
        }
    }

    return () => clearTimeout(timer);
  }, [notice]);

  const handleDismissNotice = () => {
    setIsNoticeVisible(false);
    sessionStorage.setItem('notice_dismissed', 'true');
  }

  const handleButtonClick = () => {
    if (notice?.button?.type === 'function' && notice.button.action === 'open_feedback_dialog') {
        setIsFeedbackDialogOpen(true);
    }
  };

  const NoticeIcon = notice?.icon ? ICONS[notice.icon] : null;

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <FeedbackDialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen} />
       {isNoticeVisible && notice && (
            <Alert variant={notice.variant || 'default'} className="mb-6">
                {notice.dismissible && (
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={handleDismissNotice}>
                        <X className="h-4 w-4" />
                    </Button>
                )}
                <div className="flex items-start gap-4">
                     {NoticeIcon}
                    <div className="flex-1">
                        <AlertTitle>{notice.title}</AlertTitle>
                        <AlertDescription>
                            {notice.content}
                        </AlertDescription>
                        {notice.button && (
                            <div className="mt-4">
                                {notice.button.type === 'href' && notice.button.href ? (
                                    <Button asChild>
                                        <Link href={notice.button.href}>
                                            {notice.button.text}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button onClick={handleButtonClick}>
                                         {notice.button.text}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Alert>
       )}

      <PageHeader
        title="Dashboard"
        description="Welcome to MDC Panel+. Here are your available tools."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <ModuleCardSkeleton key={index} />
            ))
          : modules.map((module) => <ModuleCard key={module.title} {...module} />)}
      </div>
    </div>
  );
}
