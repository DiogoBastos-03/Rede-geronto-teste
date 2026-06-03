import { useEffect, useMemo, useRef, useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import SectionLabel from '../ui/SectionLabel';
import Button from '../ui/Button';
import type { Estado } from './dashboard/types';
import { effectiveStatus } from './dashboard/types';
import {
  volumeFill,
  volumeFillHover,
  AMBER,
  AMBER_HOVER,
  NEUTRAL_FILL,
  NEUTRAL_HOVER,
} from '../../data/mapScale';

const GEO_URL =
  'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';

const STATUS_LABEL: Record<string, string> = {
  ativo: 'Fundo Ativo',
  em_tramitacao: 'PL em tramitação',
  sem_fundo: 'Sem fundo estadual',
};

function normalise(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

interface Tooltip {
  x: number;
  y: number;
  name: string;
  uf: string;
  status: string;
  count: number;
}

// ── Stat chips data (official numbers only) ───────────────────────────────────
const CHIPS = [
  {
    value: '26',
    unit: 'estados',
    label: 'com fundo estadual ativo',
    color: '#1B8A6B',
    dotBg: '#D1FAE5',
  },
  {
    value: '2.160',
    unit: 'municípios',
    label: 'habilitados a receber doações (DIRPF)',
    color: '#2196C9',
    dotBg: '#DBEAFE',
  },
  {
    value: 'R$ 153,3 mi',
    unit: '',
    label: 'em doações via IRPF repassadas em 2025',
    color: '#D99A2B',
    dotBg: '#FEF3C7',
    note: 'Fonte: Receita Federal · 2025',
  },
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export default function Data() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headRef    = useRef<HTMLDivElement | null>(null);
  const heroRef    = useRef<HTMLDivElement | null>(null);
  const numberRef  = useRef<HTMLSpanElement | null>(null);
  const chipsRef   = useRef<HTMLDivElement | null>(null);
  const mapRef     = useRef<HTMLDivElement | null>(null);
  const ctaRef     = useRef<HTMLDivElement | null>(null);

  const [estados, setEstados] = useState<Estado[]>([]);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  useEffect(() => {
    import('../../data/estados.json').then((m) =>
      setEstados(m.default as Estado[]),
    );
  }, []);

  const byUF = useMemo(() => {
    const m = new Map<string, Estado>();
    estados.forEach((e) => m.set(e.uf, e));
    return m;
  }, [estados]);

  const byName = useMemo(() => {
    const m = new Map<string, Estado>();
    estados.forEach((e) => { if (e.nome) m.set(normalise(e.nome), e); });
    return m;
  }, [estados]);

  // ── GSAP ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Head block — eyebrow + title stagger
      const headChildren = Array.from(headRef.current?.children ?? []);
      if (headChildren.length) {
        gsap.set(headChildren, { y: 24, autoAlpha: 0 });
        gsap.fromTo(headChildren, { y: 24, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1, duration: 0.85, stagger: 0.12, ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: { trigger: headRef.current, start: 'top 85%', once: true },
        });
      }

      // Stat-hero card entrance
      if (heroRef.current) {
        gsap.set(heroRef.current, { y: 32, autoAlpha: 0 });
        gsap.fromTo(heroRef.current, { y: 32, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: { trigger: heroRef.current, start: 'top 82%', once: true },
        });
      }

      // 68% counter — opacity only (never autoAlpha on gradient text)
      if (numberRef.current) {
        gsap.set(numberRef.current, { opacity: 0 });
        const state = { val: 0 };
        gsap.fromTo(state, { val: 0 }, {
          val: 68, duration: 2, ease: 'power2.out', immediateRender: false,
          scrollTrigger: {
            trigger: heroRef.current, start: 'top 82%', once: true,
            onEnter: () => gsap.to(numberRef.current, { opacity: 1, duration: 0.5 }),
          },
          onUpdate() {
            if (numberRef.current)
              numberRef.current.textContent = `${Math.round(state.val)}%`;
          },
        });
      }

      // Stat chips stagger
      const chips = chipsRef.current?.querySelectorAll('[data-chip]') ?? [];
      gsap.set(chips, { y: 20, autoAlpha: 0 });
      gsap.fromTo(chips, { y: 20, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: chipsRef.current, start: 'top 82%', once: true },
      });

      // Map card
      if (mapRef.current) {
        gsap.set(mapRef.current, { autoAlpha: 0, scale: 0.96 });
        gsap.fromTo(mapRef.current, { autoAlpha: 0, scale: 0.96 }, {
          autoAlpha: 1, scale: 1, duration: 1.1, ease: 'expo.out',
          immediateRender: false,
          scrollTrigger: { trigger: mapRef.current, start: 'top 82%', once: true },
        });
      }

      // CTA
      if (ctaRef.current) {
        gsap.set(ctaRef.current, { y: 14, autoAlpha: 0 });
        gsap.fromTo(ctaRef.current, { y: 14, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: { trigger: ctaRef.current, start: 'top 90%', once: true },
        });
      }
    }, sectionRef);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section
      id="dados"
      ref={sectionRef}
      aria-labelledby="dados-heading"
      className="relative py-[120px] lg:py-[140px] overflow-hidden"
      style={{ backgroundColor: '#F0FAF6' }}
    >
      {/* Decorative blob */}
      <div
        aria-hidden="true"
        className="absolute -z-0 left-[-8%] bottom-[10%] w-[500px] h-[400px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 420px 320px at center, rgba(40,168,122,0.09), transparent 70%)',
        }}
      />

      <div className="container-x relative">
        {/* ── Section header ── */}
        <div ref={headRef} className="max-w-3xl mb-12">
          <SectionLabel>Dados</SectionLabel>
          <h2
            id="dados-heading"
            className="mt-5 text-[32px] sm:text-[40px] lg:text-[44px] font-medium leading-[1.15] tracking-[-0.02em] text-text-primary"
          >
            Veja como os fundos estão{' '}
            <em className="font-serif italic font-normal" style={{ color: '#1B8A6B' }}>
              distribuídos pelo Brasil
            </em>
          </h2>
        </div>

        {/* ── 2-col grid ── */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">

          {/* ── Left column ── */}
          <div className="flex flex-col gap-6">

            {/* Stat-hero card — 68% contained */}
            <div
              ref={heroRef}
              className="rounded-[20px] p-7"
              style={{
                background:
                  'linear-gradient(135deg, rgba(12,74,140,0.05) 0%, rgba(33,150,201,0.04) 100%)',
                border: '1px solid rgba(12,74,140,0.12)',
                boxShadow: '0 4px 20px rgba(12,74,140,0.07)',
              }}
            >
              <span
                ref={numberRef}
                className="block leading-none tracking-[-0.04em]"
                style={{
                  fontSize: 'clamp(64px, 10vw, 88px)',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #0C4A8C, #2196C9)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'inline-block',
                }}
                aria-label="68 por cento"
              >
                0%
              </span>
              <p
                className="mt-3 text-[16px] leading-[1.65]"
                style={{ color: '#4A5568' }}
              >
                dos municípios brasileiros não captaram recursos via IRPF em
                2025 — mesmo estando habilitados.
              </p>
            </div>

            {/* Stat chips */}
            <div ref={chipsRef} className="flex flex-col gap-2.5">
              {CHIPS.map((chip) => (
                <div
                  key={chip.label}
                  data-chip
                  className="flex items-start gap-3.5 rounded-[14px] px-4 py-3.5 bg-white"
                  style={{
                    border: '1px solid rgba(0,0,0,0.07)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="w-1.5 shrink-0 mt-1 rounded-full"
                    style={{ height: '20px', backgroundColor: chip.color }}
                  />
                  <div className="min-w-0">
                    <p className="text-[16px] font-bold text-text-primary leading-snug">
                      {chip.value}
                      {chip.unit && (
                        <span className="ml-1.5 text-[14px] font-medium">
                          {chip.unit}
                        </span>
                      )}
                    </p>
                    <p className="text-[12px] text-text-secondary mt-0.5 leading-snug">
                      {chip.label}
                    </p>
                    {'note' in chip && chip.note && (
                      <p className="text-[10px] mt-1" style={{ color: '#9CA3AF' }}>
                        {chip.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column — map preview ── */}
          <div className="flex flex-col gap-5">
            <div
              ref={mapRef}
              className="rounded-[20px] p-5"
              style={{
                background: 'linear-gradient(135deg, #F0F7FF 0%, #EAF4F0 100%)',
                boxShadow: '0 8px 32px rgba(12,74,140,0.10)',
                border: '1px solid rgba(12,74,140,0.07)',
              }}
            >
              {/* Preview label */}
              <p
                className="text-[10px] uppercase tracking-[1.2px] font-semibold mb-3 text-center"
                style={{ color: '#9CA3AF' }}
              >
                Prévia — Dashboard de Fundos
              </p>

              <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: 580, center: [-54, -15] }}
                style={{
                  width: '100%',
                  height: 'auto',
                  filter: 'drop-shadow(0 3px 12px rgba(0,0,0,0.09))',
                }}
                aria-label="Mapa do Brasil — distribuição de fundos por estado"
              >
                <Geographies geography={GEO_URL}>
                  {({ geographies }: { geographies: any[] }) =>
                    geographies.map((geo) => {
                      const sigla: string = geo.properties?.sigla ?? '';
                      const geoName: string =
                        geo.properties?.name ||
                        geo.properties?.NAME ||
                        geo.properties?.nome ||
                        '';
                      const estado =
                        byUF.get(sigla) ?? byName.get(normalise(geoName));
                      const uf = estado?.uf ?? sigla;
                      const eff = estado
                        ? effectiveStatus(uf, estado.statusFundoEstadual)
                        : 'sem_fundo';
                      const count = estado?.municipiosHabilitados ?? 0;

                      const fillDefault = estado
                        ? eff === 'em_tramitacao' ? AMBER : volumeFill(count)
                        : NEUTRAL_FILL;
                      const fillHov = estado
                        ? eff === 'em_tramitacao' ? AMBER_HOVER : volumeFillHover(count)
                        : NEUTRAL_HOVER;

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          vectorEffect="non-scaling-stroke"
                          onMouseEnter={(e) => {
                            if (!estado) return;
                            setTooltip({
                              x: e.clientX + 14,
                              y: e.clientY - 44,
                              name: estado.nome ?? uf,
                              uf,
                              status: STATUS_LABEL[eff] ?? eff,
                              count,
                            });
                          }}
                          onMouseMove={(e) =>
                            setTooltip((t) =>
                              t ? { ...t, x: e.clientX + 14, y: e.clientY - 44 } : null,
                            )
                          }
                          onMouseLeave={() => setTooltip(null)}
                          style={{
                            default: {
                              fill: fillDefault,
                              stroke: '#FFFFFF',
                              strokeWidth: 1,
                              outline: 'none',
                              transition: 'fill 0.2s ease',
                            },
                            hover: {
                              fill: fillHov,
                              stroke: '#FFFFFF',
                              strokeWidth: 1,
                              outline: 'none',
                              cursor: 'default',
                            },
                            pressed: { outline: 'none' },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>

              {/* Legend */}
              <div
                className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-3"
                style={{ fontSize: '11px', color: '#5F5E5A' }}
              >
                <div className="flex flex-col gap-1 items-center">
                  <div
                    aria-hidden="true"
                    style={{
                      width: '100px',
                      height: '5px',
                      background:
                        'linear-gradient(to right, #B4CADF, #8FB0D2, #6A92BE, #3D6BA0, #1B4C84, #0C3057)',
                      borderRadius: '3px',
                    }}
                  />
                  <div
                    className="flex justify-between w-full"
                    style={{ fontSize: '9px', color: '#9CA3AF' }}
                  >
                    <span>menos</span>
                    <span>mais municípios</span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="w-2.5 h-2.5 rounded-[2px] shrink-0"
                    style={{ backgroundColor: AMBER }}
                  />
                  <span>PL em tramitação</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div ref={ctaRef}>
              <Button href="/dashboard" variant="primary" size="md" className="w-full sm:w-auto">
                Ver dashboard completo
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          role="tooltip"
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            pointerEvents: 'none',
            zIndex: 60,
            backgroundColor: '#0D1B2A',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: 10,
            fontSize: 12,
            lineHeight: 1.5,
            maxWidth: 210,
            boxShadow: '0 6px 20px rgba(0,0,0,0.22)',
          }}
        >
          <strong style={{ fontWeight: 600, display: 'block' }}>
            {tooltip.name} ({tooltip.uf})
          </strong>
          <span style={{ color: '#9CB8D4' }}>{tooltip.status}</span>
          <div style={{ marginTop: 3 }}>
            {tooltip.count} municípios habilitados
          </div>
        </div>
      )}
    </section>
  );
}
