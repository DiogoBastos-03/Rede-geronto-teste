/**
 * Shared volume colour scale for choropleth maps (blue brand ramp).
 * Imported by: MapaDashboard.tsx, Data.tsx
 *
 * Quantile breaks from municipiosHabilitados distribution (26 states):
 *   Band 0:  0–4    (AC AP AM RR SE)
 *   Band 1:  5–16   (RO TO PI AL)
 *   Band 2: 17–37   (MA PA PB ES MS)
 *   Band 3: 38–53   (RN BA MT CE)
 *   Band 4: 54–169  (RJ PE GO SC)
 *   Band 5: 170+    (RS PR MG SP)
 */

export const VOLUME_RAMP: string[] = [
  '#B4CADF', // Band 0 — lightest
  '#8FB0D2', // Band 1
  '#6A92BE', // Band 2
  '#3D6BA0', // Band 3
  '#1B4C84', // Band 4
  '#0C3057', // Band 5 — darkest
];

export const VOLUME_RAMP_HOVER: string[] = [
  '#8FB0D2',
  '#6A92BE',
  '#3D6BA0',
  '#1B4C84',
  '#0C3057',
  '#08203B',
];

/** Upper-exclusive thresholds: count < THRESHOLDS[i] → band i */
export const VOLUME_THRESHOLDS: number[] = [5, 17, 38, 54, 170];

export function bandOf(count: number): number {
  for (let i = 0; i < VOLUME_THRESHOLDS.length; i++) {
    if (count < VOLUME_THRESHOLDS[i]) return i;
  }
  return VOLUME_RAMP.length - 1;
}

export function volumeFill(count: number): string {
  return VOLUME_RAMP[bandOf(count)];
}

export function volumeFillHover(count: number): string {
  return VOLUME_RAMP_HOVER[bandOf(count)];
}

/** Amber used for "PL em tramitação" states */
export const AMBER = '#D99A2B';
export const AMBER_HOVER = '#C08820';

/** Neutral fill for states with no data */
export const NEUTRAL_FILL = '#ECF1F4';
export const NEUTRAL_HOVER = '#E0E8EC';
