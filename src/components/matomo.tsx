'use client';

import { useEffect } from 'react';
import { init } from '@socialgouv/matomo-next';

export function Matomo() {
  useEffect(() => {
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.NEXT_PUBLIC_MATOMO_URL &&
      process.env.NEXT_PUBLIC_MATOMO_SITE_ID
    ) {
      init({
        url: process.env.NEXT_PUBLIC_MATOMO_URL,
        siteId: process.env.NEXT_PUBLIC_MATOMO_SITE_ID,
      });
    }
  }, []);
  return null;
}
