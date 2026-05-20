import {
  useEffect,
  useMemo,
  useRef,
  useState,
  CSSProperties,
} from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X, ArrowRight, Building2, IdCard } from 'lucide-react';
import SectionLabel from '../../ui/SectionLabel';
import {
  Estado,
  MunicipioDirpf,
  REGIOES,
  effectiveStatus,
  formatCNPJ,
} from './types';
import { useEstados, useMunicipios } from './useDashboardData';
import Skeleton from './Skeleton';

const GEO_URL =
  'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';

// Status palette — default + hover variants with richer depth
const STATUS_COLOR: Record<
  'ativo' | 'em_tramitacao' | 'sem_fundo',
  { default: string; hover: string }
> = {
  ativo: { default: '#1B8A6B', hover: '#145F49' },
  em_tramitacao: { default: '#F0B429', hover: '#D4A800' },
  sem_fundo: { default: '#D6E8F7', hover: '#C5DCF5' },
};

const STATUS_LABEL: Record<string, string> = {
  ativo: 'Fundo Ativo',
  em_tramitacao: 'PL em tramitação',
  sem_fundo: 'Sem fundo estadual',
};

type RegionKey = 'Todas' | keyof typeof REGIOES;
type StatusKey = 'Todos' | 'ativo' | 'em_tramitacao' | 'sem_fundo';
type StatusEff = keyof typeof STATUS_COLOR;

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function getGeoStateName(geo: any): string {
  return (
    geo.properties?.name ||
    geo.properties?.NAME ||
    geo.properties?.nome ||
    geo.properties?.sigla ||
    ''
  );
}

