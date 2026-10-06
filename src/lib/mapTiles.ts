// Google satellite-hybrid tile layer, shared across all maps.
//
// The `hl` (host language) parameter controls the language of Google's map
// labels. Without it Google geo-guesses and can show, e.g., Turkish
// ("Gürcistan"). We pass the current interface language so labels follow the
// top-right language dropdown. Our UI supports ka/en/ru, all of which Google
// supports; anything else falls back to English.

export const GOOGLE_SAT_ATTRIBUTION = '© Google';

export function googleSatelliteUrl(lang: string): string {
  const hl = ['ka', 'en', 'ru'].includes(lang) ? lang : 'en';
  return `https://mt{s}.google.com/vt/lyrs=y&hl=${hl}&x={x}&y={y}&z={z}`;
}
