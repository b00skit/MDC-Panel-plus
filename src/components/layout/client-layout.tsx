
'use client';

import React, { useState, useEffect } from 'react';
import FullScreenMessage from '@/components/layout/maintenance-page';

const BetaRedirect = ({ children }: { children: React.ReactNode }) => {
    const [isBlocked, setIsBlocked] = useState(false);

    useEffect(() => {
        const betaEnabled = true;
        if (betaEnabled) return;

        const hostname = window.location.hostname;
        const isBetaHost = hostname.includes('cloudworkstations.dev') || hostname.includes('beta.panel.booskit.dev');
        
        if (isBetaHost) {
            const betaCode = localStorage.getItem('beta_code');
            const expectedCode = process.env.NEXT_PUBLIC_BETA_CODE;
            if (betaCode !== expectedCode) {
                setIsBlocked(true);
            }
        }
    }, []);

    if (isBlocked) {
        return (
            <FullScreenMessage
                title="Beta Access has Ended"
                message="This beta version is no longer active. Please use the main site."
                linkHref="https://panel.booskit.dev/"
                linkText="Go to Live Site"
            />
        );
    }
    
    return <>{children}</>;
};


export function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <BetaRedirect>{children}</BetaRedirect>;
}
