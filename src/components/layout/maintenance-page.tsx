import { Button } from '@/components/ui/button';
import { TriangleAlert, Download } from 'lucide-react';
import Link from 'next/link';

interface FullScreenMessageProps {
  title: string;
  message: string;
  linkHref?: string;
  linkText?: string;
  actionText?: string;
  onActionClick?: () => void;
}

export default function FullScreenMessage({ title, message, linkHref, linkText, actionText, onActionClick }: FullScreenMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <TriangleAlert className="w-16 h-16 text-primary mb-4" />
      <h1 className="text-4xl font-bold mb-2">{title}</h1>
      <p className="text-lg text-muted-foreground max-w-md">
        {message}
      </p>
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        {linkHref && linkText && (
          <Button asChild>
              <Link href={linkHref}>{linkText}</Link>
          </Button>
        )}
        {actionText && onActionClick && (
            <Button variant="outline" onClick={onActionClick}>
                <Download className="mr-2 h-4 w-4" />
                {actionText}
            </Button>
        )}
      </div>
    </div>
  );
}
