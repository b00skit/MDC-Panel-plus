'use client';

import { useEffect } from 'react';
import { init } from '@socialgouv/matomo-next';
import { usePathname, useSearchParams } from 'next/navigation';
import analyticsConfig from '../../data/analytics.json';

export function Matomo() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1) Init once
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

      // Accurate time-on-page: heartbeat pings every ~15s (tweak as you like)
      // Matomo will attribute this to the current page and session.
      const _paq = (window as any)._paq || [];
      _paq.push(['enableHeartBeatTimer', 15]); // seconds
      _paq.push(['enableLinkTracking']);
    }
  }, []);

  // 2) Track SPA route changes
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
      _paq.push(['trackPageView'] as any);
    }
  }, [pathname, searchParams]);

  // 3) Try to catch “last interaction” when the tab is hidden
  // (not perfect, but improves the tail end a bit).
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const _paq = (window as any)._paq || [];
        // record a lightweight interaction so the session doesn’t get cut short
        // _paq.push(['trackEvent', 'session', 'tab-hidden']);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  return null;
}