export default function MapaFundos() {
  const { data: estados, loading: loadingEstados } = useEstados();
  const { data: municipios, loading: loadingMunicipios } = useMunicipios();

  const sectionRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const mapWrapRef = useRef<HTMLDivElement | null>(null);

  const [selectedUF, setSelectedUF] = useState<string | null>(null);
  const [hoverUF, setHoverUF] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    name: string;
    count: number;
    status: string;
  }>({ visible: false, name: '', count: 0, status: '' });
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const [region, setRegion] = useState<RegionKey>('Todas');
  const [statusFilter, setStatusFilter] = useState<StatusKey>('Todos');

  const byName = useMemo(() => {
    const m = new Map<string, Estado>();
    estados?.forEach((e) => {
      if (e.nome) m.set(normalize(e.nome), e);
    });
    return m;
  }, [estados]);

  const byUF = useMemo(() => {
    const m = new Map<string, Estado>();
    estados?.forEach((e) => m.set(e.uf, e));
    return m;
  }, [estados]);

  const visibleUFs = useMemo(() => {
    if (!estados) return new Set<string>();
    const regionUFs =
      region === 'Todas'
        ? new Set(estados.map((e) => e.uf))
        : new Set(REGIOES[region] ?? []);
    const set = new Set<string>();
    estados.forEach((e) => {
      if (!e.nome) return;
      if (!regionUFs.has(e.uf)) return;
      const eff = effectiveStatus(e.uf, e.statusFundoEstadual);
      if (statusFilter === 'Todos' || eff === statusFilter) set.add(e.uf);
    });
    return set;
  }, [estados, region, statusFilter]);

  const selectedEstado = selectedUF ? byUF.get(selectedUF) ?? null : null;
  const selectedMunicipios: MunicipioDirpf[] = useMemo(() => {
    if (!selectedUF || !municipios) return [];
    return municipios.filter((m) => m.uf === selectedUF);
  }, [selectedUF, municipios]);

  // GSAP: title clip-path + map fade/scale
  useEffect(() => {
    if (!estados) return;
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.set(titleRef.current, {
          clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
          y: 24,
        });
        gsap.fromTo(
          titleRef.current,
          {
            clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
            y: 24,
          },
          {
            clipPath: 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)',
            y: 0,
            duration: 1.1,
            ease: 'expo.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: titleRef.current,
              start: 'top 85%',
              once: true,
            },
          },
        );
      }
      if (mapWrapRef.current) {
        gsap.set(mapWrapRef.current, { scale: 0.95, autoAlpha: 0 });
        gsap.fromTo(
          mapWrapRef.current,
          { scale: 0.95, autoAlpha: 0 },
          {
            scale: 1,
            autoAlpha: 1,
            duration: 1.2,
            ease: 'expo.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: mapWrapRef.current,
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
  }, [estados]);

  const panelOpen = selectedUF !== null;

  const counts = useMemo(() => {
    if (!estados) return { total: 0, ativo: 0, tram: 0, sem: 0 };
    const allReal = estados.filter((e) => e.nome);
    return {
      total: allReal.length,
      ativo: allReal.filter(
        (e) => effectiveStatus(e.uf, e.statusFundoEstadual) === 'ativo',
      ).length,
      tram: allReal.filter(
        (e) =>
          effectiveStatus(e.uf, e.statusFundoEstadual) === 'em_tramitacao',
      ).length,
      sem: allReal.filter(
        (e) => effectiveStatus(e.uf, e.statusFundoEstadual) === 'sem_fundo',
      ).length,
    };
  }, [estados]);

  return (
    <section
      id="mapa-fundos"
      ref={sectionRef}
      aria-labelledby="mapa-fundos-heading"
      className="relative py-[120px] lg:py-[140px] bg-white"
    >
      <div className="container-x">
        <div className="max-w-3xl mb-10 lg:mb-14">
          <SectionLabel>Mapa de Fundos Estaduais</SectionLabel>
          <div
            className="mt-5 overflow-hidden"
            style={{ paddingBottom: '4px' }}
          >
            <h2
              ref={titleRef}
              id="mapa-fundos-heading"
              className="text-[28px] sm:text-[36px] lg:text-[40px] font-medium leading-[1.15] tracking-[-0.02em] text-text-primary"
            >
              Onde estão os fundos estaduais ativos
            </h2>
          </div>
          <p className="mt-5 text-[16px] sm:text-[17px] leading-[1.65] text-text-secondary">
            Clique em um estado para ver detalhes do fundo estadual e a lista
            de municípios habilitados.
          </p>
        </div>

        {/* Filters (legend moved below the map) */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-end justify-end">
          <SelectField
            label="Região"
            value={region}
            onChange={(v) => setRegion(v as RegionKey)}
            options={[
              'Todas',
              ...(Object.keys(REGIOES) as Array<keyof typeof REGIOES>),
            ]}
          />
          <SelectField
            label="Status"
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as StatusKey)}
            options={[
              { value: 'Todos', label: 'Todos' },
              { value: 'ativo', label: 'Fundo Ativo' },
              { value: 'em_tramitacao', label: 'PL em tramitação' },
              { value: 'sem_fundo', label: 'Sem fundo' },
            ]}
          />
        </div>

        <p
          className="text-[13px] mb-4"
          style={{ color: '#5F5E5A' }}
          aria-live="polite"
        >
          {visibleUFs.size} estado{visibleUFs.size === 1 ? '' : 's'} exibido
          {visibleUFs.size === 1 ? '' : 's'}
        </p>

        {/* Map + Side panel layout */}
        <div className="relative grid lg:grid-cols-12 gap-6">
          <div className={panelOpen ? 'lg:col-span-8' : 'lg:col-span-12'}>
            {loadingEstados ? (
              <Skeleton height={520} rounded="20px" />
            ) : (
              <>
                <div
                  ref={mapWrapRef}
                  className="relative rounded-[20px] p-3 sm:p-5 shadow-[0_8px_32px_rgba(12,74,140,0.12)]"
                  style={{
                    background:
                      'linear-gradient(135deg, #F0F7FF 0%, #EAF4F0 100%)',
                    border: '1px solid rgba(12,74,140,0.08)',
                    minHeight: '480px',
                  }}
                >
                  <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{ scale: 700, center: [-54, -15] }}
                    style={{ width: '100%', height: 'auto' }}
                  >
                    <Geographies geography={GEO_URL}>
                      {({ geographies }: { geographies: any[] }) =>
                        geographies.map((geo) => {
                          const name = getGeoStateName(geo);
                          const estado = byName.get(normalize(name));
                          const uf = estado?.uf ?? '';
                          const eff: StatusEff = estado
                            ? (effectiveStatus(
                                uf,
                                estado.statusFundoEstadual,
                              ) as StatusEff)
                            : 'sem_fundo';
                          const isVisible = uf && visibleUFs.has(uf);
                          const isSelected = selectedUF === uf;
                          const palette = STATUS_COLOR[eff];
                          return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              onMouseEnter={(e) => {
                                if (!estado) return;
                                setHoverUF(uf);
                                setTooltipPos({
                                  x: e.clientX + 12,
                                  y: e.clientY - 40,
                                });
                                setTooltip({
                                  visible: true,
                                  name: estado.nome ?? uf,
                                  count: estado.municipiosHabilitados,
                                  status: STATUS_LABEL[eff] ?? '',
                                });
                              }}
                              onMouseMove={(e) => {
                                setTooltipPos({
                                  x: e.clientX + 12,
                                  y: e.clientY - 40,
                                });
                              }}
                              onMouseLeave={() => {
                                setHoverUF(null);
                                setTooltip((t) => ({ ...t, visible: false }));
                              }}
                              onClick={() => estado && setSelectedUF(uf)}
                              tabIndex={estado ? 0 : -1}
                              aria-label={
                                estado
                                  ? `${estado.nome} — ${STATUS_LABEL[eff]} — ${estado.municipiosHabilitados} municípios habilitados`
                                  : undefined
                              }
                              style={{
                                default: {
                                  fill: isVisible ? palette.default : '#F1EFE8',
                                  stroke: '#FFFFFF',
                                  strokeWidth: isSelected ? 2 : 0.8,
                                  outline: 'none',
                                  cursor: estado ? 'pointer' : 'default',
                                  opacity: isVisible ? 1 : 0.4,
                                  transition:
                                    'fill 0.2s ease, opacity 0.2s ease, stroke-width 0.2s ease',
                                },
                                hover: {
                                  fill: isVisible ? palette.hover : '#E8E5DE',
                                  stroke: '#FFFFFF',
                                  strokeWidth: 1.2,
                                  outline: 'none',
                                  cursor: estado ? 'pointer' : 'default',
                                },
                                pressed: {
                                  fill: palette.hover,
                                  outline: 'none',
                                },
                              }}
                            />
                          );
                        })
                      }
                    </Geographies>
                  </ComposableMap>
                </div>

                {/* Legend below the map */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px]">
                  <LegendDot
                    color={STATUS_COLOR.ativo.default}
                    label={`Fundo Ativo (${counts.ativo})`}
                  />
                  <LegendDot
                    color={STATUS_COLOR.em_tramitacao.default}
                    label={`PL em tramitação (${counts.tram})`}
                  />
                  <LegendDot
                    color={STATUS_COLOR.sem_fundo.default}
                    label={`Sem fundo (${counts.sem})`}
                    border="1px solid #B5D4F4"
                  />
                </div>
              </>
            )}
          </div>

          {/* Side panel */}
          {panelOpen && selectedEstado && (
            <SidePanel
              estado={selectedEstado}
              municipios={selectedMunicipios}
              loadingMunicipios={loadingMunicipios}
              onClose={() => setSelectedUF(null)}
            />
          )}
        </div>
      </div>

      {/* Floating tooltip — follows the mouse via position: fixed */}
      {tooltip.visible && (
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
            padding: '10px 12px',
            borderRadius: 10,
            fontSize: 12,
            lineHeight: 1.45,
            maxWidth: 220,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          }}
        >
          <strong style={{ fontWeight: 600, display: 'block' }}>
            {tooltip.name}
          </strong>
          <span style={{ color: '#9CB8D4' }}>{tooltip.status}</span>
          <div style={{ marginTop: 4 }}>
            {tooltip.count} municípios habilitados
          </div>
        </div>
      )}
      {/* Hover indicator (visually inert, retained for testing) */}
      <span aria-hidden="true" data-hover={hoverUF ?? ''} className="sr-only" />
    </section>
  );
}

