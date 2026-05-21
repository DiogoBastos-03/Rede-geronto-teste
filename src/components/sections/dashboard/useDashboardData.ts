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
