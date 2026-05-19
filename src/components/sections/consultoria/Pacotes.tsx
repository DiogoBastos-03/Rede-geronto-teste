import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, ArrowRight, Star } from 'lucide-react';
import SectionLabel from '../../ui/SectionLabel';

interface Pacote {
  name: string;
  duration: string;
  ideal: string;
  description: string;
  itemsLabel: string;
  items: string[];
  featured?: boolean;
}

const pacotes: Pacote[] = [
  {
    name: 'Diagnóstico e Planejamento',
    duration: '4 a 6 semanas · Valor sob consulta',
    ideal:
      'Ideal para municípios que querem entender o caminho antes de iniciar',
    description:
      'Análise estratégica completa e plano de implementação personalizado — adaptável ao Fundo do Idoso, ao Programa Cidade Amiga ou à combinação dos dois.',
    itemsLabel: 'Inclui:',
    items: [
      'Diagnóstico aprofundado da situação atual',
      'Análise SWOT detalhada',
      'Levantamento da legislação municipal existente',
      'Identificação de stakeholders e atores-chave',
      'Plano de implementação customizado',
      'Relatório executivo com recomendações',
      'Apresentação para gestores e conselheiros',
    ],
  },
  {
    name: 'Implementação Completa',
    duration: '12 a 16 semanas · Valor sob consulta',
    ideal:
      'Ideal para municípios prontos para implementar com suporte especializado',
    description:
      'Suporte total desde o projeto de lei até a operacionalização — seja para o Fundo Municipal do Idoso, para o Programa Cidade Amiga ou para ambos de forma integrada.',
    itemsLabel: 'Inclui tudo do Pacote 1, mais:',
    items: [
      'Elaboração de minuta de lei',
      'Elaboração de regimento interno e plano de ação',
      'Estruturação do conselho paritário',
      'Capacitação de conselheiros e gestores (16h)',
      'Registro no Cadastro Nacional de Fundos (MDH)',
      'Orientação para abertura de conta bancária',
      'Primeiro plano de aplicação de recursos',
      'Suporte jurídico durante aprovação legislativa',
    ],
    featured: true,
  },
  {
    name: 'Gestão Contínua',
    duration: '12 meses renováveis · Valor sob consulta',
    ideal:
      'Ideal para municípios com programa implementado que buscam crescimento',
    description:
      'Acompanhamento mensal e otimização contínua do programa já implementado — Fundo do Idoso, Cidade Amiga ou ambos.',
    itemsLabel: 'Inclui:',
    items: [
      'Acompanhamento mensal do programa',
      'Consultoria em captação de recursos',
      'Otimização de processos de gestão',
      'Relatórios de transparência e prestação de contas',
      'Capacitação contínua de conselheiros',
      'Articulação com redes estaduais e federais',
      'Suporte para campanhas de doação IRPF',
      'Acesso à plataforma de benchmarking',
    ],
  },
];

