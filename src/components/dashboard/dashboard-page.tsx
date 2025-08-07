
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from './page-header';
import { ModuleCard, type ModuleCardProps } from './module-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Gavel, FileText, BookOpen, Landmark, Puzzle } from 'lucide-react';

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
    title: "Paperwork Generator",
    description: "Generate different types of paperwork.",
    icon: <FileText className="w-8 h-8 text-primary" />,
    href: "#",
    dataAiHint: "document generator"
  },
  {
    title: "Simplified Penal Code",
    description: "Browse a simplified version of the penal code.",
    icon: <BookOpen className="w-8 h-8 text-primary" />,
    href: "#",
    dataAiHint: "law book"
  },
  {
    title: "Caselaw & Legal Resources",
    description: "Access caselaw and other legal resources.",
    icon: <Landmark className="w-8 h-8 text-primary" />,
    href: "#",
    dataAiHint: "court building"
  },
  {
    title: "Placeholder Module",
    description: "This is a placeholder for a future module.",
    icon: <Puzzle className="w-8 h-8 text-primary" />,
    href: "#",
    dataAiHint: "puzzle piece"
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
