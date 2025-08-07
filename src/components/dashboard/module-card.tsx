import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export type ModuleCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  dataAiHint?: string;
};

export function ModuleCard({ icon, title, description, href, dataAiHint }: ModuleCardProps) {
  return (
    <Link href={href} className="group block" data-ai-hint={dataAiHint}>
      <Card className="h-[190px] flex flex-col justify-between transition-all duration-300 ease-in-out group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/10 group-hover:-translate-y-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            {icon}
            <ArrowRight className="w-5 h-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <CardTitle className="font-headline text-xl">{title}</CardTitle>
          <CardDescription className="mt-2">{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
