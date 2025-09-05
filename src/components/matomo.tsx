
'use client';

import { useEffect } from 'react';
import { init, push } from '@socialgouv/matomo-next';
import { usePathname, useSearchParams } from 'next/navigation';
import analyticsConfig from '../../data/analytics.json';

export function Matomo() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1) Init once
  useEffect(() => {
    // Check for opt-out cookie/localStorage
    const settings = JSON.parse(localStorage.getItem('site-settings-storage') || '{}');
    const hasOptedOut = settings?.state?.analyticsOptOut === true;

    if (
      !hasOptedOut &&
      process.env.NODE_ENV === 'production' &&
      analyticsConfig.ANALYTICS_URL &&
      analyticsConfig.ANALYTICS_TRACKER_ID
    ) {
      init({
        url: analyticsConfig.ANALYTICS_URL,
        siteId: analyticsConfig.ANALYTICS_TRACKER_ID,
      });
      push(['enableHeartBeatTimer', 15]);
      push(['enableLinkTracking']);
    }
  }, []);

  // 2) Track SPA route changes
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('site-settings-storage') || '{}');
    const hasOptedOut = settings?.state?.analyticsOptOut === true;

    if (
      !hasOptedOut &&
      process.env.NODE_ENV === 'production' &&
      analyticsConfig.ANALYTICS_URL &&
      analyticsConfig.ANALYTICS_TRACKER_ID &&
      pathname
    ) {
      const url = `${pathname}${searchParams ? `?${searchParams.toString()}` : ''}`;
      push(['setCustomUrl', url]);
      push(['trackPageView']);
    }
  }, [pathname, searchParams]);

  // 3) Try to catch “last interaction” when the tab is hidden
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('site-settings-storage') || '{}');
    const hasOptedOut = settings?.state?.analyticsOptOut === true;
    if (hasOptedOut || process.env.NODE_ENV !== 'production') return;

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // No event tracking needed here, heartbeat timer is sufficient
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  return null;
}
