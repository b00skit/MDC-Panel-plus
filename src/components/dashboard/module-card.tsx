
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import React from 'react';

export type ModuleCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  dataAiHint?: string;
  disabled?: boolean;
  color?: string;
};

export function ModuleCard({ icon, title, description, href, dataAiHint, disabled = false, color }: ModuleCardProps) {
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
          <div className="flex items-center justify-between">
             <div className={cn(
                "transition-all duration-300",
                !disabled && "group-hover:[&>svg]:drop-shadow-[0_0_8px_var(--glow-color)]"
             )}>
                {icon}
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
