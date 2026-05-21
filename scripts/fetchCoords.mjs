/**
 * Fetches municipality polygon centroids from IBGE malhas API (v3).
 * Strategy: one request per state (27 total) — each returns all municipalities
 * in that state as a GeoJSON FeatureCollection with simplified polygons.
 * Centroid = average of all polygon ring vertices.
 *
 * Output: src/data/coordenadas-municipios.json
 *   { "1200203": { "lat": -7.62, "lng": -72.67 }, ... }
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// IBGE state codes (id) mapped to UF sigla
const STATES = [
  { id: 11, uf: 'RO' }, { id: 12, uf: 'AC' }, { id: 13, uf: 'AM' },
  { id: 14, uf: 'RR' }, { id: 15, uf: 'PA' }, { id: 16, uf: 'AP' },
  { id: 17, uf: 'TO' }, { id: 21, uf: 'MA' }, { id: 22, uf: 'PI' },
  { id: 23, uf: 'CE' }, { id: 24, uf: 'RN' }, { id: 25, uf: 'PB' },
  { id: 26, uf: 'PE' }, { id: 27, uf: 'AL' }, { id: 28, uf: 'SE' },
  { id: 29, uf: 'BA' }, { id: 31, uf: 'MG' }, { id: 32, uf: 'ES' },
  { id: 33, uf: 'RJ' }, { id: 35, uf: 'SP' }, { id: 41, uf: 'PR' },
  { id: 42, uf: 'SC' }, { id: 43, uf: 'RS' }, { id: 50, uf: 'MS' },
  { id: 51, uf: 'MT' }, { id: 52, uf: 'GO' }, { id: 53, uf: 'DF' },
];

/** Compute polygon centroid as vertex average (works for convex and most concave polygons) */
function centroid(coordinates) {
  // Geometry can be Polygon or MultiPolygon — use the largest ring
  let ring;
  if (Array.isArray(coordinates[0][0][0])) {
    // MultiPolygon: find the ring with the most vertices
    ring = coordinates.flat().reduce((a, b) => (b.length > a.length ? b : a));
  } else {
    // Polygon: use outer ring
    ring = coordinates[0];
  }
  const n = ring.length;
  let lngSum = 0, latSum = 0;
  for (const [lng, lat] of ring) {
    lngSum += lng;
    latSum += lat;
  }
  return { lat: Math.round((latSum / n) * 1e5) / 1e5, lng: Math.round((lngSum / n) * 1e5) / 1e5 };
}

async function fetchState(stateId, uf) {
  const url = `https://servicodados.ibge.gov.br/api/v3/malhas/estados/${stateId}?intrarregiao=municipio&formato=application/vnd.geo+json&qualidade=minima`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for state ${uf}`);
  const geojson = await res.json();
  return geojson.features ?? [];
}

async function main() {
  const coords = {};
  let total = 0;

  for (const { id, uf } of STATES) {
    process.stdout.write(`Fetching ${uf} (${id})... `);
    try {
      const features = await fetchState(id, uf);
      for (const f of features) {
        const code = String(f.properties?.codarea ?? '');
        if (!code) continue;
        const { geometry } = f;
        if (!geometry?.coordinates) continue;
        try {
          coords[code] = centroid(geometry.coordinates);
          total++;
        } catch {
          // skip malformed geometries
        }
      }
      console.log(`${features.length} municipalities`);
    } catch (err) {
      console.error(`FAILED: ${err.message}`);
    }
    // Small delay to be polite to the API
    await new Promise(r => setTimeout(r, 200));
  }

  const outPath = resolve(__dirname, '../src/data/coordenadas-municipios.json');
  writeFileSync(outPath, JSON.stringify(coords, null, 2), 'utf-8');
  console.log(`\nDone! ${total} centroids written to ${outPath}`);
}

main().catch(err => { console.error(err); process.exit(1); });
