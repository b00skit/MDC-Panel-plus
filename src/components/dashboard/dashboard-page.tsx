"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from './page-header';
import { ModuleCard, type ModuleCardProps } from './module-card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, CalendarCheck, Shield, Activity, Users, Puzzle } from 'lucide-react';

const modules: ModuleCardProps[] = [
  {
    title: "Content Generator",
    description: "Generate articles, summaries, and other text content.",
    icon: <FileText className="w-8 h-8 text-primary" />,
    href: "#",
    dataAiHint: "writing text"
  },
  {
    title: "Task Scheduler",
    description: "Automate and manage your upcoming tasks and events.",
    icon: <CalendarCheck className="w-8 h-8 text-primary" />,
    href: "#",
    dataAiHint: "planning schedule"
  },
  {
    title: "Security Scanner",
    description: "Analyze and secure your applications from vulnerabilities.",
    icon: <Shield className="w-8 h-8 text-primary" />,
    href: "#",
    dataAiHint: "cyber security"
  },
  {
    title: "API Monitor",
    description: "Keep track of your API's health and performance.",
    icon: <Activity className="w-8 h-8 text-primary" />,
    href: "#",
    dataAiHint: "server analytics"
  },
  {
    title: "User Management",
    description: "Manage users, roles, and permissions with ease.",
    icon: <Users className="w-8 h-8 text-primary" />,
    href: "#",
    dataAiHint: "team collaboration"
  },
  {
    title: "Plugin Integrations",
    description: "Extend functionality with third-party plugins.",
    icon: <Puzzle className="w-8 h-8 text-primary" />,
    href: "#",
    dataAiHint: "puzzle pieces"
  },
];

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

export function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Dashboard"
        description="Welcome to LEO Panel. Here are your available tools."
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
