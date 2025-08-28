import { Button } from '@/components/ui/button';
import { TriangleAlert } from 'lucide-react';
import Link from 'next/link';

interface FullScreenMessageProps {
  title: string;
  message: string;
  linkHref?: string;
  linkText?: string;
}

export default function FullScreenMessage({ title, message, linkHref, linkText }: FullScreenMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <TriangleAlert className="w-16 h-16 text-primary mb-4" />
      <h1 className="text-4xl font-bold mb-2">{title}</h1>
      <p className="text-lg text-muted-foreground max-w-md">
        {message}
      </p>
      {linkHref && linkText && (
        <Button asChild className="mt-6">
            <Link href={linkHref}>{linkText}</Link>
        </Button>
      )}
    </div>
  );
}
