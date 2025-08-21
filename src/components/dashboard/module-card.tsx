import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

export type ModuleCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  dataAiHint?: string;
  disabled?: boolean;
};

export function ModuleCard({ icon, title, description, href, dataAiHint, disabled = false }: ModuleCardProps) {
  const cardClasses = cn(
    "h-[190px] flex flex-col justify-between transition-all duration-300 ease-in-out",
    !disabled && "group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/10 group-hover:-translate-y-1",
    disabled && "opacity-50 cursor-not-allowed bg-muted/50"
  );
  
  const CardContentComponent = (
    <Card className={cardClasses}>
        <CardHeader>
          <div className="flex items-center justify-between">
            {icon}
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
