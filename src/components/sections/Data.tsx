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

// Normalise for GeoJSON name → UF lookup
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

export default function Data() {
  const sectionRef  = useRef<HTMLElement | null>(null);
  const headRef     = useRef<HTMLDivElement | null>(null);
  const numberRef   = useRef<HTMLSpanElement | null>(null);
  const bulletsRef  = useRef<HTMLDivElement | null>(null);
  const mapRef      = useRef<HTMLDivElement | null>(null);
  const ctaRef      = useRef<HTMLDivElement | null>(null);

  const [estados, setEstados] = useState<Estado[]>([]);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  useEffect(() => {
    import('../../data/estados.json').then((m) =>
      setEstados(m.default as Estado[]),
    );
  }, []);

  // Look up by UF sigla (what the GeoJSON exposes) AND by normalised name
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
      // Section label + heading stagger
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

      // 57% counter — opacity only (never autoAlpha on gradient text)
      if (numberRef.current) {
        gsap.set(numberRef.current, { opacity: 0 });
        const state = { val: 0 };
        gsap.fromTo(
          state,
          { val: 0 },
          {
            val: 68,
            duration: 2,
            ease: 'power2.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: numberRef.current,
              start: 'top 85%',
              once: true,
              onEnter: () =>
                gsap.to(numberRef.current, { opacity: 1, duration: 0.5 }),
            },
            onUpdate() {
              if (numberRef.current)
                numberRef.current.textContent = `${Math.round(state.val)}%`;
            },
          },
        );
      }

      // Bullet stats — stagger y: 20 → 0
      const bullets =
        bulletsRef.current?.querySelectorAll<HTMLElement>('[data-bullet]') ?? [];
      gsap.set(bullets, { y: 20, autoAlpha: 0 });
      gsap.fromTo(
        bullets,
        { y: 20, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: bulletsRef.current,
            start: 'top 85%',
            once: true,
          },
        },
      );

      // Map fade + scale
      if (mapRef.current) {
        gsap.set(mapRef.current, { autoAlpha: 0, scale: 0.95 });
        gsap.fromTo(
          mapRef.current,
          { autoAlpha: 0, scale: 0.95 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 1.1,
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

      // CTA
      if (ctaRef.current) {
        gsap.set(ctaRef.current, { y: 16, autoAlpha: 0 });
        gsap.fromTo(
          ctaRef.current,
          { y: 16, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: 'power3.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: ctaRef.current,
              start: 'top 90%',
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
  }, []);

  return (
    <section
      id="dados"
      ref={sectionRef}
      aria-labelledby="dados-heading"
      className="py-[120px] lg:py-[140px]"
      style={{ backgroundColor: '#F0FAF6' }}
    >
      <div className="container-x">

        {/* ── Section header ── */}
        <div ref={headRef} className="max-w-3xl mb-12">
          <SectionLabel>Dados</SectionLabel>
          <h2
            id="dados-heading"
            className="mt-5 text-[32px] sm:text-[40px] lg:text-[44px] font-medium leading-[1.15] tracking-[-0.02em] text-text-primary"
          >
            Veja como os fundos estão distribuídos pelo Brasil
          </h2>
        </div>

        {/* ── Main grid: 2 / 5 + 3 / 5 ── */}
        <div className="grid md:grid-cols-5 gap-10 lg:gap-14 items-center">

          {/* ── Left column ── */}
          <div className="md:col-span-2 flex flex-col gap-7">

            {/* 57% counter */}
            <div>
              <span
                ref={numberRef}
                className="block leading-none tracking-[-0.04em]"
                style={{
                  fontSize: 'clamp(72px, 11vw, 96px)',
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
                className="mt-3 text-[16px] leading-[1.6]"
                style={{ color: '#5F5E5A' }}
              >
                dos municípios brasileiros não captaram recursos via IRPF em
                2025 — mesmo estando habilitados.
              </p>
            </div>

            {/* Bullet stats */}
            <div ref={bulletsRef} className="flex flex-col gap-3">
              <div data-bullet className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: '#1B8A6B' }}
                />
                <span className="text-[14px]" style={{ color: '#2C2C2A' }}>
                  <strong>26 estados</strong> com fundo estadual ativo
                </span>
              </div>
              <div data-bullet className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: '#2196C9' }}
                />
                <span className="text-[14px]" style={{ color: '#2C2C2A' }}>
                  <strong>2.160 municípios</strong> habilitados DIRPF
                </span>
              </div>
              <div data-bullet className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: '#F0B429' }}
                />
                <span className="text-[14px]" style={{ color: '#2C2C2A' }}>
                  <strong>R$ 153,3 milhões</strong> em doações via IRPF repassadas aos Fundos do Idoso em 2025
                  <span
                    className="block text-[11px] mt-0.5"
                    style={{ color: '#9CA3AF' }}
                  >
                    Fonte: Receita Federal · 2025
                  </span>
                </span>
              </div>
            </div>

            {/* CTA */}
            <div ref={ctaRef}>
              <Button href="/dashboard" variant="primary" size="md">
                Ver dashboard completo
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* ── Right column — map ── */}
          <div className="md:col-span-3">
            <div
              ref={mapRef}
              className="rounded-[20px] p-4 sm:p-5"
              style={{
                background: 'linear-gradient(135deg, #F0F7FF 0%, #EAF4F0 100%)',
                boxShadow: '0 8px 32px rgba(12,74,140,0.10)',
                border: '1px solid rgba(12,74,140,0.07)',
              }}
            >
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: 700, center: [-54, -15] }}
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
                      // Try sigla first, fall back to normalised name
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
                          onMouseMove={(e) => {
                            setTooltip((t) =>
                              t ? { ...t, x: e.clientX + 14, y: e.clientY - 44 } : null,
                            );
                          }}
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
                              cursor: estado ? 'default' : 'default',
                            },
                            pressed: { outline: 'none' },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>

              {/* Legend — matches dashboard style */}
              <div
                className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mt-2"
                style={{ fontSize: '12px', color: '#5F5E5A' }}
              >
                {/* Blue volume ramp */}
                <div className="flex flex-col gap-1 items-center">
                  <div
                    aria-hidden="true"
                    style={{
                      width: '120px',
                      height: '6px',
                      background:
                        'linear-gradient(to right, #B4CADF, #8FB0D2, #6A92BE, #3D6BA0, #1B4C84, #0C3057)',
                      borderRadius: '3px',
                    }}
                  />
                  <div
                    className="flex justify-between w-full"
                    style={{ fontSize: '9px', color: '#9CA3AF' }}
                  >
                    <span>menos municípios</span>
                    <span>mais municípios</span>
                  </div>
                </div>

                {/* Amber swatch */}
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
          </div>
        </div>
      </div>

      {/* Fixed tooltip — follows mouse, outside section for correct stacking */}
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
