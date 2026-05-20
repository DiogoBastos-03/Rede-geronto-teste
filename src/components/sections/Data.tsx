import { useEffect, useMemo, useRef, useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import SectionLabel from '../ui/SectionLabel';
import Button from '../ui/Button';
import type { Estado } from './dashboard/types';
import { effectiveStatus } from './dashboard/types';

const GEO_URL =
  'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';

const FILL: Record<string, string> = {
  ativo:        '#1B8A6B',
  em_tramitacao: '#F0B429',
  sem_fundo:    '#D6E8F7',
};
const HOVER: Record<string, string> = {
  ativo:        '#145F49',
  em_tramitacao: '#C99000',
  sem_fundo:    '#C5DCF5',
};

export default function Data() {
  const sectionRef  = useRef<HTMLElement | null>(null);
  const headRef     = useRef<HTMLDivElement | null>(null);
  const numberRef   = useRef<HTMLSpanElement | null>(null);
  const bulletsRef  = useRef<HTMLDivElement | null>(null);
  const mapRef      = useRef<HTMLDivElement | null>(null);
  const ctaRef      = useRef<HTMLDivElement | null>(null);

  const [estados, setEstados] = useState<Estado[]>([]);

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
            val: 57,
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
            Veja como está o Brasil
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
                aria-label="57 por cento"
              >
                0%
              </span>
              <p
                className="mt-3 text-[16px] leading-[1.6]"
                style={{ color: '#5F5E5A' }}
              >
                dos municípios brasileiros ainda não implementaram o Fundo do
                Idoso.
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
                  <strong>2.185 municípios</strong> habilitados DIRPF
                </span>
              </div>
              <div data-bullet className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: '#F0B429' }}
                />
                <span className="text-[14px]" style={{ color: '#2C2C2A' }}>
                  <strong>R$ 170M</strong> em doações disponíveis em 2023
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
                background:
                  'linear-gradient(135deg, #F0F7FF 0%, #EAF4F0 100%)',
                boxShadow: '0 8px 32px rgba(12,74,140,0.10)',
                border: '1px solid rgba(12,74,140,0.07)',
              }}
            >
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: 700, center: [-54, -15] }}
                style={{ width: '100%', height: 'auto' }}
                aria-label="Mapa do Brasil — situação do Fundo do Idoso por estado"
              >
                <Geographies geography={GEO_URL}>
                  {({ geographies }: { geographies: any[] }) =>
                    geographies.map((geo) => {
                      const uf: string = geo.properties?.sigla ?? '';
                      const estado = byUF.get(uf);
                      const eff = estado
                        ? effectiveStatus(uf, estado.statusFundoEstadual)
                        : 'sem_fundo';
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          style={{
                            default: {
                              fill: FILL[eff] ?? FILL.sem_fundo,
                              stroke: '#FFFFFF',
                              strokeWidth: 0.6,
                              outline: 'none',
                              transition: 'fill 0.15s ease',
                            },
                            hover: {
                              fill: HOVER[eff] ?? HOVER.sem_fundo,
                              stroke: '#FFFFFF',
                              strokeWidth: 0.8,
                              outline: 'none',
                              cursor: estado ? 'pointer' : 'default',
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
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-1">
                <LegendItem color="#1B8A6B" label="Fundo ativo" />
                <LegendItem color="#F0B429" label="PL em tramitação" />
                <LegendItem
                  color="#D6E8F7"
                  label="Sem fundo"
                  border="1px solid #B5D4F4"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LegendItem({
  color,
  label,
  border,
}: {
  color: string;
  label: string;
  border?: string;
}) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className="w-2.5 h-2.5 rounded-[2px] shrink-0"
        style={{ backgroundColor: color, border }}
      />
      <span className="text-[12px]" style={{ color: '#5F5E5A' }}>
        {label}
      </span>
    </div>
  );
}
