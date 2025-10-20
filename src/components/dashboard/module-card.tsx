
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import React, { useMemo } from 'react';
import { useScopedI18n } from '@/lib/i18n/client';

export type ModuleCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  dataAiHint?: string;
  disabled?: boolean;
  color?: string;
  newExpiry?: string;
};

export function ModuleCard({ icon, title, description, href, dataAiHint, disabled = false, color, newExpiry }: ModuleCardProps) {
  const { t } = useScopedI18n('paperworkGenerators.page');

  const isNew = useMemo(() => {
    if (!newExpiry) return false;
    try {
      const expiryDate = new Date(newExpiry);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Compare dates only
      return expiryDate >= today;
    } catch (e) {
      return false;
    }
  }, [newExpiry]);
  
  const cardClasses = cn(
    "h-[190px] flex flex-col justify-between transition-all duration-300 ease-in-out relative overflow-hidden",
    !disabled && "group-hover:border-primary/50 group-hover:shadow-lg group-hover:-translate-y-1",
    disabled && "opacity-50 cursor-not-allowed bg-muted/50"
  );
  
  const CardContentComponent = (
    <Card className={cardClasses} style={{
        '--glow-color': color || 'hsl(var(--primary))',
      } as React.CSSProperties}>
        {color && !disabled && (
          <div
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_farthest-side,var(--glow-color),transparent)] opacity-5 group-hover:opacity-25 transition-opacity duration-300"
          />
        )}
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className={cn(
                "transition-all duration-300 flex flex-col items-start gap-2",
                !disabled && "group-hover:[&>svg]:drop-shadow-[0_0_8px_var(--glow-color)]"
            )}>
                {icon}
                {isNew && <Badge variant="destructive" className="text-xs px-1.5 py-0.5">{t('newAddition')}</Badge>}
            </div>
            {disabled ? (
                <Badge variant="secondary">COMING SOON</Badge>
            ) : (
                <ArrowRight className="w-5 h-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <CardTitle className="font-headline text-xl">{title}</CardTitle>
          <CardDescription className="mt-2">{description}</CardDescription>
        </CardContent>
      </Card>
  );

  if (disabled) {
    return (
        <div className="group block" data-ai-hint={dataAiHint}>
            {CardContentComponent}
        </div>
    );
  }

  return (
    <Link href={href} className="group block" data-ai-hint={dataAiHint}>
        {CardContentComponent}
    </Link>
  );
}
