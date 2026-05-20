import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Search,
} from 'lucide-react';
import SectionLabel from '../../ui/SectionLabel';
import { TOTAL_MUNICIPIOS_BRASIL, formatCNPJ } from './types';
import { useReferencias } from './useDashboardData';
import Skeleton from './Skeleton';

const GEO_URL =
  'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';

// Approximate centroid coordinates for each Brazilian state (lng, lat)
const STATE_CENTROIDS: Record<string, [number, number]> = {
  AC: [-70.0, -8.8],
  AL: [-36.6, -9.6],
  AM: [-63.0, -4.5],
  AP: [-52.0, 1.5],
  BA: [-41.7, -12.5],
  CE: [-39.5, -5.2],
  DF: [-47.9, -15.8],
  ES: [-40.3, -19.7],
  GO: [-49.6, -15.9],
  MA: [-45.0, -5.0],
  MG: [-44.5, -18.5],
  MS: [-54.5, -20.5],
  MT: [-55.5, -13.0],
  PA: [-52.5, -4.5],
  PB: [-36.7, -7.2],
  PE: [-37.8, -8.5],
  PI: [-43.0, -7.5],
  PR: [-51.5, -24.5],
  RJ: [-42.5, -22.3],
  RN: [-36.5, -5.8],
  RO: [-63.5, -10.9],
  RR: [-61.0, 2.0],
  RS: [-53.5, -30.0],
  SC: [-50.0, -27.2],
  SE: [-37.4, -10.6],
  SP: [-48.6, -22.2],
  TO: [-48.0, -10.3],
};

type SortKey = 'uf' | 'municipio' | 'tipo' | 'nomeFundo' | 'codigoIBGE';
type TipoFilter = 'Todos' | 'Municipal' | 'Estadual';

const PER_PAGE = 50;

