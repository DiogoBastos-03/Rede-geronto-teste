import {
  CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Building2, Check, Plus, Minus, Maximize } from 'lucide-react';
import SectionLabel from '../../ui/SectionLabel';
import Button from '../../ui/Button';
import { TOTAL_MUNICIPIOS_BRASIL } from './types';
import { useMunicipios, useCoordsMap } from './useDashboardData';
import type { MunicipioDirpf } from './types';
import Skeleton from './Skeleton';

const GEO_URL =
  'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';

// ── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  value: number | string;
  label: string;
}

function StatCard({ value, label }: StatCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const numRef = useRef<HTMLSpanElement | null>(null);

  const isNumeric = typeof value === 'number';

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        card,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            once: true,
          },
        },
      );

      if (isNumeric && numRef.current) {
        const target = value as number;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.6,
          ease: 'power2.out',
          delay: 0.3,
          immediateRender: false,
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            once: true,
          },
          onUpdate() {
            if (numRef.current) {
              numRef.current.textContent = Math.round(obj.val).toLocaleString(
                'pt-BR',
              );
            }
          },
        });
      }
    }, card);
    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [value, isNumeric]);

  const gradientStyle: CSSProperties = {
    background: 'linear-gradient(135deg, #0C4A8C, #2196C9)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    display: 'inline-block',
  };

  return (
    <div
      ref={cardRef}
      className="rounded-[20px] bg-white p-6 flex flex-col justify-between"
      style={{
        border: '1px solid rgba(12,74,140,0.08)',
        boxShadow: '0 4px 24px rgba(12,74,140,0.06)',
      }}
    >
      {isNumeric ? (
        <span
          ref={numRef}
          className="text-[40px] lg:text-[44px] leading-none tracking-[-0.03em] font-extrabold"
          style={gradientStyle}
        >
          0
        </span>
      ) : (
        <span
          className="text-[36px] lg:text-[40px] leading-none tracking-[-0.03em] font-extrabold"
          style={gradientStyle}
        >
          {value}
        </span>
      )}
      <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">
        {label}
      </p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function MunicipiosDIRPF() {
  const { data, loading } = useMunicipios();
  const { data: coordsMap } = useCoordsMap();

  const sectionRef = useRef<HTMLElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);

  const [filterUF, setFilterUF] = useState('Todos');
  const [tooltip, setTooltip] = useState<MunicipioDirpf | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState<{
    coordinates: [number, number];
    zoom: number;
  }>({ coordinates: [-54, -15], zoom: 1 });

  // Aggregates
  const byState = useMemo(() => {
    if (!data) return new Map<string, number>();
    const m = new Map<string, number>();
    data.forEach((r) => m.set(r.uf, (m.get(r.uf) ?? 0) + 1));
    return m;
  }, [data]);

  const ufs = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.map((r) => r.uf))).sort();
  }, [data]);

  const totalMunicipios = data?.length ?? 0;
  const estadosRepresentados = byState.size;
  const percent = totalMunicipios
    ? (totalMunicipios / TOTAL_MUNICIPIOS_BRASIL) * 100
    : 0;

  const filteredCount = useMemo(() => {
    if (!data) return 0;
    if (filterUF === 'Todos') return data.length;
    return data.filter((r) => r.uf === filterUF).length;
  }, [data, filterUF]);

  // Municipalities to plot as dots (filtered by UF dropdown)
  const visibleDots = useMemo(() => {
    if (!data) return [];
    if (filterUF === 'Todos') return data;
    return data.filter((r) => r.uf === filterUF);
  }, [data, filterUF]);

  const top5: { uf: string; count: number }[] = useMemo(
    () =>
      Array.from(byState.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([uf, count]) => ({ uf, count })),
    [byState],
  );

  // GSAP: map fade on data load
  useEffect(() => {
    if (!data) return;
    const ctx = gsap.context(() => {
      if (mapRef.current) {
        gsap.fromTo(
          mapRef.current,
          { opacity: 0, scale: 0.97 },
          {
            opacity: 1,
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

  return (
    <section
      id="municipios-dirpf"
      ref={sectionRef}
      aria-labelledby="municipios-dirpf-heading"
      className="relative py-[120px] lg:py-[140px]"
      style={{ backgroundColor: '#F0F7FF' }}
    >
      <div className="container-x">
        {/* ── Section header ── */}
        <div className="max-w-3xl mb-10 lg:mb-12">
          <SectionLabel>DIRPF 2025 — RECEITA FEDERAL DO BRASIL</SectionLabel>
          <h2
            id="municipios-dirpf-heading"
            className="mt-5 text-[28px] sm:text-[36px] lg:text-[40px] font-medium leading-[1.15] tracking-[-0.02em] text-text-primary"
          >
            Municípios Habilitados para Receber Doações via IR
          </h2>
          <p className="mt-5 text-[16px] sm:text-[17px] leading-[1.65] text-text-secondary">
            Fundos Municipais do Idoso habilitados pela Receita Federal para
            receber doações dedutíveis do Imposto de Renda (DIRPF 2025). Todos
            esses municípios são elegíveis para o projeto Cidade Amiga do Idoso.
          </p>
        </div>

        {/* ── 3 stat cards ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} height={130} rounded="20px" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <StatCard value={totalMunicipios} label="Municípios Habilitados" />
            <StatCard
              value={estadosRepresentados}
              label="Estados Representados"
            />
            <StatCard
              value={`${percent.toFixed(1).replace('.', ',')}%`}
              label="dos Municípios Brasileiros"
            />
          </div>
        )}

        {/* ── 2-col grid ── */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left col */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* UF filter */}
            <div>
              <label
                htmlFor="mun-uf-filter"
                className="block text-[11px] uppercase tracking-[1.2px] font-medium mb-1.5"
                style={{ color: '#5F5E5A' }}
              >
                Filtrar por estado
              </label>
              <select
                id="mun-uf-filter"
                value={filterUF}
                onChange={(e) => setFilterUF(e.target.value)}
                className="w-full rounded-input px-3 py-2.5 text-[14px] outline-none cursor-pointer"
                style={{
                  border: '1px solid #B5D4F4',
                  backgroundColor: '#FFFFFF',
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
            </div>

            {/* Counter */}
            <p
              className="text-[13px]"
              style={{ color: '#5F5E5A' }}
              aria-live="polite"
            >
              <strong className="text-text-primary">
                {filteredCount.toLocaleString('pt-BR')}
              </strong>{' '}
              municípios encontrados
            </p>

            {/* Cidade Amiga card */}
            <div
              className="rounded-[12px] p-5 flex flex-col gap-4"
              style={{
                borderLeft: '4px solid #1B8A6B',
                backgroundColor: '#EAF4F0',
              }}
            >
              <div className="flex items-center gap-2">
                <Building2
                  size={18}
                  aria-hidden="true"
                  style={{ color: '#1B8A6B' }}
                />
                <span
                  className="text-[11px] uppercase tracking-[1.2px] font-medium"
                  style={{ color: '#085041' }}
                >
                  CIDADE AMIGA DO IDOSO
                </span>
              </div>
              <ul className="flex flex-col gap-2">
                {[
                  'Diagnóstico de acessibilidade urbana',
                  'Plano de ação gerontológico',
                  'Certificação e visibilidade nacional',
                  'Acesso a editais e financiamentos',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-[13px]"
                    style={{ color: '#085041' }}
                  >
                    <Check
                      size={14}
                      aria-hidden="true"
                      className="shrink-0 mt-0.5"
                      style={{ color: '#1B8A6B' }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <Button
              href="/consultoria"
              variant="green"
              size="md"
              className="w-full"
            >
              Solicitar Proposta
              <ArrowRight size={16} aria-hidden="true" />
            </Button>

            {/* Top 5 */}
            <div
              className="rounded-[12px] p-4"
              style={{
                border: '1px solid rgba(12,74,140,0.08)',
                backgroundColor: '#FFFFFF',
              }}
            >
              <p
                className="text-[11px] uppercase tracking-[1.2px] font-medium mb-3"
                style={{ color: '#5F5E5A' }}
              >
                Top 5 Estados
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

            {/* Legenda */}
            <div
              className="flex items-center gap-2 text-[12px]"
              style={{ color: '#5F5E5A' }}
            >
              <span
                aria-hidden="true"
                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: '#2196C9' }}
              />
              Município habilitado
            </div>
          </div>

          {/* Right col — dot map */}
          <div className="lg:col-span-8">
            {loading ? (
              <Skeleton height={460} rounded="20px" />
            ) : (
              <div
                ref={mapRef}
                className="relative rounded-[20px] bg-white p-4 lg:p-5"
                style={{
                  border: '1px solid rgba(12,74,140,0.08)',
                  boxShadow: '0 4px 24px rgba(12,74,140,0.06)',
                }}
              >
                {/* Card header */}
                <h3 className="text-[16px] font-medium text-text-primary mb-1 px-2">
                  Distribuição geográfica dos municípios
                </h3>
                <p
                  className="text-[13px] mb-3 px-2"
                  style={{ color: '#5F5E5A' }}
                >
                  Um ponto por município — scroll+Ctrl ou botões para zoom,
                  arraste para navegar
                </p>

                {/* Zoom controls */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setPosition((p) => ({
                        ...p,
                        zoom: Math.min(p.zoom * 1.5, 8),
                      }))
                    }
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-text-primary transition-colors hover:bg-blue-light"
                    style={{ boxShadow: '0 1px 6px rgba(12,74,140,0.18)' }}
                    aria-label="Zoom in"
                  >
                    <Plus size={15} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPosition((p) => ({
                        ...p,
                        zoom: Math.max(p.zoom / 1.5, 1),
                      }))
                    }
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-text-primary transition-colors hover:bg-blue-light"
                    style={{ boxShadow: '0 1px 6px rgba(12,74,140,0.18)' }}
                    aria-label="Zoom out"
                  >
                    <Minus size={15} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPosition({ coordinates: [-54, -15], zoom: 1 })
                    }
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-text-primary transition-colors hover:bg-blue-light"
                    style={{ boxShadow: '0 1px 6px rgba(12,74,140,0.18)' }}
                    aria-label="Resetar zoom"
                  >
                    <Maximize size={14} aria-hidden="true" />
                  </button>
                </div>

                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{ scale: 600, center: [-54, -15] }}
                  style={{ width: '100%', height: '500px' }}
                >
                  <ZoomableGroup
                    zoom={position.zoom}
                    center={position.coordinates}
                    onMoveEnd={(pos) =>
                      setPosition({
                        coordinates: pos.coordinates as [number, number],
                        zoom: pos.zoom,
                      })
                    }
                    minZoom={1}
                    maxZoom={8}
                    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                    filterZoomEvent={((evt: any) => {
                      if (window.innerWidth < 768) return false;
                      return evt.type !== 'wheel' || evt.ctrlKey;
                    }) as (element: SVGElement) => boolean}
                  >
                    {/* State outlines */}
                    <Geographies geography={GEO_URL}>
                      {({ geographies }: { geographies: any[] }) =>
                        geographies.map((geo) => (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill="#E8F2FB"
                            stroke="#FFFFFF"
                            strokeWidth={0.6 / position.zoom}
                            style={{
                              default: { outline: 'none' },
                              hover: { outline: 'none' },
                              pressed: { outline: 'none' },
                            }}
                          />
                        ))
                      }
                    </Geographies>

                    {/* One dot per municipality */}
                    {coordsMap &&
                      visibleDots.map((m) => {
                        const c = coordsMap[m.codigoIBGE];
                        if (!c) return null;
                        return (
                          <Marker
                            key={m.codigoIBGE}
                            coordinates={[c.lng, c.lat]}
                          >
                            <circle
                              r={3 / position.zoom}
                              fill="#2196C9"
                              fillOpacity={0.7}
                              stroke="#FFFFFF"
                              strokeWidth={0.5 / position.zoom}
                              style={{ cursor: 'pointer' }}
                              onMouseEnter={() => setTooltip(m)}
                              onMouseLeave={() => setTooltip(null)}
                              onMouseMove={(e) =>
                                setTooltipPos({
                                  x: e.clientX + 12,
                                  y: e.clientY - 40,
                                })
                              }
                            />
                          </Marker>
                        );
                      })}
                  </ZoomableGroup>
                </ComposableMap>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          role="tooltip"
          style={{
            position: 'fixed',
            left: tooltipPos.x,
            top: tooltipPos.y,
            pointerEvents: 'none',
            zIndex: 50,
            backgroundColor: '#0D1B2A',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: '8px',
            fontSize: '12px',
            lineHeight: 1.45,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          }}
        >
          <strong style={{ fontWeight: 600 }}>{tooltip.municipio}</strong>
          <span style={{ color: '#9CB8D4' }}> — {tooltip.uf}</span>
        </div>
      )}
    </section>
  );
}
