import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Building2,
  Bus,
  Home,
  Users,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';
import SectionLabel from '../../ui/SectionLabel';

// ── Data ──────────────────────────────────────────────────────────────────────

interface Pilar {
  icon: LucideIcon;
  title: string;
  description: string;
}

const PILARES: Pilar[] = [
  {
    icon: Building2,
    title: 'Ambiente Físico',
    description:
      'Acessibilidade em parques, prédios e ruas — o ponto de partida para qualquer cidade amiga do idoso.',
  },
  {
    icon: Bus,
    title: 'Transporte',
    description:
      'Transporte coletivo seguro, acessível e com assentos preferenciais em rotas que atendam os idosos.',
  },
  {
    icon: Home,
    title: 'Moradia',
    description:
      'Habitação segura, adaptada e próxima a serviços essenciais de saúde e convivência.',
  },
  {
    icon: Users,
    title: 'Participação Social/Cívica',
    description:
      'Atividades de lazer, educação, voluntariado e oportunidades de trabalho para idosos ativos.',
  },
  {
    icon: MessageSquare,
    title: 'Comunicação',
    description:
      'Informações acessíveis em linguagem clara, incluindo tecnologia adaptada para a terceira idade.',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function PilaresFundamentais() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      // Header
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

      // Cards stagger
      const cards = gridRef.current?.querySelectorAll('[data-pilar-card]') ?? [];
      gsap.set(cards, { y: 40, autoAlpha: 0 });
      gsap.to(cards, {
        y: 0,
        autoAlpha: 1,
        duration: 0.8,
        stagger: 0.09,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 82%',
          once: true,
        },
      });

      // Hover (desktop only)
      if (!isMobile) {
        cards.forEach((card) => {
          const el = card as HTMLElement;
          el.addEventListener('pointerenter', () => {
            gsap.to(el, {
              scale: 1.03,
              boxShadow: '0 8px 24px rgba(26,122,94,0.15)',
              duration: 0.3,
              ease: 'power2.out',
            });
            gsap.to(el, {
              background: 'linear-gradient(135deg, #E8F2FB 0%, #EAF4F0 100%)',
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
              background: '#ffffff',
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
      id="pilares"
      ref={sectionRef}
      aria-labelledby="pilares-heading"
      className="relative py-[120px] lg:py-[140px] bg-white"
    >
      <div className="container-x">
        {/* ── Header ── */}
        <div ref={headRef} className="max-w-3xl mb-14 lg:mb-20">
          <SectionLabel tone="green">Pilares Fundamentais</SectionLabel>
          <h2
            id="pilares-heading"
            className="mt-5 text-[32px] sm:text-[40px] lg:text-[44px] font-medium leading-[1.15] tracking-[-0.02em] text-text-primary"
          >
            Cinco áreas de atuação prioritária
          </h2>
          <p className="mt-6 text-[17px] leading-[1.65] text-text-secondary max-w-2xl">
            Cinco áreas de atuação prioritária que concentram as intervenções
            de maior impacto para a qualidade de vida da pessoa idosa no
            ambiente urbano.
          </p>
        </div>

        {/* ── 5-column grid ── */}
        <ul
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 lg:gap-5"
          role="list"
        >
          {PILARES.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              data-pilar-card
              className="relative rounded-[20px] p-6 lg:p-7 flex flex-col gap-4 will-change-transform"
              style={{
                background: '#ffffff',
                border: '1px solid rgba(12,74,140,0.08)',
                boxShadow: '0 4px 24px rgba(12,74,140,0.08)',
              }}
            >
              <span
                className="inline-flex w-10 h-10 rounded-full items-center justify-center self-start"
                style={{
                  backgroundColor: 'rgba(26,122,94,0.10)',
                  color: '#1A7A5E',
                }}
                aria-hidden="true"
              >
                <Icon size={18} />
              </span>
              <h3 className="text-[17px] font-medium text-text-primary leading-snug tracking-[-0.01em]">
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
