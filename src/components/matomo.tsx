
'use client';

import { useEffect } from 'react';
import { init } from '@socialgouv/matomo-next';
import { usePathname, useSearchParams } from 'next/navigation';
import analyticsConfig from '../../data/analytics.json';

export function Matomo() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (
      process.env.NODE_ENV === 'production' &&
      analyticsConfig.ANALYTICS_URL &&
      analyticsConfig.ANALYTICS_TRACKER_ID
    ) {
      init({
        url: analyticsConfig.ANALYTICS_URL,
        siteId: analyticsConfig.ANALYTICS_TRACKER_ID,
      });
    }
  }, []);

  useEffect(() => {
    if (
      process.env.NODE_ENV === 'production' &&
      analyticsConfig.ANALYTICS_URL &&
      analyticsConfig.ANALYTICS_TRACKER_ID &&
      pathname
    ) {
      const url = `${pathname}${searchParams ? `?${searchParams.toString()}` : ''}`;
      const _paq = (window as any)._paq || [];
      _paq.push(['setCustomUrl', url]);
      _paq.push(['trackPageView']);
    }
  }, [pathname, searchParams]);

  return null;
}
