import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check } from 'lucide-react';
import SectionLabel from '../../ui/SectionLabel';

interface Fase {
  number: string;
  title: string;
  items: string[];
}

const fases: Fase[] = [
  {
    number: '01',
    title: 'Engajamento e Diagnóstico',
    items: [
      'Envolver ativamente a população idosa — eles conhecem as barreiras do cotidiano e devem ser parceiros em todas as etapas',
      'Criar comitês intersetoriais com governo local, sociedade civil e setor privado',
      'Avaliar os 8 eixos da OMS por meio de grupos focais com idosos, cuidadores e prestadores de serviço',
      'Aplicar o checklist OMS como instrumento de autoavaliação e mapa para evolução futura',
    ],
  },
  {
    number: '02',
    title: 'Planejamento de Ação',
    items: [
      'Criar o Plano de Ação Municipal com estratégias claras, metas mensuráveis, responsáveis por secretaria e prazos realistas',
      'Garantir ações intersetoriais — saúde, urbanismo, transporte e assistência social trabalhando juntos',
      'Priorizar intervenções de maior impacto com base no diagnóstico realizado',
    ],
  },
  {
    number: '03',
    title: 'Implementação e Monitoramento',
    items: [
      'Executar as ações previstas no plano, com acompanhamento contínuo',
      'Criar grupos de apoio e programas de participação social para idosos',
      'Monitorar resultados por eixo com indicadores específicos',
      'Manter os idosos envolvidos como defensores e conselheiros ao longo de todo o processo',
    ],
  },
  {
    number: '04',
    title: 'Certificação',
    items: [
      'Candidatar-se à Rede Global de Cidades e Comunidades Amigáveis da OMS',
      'Apresentar relatório de progresso com evidências de melhoria em cada um dos 8 eixos',
      'Renovar o compromisso — a certificação é um processo contínuo, renovado a cada ciclo de avaliação',
    ],
  },
];

export default function Fases() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const connectorRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      // Header (label + title + subtitle) — set initial state immediately,
      // then fromTo on scroll to avoid GSAP resolving final state before trigger
      const headChildren = Array.from(headRef.current?.children ?? []);
      if (headChildren.length > 0) {
        gsap.set(headChildren, { y: 30, autoAlpha: 0 });
        gsap.fromTo(
          headChildren,
          { y: 30, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.9,
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

      // Cards
      const cards = gridRef.current?.querySelectorAll('[data-fase-card]') ?? [];
      gsap.set(cards, { y: 60, autoAlpha: 0 });
      gsap.to(cards, {
        y: 0,
        autoAlpha: 1,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 80%',
          once: true,
        },
      });

      // Numbers — small scale-in flourish
      const numbers = gridRef.current?.querySelectorAll('[data-fase-number]') ?? [];
      gsap.set(numbers, { scale: 0.6, autoAlpha: 0 });
      gsap.to(numbers, {
        scale: 1,
        autoAlpha: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 80%',
          once: true,
        },
      });

      // Dashed connector animation (desktop only)
      if (!isMobile && connectorRef.current) {
        const path = connectorRef.current;
        const length = path.getTotalLength();
        gsap.set(path, {
          strokeDasharray: '6 8',
          strokeDashoffset: length,
        });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 70%',
            once: true,
          },
        });
      }

      // Hover cards — y: -6 + bigger shadow
      if (!isMobile) {
        cards.forEach((card) => {
          const el = card as HTMLElement;
          const baseShadow = '0 4px 24px rgba(12,74,140,0.08)';
          el.addEventListener('pointerenter', () => {
            gsap.to(el, {
              y: -6,
              boxShadow: '0 16px 40px rgba(12,74,140,0.15)',
              duration: 0.25,
              ease: 'power2.out',
            });
          });
          el.addEventListener('pointerleave', () => {
            gsap.to(el, {
              y: 0,
              boxShadow: baseShadow,
              duration: 0.25,
              ease: 'power2.out',
            });
          });
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
      id="fases"
      ref={sectionRef}
      aria-labelledby="fases-heading"
      className="relative py-[120px] lg:py-[140px] overflow-hidden bg-white"
    >
      <div className="container-x">
        <div ref={headRef} className="max-w-3xl mb-14 lg:mb-20">
          <SectionLabel>Como funciona</SectionLabel>
          <h2
            id="fases-heading"
            className="mt-5 text-[32px] sm:text-[40px] lg:text-[44px] font-medium leading-[1.15] tracking-[-0.02em] text-text-primary"
          >
            Um processo estruturado em{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #0C4A8C, #2196C9)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline',
              }}
            >
              4 fases
            </span>
          </h2>
          <p className="mt-6 text-[17px] leading-[1.65] text-text-secondary max-w-2xl">
            Cada fase é construída sobre uma base sólida de participação e
            evidências — garantindo que os avanços sejam reais e duradouros.
          </p>
        </div>

        <div ref={gridRef} className="relative">
          {/* Desktop dashed connector — runs through card centers (top region) */}
          <svg
            className="hidden lg:block absolute top-[88px] left-0 w-full h-6 pointer-events-none"
            viewBox="0 0 1200 24"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              ref={connectorRef}
              d="M 80 12 L 1120 12"
              fill="none"
              stroke="#B5D4F4"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          {/* Mobile vertical connector */}
          <div
            className="lg:hidden absolute left-[34px] top-12 bottom-12 w-px"
            style={{
              backgroundImage:
                'linear-gradient(to bottom, #B5D4F4 0, #B5D4F4 6px, transparent 6px, transparent 14px)',
              backgroundSize: '2px 14px',
              backgroundRepeat: 'repeat-y',
            }}
            aria-hidden="true"
          />

          <ol className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-5 relative">
            {fases.map((fase) => (
              <li
                key={fase.number}
                data-fase-card
                className="relative rounded-[20px] bg-white p-7 lg:p-7 flex flex-col gap-5 will-change-transform"
                style={{
                  border: '1px solid rgba(12,74,140,0.08)',
                  boxShadow: '0 4px 24px rgba(12,74,140,0.08)',
                }}
              >
                <p
                  data-fase-number
                  className="leading-none tracking-[-0.04em]"
                  style={{
                    fontSize: '64px',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #0C4A8C, #2196C9)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    display: 'inline-block',
                  }}
                >
                  {fase.number}
                </p>
                <h3 className="text-[20px] lg:text-[22px] font-medium text-text-primary leading-snug tracking-[-0.01em]">
                  {fase.title}
                </h3>
                <ul className="space-y-3 text-[14px] leading-[1.55] text-text-secondary">
                  {fase.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span
                        className="inline-flex w-5 h-5 shrink-0 rounded-full items-center justify-center mt-[3px]"
                        style={{
                          backgroundColor: 'rgba(40,168,122,0.12)',
                          color: '#28A87A',
                        }}
                        aria-hidden="true"
                      >
                        <Check size={12} strokeWidth={3} />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
