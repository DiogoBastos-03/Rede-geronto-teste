export type StatusFundoEstadual = 'ativo' | 'sem_fundo' | 'em_tramitacao';

export interface Estado {
  uf: string;
  nome: string | null;
  municipiosHabilitados: number;
  statusFundoEstadual: StatusFundoEstadual;
  cnpjEstadual: string | null;
  nomeFundoEstadual: string | null;
}

export interface MunicipioDirpf {
  uf: string;
  municipio: string;
  codigoIBGE: string;
  tipo: 'Municipal' | 'Estadual';
  cnpj: string;
  nomeFundo: string;
}

export type Referencia = MunicipioDirpf;

export const REGIOES: Record<string, string[]> = {
  Norte: ['AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO'],
  Nordeste: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
  'Centro-Oeste': ['DF', 'GO', 'MS', 'MT'],
  Sudeste: ['ES', 'MG', 'RJ', 'SP'],
  Sul: ['PR', 'RS', 'SC'],
};

// PB has a Bill in tramitation — UI-level override
export const PL_EM_TRAMITACAO: string[] = ['PB'];

// Static fallbacks for figures not present in the JSON
export const TOTAL_MUNICIPIOS_BRASIL = 5570;
export const ARRECADACAO_2023_BRL_MI = 170;

export function formatCNPJ(cnpj: string | null | undefined): string {
  if (!cnpj) return '—';
  const v = cnpj.replace(/\D/g, '').padStart(14, '0');
  return v.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    '$1.$2.$3/$4-$5',
  );
}

export function effectiveStatus(uf: string, raw: StatusFundoEstadual) {
  if (PL_EM_TRAMITACAO.includes(uf)) return 'em_tramitacao' as const;
  return raw;
}
