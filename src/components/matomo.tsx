
'use client';

import { useEffect } from 'react';
import { init } from '@socialgouv/matomo-next';
import analyticsConfig from '../../data/analytics.json';

export function Matomo() {
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
  return null;
}