export default function MunicipiosDIRPF() {
  const { data, loading } = useReferencias();

  const sectionRef = useRef<HTMLElement | null>(null);
  const headRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const barsRef = useRef<HTMLUListElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);

  const [search, setSearch] = useState('');
  const [filterUF, setFilterUF] = useState('Todos');
  const [tipo, setTipo] = useState<TipoFilter>('Todos');
  const [sortKey, setSortKey] = useState<SortKey>('uf');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [search, filterUF, tipo, sortKey, sortDir]);

  // ── derived aggregates (full dataset, not filtered) ──────────────────────
  const byState = useMemo(() => {
    if (!data) return new Map<string, number>();
    const m = new Map<string, number>();
    data.forEach((r) => m.set(r.uf, (m.get(r.uf) ?? 0) + 1));
    return m;
  }, [data]);

  const topStates = useMemo(() =>
    Array.from(byState.entries())
      .map(([uf, count]) => ({ uf, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
  [byState]);

  const maxCount = topStates[0]?.count ?? 1;

  const ufs = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.map((r) => r.uf))).sort();
  }, [data]);

  // ── filtering + sorting ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.filter((r) => {
      if (filterUF !== 'Todos' && r.uf !== filterUF) return false;
      if (tipo !== 'Todos' && r.tipo !== tipo) return false;
      if (
        q &&
        !r.municipio.toLowerCase().includes(q) &&
        !r.nomeFundo.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [data, search, filterUF, tipo]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = String(a[sortKey] ?? '');
      const bv = String(b[sortKey] ?? '');
      const cmp = av.localeCompare(bv, 'pt-BR');
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const pageItems = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── summary cards ────────────────────────────────────────────────────────
  const totalMunicipios = data?.length ?? 0;
  const estadosRepresentados = byState.size;
  const percent = totalMunicipios
    ? (totalMunicipios / TOTAL_MUNICIPIOS_BRASIL) * 100
    : 0;
  const top5 = topStates.slice(0, 5);

  // Bubble map respects UF filter
  const visibleBubbles = useMemo(() => {
    if (filterUF === 'Todos') return byState;
    const m = new Map<string, number>();
    const v = byState.get(filterUF);
    if (v !== undefined) m.set(filterUF, v);
    return m;
  }, [byState, filterUF]);

  // ── sort toggle ───────────────────────────────────────────────────────────
  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(k); setSortDir('asc'); }
  };

  // ── CSV export ────────────────────────────────────────────────────────────
  const downloadCSV = () => {
    const headers = ['UF', 'Município', 'Tipo', 'Nome do Fundo', 'CNPJ', 'Código IBGE'];
    const escape = (s: string) => {
      const v = s.replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${v}"` : v;
    };
    const lines = [
      headers.join(','),
      ...sorted.map((r) =>
        [r.uf, r.municipio, r.tipo, r.nomeFundo, r.cnpj, r.codigoIBGE]
          .map(escape)
          .join(','),
      ),
    ];
    const blob = new Blob(['﻿' + lines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fundos-dirpf-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── GSAP animations ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!data) return;
    const ctx = gsap.context(() => {
      // Heading children
      const headChildren = Array.from(headRef.current?.children ?? []);
      if (headChildren.length) {
        gsap.set(headChildren, { y: 24, autoAlpha: 0 });
        gsap.fromTo(
          headChildren,
          { y: 24, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.85,
            stagger: 0.12,
            ease: 'power3.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: headRef.current,
              start: 'top 85%',
              once: true,
            },
          },
        );
      }

      // Highlight cards
      const cardEls = cardsRef.current?.querySelectorAll('[data-card]') ?? [];
      gsap.set(cardEls, { y: 40, autoAlpha: 0 });
      gsap.fromTo(
        cardEls,
        { y: 40, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.85,
          stagger: 0.1,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 85%',
            once: true,
          },
        },
      );

      // Bar fills grow left → right
      const barFills = barsRef.current?.querySelectorAll('[data-bar-fill]') ?? [];
      gsap.set(barFills, { scaleX: 0, transformOrigin: 'left center' });
      gsap.fromTo(
        barFills,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.0,
          stagger: 0.08,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: barsRef.current,
            start: 'top 85%',
            once: true,
          },
        },
      );

      // Map fade-in
      if (mapRef.current) {
        gsap.set(mapRef.current, { autoAlpha: 0, scale: 0.97 });
        gsap.fromTo(
          mapRef.current,
          { autoAlpha: 0, scale: 0.97 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 1,
            ease: 'expo.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: mapRef.current,
              start: 'top 85%',
              once: true,
            },
          },
        );
      }
    }, sectionRef);
    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [data]);

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <section
      id="municipios"
      ref={sectionRef}
      aria-labelledby="municipios-heading"
      className="relative py-[120px] lg:py-[140px]"
      style={{ backgroundColor: '#F0F7FF' }}
    >
      <div className="container-x">
        {/* ── Section header ── */}
        <div ref={headRef} className="max-w-3xl mb-10 lg:mb-12">
          <SectionLabel>Municípios habilitados</SectionLabel>
          <h2
            id="municipios-heading"
            className="mt-5 text-[28px] sm:text-[36px] lg:text-[40px] font-medium leading-[1.15] tracking-[-0.02em] text-text-primary"
          >
            Municípios habilitados para DIRPF 2025
          </h2>
          <p className="mt-5 text-[16px] sm:text-[17px] leading-[1.65] text-text-secondary">
            Lista oficial dos Fundos dos Direitos da Pessoa Idosa habilitados
            para captação via Imposto de Renda 2025. Fonte: MDH + Receita
            Federal.
          </p>
        </div>

        {/* ── Highlight cards ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={130} rounded="20px" />
            ))}
          </div>
        ) : (
          <div
            ref={cardsRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12"
          >
            <HighlightCard
              big={totalMunicipios.toLocaleString('pt-BR')}
              label="Municípios Habilitados"
            />
            <HighlightCard
              big={estadosRepresentados.toString()}
              label="Estados Representados"
            />
            <HighlightCard
              big={`${percent.toFixed(1).replace('.', ',')}%`}
              label="dos Municípios Brasileiros"
            />
            {/* Top 5 card */}
            <div
              data-card
              className="rounded-[20px] bg-white p-6"
              style={{
                border: '1px solid rgba(12,74,140,0.08)',
                boxShadow: '0 4px 24px rgba(12,74,140,0.06)',
              }}
            >
              <p
                className="text-[11px] uppercase tracking-[1.2px] font-medium mb-3"
                style={{ color: '#5F5E5A' }}
              >
                Top 5 estados
              </p>
              <ul className="space-y-1.5">
                {top5.map(({ uf, count }) => (
                  <li
                    key={uf}
                    className="flex justify-between text-[13px] text-text-primary"
                  >
                    <span className="font-medium">{uf}</span>
                    <span style={{ color: '#5F5E5A' }}>
                      {count.toLocaleString('pt-BR')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── Bar chart + Bubble map ── */}
        <div className="grid lg:grid-cols-12 gap-6 mb-12">
          {/* Bar chart */}
          <div className="lg:col-span-6">
            <div
              className="rounded-[20px] bg-white p-6 lg:p-7 h-full"
              style={{
                border: '1px solid rgba(12,74,140,0.08)',
                boxShadow: '0 4px 24px rgba(12,74,140,0.06)',
              }}
            >
              <h3 className="text-[16px] font-medium text-text-primary mb-1">
                Top 10 estados
              </h3>
              <p className="text-[13px] mb-5" style={{ color: '#5F5E5A' }}>
                Por número de municípios habilitados
              </p>
              {loading ? (
                <Skeleton height={320} />
              ) : (
                <ul ref={barsRef} className="space-y-3" role="list">
                  {topStates.map(({ uf, count }) => (
                    <li key={uf}>
                      <div className="flex justify-between text-[12px] mb-1">
                        <span className="font-medium text-text-primary">
                          {uf}
                        </span>
                        <span style={{ color: '#5F5E5A' }}>
                          {count.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div
                        className="h-2.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: '#E8F2FB' }}
                        aria-hidden="true"
                      >
                        <div
                          data-bar-fill
                          className="h-full rounded-full"
                          style={{
                            width: `${(count / maxCount) * 100}%`,
                            background:
                              'linear-gradient(90deg, #0C4A8C, #2196C9)',
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Bubble map */}
          <div className="lg:col-span-6">
            <div
              ref={mapRef}
              className="rounded-[20px] bg-white p-4 lg:p-5 h-full"
              style={{
                border: '1px solid rgba(12,74,140,0.08)',
                boxShadow: '0 4px 24px rgba(12,74,140,0.06)',
                minHeight: '420px',
              }}
            >
              <h3 className="text-[16px] font-medium text-text-primary mb-1 px-2">
                Distribuição por estado
              </h3>
              <p
                className="text-[13px] mb-3 px-2"
                style={{ color: '#5F5E5A' }}
              >
                Tamanho do ponto proporcional ao número de municípios
              </p>
              {loading ? (
                <Skeleton height={360} />
              ) : (
                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{ scale: 600, center: [-54, -15] }}
                  style={{ width: '100%', height: 'auto' }}
                >
                  <Geographies geography={GEO_URL}>
                    {({ geographies }: { geographies: any[] }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          style={{
                            default: {
                              fill: '#F0F7FF',
                              stroke: '#B5D4F4',
                              strokeWidth: 0.6,
                              outline: 'none',
                            },
                            hover: { fill: '#E8F2FB', outline: 'none' },
                            pressed: { fill: '#E8F2FB', outline: 'none' },
                          }}
                        />
                      ))
                    }
                  </Geographies>
                  {Array.from(visibleBubbles.entries()).map(([uf, count]) => {
                    const coords = STATE_CENTROIDS[uf];
                    if (!coords) return null;
                    const r = Math.max(3, Math.sqrt(count) * 0.9);
                    return (
                      <Marker key={uf} coordinates={coords}>
                        <circle
                          r={r}
                          fill="#2196C9"
                          fillOpacity={0.55}
                          stroke="#0C4A8C"
                          strokeWidth={1}
                        >
                          <title>{`${uf}: ${count} municípios`}</title>
                        </circle>
                      </Marker>
                    );
                  })}
                </ComposableMap>
              )}
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
          {/* Search */}
          <div className="md:col-span-5">
            <label
              htmlFor="mun-search"
              className="block text-[11px] uppercase tracking-[1.2px] font-medium mb-1.5"
              style={{ color: '#5F5E5A' }}
            >
              Buscar
            </label>
            <div className="relative">
              <Search
                size={16}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: '#5F5E5A' }}
              />
              <input
                id="mun-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Município ou nome do fundo..."
                className="w-full rounded-input pl-10 pr-3 py-2.5 text-[14px] outline-none"
                style={{
                  border: '1px solid #B5D4F4',
                  backgroundColor: '#ffffff',
                  color: '#2C2C2A',
                }}
              />
            </div>
          </div>

          {/* UF dropdown */}
          <div className="md:col-span-3">
            <label
              htmlFor="mun-uf"
              className="block text-[11px] uppercase tracking-[1.2px] font-medium mb-1.5"
              style={{ color: '#5F5E5A' }}
            >
              Estado (UF)
            </label>
            <div className="relative">
              <select
                id="mun-uf"
                value={filterUF}
                onChange={(e) => setFilterUF(e.target.value)}
                className="w-full appearance-none rounded-input px-3.5 py-2.5 pr-9 text-[14px] outline-none cursor-pointer"
                style={{
                  border: '1px solid #B5D4F4',
                  backgroundColor: '#ffffff',
                  color: '#2C2C2A',
                }}
              >
                <option value="Todos">Todos</option>
                {ufs.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                aria-hidden="true"
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: '#5F5E5A' }}
              />
            </div>
          </div>

          {/* Tipo toggle */}
          <div className="md:col-span-4 flex flex-col">
            <p
              className="text-[11px] uppercase tracking-[1.2px] font-medium mb-1.5"
              style={{ color: '#5F5E5A' }}
            >
              Tipo
            </p>
            <div
              role="group"
              aria-label="Filtrar por tipo de fundo"
              className="inline-flex p-0.5 rounded-pill self-start"
              style={{
                backgroundColor: '#E8F2FB',
                border: '1px solid rgba(12,74,140,0.12)',
              }}
            >
              {(['Todos', 'Municipal', 'Estadual'] as TipoFilter[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  aria-pressed={tipo === t}
                  className="px-3.5 py-1.5 rounded-pill text-[12px] font-medium transition-colors"
                  style={{
                    backgroundColor: tipo === t ? '#FFFFFF' : 'transparent',
                    color: tipo === t ? '#0C4A8C' : '#5F5E5A',
                    boxShadow:
                      tipo === t
                        ? '0 1px 3px rgba(12,74,140,0.12)'
                        : 'none',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Result count + Export ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <p
            className="text-[13px]"
            style={{ color: '#5F5E5A' }}
            aria-live="polite"
          >
            <strong className="text-text-primary">
              {sorted.length.toLocaleString('pt-BR')}
            </strong>{' '}
            registro{sorted.length === 1 ? '' : 's'} encontrado
            {sorted.length === 1 ? '' : 's'}
          </p>
          <button
            type="button"
            onClick={downloadCSV}
            disabled={loading || sorted.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-pill px-5 py-2.5 text-[13px] font-medium text-white transition-shadow hover:shadow-[0_10px_28px_rgba(12,74,140,0.45)] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #0C4A8C, #2196C9)',
              boxShadow: '0 4px 14px rgba(12,74,140,0.35)',
            }}
          >
            <Download size={14} aria-hidden="true" />
            Baixar CSV
          </button>
        </div>

        {/* ── Table ── */}
        <div
          className="rounded-[16px] bg-white overflow-hidden mb-12"
          style={{
            border: '1px solid rgba(12,74,140,0.08)',
            boxShadow: '0 4px 24px rgba(12,74,140,0.06)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[860px]">
              <caption className="sr-only">
                Lista oficial de municípios habilitados para DIRPF 2025
              </caption>
              <thead>
                <tr style={{ backgroundColor: '#F7F9FC' }}>
                  <SortableHeader
                    label="UF"
                    sortKey="uf"
                    current={sortKey}
                    dir={sortDir}
                    onSort={toggleSort}
                    width="70px"
                  />
                  <SortableHeader
                    label="Município"
                    sortKey="municipio"
                    current={sortKey}
                    dir={sortDir}
                    onSort={toggleSort}
                  />
                  <SortableHeader
                    label="Tipo"
                    sortKey="tipo"
                    current={sortKey}
                    dir={sortDir}
                    onSort={toggleSort}
                    width="110px"
                  />
                  <SortableHeader
                    label="Nome do Fundo"
                    sortKey="nomeFundo"
                    current={sortKey}
                    dir={sortDir}
                    onSort={toggleSort}
                  />
                  <th
                    scope="col"
                    className="text-left text-[11px] uppercase tracking-[1.2px] font-medium px-4 py-3 whitespace-nowrap"
                    style={{ color: '#5F5E5A' }}
                  >
                    CNPJ
                  </th>
                  <SortableHeader
                    label="Cód. IBGE"
                    sortKey="codigoIBGE"
                    current={sortKey}
                    dir={sortDir}
                    onSort={toggleSort}
                    width="110px"
                  />
                </tr>
              </thead>
              <tbody
                key={`${page}-${sortKey}-${sortDir}-${filterUF}-${tipo}-${search}`}
                className="divide-y"
                style={{ borderColor: 'rgba(12,74,140,0.06)' }}
              >
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3" colSpan={6}>
                        <Skeleton height={16} />
                      </td>
                    </tr>
                  ))
                ) : pageItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-text-secondary"
                    >
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((r, idx) => (
                    <TableRow
                      key={`${r.codigoIBGE}-${idx}`}
                      delay={idx * 0.02}
                    >
                      <td
                        className="px-4 py-3 font-medium text-text-primary whitespace-nowrap"
                        style={{ width: '70px' }}
                      >
                        {r.uf}
                      </td>
                      <td className="px-4 py-3 text-text-primary">
                        {r.municipio}
                      </td>
                      <td className="px-4 py-3">
                        <TipoBadge tipo={r.tipo} />
                      </td>
                      <td className="px-4 py-3" style={{ color: '#5F5E5A' }}>
                        {r.nomeFundo}
                      </td>
                      <td
                        className="px-4 py-3 font-mono text-[12px] whitespace-nowrap"
                        style={{ color: '#5F5E5A' }}
                      >
                        {formatCNPJ(r.cnpj)}
                      </td>
                      <td
                        className="px-4 py-3 font-mono text-[12px]"
                        style={{ color: '#5F5E5A' }}
                      >
                        {r.codigoIBGE}
                      </td>
                    </TableRow>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[13px]"
            style={{
              borderTop: '1px solid rgba(12,74,140,0.06)',
              color: '#5F5E5A',
            }}
          >
            <span>
              Mostrando{' '}
              <strong className="text-text-primary">
                {sorted.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}–
                {Math.min(page * PER_PAGE, sorted.length)}
              </strong>{' '}
              de{' '}
              <strong className="text-text-primary">
                {sorted.length.toLocaleString('pt-BR')}
              </strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Página anterior"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full text-blue-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-light"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <span className="text-text-primary font-medium">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Próxima página"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full text-blue-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-light"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Sobre os dados ── */}
        <div
          className="rounded-[16px] p-6 lg:p-8"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(12,74,140,0.10)',
            boxShadow: '0 4px 24px rgba(12,74,140,0.06)',
          }}
        >
          <h3 className="text-[17px] font-medium text-text-primary mb-3">
            Sobre os dados
          </h3>
          <p
            className="text-[14px] leading-[1.7] mb-5"
            style={{ color: '#5F5E5A' }}
          >
            Os dados desta página são extraídos do{' '}
            <strong className="text-text-primary font-medium">
              Ato Declaratório Executivo CODAR nº 02, de 12 de fevereiro de
              2025
            </strong>
            , publicado pela Receita Federal do Brasil. A lista é atualizada
            anualmente pelo MDH em conjunto com a Receita Federal.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://www.gov.br/mdh/pt-br/assuntos/pessoa-idosa/cadastramento-de-fundos"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-pill px-5 py-2.5 text-[13px] font-medium transition-colors hover:opacity-80"
              style={{
                backgroundColor: '#E8F2FB',
                color: '#0C4A8C',
                border: '1px solid rgba(12,74,140,0.15)',
              }}
            >
              <ExternalLink size={14} aria-hidden="true" />
              Portal MDH — Cadastramento de Fundos
            </a>
            <a
              href="https://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=136840"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-pill px-5 py-2.5 text-[13px] font-medium transition-colors hover:opacity-80"
              style={{
                backgroundColor: '#E8F2FB',
                color: '#0C4A8C',
                border: '1px solid rgba(12,74,140,0.15)',
              }}
            >
              <Download size={14} aria-hidden="true" />
              Baixar PDF original (ADE CODAR 02/2025)
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function HighlightCard({ big, label }: { big: string; label: string }) {
  return (
    <div
      data-card
      className="rounded-[20px] bg-white p-6 flex flex-col justify-between"
      style={{
        border: '1px solid rgba(12,74,140,0.08)',
        boxShadow: '0 4px 24px rgba(12,74,140,0.06)',
      }}
    >
      <p
        className="text-[36px] lg:text-[40px] leading-none tracking-[-0.03em]"
        style={{
          fontWeight: 800,
          background: 'linear-gradient(135deg, #0C4A8C, #2196C9)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          display: 'inline-block',
        }}
      >
        {big}
      </p>
      <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">
        {label}
      </p>
    </div>
  );
}

function TipoBadge({ tipo }: { tipo: string }) {
  const style =
    tipo === 'Estadual'
      ? { backgroundColor: '#EAF4F0', color: '#085041' }
      : { backgroundColor: '#E8F2FB', color: '#0C447C' };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-badge text-[11px] font-medium"
      style={style}
    >
      {tipo}
    </span>
  );
}

function SortableHeader({
  label,
  sortKey,
  current,
  dir,
  onSort,
  width,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: 'asc' | 'desc';
  onSort: (k: SortKey) => void;
  width?: string;
}) {
  const active = current === sortKey;
  return (
    <th scope="col" className="text-left px-4 py-3" style={{ width }}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[1.2px] font-medium hover:text-blue-deep transition-colors whitespace-nowrap"
        style={{ color: active ? '#0C4A8C' : '#5F5E5A' }}
      >
        {label}
        <ArrowUpDown size={11} aria-hidden="true" />
      </button>
    </th>
  );
}

function TableRow({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  const ref = useRef<HTMLTableRowElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { autoAlpha: 0, y: 6 },
      { autoAlpha: 1, y: 0, duration: 0.4, delay, ease: 'power2.out' },
    );
  }, [delay]);
  return (
    <tr ref={ref} className="hover:bg-blue-light/30 transition-colors">
      {children}
    </tr>
  );
}
