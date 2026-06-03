import { useEffect, useState } from 'react';
import type { Estado, MunicipioDirpf, Referencia } from './types';

export type CoordsMap = Record<string, { lat: number; lng: number }>;

type LoadResult<T> = { data: T | null; loading: boolean };

export function useEstados(): LoadResult<Estado[]> {
  const [data, setData] = useState<Estado[] | null>(null);
  useEffect(() => {
    let alive = true;
    import('../../../data/estados.json').then((m) => {
      if (alive) setData(m.default as Estado[]);
    });
    return () => {
      alive = false;
    };
  }, []);
  return { data, loading: data === null };
}

export function useMunicipios(): LoadResult<MunicipioDirpf[]> {
  const [data, setData] = useState<MunicipioDirpf[] | null>(null);
  useEffect(() => {
    let alive = true;
    import('../../../data/municipios-dirpf.json').then((m) => {
      if (alive) setData(m.default as MunicipioDirpf[]);
    });
    return () => {
      alive = false;
    };
  }, []);
  return { data, loading: data === null };
}

export function useReferencias(): LoadResult<Referencia[]> {
  const [data, setData] = useState<Referencia[] | null>(null);
  useEffect(() => {
    let alive = true;
    import('../../../data/referencias.json').then((m) => {
      if (alive) setData(m.default as Referencia[]);
    });
    return () => {
      alive = false;
    };
  }, []);
  return { data, loading: data === null };
}

// ── Fundos estaduais dados (official legal/administrative data) ──────────────

export interface FundoEstadualDado {
  nomeFundo: string | null;
  sigla: string | null;
  status: 'ativo' | 'sem_fundo' | 'lei_sem_cadastro';
  temFundo: string;
  lei: string | null;
  anoLei: number | null;
  orgaoGestor: string | null;
  conselho: string | null;
  decretoRegulamentador: string | null;
  situacaoReceita: string | null;
  /** Doações via IRPF repassadas em 2025 (R$). Fonte: Receita Federal. */
  arrecadacaoIRPF2025: number | null;
  /** Quantidade de doações IRPF em 2025. */
  doacoesIRPF2025: number | null;
  fonte: string | null;
  confianca: 'alta' | 'media';
}

// ── Arrecadação IRPF 2025 ───────────────────────────────────────────────────

export interface MunicipioArrecadacao {
  uf: string;
  local: string;
  ibge: string;
  cnpj: string;
  doacoes: number;
  total: number;
}

export interface ArrecadacaoTotais {
  municipal: number;
  estadual: number;
  nacional: number;
  geral: number;
  qtdMunicipios: number;
  qtdEstaduais: number;
}

export interface ArrecadacaoData {
  _meta: { fonte: string; totais: ArrecadacaoTotais };
  municipios: MunicipioArrecadacao[];
  estaduais: Record<string, MunicipioArrecadacao>;
  porUF: Record<string, { totalMunicipal: number; qtdMunicipios: number }>;
}

export function useArrecadacao(): LoadResult<ArrecadacaoData> {
  const [data, setData] = useState<ArrecadacaoData | null>(null);
  useEffect(() => {
    let alive = true;
    import('../../../data/arrecadacao-idoso-2025.json').then((m) => {
      if (alive) setData(m.default as ArrecadacaoData);
    });
    return () => { alive = false; };
  }, []);
  return { data, loading: data === null };
}

export type FundosEstaduaisMap = Record<string, FundoEstadualDado>;

export function useFundosEstaduais(): LoadResult<FundosEstaduaisMap> {
  const [data, setData] = useState<FundosEstaduaisMap | null>(null);
  useEffect(() => {
    let alive = true;
    import('../../../data/fundos-estaduais-dados.json').then((m) => {
      if (alive) {
        const raw = m.default as Record<string, unknown>;
        const map: FundosEstaduaisMap = {};
        for (const [k, v] of Object.entries(raw)) {
          if (k !== '_meta') map[k] = v as FundoEstadualDado;
        }
        setData(map);
      }
    });
    return () => {
      alive = false;
    };
  }, []);
  return { data, loading: data === null };
}

export function useCoordsMap(): LoadResult<CoordsMap> {
  const [data, setData] = useState<CoordsMap | null>(null);
  useEffect(() => {
    let alive = true;
    import('../../../data/coordenadas-municipios.json').then((m) => {
      if (alive) setData(m.default as CoordsMap);
    });
    return () => {
      alive = false;
    };
  }, []);
  return { data, loading: data === null };
}
