import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionLabel from '../../ui/SectionLabel';

// ── Stat strip data ───────────────────────────────────────────────────────────

const STATS = [
  {
    value: '33',
    label: 'cidades pesquisadas pela OMS',
  },
  {
    value: '8',
    label: 'eixos de avaliação urbana',
  },
  {
    value: '+1.000',
    label: 'municípios brasileiros no BAPI',
  },
  {
    value: '4',
    label: 'fases de implementação',
  },
] as const;

// ── Gradient text style (shared) ─────────────────────────────────────────────

const gradientText = {
  background: 'linear-gradient(135deg, #1A7A5E, #2196C9)',
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent' as const,
  backgroundClip: 'text' as const,
  display: 'inline-block' as const,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function OQueE() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const paragraphsRef = useRef<HTMLDivElement | null>(null);
  const statsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      // Title clip-path reveal
      if (titleRef.current) {
        gsap.set(titleRef.current, {
          clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
          y: 24,
        });
        gsap.fromTo(
          titleRef.current,
          { clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)', y: 24 },
          {
            clipPath: 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)',
            y: 0,
            duration: 1.1,
            ease: 'expo.out',
            immediateRender: false,
            scrollTrigger: { trigger: titleRef.current, start: 'top 85%', once: true },
          },
        );
      }

      // Paragraphs stagger
      const paragraphs = paragraphsRef.current?.querySelectorAll('p') ?? [];
      gsap.set(paragraphs, { x: isMobile ? 0 : -30, autoAlpha: 0 });
      gsap.to(paragraphs, {
        x: 0,
        autoAlpha: 1,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: paragraphsRef.current,
          start: 'top 80%',
          once: true,
        },
      });

      // Stat cards stagger
      const statCards = statsRef.current?.querySelectorAll('[data-stat-card]') ?? [];
      gsap.set(statCards, { y: 36, opacity: 0 });
      gsap.to(statCards, {
        y: 0,
        opacity: 1,
        duration: 0.75,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: statsRef.current,
          start: 'top 87%',
          once: true,
        },
      });
    }, sectionRef);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section
      id="o-que-e"
      ref={sectionRef}
      aria-labelledby="o-que-e-heading"
      className="relative py-[120px] lg:py-[140px]"
      style={{ backgroundColor: '#F0F7FF' }}
    >
      <div className="container-x">
        {/* ── Text block ── */}
        <div className="max-w-3xl mb-12 lg:mb-16">
          <SectionLabel>O conceito</SectionLabel>
          <div className="mt-5 overflow-hidden" style={{ paddingBottom: '4px' }}>
            <h2
              ref={titleRef}
              id="o-que-e-heading"
              className="text-[32px] sm:text-[40px] lg:text-[44px] font-medium leading-[1.15] tracking-[-0.02em] text-text-primary"
            >
              O que é uma Cidade Amiga do Idoso?
            </h2>
          </div>
          <div
            ref={paragraphsRef}
            className="mt-8 space-y-5 text-[17px] leading-[1.7] text-text-secondary"
          >
            <p>
              Uma Cidade Amiga do Idoso estimula o envelhecimento ativo ao
              otimizar oportunidades para saúde, participação e segurança —
              aumentando a qualidade de vida à medida que as pessoas envelhecem.
            </p>
            <p>
              Na prática, ela adapta suas estruturas e serviços para que sejam
              acessíveis e promovam a inclusão de idosos com diferentes
              necessidades e graus de capacidade.
            </p>
            <p>
              O conceito foi desenvolvido pela Organização Mundial da Saúde a
              partir de pesquisa realizada em 33 cidades de todas as regiões do
              mundo. Hoje, centenas de cidades ao redor do planeta fazem parte
              da Rede Global de Cidades Amigáveis da OMS.
            </p>
          </div>
        </div>

        {/* ── Stat strip (4 cards) ── */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5"
        >
          {STATS.map(({ value, label }) => (
            <div
              key={label}
              data-stat-card
              className="rounded-[20px] bg-white p-6 lg:p-8 flex flex-col gap-3"
              style={{
                border: '1px solid rgba(12,74,140,0.08)',
                boxShadow: '0 4px 24px rgba(12,74,140,0.06)',
              }}
            >
              <span
                className="leading-none tracking-[-0.04em]"
                style={{ fontSize: '44px', fontWeight: 800, ...gradientText }}
              >
                {value}
              </span>
              <p className="text-[14px] leading-[1.5] text-text-secondary">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
