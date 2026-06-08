// ── UF list ──────────────────────────────────────────────────────────────────

export const UF_LIST = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as string[];

export const NOTA_LABELS: Record<number, string> = {
  1: 'Muito baixo',
  2: 'Baixo',
  3: 'Moderado',
  4: 'Alto',
  5: 'Muito alto',
};

// ── Phase form data ───────────────────────────────────────────────────────────

export interface Phase1Data {
  municipio: string;
  uf: string;
  populacaoTotal: string;
  populacaoIdosa: string;
  nomeGestor: string;
  cargo: string;
  email: string;
  telefone: string;
  possuiConselhoIdoso: boolean;
  possuiFundoIdoso: boolean;
}

export interface Phase2Data {
  estruturaAdministrativa: number; // 1–5, 0 = not yet answered
  recursosHumanos: number;
  conhecimentoLegislacao: number;
  experienciaFundos: number;
  articulacaoSociedade: number;
}

export interface Phase3Data {
  hasIES: boolean;
  numEntidadesCivis: string;
  numEmpresasInteressadas: string;
  nivelPoliticasPublicas: number; // 1–5, 0 = not yet answered
  principaisDemandas: string;
}

export interface Phase4Data {
  apoioPrefeitura: number;
  disposicaoCamara: number;
  engajamentoSociedadeCivil: number;
  historicoPoliticasSociais: number;
}

export interface DiagnosticoFormData {
  phase1: Phase1Data;
  phase2: Phase2Data;
  phase3: Phase3Data;
  phase4: Phase4Data;
}

// ── Result structures ─────────────────────────────────────────────────────────

export interface DimensionScores {
  capacidadeInstitucional: number; // 0–100
  apoioPolitico: number;
  conhecimentoLegal: number;
  engajamentoSocial: number;
  contextoLocal: number;
  recursosHumanos: number;
}

export type StatusType = 'Inicial' | 'Em Desenvolvimento' | 'Avançado' | 'Pronto';

export interface SWOTItem {
  text: string;
}

export interface SWOTData {
  forcas: SWOTItem[];
  fraquezas: SWOTItem[];
  oportunidades: SWOTItem[];
  ameacas: SWOTItem[];
}

export interface DiagnosticoResult {
  id: string;
  createdAt: string;
  formData: DiagnosticoFormData;
  score: number;
  status: StatusType;
  dimensionScores: DimensionScores;
  swot: SWOTData;
}

// ── Empty defaults ────────────────────────────────────────────────────────────

export const emptyPhase1 = (): Phase1Data => ({
  municipio: '',
  uf: '',
  populacaoTotal: '',
  populacaoIdosa: '',
  nomeGestor: '',
  cargo: '',
  email: '',
  telefone: '',
  possuiConselhoIdoso: false,
  possuiFundoIdoso: false,
});

export const emptyPhase2 = (): Phase2Data => ({
  estruturaAdministrativa: 0,
  recursosHumanos: 0,
  conhecimentoLegislacao: 0,
  experienciaFundos: 0,
  articulacaoSociedade: 0,
});

export const emptyPhase3 = (): Phase3Data => ({
  hasIES: false,
  numEntidadesCivis: '',
  numEmpresasInteressadas: '',
  nivelPoliticasPublicas: 0,
  principaisDemandas: '',
});

export const emptyPhase4 = (): Phase4Data => ({
  apoioPrefeitura: 0,
  disposicaoCamara: 0,
  engajamentoSociedadeCivil: 0,
  historicoPoliticasSociais: 0,
});
