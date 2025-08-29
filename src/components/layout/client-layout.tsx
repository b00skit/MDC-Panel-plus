
'use client';

import React, { useState, useEffect } from 'react';
import FullScreenMessage from '@/components/layout/maintenance-page';
import configData from '../../../data/config.json';

async function clearCaches() {
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

function clearLocalStorage() {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

const CacheBuster = ({
  cacheVersion,
  localStorageVersion,
}: {
  cacheVersion?: string;
  localStorageVersion?: string;
}) => {
  useEffect(() => {
    const handleBust = async () => {
      if (!cacheVersion && !localStorageVersion) return;

      const storedCacheVersion = localStorage.getItem('cache_version');
      const storedLocalVersion = localStorage.getItem('local_storage_version');

      const cacheMismatch = cacheVersion && storedCacheVersion !== cacheVersion;
      const localMismatch =
        localStorageVersion && storedLocalVersion !== localStorageVersion;

      if (cacheMismatch || localMismatch) {
        if (cacheMismatch) {
          await clearCaches();
        }
        if (localMismatch) {
          clearLocalStorage();
        }
        if (cacheVersion) {
          localStorage.setItem('cache_version', cacheVersion);
        }
        if (localStorageVersion) {
          localStorage.setItem(
            'local_storage_version',
            localStorageVersion
          );
        }
        window.location.reload();
      }
    };

    handleBust();
  }, [cacheVersion, localStorageVersion]);

  return null;
};

const BetaRedirect = ({ children }: { children: React.ReactNode }) => {
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const betaEnabled = configData.BETA_ENABLED;
    if (betaEnabled) return;

    const hostname = window.location.hostname;
    const isBetaHost =
      hostname.includes('cloudworkstations.dev') ||
      hostname.includes('beta.panel.booskit.dev');

    if (isBetaHost) {
      const betaCode = localStorage.getItem('beta_code');
      const expectedCode = configData.BETA_CODE;
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
  localStorageVersion,
}: Readonly<{
  children: React.ReactNode;
  cacheVersion?: string;
  localStorageVersion?: string;
}>) {
  return (
    <>
      <CacheBuster
        cacheVersion={cacheVersion}
        localStorageVersion={localStorageVersion}
      />
      <BetaRedirect>{children}</BetaRedirect>
    </>
  );
}
