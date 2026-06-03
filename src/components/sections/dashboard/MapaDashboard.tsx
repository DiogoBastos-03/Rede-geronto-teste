import {
  CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { geoMercator, geoBounds, geoCentroid } from 'd3-geo';
import {
  volumeFill,
  volumeFillHover,
  AMBER,
  AMBER_HOVER,
  NEUTRAL_FILL,
  NEUTRAL_HOVER,
} from '../../../data/mapScale';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  FileText,
  IdCard,
  MapPin,
  Maximize,
  Minus,
  Plus,
  Scale,
  Search,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import SectionLabel from '../../ui/SectionLabel';
import Button from '../../ui/Button';
import {
  Estado,
  MunicipioDirpf,
  REGIOES,
  ARRECADACAO_2023_BRL_MI,
  effectiveStatus,
  formatCNPJ,
} from './types';
import {
  useEstados,
  useMunicipios,
  useCoordsMap,
  useFundosEstaduais,
  useArrecadacao,
  type FundoEstadualDado,
  type MunicipioArrecadacao,
} from './useDashboardData';
import Skeleton from './Skeleton';

// ── Currency helpers ──────────────────────────────────────────────────────────

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatBRLCompact(value: number): string {
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} mi`;
  }
  if (value >= 1_000) {
    return `R$ ${(value / 1_000).toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })} mil`;
  }
  return formatBRL(value);
}

// ── Dot radius scaled by arrecadação (log scale, CSS pixels) ─────────────────

function dotRadius(total: number): number {
  if (total <= 0) return 1.5;
  const logMin = Math.log10(10);
  const logMax = Math.log10(4_000_000);
  const t = Math.min(1, (Math.log10(Math.max(10, total)) - logMin) / (logMax - logMin));
  return 1.5 + t * 3.5; // 1.5 px (min) → 5 px (max)
}

const GEO_URL =
  'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';

// ── Colour constants — see src/data/mapScale.ts for the shared ramp ───────────

const STATUS_LABEL: Record<string, string> = {
  ativo: 'Fundo Ativo',
  em_tramitacao: 'PL em tramitação',
  sem_fundo: 'Sem fundo estadual',
};

// ── Types ──────────────────────────────────────────────────────────────────────

type RegionKey = 'Todas' | keyof typeof REGIOES;
type StatusKey = 'Todos' | 'ativo' | 'em_tramitacao' | 'sem_fundo';
type DirpfKey = 'Todos' | 'habilitados' | 'nao_hab';
type StatusEff = 'ativo' | 'em_tramitacao' | 'sem_fundo';

// ── Helpers ────────────────────────────────────────────────────────────────────

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

// ── StatCard ───────────────────────────────────────────────────────────────────

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
      // CRITICAL: opacity, NOT autoAlpha — card has gradient-text children
      gsap.fromTo(
        card,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: { trigger: card, start: 'top 88%', once: true },
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
          scrollTrigger: { trigger: card, start: 'top 88%', once: true },
          onUpdate() {
            if (numRef.current)
              numRef.current.textContent = Math.round(obj.val).toLocaleString('pt-BR');
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
      style={{ border: '1px solid rgba(12,74,140,0.08)', boxShadow: '0 4px 24px rgba(12,74,140,0.06)' }}
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
      <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">{label}</p>
    </div>
  );
}

// ── StatusBadge ────────────────────────────────────────────────────────────────

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

// ── LegendDot ──────────────────────────────────────────────────────────────────

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

// ── StatusDot (compact indicator for state list) ──────────────────────────────

function StatusDot({ eff }: { eff: StatusEff }) {
  const cfg: Record<StatusEff, { color: string; label: string }> = {
    ativo: { color: '#28A87A', label: 'Ativo' },
    em_tramitacao: { color: '#D99A2B', label: 'PL/Lei' },
    sem_fundo: { color: '#9CA3AF', label: 'Sem fundo' },
  };
  const { color, label } = cfg[eff];
  return (
    <span className="inline-flex items-center gap-1 shrink-0">
      <span
        aria-hidden="true"
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-[10px] font-medium" style={{ color }}>
        {label}
      </span>
    </span>
  );
}

// ── PillButton (filter rows) ───────────────────────────────────────────────────

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

// ── TabButton (FullPanel) ──────────────────────────────────────────────────────

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

// ── FullPanel (state detail, Fundos layer only) ────────────────────────────────

interface FullPanelProps {
  estado: Estado;
  municipios: MunicipioDirpf[];
  loadingMunicipios: boolean;
  onClose: () => void;
}

function FullPanel({ estado, municipios, loadingMunicipios, onClose }: FullPanelProps) {
  const [tab, setTab] = useState<0 | 1>(0);
  useEffect(() => setTab(0), [estado.uf]);

  const eff = effectiveStatus(estado.uf, estado.statusFundoEstadual) as StatusEff;

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar painel"
        className="absolute top-6 right-6 inline-flex items-center justify-center w-9 h-9 rounded-full text-text-secondary hover:bg-blue-light hover:text-blue-deep transition-colors"
      >
        <X size={20} aria-hidden="true" />
      </button>

      <header className="flex flex-wrap items-center gap-3 mb-6 pr-12">
        <div>
          <p className="text-[11px] uppercase tracking-[1.2px] font-medium" style={{ color: '#5F5E5A' }}>
            Estado selecionado
          </p>
          <h3 className="mt-0.5 text-[22px] font-medium text-text-primary leading-snug">
            {estado.nome}{' '}
            <span className="text-text-secondary text-[15px] font-normal">({estado.uf})</span>
          </h3>
        </div>
        <StatusBadge eff={eff} />
      </header>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: fund info + count + CTA */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {estado.nomeFundoEstadual ? (
            <div className="rounded-[12px] p-4 flex flex-col gap-2" style={{ backgroundColor: '#F7F9FC' }}>
              <p className="text-[11px] uppercase tracking-[1.2px] font-medium" style={{ color: '#5F5E5A' }}>
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
              style={{ backgroundColor: '#F1EFE8', border: '1px dashed rgba(0,0,0,0.10)' }}
            >
              <p className="text-[13px]" style={{ color: '#5F5E5A' }}>
                Este estado ainda não tem um fundo estadual{' '}
                {eff === 'em_tramitacao' ? 'em operação (PL em tramitação).' : 'criado.'}
              </p>
            </div>
          )}

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

          <a
            href="/consultoria"
            className="inline-flex items-center justify-center gap-2 w-full rounded-pill px-5 py-3 text-[14px] font-medium text-white transition-shadow hover:shadow-[0_10px_28px_rgba(12,74,140,0.45)]"
            style={{
              background: 'linear-gradient(135deg, #0C4A8C, #2196C9)',
              boxShadow: '0 4px 14px rgba(12,74,140,0.35)',
            }}
          >
            Solicitar Consultoria
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>

        {/* Right: tab + scrollable list */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div
            role="tablist"
            aria-label="Visualizar municípios"
            className="inline-flex p-0.5 rounded-pill self-start"
            style={{ backgroundColor: '#F1EFE8', border: '1px solid rgba(0,0,0,0.06)' }}
          >
            <TabButton active={tab === 0} onClick={() => setTab(0)}>
              <IdCard size={14} aria-hidden="true" /> CNPJ
            </TabButton>
            <TabButton active={tab === 1} onClick={() => setTab(1)}>
              <Building2 size={14} aria-hidden="true" /> Nome do Fundo
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
            <div className="overflow-y-auto" style={{ maxHeight: '65vh' }}>
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
                <ul className="divide-y" style={{ borderColor: 'rgba(12,74,140,0.06)' }}>
                  {municipios.map((m, i) => (
                    <li key={i} className="grid grid-cols-2 gap-4 px-4 py-2.5 text-[12px] leading-snug">
                      <span className="text-text-primary font-medium truncate" title={m.municipio}>
                        {m.municipio}
                      </span>
                      {tab === 0 ? (
                        <span className="font-mono text-[11px]" style={{ color: '#5F5E5A' }}>
                          {formatCNPJ(m.cnpj)}
                        </span>
                      ) : (
                        <span className="truncate" style={{ color: '#5F5E5A' }} title={m.nomeFundo}>
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

// ── FilterDropdown ─────────────────────────────────────────────────────────────

interface DropdownOpt<T extends string> { value: T; label: string; }

function FilterDropdown<T extends string,>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: DropdownOpt<T>[];
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const isDefault = options[0]?.value === value;
  const selectedLabel = options.find((o) => o.value === value)?.label ?? label;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-[13px] font-medium whitespace-nowrap transition-colors"
        style={{
          backgroundColor: isDefault ? '#F7F9FC' : '#0C4A8C',
          color: isDefault ? '#4A5568' : '#FFFFFF',
          border: isDefault ? '1px solid #D5E3F0' : '1px solid #0C4A8C',
        }}
      >
        {isDefault ? label : selectedLabel}
        <ChevronDown size={13} aria-hidden="true" style={{ opacity: 0.7 }} />
      </button>
      {open && (
        <div
          className="absolute left-0 z-20 mt-1 min-w-[148px] rounded-[10px] bg-white py-1"
          style={{
            top: '100%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-[13px] hover:bg-gray-50 transition-colors"
              style={{
                color: opt.value === value ? '#0C4A8C' : '#2C2C2A',
                fontWeight: opt.value === value ? 600 : 400,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── SearchCombobox ─────────────────────────────────────────────────────────────

function SearchCombobox<T,>({
  query,
  onChange,
  onSelect,
  onClear,
  placeholder,
  suggestions,
  getKey,
  getLabel,
}: {
  query: string;
  onChange: (q: string) => void;
  onSelect: (item: T) => void;
  onClear: () => void;
  placeholder: string;
  suggestions: T[];
  getKey: (item: T) => string;
  getLabel: (item: T) => string;
}) {
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const showList = focused && suggestions.length > 0;

  useEffect(() => {
    if (!showList) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showList]);

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-pill"
        style={{
          border: focused ? '1.5px solid #2196C9' : '1px solid #D5E3F0',
          backgroundColor: '#FFFFFF',
          boxShadow: focused ? '0 0 0 3px rgba(33,150,201,0.12)' : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      >
        <Search size={13} aria-hidden="true" style={{ color: '#9CA3AF', flexShrink: 0 }} />
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          className="flex-1 outline-none bg-transparent text-[13px] min-w-0"
          style={{ color: '#2C2C2A' }}
        />
        {query && (
          <button type="button" onClick={onClear} aria-label="Limpar busca" className="shrink-0" style={{ color: '#9CA3AF' }}>
            <X size={13} aria-hidden="true" />
          </button>
        )}
      </div>
      {showList && (
        <div
          className="absolute left-0 right-0 z-20 mt-1 rounded-[10px] bg-white py-1 overflow-y-auto"
          style={{
            top: '100%',
            maxHeight: '220px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          {suggestions.map((item) => (
            <button
              key={getKey(item)}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onSelect(item); setFocused(false); }}
              className="w-full text-left px-3 py-1.5 text-[13px] hover:bg-blue-50 transition-colors"
              style={{ color: '#2C2C2A' }}
            >
              {getLabel(item)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── StateSidePanel (master-detail, left column) ────────────────────────────────

interface StateSidePanelProps {
  estado: Estado;
  onBack: () => void;
  fundoDado?: FundoEstadualDado | null;
  municipiosHabilitados: number;
}

// ── Status chip for the panel (different style from StatusBadge) ──────────────

function PanelStatusChip({ status }: { status: 'ativo' | 'sem_fundo' | 'lei_sem_cadastro' }) {
  const cfg = {
    ativo:            { label: 'Fundo Ativo',                bg: '#ECFDF5', color: '#065F46' },
    lei_sem_cadastro: { label: 'Lei aprovada, fundo não cadastrado', bg: '#FFFBEB', color: '#92400E' },
    sem_fundo:        { label: 'Sem fundo estadual',         bg: '#F3F4F6', color: '#4B5563' },
  }[status];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

// ── Attribute row ─────────────────────────────────────────────────────────────

function AttrRow({
  icon: Icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon size={13} aria-hidden="true" className="shrink-0 mt-[3px]" style={{ color: '#9CA3AF' }} />
      <div className="flex-1 min-w-0">
        <p className="text-[9.5px] uppercase tracking-[0.9px] font-medium mb-0.5" style={{ color: '#9CA3AF' }}>
          {label}
        </p>
        <p
          className="text-[12px] font-medium leading-snug text-text-primary break-words"
          style={valueColor ? { color: valueColor } : undefined}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function StateSidePanel({ estado, onBack, fundoDado, municipiosHabilitados }: StateSidePanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Entrance animation on mount
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    gsap.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' });
  }, [estado.uf]);

  const status = fundoDado?.status ?? 'sem_fundo';

  return (
    <div ref={panelRef} className="flex flex-col h-full gap-0">

      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[12px] font-medium mb-3 self-start transition-colors hover:text-text-primary shrink-0"
        style={{ color: '#5F5E5A' }}
      >
        <ArrowLeft size={13} aria-hidden="true" />
        Voltar à lista
      </button>

      {/* Card */}
      <div
        className="flex flex-col flex-1 min-h-0 rounded-[16px] bg-white overflow-hidden"
        style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}
      >
        {/* ── Header ── */}
        <div
          className="px-5 pt-5 pb-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}
        >
          <div className="flex items-center gap-2 mb-2.5">
            <h3 className="text-[19px] font-semibold text-text-primary leading-snug">{estado.nome}</h3>
            <span
              className="rounded-[6px] px-2 py-0.5 text-[11px] font-bold shrink-0"
              style={{ backgroundColor: '#EBF4FF', color: '#0C4A8C' }}
            >
              {estado.uf}
            </span>
          </div>
          <PanelStatusChip status={status} />
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 flex flex-col gap-4" style={{ scrollbarWidth: 'thin' }}>

          {/* Fund identity — only when there's a fund */}
          {status !== 'sem_fundo' && fundoDado?.nomeFundo && (
            <div>
              {fundoDado.sigla && (
                <span
                  className="inline-block rounded-[5px] px-2 py-0.5 text-[10px] font-bold text-white mb-2"
                  style={{ backgroundColor: '#2196C9' }}
                >
                  {fundoDado.sigla}
                </span>
              )}
              <p className="text-[13px] font-semibold text-text-primary leading-snug">{fundoDado.nomeFundo}</p>
            </div>
          )}

          {/* sem_fundo message */}
          {status === 'sem_fundo' && (
            <div
              className="rounded-[10px] px-4 py-3 text-[12px] leading-relaxed"
              style={{ backgroundColor: '#F7F9FC', border: '1px solid rgba(0,0,0,0.07)', color: '#5F5E5A' }}
            >
              Este estado ainda não possui Fundo Estadual da Pessoa Idosa.
            </div>
          )}

          {/* Attribute list */}
          <div className="flex flex-col divide-y divide-[rgba(0,0,0,0.05)]">
            {[
              fundoDado?.lei && { icon: Scale, label: 'Lei de criação', value: fundoDado.lei },
              fundoDado?.orgaoGestor && { icon: Building2, label: 'Órgão gestor', value: fundoDado.orgaoGestor },
              fundoDado?.conselho && { icon: Users, label: 'Conselho', value: fundoDado.conselho },
              fundoDado?.decretoRegulamentador && { icon: FileText, label: 'Decreto regulamentador', value: fundoDado.decretoRegulamentador },
              fundoDado?.situacaoReceita && {
                icon: BadgeCheck,
                label: 'Situação na Receita',
                value: fundoDado.situacaoReceita,
                valueColor: fundoDado.situacaoReceita === 'Apto' ? '#1B8A6B' : undefined,
              },
              {
                icon: MapPin,
                label: 'Municípios habilitados (DIRPF 2025)',
                value: `${municipiosHabilitados}`,
                valueColor: '#0C4A8C',
              },
            ]
              .filter(Boolean)
              .map((row) => {
                const r = row as { icon: React.ElementType; label: string; value: string; valueColor?: string };
                return (
                  <AttrRow key={r.label} icon={r.icon} label={r.label} value={r.value} valueColor={r.valueColor} />
                );
              })}
          </div>

          {/* ── Arrecadação IRPF 2025 ── */}
          {fundoDado && fundoDado.arrecadacaoIRPF2025 !== undefined && fundoDado.arrecadacaoIRPF2025 !== null && (
            <div
              className="rounded-[10px] px-4 py-3 flex items-start gap-3 shrink-0"
              style={{ backgroundColor: '#F0FAF6', border: '1px solid rgba(40,168,122,0.18)' }}
            >
              <TrendingUp size={15} aria-hidden="true" className="shrink-0 mt-[3px]" style={{ color: '#28A87A' }} />
              <div className="flex-1 min-w-0">
                <p className="text-[9.5px] uppercase tracking-[0.9px] font-medium mb-1" style={{ color: '#9CA3AF' }}>
                  Doações via IRPF (2025)
                </p>
                {fundoDado.arrecadacaoIRPF2025 > 0 ? (
                  <>
                    <p className="text-[15px] font-bold text-text-primary leading-none">{formatBRL(fundoDado.arrecadacaoIRPF2025)}</p>
                    {fundoDado.doacoesIRPF2025 != null && (
                      <p className="text-[11px] mt-0.5" style={{ color: '#5F5E5A' }}>
                        {fundoDado.doacoesIRPF2025.toLocaleString('pt-BR')} doações registradas
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-[15px] font-bold text-text-primary leading-none">R$ 0,00</p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#5F5E5A' }}>
                      Nenhum recurso de IRPF foi captado por este fundo em 2025
                    </p>
                  </>
                )}
                <p className="text-[9px] mt-1.5" style={{ color: '#9CA3AF' }}>Fonte: Receita Federal · 2025</p>
              </div>
            </div>
          )}

          {/* CTA */}
          <a
            href="/consultoria"
            className="inline-flex items-center justify-center gap-2 w-full rounded-pill px-4 py-2.5 text-[13px] font-medium text-white transition-shadow hover:shadow-[0_8px_24px_rgba(12,74,140,0.40)] shrink-0"
            style={{ background: 'linear-gradient(135deg, #0C4A8C, #28A87A)', boxShadow: '0 4px 14px rgba(12,74,140,0.25)' }}
          >
            Solicitar Consultoria
            <ArrowRight size={14} aria-hidden="true" />
          </a>

          {/* Source footnote */}
          {fundoDado?.fonte && (
            <p className="text-[10px] leading-snug shrink-0" style={{ color: '#9CA3AF' }}>
              Fonte: {fundoDado.fonte}
              {' · '}confiança{' '}
              <span style={{ color: fundoDado.confianca === 'alta' ? '#1B8A6B' : '#D99A2B' }}>
                {fundoDado.confianca}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function MapaDashboard() {
  // ── Data ─────────────────────────────────────────────────────────────────────
  const { data: estados, loading: loadingEstados } = useEstados();
  const { data: municipios, loading: loadingMunicipios } = useMunicipios();
  const { data: coordsMap } = useCoordsMap();
  const { data: fundosEstaduais } = useFundosEstaduais();
  const { data: arrecadacaoData } = useArrecadacao();

  // ── Refs ──────────────────────────────────────────────────────────────────────
  const sectionRef = useRef<HTMLElement | null>(null);
  const mapWrapRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // ── Fundos zoom state + geography cache ──────────────────────────────────────
  const geoByUF = useRef<Map<string, any>>(new Map());
  const [fundosPosition, setFundosPosition] = useState<{
    coordinates: [number, number];
    zoom: number;
  }>({ coordinates: [-54, -15], zoom: 1 });

  // ── Canvas layer (Municípios overlay) ─────────────────────────────────────────
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  /** Raw d3-zoom transform {x, y, k} in viewBox-600 coordinate space */
  const munTransformRef = useRef({ x: 0, y: 0, k: 1 });
  /** Stable reference to the latest draw function — updated by effect */
  const drawCanvasRef = useRef<() => void>(() => {});
  /** Projected screen coords of visible dots, used for tooltip hit-testing */
  const projectedDotsRef = useRef<Array<{ m: MunicipioDirpf; cx: number; cy: number }>>([]);
  /** geoMercator matching ComposableMap's internal projection (viewBox 800×600) */
  const munProjection = useMemo(
    () =>
      geoMercator()
        .scale(600)                              // matches Fundos ComposableMap scale=600
        .center([-54, -15] as [number, number])
        .translate([400, 300]),
    [],
  );

  // ── Arrecadação IRPF 2025 — lookup by IBGE code ──────────────────────────────
  const arrecadacaoByIBGERef = useRef<Map<string, MunicipioArrecadacao>>(new Map());
  useEffect(() => {
    if (!arrecadacaoData) return;
    const m = new Map<string, MunicipioArrecadacao>();
    arrecadacaoData.municipios.forEach((mun) => m.set(mun.ibge, mun));
    arrecadacaoByIBGERef.current = m;
    drawCanvasRef.current(); // redraw with sized dots
  }, [arrecadacaoData]);

  // ── Municipalities overlay toggle ─────────────────────────────────────────────
  const [showMunicipios, setShowMunicipios] = useState(false);
  const showMunicipiosRef = useRef(false);

  // ── Fundos state ──────────────────────────────────────────────────────────────
  const [selectedUF, setSelectedUF] = useState<string | null>(null);
  const [hoverUF, setHoverUF] = useState<string | null>(null);
  const [fundosTooltip, setFundosTooltip] = useState<{
    visible: boolean;
    name: string;
    count: number;
    status: string;
  }>({ visible: false, name: '', count: 0, status: '' });
  const [fundosTooltipPos, setFundosTooltipPos] = useState({ x: 0, y: 0 });
  const [region, setRegion] = useState<RegionKey>('Todas');
  const [statusFilter, setStatusFilter] = useState<StatusKey>('Todos');
  const [dirpfFilter, setDirpfFilter] = useState<DirpfKey>('Todos');

  // ── Municípios overlay state ───────────────────────────────────────────────────
  const [munTooltip, setMunTooltip] = useState<MunicipioDirpf | null>(null);
  const [munTooltipPos, setMunTooltipPos] = useState({ x: 0, y: 0 });

  // Fundos search
  const [stateQuery, setStateQuery] = useState('');
  const [focusUF, setFocusUF] = useState<string | null>(null);

  // Municípios search
  const [munQuery, setMunQuery] = useState('');
  const [munFocusMun, setMunFocusMun] = useState<MunicipioDirpf | null>(null);
  const munFocusRef = useRef<MunicipioDirpf | null>(null);

  // ── Fundos derived data ───────────────────────────────────────────────────────
  const byName = useMemo(() => {
    const m = new Map<string, Estado>();
    estados?.forEach((e) => { if (e.nome) m.set(normalize(e.nome), e); });
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
        if (dirpfFilter === 'habilitados' && e.municipiosHabilitados === 0) return false;
        if (dirpfFilter === 'nao_hab' && e.municipiosHabilitados > 0) return false;
        return true;
      })
      .sort((a, b) => (a.nome ?? '').localeCompare(b.nome ?? '', 'pt-BR'));
  }, [estados, region, statusFilter, dirpfFilter]);

  const visibleUFSet = useMemo(
    () => new Set(filteredEstados.map((e) => e.uf)),
    [filteredEstados],
  );

  const selectedEstado = selectedUF ? byUF.get(selectedUF) ?? null : null;

  const selectedMunicipios = useMemo(() => {
    if (!selectedUF || !municipios) return [];
    return municipios.filter((m) => m.uf === selectedUF);
  }, [selectedUF, municipios]);

  const counts = useMemo(() => {
    if (!estados) return { total: 0, ativo: 0, tram: 0, sem: 0, habilitados: 0 };
    const allReal = estados.filter((e) => e.nome);
    return {
      total: allReal.length,
      ativo: allReal.filter((e) => effectiveStatus(e.uf, e.statusFundoEstadual) === 'ativo').length,
      tram: allReal.filter((e) => effectiveStatus(e.uf, e.statusFundoEstadual) === 'em_tramitacao').length,
      sem: allReal.filter((e) => effectiveStatus(e.uf, e.statusFundoEstadual) === 'sem_fundo').length,
      habilitados: allReal.reduce((s, e) => s + e.municipiosHabilitados, 0),
    };
  }, [estados]);

  const statusOptions: DropdownOpt<StatusKey>[] = [
    { value: 'Todos', label: 'Todos' },
    { value: 'ativo', label: 'Ativos' },
    { value: 'em_tramitacao', label: 'Em tramitação' },
    { value: 'sem_fundo', label: 'Sem fundo' },
  ];
  const dirpfOptions: DropdownOpt<DirpfKey>[] = [
    { value: 'Todos', label: 'Todos' },
    { value: 'habilitados', label: 'Habilitados' },
    { value: 'nao_hab', label: 'Não habilitados' },
  ];
  const regionOptions: DropdownOpt<RegionKey>[] = [
    { value: 'Todas', label: 'Todas' },
    ...(Object.keys(REGIOES) as Array<keyof typeof REGIOES>).map((r) => ({
      value: r as RegionKey,
      label: r,
    })),
  ];

  // ── Municípios overlay derived data ──────────────────────────────────────────
  const visibleDots = useMemo(() => {
    if (!municipios) return [];
    if (selectedUF) return municipios.filter((m) => m.uf === selectedUF);
    return municipios;
  }, [municipios, selectedUF]);

  const stateSuggestions = useMemo(() => {
    if (!stateQuery.trim()) return [];
    const q = normalize(stateQuery);
    return filteredEstados.filter((e) => e.nome && normalize(e.nome).includes(q)).slice(0, 8);
  }, [stateQuery, filteredEstados]);

  const munSuggestions = useMemo(() => {
    if (!munQuery.trim()) return [];
    const q = normalize(munQuery);
    return visibleDots.filter((m) => normalize(m.municipio).includes(q)).slice(0, 8);
  }, [munQuery, visibleDots]);

  // ── GSAP: map entrance (Fundos map) ──────────────────────────────────────────
  useEffect(() => {
    if (!estados) return;
    const ctx = gsap.context(() => {
      if (mapWrapRef.current) {
        gsap.fromTo(
          mapWrapRef.current,
          { scale: 0.95, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 1.2,
            ease: 'expo.out',
            immediateRender: false,
            scrollTrigger: { trigger: mapWrapRef.current, start: 'top 85%', once: true },
          },
        );
      }
    }, sectionRef);
    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [estados]);

  // GSAP: reanimate state list on filter change
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-state-card]');
    if (!items.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { y: 20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.04, ease: 'power3.out' },
      );
    }, listRef);
    return () => ctx.revert();
  }, [filteredEstados]);

  // ── Canvas: rebuild base projection + draw when data / filter changes ─────────
  // Base projection is computed once (no zoom/pan); draw applies the affine transform.
  useEffect(() => {
    if (!coordsMap) return;

    // Pre-project every visible dot into viewBox-600 space (cheap: one call per dot)
    const base = visibleDots.flatMap((m) => {
      const c = coordsMap[m.codigoIBGE];
      if (!c) return [];
      const pt = munProjection([c.lng, c.lat]);
      return pt ? [{ m, bx: pt[0], by: pt[1] }] : [];
    });

    drawCanvasRef.current = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      if (!W || !H) return;

      // Physical canvas size (DPR-aware for Retina)
      canvas.width = W * dpr;
      canvas.height = H * dpr;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr); // draw in CSS-pixel units

      // If municipalities layer is off, just clear and return
      if (!showMunicipiosRef.current) {
        ctx.restore();
        return;
      }

      const { x, y, k } = munTransformRef.current;
      // viewBox (800×600) → CSS pixels: height:auto SVG is uniformly scaled by W/800
      const s = W / 800;

      const projected: Array<{ m: MunicipioDirpf; cx: number; cy: number }> = [];

      // Phase 1: project all visible dots (no drawing yet)
      for (const { m, bx, by } of base) {
        const cx = (bx * k + x) * s;
        const cy = (by * k + y) * s;
        // Cull points outside the visible area (perf: skip draw calls)
        if (cx < -4 || cy < -4 || cx > W + 4 || cy > H + 4) continue;
        projected.push({ m, cx, cy });
      }

      // Store projected for tooltip hit-testing
      projectedDotsRef.current = projected;

      const focusedId = munFocusRef.current?.codigoIBGE ?? null;

      const arrByIBGE = arrecadacaoByIBGERef.current;

      if (focusedId) {
        // Non-focused: small + low alpha
        ctx.lineWidth = 0.4;
        for (const { m: pm, cx, cy } of projected) {
          if (pm.codigoIBGE === focusedId) continue;
          const arrMun = arrByIBGE.get(pm.codigoIBGE);
          const r = arrMun ? Math.max(1.2, dotRadius(arrMun.total) * 0.7) : 1.2;
          ctx.fillStyle = arrMun && arrMun.total > 0 ? 'rgba(40,168,122,0.18)' : 'rgba(40,168,122,0.1)';
          ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        // Focused: ring + larger dot
        const fp = projected.find((p) => p.m.codigoIBGE === focusedId);
        if (fp) {
          ctx.beginPath();
          ctx.arc(fp.cx, fp.cy, 13, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(40,168,122,0.3)';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(fp.cx, fp.cy, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#28A87A';
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      } else {
        // Normal: sized by arrecadação, green with white border
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 0.8;
        for (const { m: pm, cx, cy } of projected) {
          const arrMun = arrByIBGE.get(pm.codigoIBGE);
          const total = arrMun?.total ?? 0;
          const r = dotRadius(total);
          // Missed opportunities (R$0) in faint green; captadores in solid green
          ctx.fillStyle = total > 0 ? 'rgba(40,168,122,0.88)' : 'rgba(40,168,122,0.28)';
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    drawCanvasRef.current();
  }, [coordsMap, visibleDots, munProjection]);

  // ── Canvas: sync with fundosPosition state (zoom buttons / reset) ─────────────
  // When buttons update `fundosPosition`, the ZoomableGroup re-positions but onMove
  // doesn't fire — compute the equivalent d3-zoom transform from geographic coords.
  useEffect(() => {
    const pt = munProjection(fundosPosition.coordinates);
    if (!pt) return;
    munTransformRef.current = {
      x: 400 - pt[0] * fundosPosition.zoom,
      y: 300 - pt[1] * fundosPosition.zoom,
      k: fundosPosition.zoom,
    };
    drawCanvasRef.current();
  }, [fundosPosition, munProjection]);

  // ── Canvas: sync munFocusRef and redraw on focus change ──────────────────────
  useEffect(() => {
    munFocusRef.current = munFocusMun;
    drawCanvasRef.current();
  }, [munFocusMun]);

  // ── Canvas: sync showMunicipiosRef and redraw ─────────────────────────────────
  useEffect(() => {
    showMunicipiosRef.current = showMunicipios;
    drawCanvasRef.current();
  }, [showMunicipios]);

  // ── Canvas: redraw on window resize ──────────────────────────────────────────
  useEffect(() => {
    const onResize = () => drawCanvasRef.current();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);


  // ── Fundos: selecionar e deselecionar estado ──────────────────────────────────
  const handleSelectState = (uf: string, geoFeature?: any) => {
    setSelectedUF(uf);
    setFocusUF(uf);
    const geo = geoFeature ?? geoByUF.current.get(uf);
    if (geo) {
      const centroid = geoCentroid(geo) as [number, number];
      const bounds = geoBounds(geo);
      const span = Math.max(
        bounds[1][0] - bounds[0][0],
        bounds[1][1] - bounds[0][1],
      );
      const zoom = Math.min(8, Math.max(2, Math.round(40 / span)));
      setFundosPosition({ coordinates: centroid, zoom });
    }
  };

  const handleDeselectState = () => {
    setSelectedUF(null);
    setFocusUF(null);
    setStateQuery('');
    setFundosPosition({ coordinates: [-54, -15], zoom: 1 });
  };

  // ── Search handlers ───────────────────────────────────────────────────────────

  const selectFromStateSugg = (e: Estado) => {
    setStateQuery(e.nome ?? '');
    handleSelectState(e.uf);
  };

  const clearStateSearch = () => {
    setStateQuery('');
    handleDeselectState();
  };

  const selectMunicipality = (m: MunicipioDirpf) => {
    const c = coordsMap?.[m.codigoIBGE];
    setMunFocusMun(m);
    setMunQuery(m.municipio);
    setShowMunicipios(true); // auto-ativa a camada ao selecionar município
    if (c) setFundosPosition({ coordinates: [c.lng, c.lat], zoom: 6 });
  };

  const clearMunSearch = () => {
    setMunQuery('');
    setMunFocusMun(null);
  };

  return (
    <section
      id="mapa"
      ref={sectionRef}
      aria-labelledby="mapa-heading"
      className="relative bg-white"
    >
      {/* ── Full-width section header — desktop only, left-aligned ── */}
      <div className="hidden md:block border-b border-[rgba(0,0,0,0.06)]">
        <div className="container-x py-8 lg:py-10">
          <p
            className="text-[10px] uppercase tracking-[1.5px] font-semibold mb-2"
            style={{ color: '#9CA3AF' }}
          >
            Panorama dos Fundos da Pessoa Idosa
          </p>
          <h2
            id="mapa-heading"
            className="text-[22px] lg:text-[26px] font-semibold leading-snug tracking-[-0.02em] text-text-primary mb-2"
          >
            Mapa dos Fundos e Municípios DIRPF
          </h2>
          <p className="text-[13px] lg:text-[14px] leading-relaxed text-text-secondary max-w-2xl">
            Clique num estado para ver lei, situação na Receita e arrecadação. Ative os
            municípios para buscar sua cidade.
          </p>
        </div>
      </div>

      <div className="container-x flex flex-col pt-4 pb-8 md:pt-5 md:pb-10">

        {/* ── KPI: definir dados ── */}
        {(() => {
          const kpiItems = [
            { value: '26', label: 'Fundos Ativos', solidColor: '#1B8A6B' as string | undefined },
            {
              value: counts.habilitados > 0 ? counts.habilitados.toLocaleString('pt-BR') : '—',
              label: 'Municípios Habilitados (DIRPF)',
              solidColor: undefined,
            },
            {
              value: arrecadacaoData ? formatBRLCompact(arrecadacaoData._meta.totais.geral) : '—',
              label: 'Doações via IRPF (2025)',
              solidColor: undefined,
            },
            {
              value: arrecadacaoData ? arrecadacaoData._meta.totais.qtdMunicipios.toLocaleString('pt-BR') : '—',
              label: 'municípios captaram (2025)',
              solidColor: '#28A87A' as string | undefined,
            },
          ];

          const kpiValueStyle = (kpi: { solidColor?: string }) =>
            kpi.solidColor
              ? { color: kpi.solidColor }
              : {
                  background: 'linear-gradient(135deg, #0C4A8C, #2196C9)',
                  WebkitBackgroundClip: 'text' as const,
                  WebkitTextFillColor: 'transparent' as const,
                  backgroundClip: 'text' as const,
                  display: 'inline-block' as const,
                };

          return (
            <>
              {/* Mobile: 2×2 grid */}
              <div className="grid grid-cols-2 gap-2 mb-4 md:hidden">
                {kpiItems.map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-[12px] bg-white p-3 flex flex-col"
                    style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
                  >
                    <span className="text-[20px] font-bold leading-none" style={kpiValueStyle(kpi)}>
                      {kpi.value}
                    </span>
                    <span className="text-[10px] leading-tight mt-1 text-text-secondary">{kpi.label}</span>
                  </div>
                ))}
              </div>

              {/* Desktop: 1×4 horizontal strip */}
              <div
                className="hidden md:flex items-stretch divide-x divide-[rgba(0,0,0,0.07)] rounded-[12px] bg-white mb-3 shrink-0"
                style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}
              >
                {kpiItems.map((kpi) => (
                  <div key={kpi.label} className="flex-1 flex flex-col items-center justify-center py-2.5 px-3 text-center min-w-0">
                    <span className="text-[17px] lg:text-[19px] font-bold leading-none" style={kpiValueStyle(kpi)}>
                      {kpi.value}
                    </span>
                    <span className="text-[10px] leading-tight mt-1 text-text-secondary">{kpi.label}</span>
                  </div>
                ))}
              </div>
            </>
          );
        })()}

        {/* Mobile-only header — shows above map */}
        <div className="md:hidden mb-3">
          <p className="text-[9px] uppercase tracking-[1.5px] font-semibold mb-1" style={{ color: '#9CA3AF' }}>
            Panorama dos Fundos da Pessoa Idosa
          </p>
          <h2 id="mapa-heading" className="text-[15px] font-semibold leading-snug tracking-[-0.01em] text-text-primary">
            Mapa dos Fundos e Municípios DIRPF
          </h2>
          <p className="text-[11px] mt-1 leading-relaxed text-text-secondary">
            Toque num estado para ver detalhes. Use a busca para encontrar seu município.
          </p>
        </div>

        {/* Grid: left col (31%) + right col (map) — fills remaining height */}
        <div className="grid grid-cols-1 md:grid-cols-[31%_1fr] gap-3 md:gap-4">
          {/* Left col — state list OR detail panel */}
          <div className="flex flex-col overflow-hidden order-2 md:order-1 md:self-start">
            {selectedUF && selectedEstado ? (
              /* Detail panel — desktop: inline in column; mobile: usa overlay separado */
              <div className="hidden md:flex flex-col flex-1 min-h-0">
                <StateSidePanel
                  estado={selectedEstado}
                  onBack={handleDeselectState}
                  fundoDado={fundosEstaduais?.[selectedEstado.uf] ?? null}
                  municipiosHabilitados={selectedEstado.municipiosHabilitados}
                />
              </div>
            ) : (
              /* Default: header + KPIs + compact state list */
              <div className="flex flex-col flex-1 min-h-0">

                {/* ── State count ── */}
                <p
                  className="text-[11px] mb-1.5 shrink-0"
                  style={{ color: '#5F5E5A' }}
                  aria-live="polite"
                >
                  {filteredEstados.length} estado{filteredEstados.length === 1 ? '' : 's'}
                </p>

                {/* ── Compact state list ── */}
                {loadingEstados ? (
                  <div className="space-y-1.5 shrink-0">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} height={36} rounded="6px" />
                    ))}
                  </div>
                ) : (
                  <div
                    ref={listRef}
                    className="overflow-y-auto max-h-64 md:max-h-[500px] rounded-[10px] bg-white"
                    style={{
                      scrollbarWidth: 'thin',
                      border: '1px solid rgba(0,0,0,0.07)',
                    }}
                  >
                    {filteredEstados.map((e, idx) => {
                      const eff = effectiveStatus(e.uf, e.statusFundoEstadual) as StatusEff;
                      const isSelected = selectedUF === e.uf;
                      return (
                        <button
                          key={e.uf}
                          type="button"
                          data-state-card
                          onClick={() => {
                            if (isSelected) {
                              handleDeselectState();
                            } else {
                              handleSelectState(e.uf);
                            }
                          }}
                          className="w-full text-left px-2.5 py-1.5 md:py-1 min-h-[40px] md:min-h-0 transition-colors"
                          style={{
                            backgroundColor: isSelected ? '#EBF4FF' : 'transparent',
                            borderBottom: idx < filteredEstados.length - 1 ? '1px solid rgba(0,0,0,0.055)' : 'none',
                            borderLeft: isSelected ? '2.5px solid #0C4A8C' : '2.5px solid transparent',
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: '4px 8px',
                          }}
                          aria-pressed={isSelected}
                        >
                          <div className="flex items-baseline gap-1 flex-1 min-w-0">
                            <span className="text-[11px] font-medium text-text-primary leading-snug">
                              {e.nome}
                            </span>
                            <span className="text-[9.5px] font-normal shrink-0" style={{ color: '#9CA3AF' }}>
                              {e.uf}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <StatusDot eff={eff} />
                            <span className="text-[10px] tabular-nums" style={{ color: '#9CA3AF' }}>
                              {e.municipiosHabilitados}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right col — choropleth map with municipalities overlay */}
          <div className="flex flex-col order-1 md:order-2">
            {loadingEstados ? (
              <Skeleton rounded="20px" className="h-[290px] md:flex-1" />
            ) : (
              <>
                <div
                  ref={mapWrapRef}
                  className="relative rounded-[20px] p-3 md:p-4 flex flex-col min-h-0 h-[290px] md:h-auto"
                  style={{ background: '#F5F7FA', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}
                >
                  {/* Search + filter toolbar */}
                  <div className="flex flex-wrap gap-2 mb-3 items-center">
                    <SearchCombobox<Estado>
                      query={stateQuery}
                      onChange={(q) => { setStateQuery(q); if (!q) clearStateSearch(); }}
                      onSelect={selectFromStateSugg}
                      onClear={clearStateSearch}
                      placeholder="Buscar estado…"
                      suggestions={stateSuggestions}
                      getKey={(e) => e.uf}
                      getLabel={(e) => `${e.nome} (${e.uf})`}
                    />
                    <FilterDropdown<StatusKey>
                      label="Status"
                      value={statusFilter}
                      options={statusOptions}
                      onChange={setStatusFilter}
                    />
                    <FilterDropdown<DirpfKey>
                      label="DIRPF"
                      value={dirpfFilter}
                      options={dirpfOptions}
                      onChange={setDirpfFilter}
                    />
                    <FilterDropdown<RegionKey>
                      label="Região"
                      value={region}
                      options={regionOptions}
                      onChange={setRegion}
                    />
                    {/* Municipalities toggle */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showMunicipios}
                      onClick={() => setShowMunicipios((v) => !v)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-[13px] font-medium whitespace-nowrap transition-colors ml-auto"
                      style={{
                        backgroundColor: showMunicipios ? '#28A87A' : '#F7F9FC',
                        color: showMunicipios ? '#FFFFFF' : '#4A5568',
                        border: showMunicipios ? '1px solid #28A87A' : '1px solid #D5E3F0',
                      }}
                    >
                      <MapPin size={13} aria-hidden="true" />
                      {showMunicipios ? 'Municípios: ligado' : 'Mostrar municípios'}
                    </button>
                    {/* Municipality search — always visible; typing auto-activates the layer */}
                    <SearchCombobox<MunicipioDirpf>
                      query={munQuery}
                      onChange={(q) => {
                        setMunQuery(q);
                        if (q && !showMunicipios) setShowMunicipios(true);
                        if (!q) clearMunSearch();
                      }}
                      onSelect={selectMunicipality}
                      onClear={clearMunSearch}
                      placeholder="Buscar município…"
                      suggestions={munSuggestions}
                      getKey={(m) => m.codigoIBGE}
                      getLabel={(m) => `${m.municipio} (${m.uf})`}
                    />
                  </div>

                  {/* Zoom controls — bottom-left, clear of legend */}
                  <div className="absolute bottom-14 left-3 z-10 flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setFundosPosition((p) => ({ ...p, zoom: Math.min(p.zoom * 1.5, 8) }))
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
                        setFundosPosition((p) => ({ ...p, zoom: Math.max(p.zoom / 1.5, 1) }))
                      }
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-text-primary transition-colors hover:bg-blue-light"
                      style={{ boxShadow: '0 1px 6px rgba(12,74,140,0.18)' }}
                      aria-label="Zoom out"
                    >
                      <Minus size={15} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setFundosPosition({ coordinates: [-54, -15], zoom: 1 })}
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-text-primary transition-colors hover:bg-blue-light"
                      style={{ boxShadow: '0 1px 6px rgba(12,74,140,0.18)' }}
                      aria-label="Resetar zoom"
                    >
                      <Maximize size={14} aria-hidden="true" />
                    </button>
                  </div>

                  {/* Map + canvas overlay wrapper — flex-1 so it fills the card */}
                  <div
                    style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' }}
                    onMouseMove={(e) => {
                      if (!showMunicipios) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const mx = e.clientX - rect.left;
                      const my = e.clientY - rect.top;
                      const pts = projectedDotsRef.current;
                      let best: MunicipioDirpf | null = null;
                      let bestD = 6;
                      for (const { m, cx, cy } of pts) {
                        const d = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
                        if (d < bestD) { bestD = d; best = m; }
                      }
                      setMunTooltip(best);
                      if (best) setMunTooltipPos({ x: e.clientX + 12, y: e.clientY - 40 });
                    }}
                    onMouseLeave={() => setMunTooltip(null)}
                  >
                    <ComposableMap
                      projection="geoMercator"
                      projectionConfig={{ scale: 600, center: [-54, -15] }}
                      style={{
                        width: '100%',
                        height: 'auto',
                        filter: 'drop-shadow(0 4px 18px rgba(0,0,0,0.12))',
                      }}
                    >
                      <ZoomableGroup
                        zoom={fundosPosition.zoom}
                        center={fundosPosition.coordinates}
                        onMove={({ x, y, zoom }) => {
                          munTransformRef.current = { x, y, k: zoom };
                          drawCanvasRef.current();
                        }}
                        onMoveEnd={(pos) =>
                          setFundosPosition({
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
                        <Geographies geography={GEO_URL}>
                          {({ geographies }: { geographies: any[] }) =>
                            geographies.map((geo) => {
                              const name = getGeoStateName(geo);
                              const estado = byName.get(normalize(name));
                              const uf = estado?.uf ?? '';

                              // Cache geo feature for centroid calculation
                              if (estado && uf) geoByUF.current.set(uf, geo);

                              const count = estado?.municipiosHabilitados ?? 0;
                              const eff: StatusEff = estado
                                ? (effectiveStatus(uf, estado.statusFundoEstadual) as StatusEff)
                                : 'sem_fundo';
                              const isVisible = uf ? visibleUFSet.has(uf) : false;
                              const isSelected = selectedUF === uf;

                              const fillDefault = isVisible && estado
                                ? eff === 'em_tramitacao' ? AMBER : volumeFill(count)
                                : NEUTRAL_FILL;
                              const fillHov = isVisible && estado
                                ? eff === 'em_tramitacao' ? AMBER_HOVER : volumeFillHover(count)
                                : NEUTRAL_HOVER;

                              return (
                                <Geography
                                  key={geo.rsmKey}
                                  geography={geo}
                                  vectorEffect="non-scaling-stroke"
                                  onMouseEnter={(e) => {
                                    if (!estado) return;
                                    setHoverUF(uf);
                                    setFundosTooltipPos({ x: e.clientX + 12, y: e.clientY - 40 });
                                    setFundosTooltip({
                                      visible: true,
                                      name: estado.nome ?? uf,
                                      count: estado.municipiosHabilitados,
                                      status: STATUS_LABEL[eff] ?? '',
                                    });
                                  }}
                                  onMouseMove={(e) =>
                                    setFundosTooltipPos({ x: e.clientX + 12, y: e.clientY - 40 })
                                  }
                                  onMouseLeave={() => {
                                    setHoverUF(null);
                                    setFundosTooltip((t) => ({ ...t, visible: false }));
                                  }}
                                  onClick={() => {
                                    if (!estado) return;
                                    if (selectedUF === uf) {
                                      handleDeselectState();
                                    } else {
                                      handleSelectState(uf, geo);
                                    }
                                  }}
                                  tabIndex={estado ? 0 : -1}
                                  aria-label={
                                    estado
                                      ? `${estado.nome} — ${STATUS_LABEL[eff]} — ${estado.municipiosHabilitados} municípios habilitados`
                                      : undefined
                                  }
                                  style={{
                                    default: {
                                      fill: fillDefault,
                                      stroke: '#FFFFFF',
                                      strokeWidth: 1.2,
                                      outline: 'none',
                                      cursor: estado ? 'pointer' : 'default',
                                      opacity: focusUF
                                        ? (uf === focusUF ? 1 : 0.18)
                                        : (isVisible ? 1 : 0.25),
                                      transition: 'fill 0.25s ease, opacity 0.2s ease',
                                    },
                                    hover: {
                                      fill: fillHov,
                                      stroke: '#FFFFFF',
                                      strokeWidth: 1.2,
                                      outline: 'none',
                                      cursor: estado ? 'pointer' : 'default',
                                    },
                                    pressed: { fill: fillHov, outline: 'none' },
                                  }}
                                />
                              );
                            })
                          }
                        </Geographies>
                      </ZoomableGroup>
                    </ComposableMap>

                    {/* Canvas dot overlay */}
                    <canvas
                      ref={canvasRef}
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Legend */}
                <div
                  className="mt-2 flex flex-wrap items-center justify-center gap-x-10 gap-y-3"
                  style={{ fontSize: '12px', color: '#5F5E5A' }}
                >
                  {/* Volume ramp */}
                  <div className="flex flex-col gap-1.5 items-center">
                    <div
                      aria-hidden="true"
                      style={{
                        width: '180px',
                        height: '8px',
                        background:
                          'linear-gradient(to right, #B4CADF, #8FB0D2, #6A92BE, #3D6BA0, #1B4C84, #0C3057)',
                        borderRadius: '4px',
                      }}
                    />
                    <div
                      className="flex justify-between w-full"
                      style={{ fontSize: '10px', color: '#9CA3AF' }}
                    >
                      <span>menos municípios</span>
                      <span>mais municípios</span>
                    </div>
                  </div>

                  {/* Amber swatch — PL em tramitação */}
                  <div className="inline-flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="inline-block w-3 h-3 rounded-sm"
                      style={{ backgroundColor: '#D99A2B' }}
                    />
                    <span>PL em tramitação</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile overlay — detail panel full-screen on small screens */}
        {selectedUF && selectedEstado && (
          <div className="fixed inset-0 z-50 bg-white overflow-y-auto p-5 md:hidden">
            <StateSidePanel
              estado={selectedEstado}
              onBack={handleDeselectState}
              fundoDado={fundosEstaduais?.[selectedEstado.uf] ?? null}
              municipiosHabilitados={selectedEstado.municipiosHabilitados}
            />
          </div>
        )}
      </div>

      {/* ── Fundos tooltip ── */}
      {fundosTooltip.visible && (
        <div
          role="tooltip"
          style={{
            position: 'fixed',
            left: fundosTooltipPos.x,
            top: fundosTooltipPos.y,
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
          <strong style={{ fontWeight: 600, display: 'block' }}>{fundosTooltip.name}</strong>
          <span style={{ color: '#9CB8D4' }}>{fundosTooltip.status}</span>
          <div style={{ marginTop: 4 }}>{fundosTooltip.count} municípios habilitados</div>
        </div>
      )}

      {/* ── Municípios hover tooltip (compact, follows mouse) ── */}
      {munTooltip && showMunicipios && !munFocusMun && (
        <div
          role="tooltip"
          style={{
            position: 'fixed',
            left: munTooltipPos.x,
            top: munTooltipPos.y,
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
          <strong style={{ fontWeight: 600 }}>{munTooltip.municipio}</strong>
          <span style={{ color: '#9CB8D4' }}> — {munTooltip.uf}</span>
          {(() => {
            const arr = arrecadacaoByIBGERef.current.get(munTooltip.codigoIBGE);
            return arr && arr.total > 0
              ? <div style={{ color: '#6EE7B7', marginTop: 2 }}>{formatBRLCompact(arr.total)} via IRPF 2025</div>
              : <div style={{ color: '#9CB8D4', marginTop: 2, fontSize: 11 }}>Sem captação em 2025</div>;
          })()}
        </div>
      )}

      {/* ── Município focado — card de detalhe (quando selecionado via busca ou clique) ── */}
      {munFocusMun && showMunicipios && (() => {
        const arr = arrecadacaoByIBGERef.current.get(munFocusMun.codigoIBGE);
        return (
          <div
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 55,
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: '16px 18px',
              minWidth: 280,
              maxWidth: 340,
              boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <p className="text-[15px] font-semibold text-text-primary leading-snug">{munFocusMun.municipio}</p>
                <p className="text-[11px]" style={{ color: '#5F5E5A' }}>{munFocusMun.uf} · {munFocusMun.nomeFundo}</p>
              </div>
              <button
                type="button"
                onClick={clearMunSearch}
                aria-label="Fechar"
                className="shrink-0 mt-0.5 hover:text-text-primary transition-colors"
                style={{ color: '#9CA3AF' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Arrecadação */}
            <div
              className="rounded-[10px] px-3.5 py-3 flex items-start gap-2.5 mb-3"
              style={{ backgroundColor: arr && arr.total > 0 ? '#F0FAF6' : '#F7F9FC', border: '1px solid rgba(0,0,0,0.07)' }}
            >
              <TrendingUp size={14} className="shrink-0 mt-0.5" style={{ color: arr && arr.total > 0 ? '#28A87A' : '#9CA3AF' }} />
              <div>
                <p className="text-[9px] uppercase tracking-[0.9px] font-medium mb-0.5" style={{ color: '#9CA3AF' }}>
                  Doações via IRPF (2025)
                </p>
                {arr && arr.total > 0 ? (
                  <>
                    <p className="text-[16px] font-bold text-text-primary leading-none">{formatBRL(arr.total)}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#5F5E5A' }}>{arr.doacoes.toLocaleString('pt-BR')} doações</p>
                  </>
                ) : (
                  <>
                    <p className="text-[16px] font-bold text-text-primary leading-none">R$ 0,00</p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#5F5E5A' }}>
                      Sem captação de IRPF em 2025 — oportunidade não aproveitada
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* CNPJ */}
            <p className="text-[10px] font-mono mb-2" style={{ color: '#9CA3AF' }}>
              CNPJ {formatCNPJ(munFocusMun.cnpj)}
            </p>

            {/* Source */}
            <p className="text-[9px]" style={{ color: '#9CA3AF' }}>Fonte: Receita Federal · 2025</p>
          </div>
        );
      })()}

      {/* Screen-reader hover indicator (Fundos) */}
      <span aria-hidden="true" data-hover={hoverUF ?? ''} className="sr-only" />
    </section>
  );
}
