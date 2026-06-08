import type { DiagnosticoFormData, DiagnosticoResult } from './types';
import { calcDimensionScores, calcScore, getStatus } from './scoring';
import { generateSWOT } from './swot';

const STORAGE_KEY = 'rg_diagnostico_results';

function getAll(): DiagnosticoResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DiagnosticoResult[]) : [];
  } catch {
    return [];
  }
}

export function saveDiagnostico(formData: DiagnosticoFormData): DiagnosticoResult {
  const all = getAll();
  const id = String(all.length + 1);

  const dims  = calcDimensionScores(formData);
  const score = calcScore(dims);
  const status = getStatus(score);
  const swot  = generateSWOT(formData);

  const result: DiagnosticoResult = {
    id,
    createdAt: new Date().toISOString(),
    formData,
    score,
    status,
    dimensionScores: dims,
    swot,
  };

  all.push(result);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return result;
}

export function getDiagnostico(id: string): DiagnosticoResult | null {
  return getAll().find((r) => r.id === id) ?? null;
}