function LegendDot({
  color,
  label,
  border,
}: {
  color: string;
  label: string;
  border?: string;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className="inline-block w-3 h-3 rounded-full"
        style={{ backgroundColor: color, border }}
      />
      <span style={{ color: '#5F5E5A' }}>{label}</span>
    </div>
  );
}

interface OptionObj {
  value: string;
  label: string;
}
function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: (string | OptionObj)[];
}) {
  const id = `sel-${label.toLowerCase().replace(/\s/g, '-')}`;
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[11px] uppercase tracking-[1.2px] font-medium mb-1.5"
        style={{ color: '#5F5E5A' }}
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-input px-3 py-2 text-[14px] outline-none cursor-pointer"
        style={{
          border: '1px solid #B5D4F4',
          backgroundColor: '#F7F9FC',
          color: '#2C2C2A',
          minWidth: 160,
        }}
      >
        {options.map((o) => {
          const opt: OptionObj =
            typeof o === 'string' ? { value: o, label: o } : o;
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </select>
    </div>
  );
}

interface SidePanelProps {
  estado: Estado;
  municipios: MunicipioDirpf[];
  loadingMunicipios: boolean;
  onClose: () => void;
}

function SidePanel({
  estado,
  municipios,
  loadingMunicipios,
  onClose,
}: SidePanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [tab, setTab] = useState<0 | 1>(0);

  useEffect(() => {
    if (!panelRef.current) return;
    gsap.fromTo(
      panelRef.current,
      { xPercent: 100, autoAlpha: 0.5 },
      { xPercent: 0, autoAlpha: 1, duration: 0.55, ease: 'expo.out' },
    );
  }, [estado.uf]);

  // Reset tab when switching state
  useEffect(() => setTab(0), [estado.uf]);

  const eff = effectiveStatus(estado.uf, estado.statusFundoEstadual);
  const statusStyle: CSSProperties =
    eff === 'ativo'
      ? { backgroundColor: '#EAF4F0', color: '#085041' }
      : eff === 'em_tramitacao'
      ? { backgroundColor: '#FEF3C7', color: '#92400E' }
      : { backgroundColor: '#F1EFE8', color: '#5F5E5A' };

  return (
    <aside
      ref={panelRef}
      aria-label={`Detalhes do estado ${estado.nome}`}
      className="lg:col-span-4 rounded-[20px] bg-white p-6 self-start sticky lg:top-24 flex flex-col gap-5 overflow-y-auto"
      style={{
        border: '1px solid rgba(12,74,140,0.10)',
        boxShadow: '0 12px 36px rgba(12,74,140,0.10)',
        maxHeight: '70vh',
      }}
    >
      {/* TOP — name + close + status badge */}
      <header className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p
              className="text-[11px] uppercase tracking-[1.2px] font-medium"
              style={{ color: '#5F5E5A' }}
            >
              Estado
            </p>
            <h3 className="mt-1 text-[20px] sm:text-[22px] font-medium text-text-primary leading-snug">
              {estado.nome}{' '}
              <span className="text-text-secondary text-[14px] font-normal">
                ({estado.uf})
              </span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar painel"
            className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full text-text-secondary hover:bg-blue-light hover:text-blue-deep transition-colors"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <span
          className="inline-flex items-center self-start gap-1.5 px-2.5 py-1 rounded-pill text-[12px] font-medium"
          style={statusStyle}
        >
          {STATUS_LABEL[eff]}
        </span>
      </header>

      {/* FUNDO ESTADUAL BLOCK */}
      {estado.nomeFundoEstadual ? (
        <div
          className="rounded-[12px] p-4 flex flex-col gap-3"
          style={{ backgroundColor: '#F7F9FC' }}
        >
          <p
            className="text-[11px] uppercase tracking-[1.2px] font-medium"
            style={{ color: '#5F5E5A' }}
          >
            Fundo Estadual
          </p>
          <p className="text-[14px] font-medium text-text-primary leading-snug">
            {estado.nomeFundoEstadual}
          </p>
          <p
            className="text-[12px] font-mono"
            style={{ color: '#5F5E5A' }}
          >
            CNPJ {formatCNPJ(estado.cnpjEstadual)}
          </p>
        </div>
      ) : (
        <div
          className="rounded-[12px] p-4"
          style={{
            backgroundColor: '#F1EFE8',
            border: '1px dashed rgba(0,0,0,0.10)',
          }}
        >
          <p className="text-[13px]" style={{ color: '#5F5E5A' }}>
            Este estado ainda não tem um fundo estadual{' '}
            {eff === 'em_tramitacao' ? 'em operação (PL em tramitação).' : 'criado.'}
          </p>
        </div>
      )}

      {/* MUNICIPALITY COUNT — destaque */}
      <div
        className="rounded-[12px] p-4 flex items-center gap-4"
        style={{
          background: 'linear-gradient(135deg, #E8F2FB 0%, #EAF4F0 100%)',
          border: '1px solid rgba(12,74,140,0.10)',
        }}
      >
        <span
          aria-hidden="true"
          className="inline-flex w-11 h-11 shrink-0 rounded-full items-center justify-center bg-white"
          style={{ color: '#0C4A8C' }}
        >
          <Building2 size={20} />
        </span>
        <div className="flex flex-col">
          <span
            className="leading-none tracking-[-0.02em]"
            style={{
              fontSize: '28px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #0C4A8C, #2196C9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'inline-block',
            }}
          >
            {estado.municipiosHabilitados}
          </span>
          <span
            className="text-[12px] mt-1"
            style={{ color: '#5F5E5A' }}
          >
            municípios habilitados DIRPF
          </span>
        </div>
      </div>

      {/* MUNICIPALITY LIST WITH TABS */}
      <div className="flex flex-col gap-3">
        <div
          role="tablist"
          aria-label="Visualizar municípios"
          className="inline-flex p-0.5 rounded-pill self-start"
          style={{
            backgroundColor: '#F1EFE8',
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <TabButton active={tab === 0} onClick={() => setTab(0)}>
            <IdCard size={14} aria-hidden="true" />
            CNPJ
          </TabButton>
          <TabButton active={tab === 1} onClick={() => setTab(1)}>
            <Building2 size={14} aria-hidden="true" />
            Nome do Fundo
          </TabButton>
        </div>

        <div
          role="tabpanel"
          className="rounded-[12px] overflow-hidden"
          style={{ border: '1px solid rgba(12,74,140,0.08)' }}
        >
          <div
            className="px-4 py-2 text-[11px] uppercase tracking-[1.2px] font-medium grid grid-cols-2 gap-4"
            style={{ color: '#5F5E5A', backgroundColor: '#F7F9FC' }}
          >
            <span>Município</span>
            <span>{tab === 0 ? 'CNPJ' : 'Nome do Fundo'}</span>
          </div>
          <div>
            {loadingMunicipios ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} height={20} />
                ))}
              </div>
            ) : municipios.length === 0 ? (
              <p
                className="p-4 text-[13px]"
                style={{ color: '#5F5E5A' }}
              >
                Nenhum município habilitado neste estado.
              </p>
            ) : (
              <ul
                className="divide-y"
                style={{ borderColor: 'rgba(12,74,140,0.06)' }}
              >
                {municipios.map((m, i) => (
                  <li
                    key={i}
                    className="grid grid-cols-2 gap-4 px-4 py-2.5 text-[12px] leading-snug"
                  >
                    <span
                      className="text-text-primary font-medium truncate"
                      title={m.municipio}
                    >
                      {m.municipio}
                    </span>
                    {tab === 0 ? (
                      <span
                        className="font-mono text-[11px]"
                        style={{ color: '#5F5E5A' }}
                      >
                        {formatCNPJ(m.cnpj)}
                      </span>
                    ) : (
                      <span
                        className="truncate"
                        style={{ color: '#5F5E5A' }}
                        title={m.nomeFundo}
                      >
                        {m.nomeFundo}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <a
        href="/consultoria"
        className="mt-auto inline-flex items-center justify-center gap-2 w-full rounded-pill px-5 py-3 text-[14px] font-medium text-white transition-shadow hover:shadow-[0_10px_28px_rgba(12,74,140,0.45)]"
        style={{
          background: 'linear-gradient(135deg, #0C4A8C, #2196C9)',
          boxShadow: '0 4px 14px rgba(12,74,140,0.35)',
        }}
      >
        Solicitar Consultoria
        <ArrowRight size={16} aria-hidden="true" />
      </a>
    </aside>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-[12px] font-medium transition-colors"
      style={{
        backgroundColor: active ? '#FFFFFF' : 'transparent',
        color: active ? '#0C4A8C' : '#5F5E5A',
        boxShadow: active ? '0 1px 3px rgba(12,74,140,0.10)' : 'none',
      }}
    >
      {children}
    </button>
  );
}
