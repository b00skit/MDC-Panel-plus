
'use client' 

import { useEffect } from 'react'
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const pathname = usePathname();

  useEffect(() => {
    // Log the error to an external reporting service
    console.error(error);

    fetch('/api/error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: {
          message: error.message,
          stack: error.stack,
          digest: error.digest,
        },
        path: pathname 
      }),
    }).catch(e => console.error("Failed to send error report:", e));

  }, [error, pathname])
 
  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
       <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
                    <AlertTriangle className="h-10 w-10 text-destructive" />
                </div>
                <CardTitle className="mt-4 text-2xl">Application Error</CardTitle>
                <CardDescription>
                    Something went wrong. Please try again or contact support if the problem persists.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground bg-secondary p-3 rounded-md max-h-40 overflow-y-auto text-left">
                    <p><strong>Error:</strong> {error.message}</p>
                </div>
                <Button onClick={() => reset()}>
                    Try Again
                </Button>
            </CardContent>
       </Card>
    </div>
  )
}
