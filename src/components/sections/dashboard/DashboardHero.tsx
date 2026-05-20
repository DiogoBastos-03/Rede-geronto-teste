import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Landmark, Building2, PieChart, Banknote, LucideIcon } from 'lucide-react';
import SectionLabel from '../../ui/SectionLabel';
import {
  TOTAL_MUNICIPIOS_BRASIL,
  ARRECADACAO_2023_BRL_MI,
} from './types';
import { useEstados, useMunicipios } from './useDashboardData';
import Skeleton from './Skeleton';

interface StatCard {
  Icon: LucideIcon;
  value: number;
  formatter: (n: number) => string;
  label: string;
}

export default function DashboardHero() {
  const { data: estados, loading: loadingEstados } = useEstados();
  const { data: municipios, loading: loadingMunicipios } = useMunicipios();

  const cards: StatCard[] | null = useMemo(() => {
    if (!estados || !municipios) return null;
    // Count states with active fund (also count those flagged as 'em tramitação'
    // visually as having movement)
    const statesAtivos = estados.filter(
      (e) =>
        e.statusFundoEstadual === 'ativo' &&
        e.uf !== 'BR' &&
        Boolean(e.nome),
    ).length;
    const totalMunicipios = municipios.length;
    const percent = (totalMunicipios / TOTAL_MUNICIPIOS_BRASIL) * 100;
    return [
      {
        Icon: Landmark,
        value: statesAtivos,
        formatter: (n) => Math.round(n).toString(),
        label: 'Estados com Fundo Ativo',
      },
      {
        Icon: Building2,
        value: totalMunicipios,
        formatter: (n) =>
          Math.round(n).toLocaleString('pt-BR'),
        label: 'Municípios Habilitados DIRPF',
      },
      {
        Icon: PieChart,
        value: percent,
        formatter: (n) => `${n.toFixed(1).replace('.', ',')}%`,
        label: 'dos Municípios Brasileiros',
      },
      {
        Icon: Banknote,
        value: ARRECADACAO_2023_BRL_MI,
        formatter: (n) =>
          `R$ ${Math.round(n).toLocaleString('pt-BR')}M`,
        label: 'Arrecadação Total 2023',
      },
    ];
  }, [estados, municipios]);

  const sectionRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const headRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!cards) return;
    const ctx = gsap.context(() => {
      gsap.to(overlayRef.current, {
        autoAlpha: 0,
        duration: 0.6,
        ease: 'power2.out',
      });

      // Header
      const headChildren = Array.from(headRef.current?.children ?? []);
      if (headChildren.length) {
        gsap.set(headChildren, { y: 24, autoAlpha: 0 });
        gsap.fromTo(
          headChildren,
          { y: 24, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
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

      // Cards (y: 60 → 0 stagger 0.12)
      const cardEls = gridRef.current?.querySelectorAll('[data-stat-card]') ?? [];
      gsap.set(cardEls, { y: 60, autoAlpha: 0 });
      gsap.fromTo(
        cardEls,
        { y: 60, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.85,
          stagger: 0.12,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 85%',
            once: true,
          },
        },
      );

      // Counter animations
      cardEls.forEach((card) => {
        const el = card as HTMLElement;
        const idx = Number(el.dataset.idx);
        const c = cards[idx];
        if (!c) return;
        const target = el.querySelector('[data-counter]') as HTMLElement | null;
        if (!target) return;
        const obj = { v: 0 };
        gsap.fromTo(
          obj,
          { v: 0 },
          {
            v: c.value,
            duration: 1.8,
            ease: 'power2.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              once: true,
            },
            onUpdate: () => {
              target.textContent = c.formatter(obj.v);
            },
          },
        );
      });
    }, sectionRef);
    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [cards]);

  return (
    <section
      id="dashboard-hero"
      ref={sectionRef}
      aria-labelledby="dashboard-hero-heading"
      className="relative pt-28 md:pt-32 lg:pt-36 pb-20 md:pb-28 overflow-hidden"
      style={{ backgroundColor: '#0D1B2A' }}
    >
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="fixed inset-0 z-[60] pointer-events-none"
        style={{ backgroundColor: '#0a0f1a' }}
      />

      {/* Decorative gradient line at top */}
      <span
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2"
        style={{
          width: '60px',
          height: '3px',
          background: 'linear-gradient(90deg, #2196C9, #28A87A)',
          borderRadius: '2px',
        }}
      />

      <div className="container-x">
        <div ref={headRef} className="max-w-3xl mb-12 lg:mb-16">
          <SectionLabel tone="neutral" className="!text-white/70">
            Panorama nacional
          </SectionLabel>
          <h1
            id="dashboard-hero-heading"
            className="mt-5 text-[32px] sm:text-[40px] lg:text-[48px] font-medium leading-[1.15] tracking-[-0.02em] text-white"
          >
            Onde está o Fundo do Idoso no Brasil
          </h1>
          <p
            className="mt-6 text-[17px] leading-[1.65]"
            style={{ color: 'rgba(255,255,255,0.70)' }}
          >
            Dados oficiais do MDH e da Receita Federal sobre fundos estaduais e
            municipais habilitados para captação via Imposto de Renda 2025.
          </p>
        </div>

        {loadingEstados || loadingMunicipios || !cards ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[20px] p-7 lg:p-8"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Skeleton height={36} className="mb-5 w-12" rounded="999px" />
                <Skeleton height={48} className="mb-3 w-3/4" />
                <Skeleton height={16} className="w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6"
          >
            {cards.map(({ Icon, label, formatter, value }, idx) => (
              <article
                key={idx}
                data-stat-card
                data-idx={idx}
                className="relative rounded-[20px] p-7 lg:p-8 overflow-hidden backdrop-blur-sm"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
              >
                <span
                  aria-hidden="true"
                  className="inline-flex w-11 h-11 rounded-full items-center justify-center mb-5"
                  style={{
                    backgroundColor: 'rgba(33,150,201,0.18)',
                    color: '#85B7EB',
                  }}
                >
                  <Icon size={20} />
                </span>
                <p
                  data-counter
                  className="text-[40px] lg:text-[48px] leading-none tracking-[-0.03em]"
                  style={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #2196C9, #28A87A)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    display: 'inline-block',
                  }}
                >
                  {formatter(0)}
                </p>
                <p
                  className="mt-3 text-[14px] leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.70)' }}
                >
                  {label}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
