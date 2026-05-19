import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Building,
  Bus,
  Home,
  Users,
  Heart,
  Briefcase,
  MessageSquare,
  Stethoscope,
  LucideIcon,
} from 'lucide-react';
import SectionLabel from '../../ui/SectionLabel';

interface Eixo {
  number: string;
  title: string;
  description: string;
  Icon: LucideIcon;
}

const eixos: Eixo[] = [
  {
    number: '01',
    title: 'Ambiente Externo e Edifícios',
    description:
      'Calçadas, espaços públicos e edifícios acessíveis, seguros e bem conservados. Inclui iluminação adequada, bancos em espaços públicos e banheiros acessíveis.',
    Icon: Building,
  },
  {
    number: '02',
    title: 'Transporte',
    description:
      'Opções de transporte seguras, acessíveis e acessíveis financeiramente. Pontos de ônibus cobertos com bancos, veículos com piso rebaixado e tarifas reduzidas para idosos.',
    Icon: Bus,
  },
  {
    number: '03',
    title: 'Moradia',
    description:
      'Habitação segura, adaptada e próxima a serviços essenciais. Programas de reforma para acessibilidade e opções de moradia assistida.',
    Icon: Home,
  },
  {
    number: '04',
    title: 'Participação Social',
    description:
      'Atividades de lazer, cultura e educação acessíveis. Integração intergeracional e combate ao isolamento social.',
    Icon: Users,
  },
  {
    number: '05',
    title: 'Respeito e Inclusão Social',
    description:
      'Atitudes respeitosas da comunidade, combate ao preconceito etário e valorização da experiência e sabedoria dos idosos.',
    Icon: Heart,
  },
  {
    number: '06',
    title: 'Participação Cívica e Emprego',
    description:
      'Oportunidades de voluntariado, trabalho e representação política para idosos ativos.',
    Icon: Briefcase,
  },
  {
    number: '07',
    title: 'Comunicação e Informação',
    description:
      'Informações acessíveis em linguagem clara, incluindo tecnologia adaptada para a terceira idade.',
    Icon: MessageSquare,
  },
  {
    number: '08',
    title: 'Apoio Comunitário e Serviços de Saúde',
    description:
      'Serviços de saúde acessíveis, cuidado domiciliar, suporte social e redes de apoio para idosos com diferentes necessidades.',
    Icon: Stethoscope,
  },
];

export default function Eixos() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      // Header (label + title + subtitle) — set initial state immediately,
      // then fromTo on scroll to avoid GSAP resolving final state before trigger
      const headChildren = Array.from(headRef.current?.children ?? []);
      if (headChildren.length > 0) {
        gsap.set(headChildren, { y: 28, autoAlpha: 0 });
        gsap.fromTo(
          headChildren,
          { y: 28, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.9,
            stagger: 0.1,
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

      const cards = gridRef.current?.querySelectorAll('[data-eixo-card]') ?? [];
      gsap.set(cards, { y: 40, autoAlpha: 0 });
      gsap.to(cards, {
        y: 0,
        autoAlpha: 1,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 82%',
          once: true,
        },
      });

      if (!isMobile) {
        cards.forEach((card) => {
          const el = card as HTMLElement;
          const initialBg = '#ffffff';
          const hoverBg =
            'linear-gradient(135deg, #E8F2FB 0%, #EAF4F0 100%)';
          el.addEventListener('pointerenter', () => {
            gsap.to(el, {
              scale: 1.03,
              boxShadow: '0 8px 24px rgba(26,122,94,0.15)',
              duration: 0.3,
              ease: 'power2.out',
            });
            gsap.to(el, {
              background: hoverBg,
              duration: 0.4,
              ease: 'power2.out',
            });
          });
          el.addEventListener('pointerleave', () => {
            gsap.to(el, {
              scale: 1,
              boxShadow: '0 4px 24px rgba(12,74,140,0.08)',
              duration: 0.3,
              ease: 'power2.out',
            });
            gsap.to(el, {
              background: initialBg,
              duration: 0.4,
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
      id="eixos"
      ref={sectionRef}
      aria-labelledby="eixos-heading"
      className="relative py-[120px] lg:py-[140px]"
      style={{ backgroundColor: '#F0FAF6' }}
    >
      <div className="container-x">
        <div ref={headRef} className="max-w-3xl mb-14 lg:mb-20">
          <SectionLabel tone="green">Metodologia OMS</SectionLabel>
          <h2
            id="eixos-heading"
            className="mt-5 text-[32px] sm:text-[40px] lg:text-[44px] font-medium leading-[1.15] tracking-[-0.02em] text-text-primary"
          >
            Os{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #2196C9, #28A87A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline',
              }}
            >
              8 eixos
            </span>{' '}
            que definem uma cidade amiga
          </h2>
          <p className="mt-6 text-[17px] leading-[1.65] text-text-secondary max-w-2xl">
            Cada eixo representa uma dimensão da vida urbana avaliada durante o
            diagnóstico. Juntos, formam um retrato completo de como a cidade
            atende — ou não — às necessidades da população idosa.
          </p>
        </div>

        <ul
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6"
          role="list"
        >
          {eixos.map(({ number, title, description, Icon }) => (
            <li
              key={number}
              data-eixo-card
              className="relative rounded-[20px] p-6 lg:p-7 flex flex-col gap-4 will-change-transform"
              style={{
                background: '#ffffff',
                border: '1px solid rgba(12,74,140,0.08)',
                boxShadow: '0 4px 24px rgba(12,74,140,0.08)',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <p
                  className="leading-none tracking-[-0.04em]"
                  style={{
                    fontSize: '40px',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #2196C9, #28A87A)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    display: 'inline-block',
                  }}
                >
                  {number}
                </p>
                <span
                  className="inline-flex w-10 h-10 rounded-full items-center justify-center shrink-0"
                  style={{
                    backgroundColor: 'rgba(26,122,94,0.10)',
                    color: '#1A7A5E',
                  }}
                  aria-hidden="true"
                >
                  <Icon size={18} />
                </span>
              </div>
              <h3 className="text-[18px] lg:text-[19px] font-medium text-text-primary leading-snug tracking-[-0.01em]">
                {title}
              </h3>
              <p className="text-[14px] leading-[1.6] text-text-secondary">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
