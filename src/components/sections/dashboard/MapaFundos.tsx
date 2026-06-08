import {
  CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X, ArrowRight, Building2, IdCard, MapPin } from 'lucide-react';
import SectionLabel from '../../ui/SectionLabel';
import { useContato } from '../../../contexts/ContatoContext';
import {
  Estado,
  MunicipioDirpf,
  REGIOES,
  effectiveStatus,
  formatCNPJ,
  ARRECADACAO_2023_BRL_MI,
} from './types';
import { useEstados, useMunicipios } from './useDashboardData';
import Skeleton from './Skeleton';

const GEO_URL =
  'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';

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
type DirpfKey = 'Todos' | 'habilitados' | 'nao_hab';
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

// ── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  value: number | string;
  label: string;
  solidColor?: string;
}

function StatCard({ value, label, solidColor }: StatCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const numRef = useRef<HTMLSpanElement | null>(null);

  const isNumeric = typeof value === 'number';
  const isGradient = isNumeric && !solidColor;

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

  const numStyle: CSSProperties = solidColor
    ? { color: solidColor }
    : isGradient
    ? {
        background: 'linear-gradient(135deg, #0C4A8C, #2196C9)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        display: 'inline-block',
      }
    : {};

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
          style={numStyle}
        >
          0
        </span>
      ) : (
        <span
          className="text-[36px] lg:text-[40px] leading-none tracking-[-0.03em] font-extrabold"
          style={{
            background: 'linear-gradient(135deg, #0C4A8C, #2196C9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            display: 'inline-block',
            opacity: 1,
          }}
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

// ── StatusBadge ───────────────────────────────────────────────────────────────

function StatusBadge({ eff }: { eff: StatusEff }) {
  const style: CSSProperties =
    eff === 'ativo'
      ? { backgroundColor: '#EAF4F0', color: '#085041' }
      : eff === 'em_tramitacao'
      ? { backgroundColor: '#FEF3C7', color: '#92400E' }
      : { backgroundColor: '#F1EFE8', color: '#5F5E5A' };

  return (
    <span
      className="inline-flex items-center self-start gap-1.5 px-2.5 py-1 rounded-pill text-[11px] font-medium"
      style={style}
    >
      {STATUS_LABEL[eff]}
    </span>
  );
}

// ── LegendDot ─────────────────────────────────────────────────────────────────

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

// ── Pill filter button ─────────────────────────────────────────────────────────

function PillButton({
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
      onClick={onClick}
      className="px-4 py-1.5 rounded-pill text-[13px] font-medium transition-colors border whitespace-nowrap"
      style={{
        backgroundColor: active ? '#0C4A8C' : '#F7F9FC',
        color: active ? '#FFFFFF' : '#4A5568',
        borderColor: active ? '#0C4A8C' : '#D5E3F0',
      }}
    >
      {children}
    </button>
  );
}

// ── TabButton ─────────────────────────────────────────────────────────────────

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

// ── FullPanel — wide layout rendered below the map ───────────────────────────

interface FullPanelProps {
  estado: Estado;
  municipios: MunicipioDirpf[];
  loadingMunicipios: boolean;
  onClose: () => void;
}

function FullPanel({
  estado,
  municipios,
  loadingMunicipios,
  onClose,
}: FullPanelProps) {
  const { openContato } = useContato();
  const [tab, setTab] = useState<0 | 1>(0);
  useEffect(() => setTab(0), [estado.uf]);

  const eff = effectiveStatus(estado.uf, estado.statusFundoEstadual) as StatusEff;

  return (
    <>
      {/* Close button — absolute top-right of the parent container */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar painel"
        className="absolute top-6 right-6 inline-flex items-center justify-center w-9 h-9 rounded-full text-text-secondary hover:bg-blue-light hover:text-blue-deep transition-colors"
      >
        <X size={20} aria-hidden="true" />
      </button>

      {/* Header: state name + status badge */}
      <header className="flex flex-wrap items-center gap-3 mb-6 pr-12">
        <div>
          <p
            className="text-[11px] uppercase tracking-[1.2px] font-medium"
            style={{ color: '#5F5E5A' }}
          >
            Estado selecionado
          </p>
          <h3 className="mt-0.5 text-[22px] font-medium text-text-primary leading-snug">
            {estado.nome}{' '}
            <span className="text-text-secondary text-[15px] font-normal">
              ({estado.uf})
            </span>
          </h3>
        </div>
        <StatusBadge eff={eff} />
      </header>

      {/* 2-col body: left info, right table */}
      <div className="grid lg:grid-cols-12 gap-6">

        {/* Left — fund block + count + CTA */}
        <div className="lg:col-span-4 flex flex-col gap-4">

          {/* Fund block */}
          {estado.nomeFundoEstadual ? (
            <div
              className="rounded-[12px] p-4 flex flex-col gap-2"
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
              <p className="text-[12px] font-mono" style={{ color: '#5F5E5A' }}>
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
                {eff === 'em_tramitacao'
                  ? 'em operação (PL em tramitação).'
                  : 'criado.'}
              </p>
            </div>
          )}

          {/* Municipality count */}
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
              <span className="text-[12px] mt-1" style={{ color: '#5F5E5A' }}>
                municípios habilitados DIRPF
              </span>
            </div>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={() => openContato({ tipo: 'Solicitar Consultoria', mensagem: 'Gostaria de saber mais sobre a consultoria para implementar um fundo no meu município.' })}
            className="inline-flex items-center justify-center gap-2 w-full rounded-pill px-5 py-3 text-[14px] font-medium text-white transition-shadow hover:shadow-[0_10px_28px_rgba(12,74,140,0.45)]"
            style={{
              background: 'linear-gradient(135deg, #0C4A8C, #2196C9)',
              boxShadow: '0 4px 14px rgba(12,74,140,0.35)',
            }}
          >
            Solicitar Consultoria
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Right — tab toggle + scrollable municipality list */}
        <div className="lg:col-span-8 flex flex-col gap-3">
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
              className="px-4 py-2 text-[11px] uppercase tracking-[1.2px] font-medium grid grid-cols-2 gap-4 sticky top-0"
              style={{ color: '#5F5E5A', backgroundColor: '#F7F9FC' }}
            >
              <span>Município</span>
              <span>{tab === 0 ? 'CNPJ' : 'Nome do Fundo'}</span>
            </div>

            <div
              className="overflow-y-auto"
              style={{ maxHeight: '65vh' }}
            >
              {loadingMunicipios ? (
                <div className="p-3 space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} height={20} />
                  ))}
                </div>
              ) : municipios.length === 0 ? (
                <p className="p-4 text-[13px]" style={{ color: '#5F5E5A' }}>
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
      </div>
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function MapaFundos() {
  const { openContato } = useContato();
  const { data: estados, loading: loadingEstados } = useEstados();
  const { data: municipios, loading: loadingMunicipios } = useMunicipios();

  const sectionRef = useRef<HTMLElement | null>(null);
  const mapWrapRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const painelRef = useRef<HTMLDivElement | null>(null);

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
  const [dirpfFilter, setDirpfFilter] = useState<DirpfKey>('Todos');

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

  const filteredEstados = useMemo(() => {
    if (!estados) return [];
    const regionUFs =
      region === 'Todas'
        ? new Set(estados.map((e) => e.uf))
        : new Set(REGIOES[region] ?? []);

    return estados
      .filter((e) => {
        if (!e.nome) return false;
        if (!regionUFs.has(e.uf)) return false;
        const eff = effectiveStatus(e.uf, e.statusFundoEstadual);
        if (statusFilter !== 'Todos' && eff !== statusFilter) return false;
        if (dirpfFilter === 'habilitados' && e.municipiosHabilitados === 0)
          return false;
        if (dirpfFilter === 'nao_hab' && e.municipiosHabilitados > 0)
          return false;
        return true;
      })
      .sort((a, b) =>
        (a.nome ?? '').localeCompare(b.nome ?? '', 'pt-BR'),
      );
  }, [estados, region, statusFilter, dirpfFilter]);

  const visibleUFSet = useMemo(
    () => new Set(filteredEstados.map((e) => e.uf)),
    [filteredEstados],
  );

  const selectedEstado = selectedUF ? byUF.get(selectedUF) ?? null : null;
  const selectedMunicipios: MunicipioDirpf[] = useMemo(() => {
    if (!selectedUF || !municipios) return [];
    return municipios.filter((m) => m.uf === selectedUF);
  }, [selectedUF, municipios]);

  const counts = useMemo(() => {
    if (!estados) return { total: 0, ativo: 0, tram: 0, sem: 0, habilitados: 0 };
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
      habilitados: allReal.reduce((s, e) => s + e.municipiosHabilitados, 0),
    };
  }, [estados]);

  // GSAP: map fade on data load
  useEffect(() => {
    if (!estados) return;
    const ctx = gsap.context(() => {
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

  // GSAP: reanimate list items when filteredEstados changes
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-state-card]');
    if (!items.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { y: 20, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.5,
          stagger: 0.04,
          ease: 'power3.out',
        },
      );
    }, listRef);
    return () => ctx.revert();
  }, [filteredEstados]);

  // GSAP: panel open (or state switch) → fade+slide in; panel close → list reappears
  useEffect(() => {
    if (selectedUF && painelRef.current) {
      gsap.fromTo(
        painelRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
      );
    } else if (!selectedUF && listRef.current) {
      gsap.fromTo(
        listRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' },
      );
    }
  }, [selectedUF]);

  const panelOpen = selectedUF !== null && selectedEstado !== null;

  return (
    <section
      id="mapa-fundos"
      ref={sectionRef}
      aria-labelledby="mapa-fundos-heading"
      className="relative py-[120px] lg:py-[140px] bg-white"
    >
      <div className="container-x">
        {/* ── Section header ── */}
        <div className="max-w-3xl mb-10 lg:mb-14">
          <SectionLabel>Panorama Nacional</SectionLabel>
          <h2
            id="mapa-fundos-heading"
            className="mt-5 text-[28px] sm:text-[36px] lg:text-[40px] font-medium leading-[1.15] tracking-[-0.02em] text-text-primary"
          >
            Mapa dos Fundos Estaduais da Pessoa Idosa
          </h2>
          <p className="mt-5 text-[16px] sm:text-[17px] leading-[1.65] text-text-secondary">
            Panorama completo — legislação, arrecadação, municípios habilitados
            e oportunidades de consultoria em todos os estados brasileiros.
          </p>
        </div>

        {/* ── 4 stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            value={26}
            label="Estados com Fundo Ativo"
            solidColor="#1B8A6B"
          />
          <StatCard
            value={1}
            label="PL em Tramitação"
            solidColor="#F0B429"
          />
          <StatCard
            value={counts.habilitados}
            label="Municípios Habilitados"
          />
          <StatCard value={`R$ ${ARRECADACAO_2023_BRL_MI}M`} label="Arrecadação Total (2023)" />
        </div>

        {/* ── Filter rows ── */}
        <div className="mb-8 flex flex-col gap-3">
          {/* Row 1 — DIRPF */}
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="text-[12px] font-medium shrink-0"
              style={{ color: '#5F5E5A', minWidth: '148px' }}
            >
              Habilitação DIRPF
            </span>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { key: 'Todos', label: 'Todos' },
                  { key: 'habilitados', label: 'Habilitados' },
                  { key: 'nao_hab', label: 'Nao Hab.' },
                ] as { key: DirpfKey; label: string }[]
              ).map(({ key, label }) => (
                <PillButton
                  key={key}
                  active={dirpfFilter === key}
                  onClick={() => setDirpfFilter(key)}
                >
                  {label}
                </PillButton>
              ))}
            </div>
          </div>

          {/* Row 2 — Status */}
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="text-[12px] font-medium shrink-0"
              style={{ color: '#5F5E5A', minWidth: '148px' }}
            >
              Status
            </span>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { key: 'Todos', label: 'Todos' },
                  { key: 'ativo', label: 'Ativos' },
                  { key: 'em_tramitacao', label: 'Em Tramitacao' },
                ] as { key: StatusKey; label: string }[]
              ).map(({ key, label }) => (
                <PillButton
                  key={key}
                  active={statusFilter === key}
                  onClick={() => setStatusFilter(key)}
                >
                  {label}
                </PillButton>
              ))}
            </div>
          </div>

          {/* Row 3 — Regiao */}
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="text-[12px] font-medium shrink-0"
              style={{ color: '#5F5E5A', minWidth: '148px' }}
            >
              Regiao
            </span>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  'Todas',
                  ...(Object.keys(REGIOES) as Array<keyof typeof REGIOES>),
                ] as RegionKey[]
              ).map((r) => (
                <PillButton
                  key={r}
                  active={region === r}
                  onClick={() => setRegion(r)}
                >
                  {r}
                </PillButton>
              ))}
            </div>
          </div>
        </div>

        {/* ── Grid: list (35%) + map (1fr) ── */}
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: '35% 1fr' }}
        >
          {/* Left col — state list, always visible */}
          <div>
              <p
                className="text-[13px] mb-3"
                style={{ color: '#5F5E5A' }}
                aria-live="polite"
              >
                {filteredEstados.length} estado
                {filteredEstados.length === 1 ? '' : 's'}
              </p>

              {loadingEstados ? (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} height={72} rounded="12px" />
                  ))}
                </div>
              ) : (
                <div
                  ref={listRef}
                  className="max-h-[580px] overflow-y-auto pr-1 space-y-2"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {filteredEstados.map((e) => {
                    const eff = effectiveStatus(
                      e.uf,
                      e.statusFundoEstadual,
                    ) as StatusEff;
                    const isSelected = selectedUF === e.uf;
                    return (
                      <button
                        key={e.uf}
                        type="button"
                        data-state-card
                        onClick={() => setSelectedUF(isSelected ? null : e.uf)}
                        className="w-full text-left rounded-[12px] p-4 transition-colors"
                        style={{
                          border: isSelected
                            ? '1.5px solid #0C4A8C'
                            : '1px solid rgba(12,74,140,0.10)',
                          backgroundColor: isSelected ? '#EBF4FF' : '#FFFFFF',
                          boxShadow: isSelected
                            ? '0 4px 14px rgba(12,74,140,0.12)'
                            : '0 2px 8px rgba(12,74,140,0.04)',
                        }}
                        aria-pressed={isSelected}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[14px] font-medium text-text-primary">
                            {e.nome}{' '}
                            <span
                              className="text-[12px] font-normal"
                              style={{ color: '#5F5E5A' }}
                            >
                              ({e.uf})
                            </span>
                          </span>
                          <StatusBadge eff={eff} />
                        </div>
                        <div
                          className="inline-flex items-center gap-1 text-[12px]"
                          style={{ color: '#5F5E5A' }}
                        >
                          <MapPin size={12} aria-hidden="true" />
                          {e.municipiosHabilitados} municípios
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          {/* Map — right column */}
          <div>
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
                          const isVisible = uf ? visibleUFSet.has(uf) : false;
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
                                setTooltip((t) => ({
                                  ...t,
                                  visible: false,
                                }));
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
                                  fill: isVisible
                                    ? palette.default
                                    : '#F1EFE8',
                                  stroke: '#FFFFFF',
                                  strokeWidth: isSelected ? 2.5 : 0.8,
                                  outline: 'none',
                                  cursor: estado ? 'pointer' : 'default',
                                  opacity: isVisible ? 1 : 0.35,
                                  transition:
                                    'fill 0.2s ease, opacity 0.2s ease, stroke-width 0.2s ease',
                                },
                                hover: {
                                  fill: isVisible
                                    ? palette.hover
                                    : '#E8E5DE',
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

                {/* Legend */}
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
        </div>

        {/* ── Full-width panel below map ── */}
        {panelOpen && selectedEstado && (
          <div
            ref={painelRef}
            className="relative mt-6 w-full rounded-[20px] bg-white p-8"
            style={{
              border: '1px solid #B5D4F4',
              boxShadow: '0 8px 32px rgba(12,74,140,0.10)',
            }}
          >
            <FullPanel
              estado={selectedEstado}
              municipios={selectedMunicipios}
              loadingMunicipios={loadingMunicipios}
              onClose={() => setSelectedUF(null)}
            />
          </div>
        )}
      </div>

      {/* Floating tooltip */}
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
      <span
        aria-hidden="true"
        data-hover={hoverUF ?? ''}
        className="sr-only"
      />
    </section>
  );
}
