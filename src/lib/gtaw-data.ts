import config from '@/../data/config.json';

export type GtawDataFile =
  | 'gtaw_penal_code.json'
  | 'gtaw_locations.json'
  | 'gtaw_vehicles.json'
  | 'gtaw_depa_categories.json';

export const shouldUseLocalGtawData = config.DISABLE_GTAW_CDN === true;

export function getGtawDataUrl(file: GtawDataFile): string {
  if (shouldUseLocalGtawData) {
    const params = new URLSearchParams({ file });
    return `/api/gtaw-data?${params.toString()}`;
  }

  let url = `${config.CONTENT_DELIVERY_NETWORK}${file}`;
  const version = (config as any).CDN_CACHE_VERSION;
  if (version) {
    url += `&v=${encodeURIComponent(version)}`;
  }
  return url;
}

export async function fetchGtawData(file: GtawDataFile): Promise<Response> {
  const url = getGtawDataUrl(file);

  const isCdn = !shouldUseLocalGtawData;
  const isCachingEnabled = (config as any).ENABLE_CDN_CACHING !== false;

  if (isCdn && isCachingEnabled && typeof window !== 'undefined' && window.localStorage) {
    const cacheKey = `cdn_gtaw_${file}`;
    const cacheVersionKey = `cdn_gtaw_version`;

    const currentVersion = String((config as any).CDN_CACHE_VERSION || '');
    const storedVersion = localStorage.getItem(cacheVersionKey);

    if (storedVersion === currentVersion) {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          JSON.parse(cachedData);
          return new Response(cachedData, {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (e) {
          console.error(`Error parsing cached GTAW data for ${file}:`, e);
        }
      }
    } else {
      // Clear old CDN cache
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cdn_gtaw_')) {
          localStorage.removeItem(key);
        }
      }
      localStorage.setItem(cacheVersionKey, currentVersion);
    }

    const response = await fetch(url);
    if (response.ok) {
      const clonedResponse = response.clone();
      try {
        const dataText = await clonedResponse.text();
        localStorage.setItem(cacheKey, dataText);
      } catch (e) {
        console.warn(`Failed to cache GTAW data for ${file} in localStorage:`, e);
      }
    }
    return response;
  }

  return fetch(url);
}
