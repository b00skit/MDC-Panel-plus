import config from '@/../data/config.json';

export type GtawDataFile =
  | 'gtaw_penal_code.json'
  | 'gtaw_locations.json'
  | 'gtaw_vehicles.json'
  | 'gtaw_depa_categories.json';

export const shouldUseLocalGtawData = config.DISABLE_GTAW_CDN === false;

export function getGtawDataUrl(file: GtawDataFile): string {
  if (shouldUseLocalGtawData) {
    const params = new URLSearchParams({ file });
    return `/api/gtaw-data?${params.toString()}`;
  }

  return `${config.CONTENT_DELIVERY_NETWORK}?file=${file}`;
}