export default function Pacotes() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const connectorRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      // Header (label + title + subtitle)
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
      const cards =
        gridRef.current?.querySelectorAll('[data-pacote-card]') ?? [];
      gsap.set(cards, { y: 60, autoAlpha: 0 });
      gsap.fromTo(
        cards,
        { y: 60, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          stagger: 0.15,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 80%',
            once: true,
          },
        },
      );

      // Dashed connector (desktop only)
      if (!isMobile && connectorRef.current) {
        const path = connectorRef.current;
        const length = path.getTotalLength();
        gsap.set(path, {
          strokeDasharray: '6 8',
          strokeDashoffset: length,
        });
        gsap.fromTo(
          path,
          { strokeDashoffset: length },
          {
            strokeDashoffset: 0,
            duration: 2,
            ease: 'power2.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 70%',
              once: true,
            },
          },
        );
      }

      // Hover lift
      if (!isMobile) {
        cards.forEach((card) => {
          const el = card as HTMLElement;
          const isFeatured = el.dataset.featured === '1';
          const baseY = isFeatured ? -8 : 0;
          const baseShadow = isFeatured
            ? '0 8px 32px rgba(12,74,140,0.15)'
            : '0 4px 24px rgba(12,74,140,0.08)';
          const hoverY = baseY - 6;
          const hoverShadow = isFeatured
            ? '0 20px 48px rgba(12,74,140,0.22)'
            : '0 16px 40px rgba(12,74,140,0.15)';

          el.addEventListener('pointerenter', () => {
            gsap.to(el, {
              y: hoverY,
              boxShadow: hoverShadow,
              duration: 0.25,
              ease: 'power2.out',
            });
          });
          el.addEventListener('pointerleave', () => {
            gsap.to(el, {
              y: baseY,
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
      id="pacotes"
      ref={sectionRef}
      aria-labelledby="pacotes-heading"
      className="relative py-[120px] lg:py-[140px] overflow-hidden bg-white"
    >
      <div className="container-x">
        <div ref={headRef} className="max-w-3xl mb-14 lg:mb-20">
          <SectionLabel>Pacotes de consultoria</SectionLabel>
          <h2
            id="pacotes-heading"
            className="mt-5 text-[32px] sm:text-[40px] lg:text-[44px] font-medium leading-[1.15] tracking-[-0.02em] text-text-primary"
          >
            Escolha o nível de suporte que seu município precisa
          </h2>
          <p className="mt-6 text-[17px] leading-[1.65] text-text-secondary max-w-2xl">
            Todos os pacotes são adaptáveis ao seu objetivo — implementar o
            Fundo Municipal do Idoso, aderir ao Programa Cidade Amiga, ou
            integrar os dois. O escopo é definido em conjunto, sem surpresas.
          </p>
        </div>

        <div ref={gridRef} className="relative">
          {/* Desktop dashed connector through card centers */}
          <svg
            className="hidden lg:block absolute top-[140px] left-0 w-full h-6 pointer-events-none"
            viewBox="0 0 1200 24"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              ref={connectorRef}
              d="M 100 12 L 1100 12"
              fill="none"
              stroke="#B5D4F4"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          <ol
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7 items-start relative"
            role="list"
          >
            {pacotes.map((pacote, idx) => (
              <li
                key={idx}
                data-pacote-card
                data-featured={pacote.featured ? '1' : '0'}
                className="relative rounded-[20px] bg-white p-7 lg:p-8 flex flex-col gap-5 will-change-transform"
                style={{
                  border: pacote.featured
                    ? '2px solid #0C4A8C'
                    : '1px solid rgba(12,74,140,0.08)',
                  boxShadow: pacote.featured
                    ? '0 8px 32px rgba(12,74,140,0.15)'
                    : '0 4px 24px rgba(12,74,140,0.08)',
                  transform: pacote.featured
                    ? 'scale(1.02) translateY(-8px)'
                    : undefined,
                }}
              >
                {pacote.featured && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-pill"
                    style={{
                      backgroundColor: '#EAF4F0',
                      color: '#085041',
                      fontSize: '12px',
                      fontWeight: 600,
                      letterSpacing: '0.2px',
                      border: '1px solid rgba(8,80,65,0.15)',
                    }}
                  >
                    <Star size={12} aria-hidden="true" />
                    Mais escolhido
                  </span>
                )}

                <div>
                  <p
                    className="text-[12px] uppercase tracking-[1.2px] font-medium"
                    style={{ color: '#0C4A8C' }}
                  >
                    Pacote {idx + 1}
                  </p>
                  <h3 className="mt-2 text-[22px] lg:text-[24px] font-medium text-text-primary leading-snug tracking-[-0.01em]">
                    {pacote.name}
                  </h3>
                </div>

                <div>
                  <p className="text-[14px] font-medium text-text-primary">
                    {pacote.duration}
                  </p>
                  <p
                    className="mt-2 inline-block px-3 py-1 rounded-pill text-[12px]"
                    style={{
                      backgroundColor: 'rgba(12,74,140,0.06)',
                      color: '#0C4A8C',
                    }}
                  >
                    {pacote.ideal}
                  </p>
                </div>

                <p className="text-[15px] leading-[1.65] text-text-secondary">
                  {pacote.description}
                </p>

                <div className="flex-1">
                  <p
                    className="text-[12px] uppercase tracking-[1.2px] font-medium mb-3"
                    style={{ color: '#5F5E5A' }}
                  >
                    {pacote.itemsLabel}
                  </p>
                  <ul className="space-y-2.5 text-[14px] leading-[1.55] text-text-secondary">
                    {pacote.items.map((item, i) => (
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
                </div>

                <a
                  href="#formulario"
                  className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-pill px-5 py-3 text-[14px] font-medium transition-colors"
                  style={
                    pacote.featured
                      ? {
                          background:
                            'linear-gradient(135deg, #0C4A8C, #2196C9)',
                          color: '#ffffff',
                          boxShadow: '0 4px 14px rgba(12,74,140,0.35)',
                        }
                      : {
                          backgroundColor: 'transparent',
                          color: '#0C4A8C',
                          border: '1.5px solid #0C4A8C',
                        }
                  }
                >
                  Solicitar este pacote
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
