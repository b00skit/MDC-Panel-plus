
'use client';

import React, { useState, useEffect } from 'react';
import FullScreenMessage from '@/components/layout/maintenance-page';

async function clearAllSiteData() {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
  try {
    sessionStorage.clear();
  } catch (error) {
    console.error('Error clearing sessionStorage:', error);
  }
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  } catch (error) {
    console.error('Error clearing cookies:', error);
  }
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((r) => r.unregister()));
    }
  } catch (error) {
    console.error('Error unregistering service workers:', error);
  }
  try {
    if (typeof caches !== 'undefined') {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch (error) {
    console.error('Error clearing caches:', error);
  }
}

const CacheBuster = ({ cacheVersion }: { cacheVersion?: string }) => {
  useEffect(() => {
    if (!cacheVersion) return;
    const currentVersion = localStorage.getItem('cache_version');
    if (currentVersion !== cacheVersion) {
      clearAllSiteData().finally(() => {
        localStorage.setItem('cache_version', cacheVersion);
        window.location.reload();
      });
    }
  }, [cacheVersion]);

  return null;
};

const BetaRedirect = ({ children }: { children: React.ReactNode }) => {
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const betaEnabled = true;
    if (betaEnabled) return;

    const hostname = window.location.hostname;
    const isBetaHost =
      hostname.includes('cloudworkstations.dev') ||
      hostname.includes('beta.panel.booskit.dev');

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
  cacheVersion,
}: Readonly<{
  children: React.ReactNode;
  cacheVersion?: string;
}>) {
  return (
    <>
      <CacheBuster cacheVersion={cacheVersion} />
      <BetaRedirect>{children}</BetaRedirect>
    </>
  );
}
