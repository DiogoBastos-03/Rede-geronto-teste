import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Search, ClipboardCheck, Wrench, TrendingUp } from 'lucide-react';
import SectionLabel from '../ui/SectionLabel';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Diagnóstico',
    description:
      'Responda um formulário rápido sobre a situação do seu município. Em menos de 10 minutos, você recebe um relatório completo com análise e próximos passos.',
  },
  {
    number: '02',
    icon: ClipboardCheck,
    title: 'Plano personalizado',
    description:
      'Com base no diagnóstico, nossa equipe monta o plano de implementação ideal para a realidade do seu município.',
  },
  {
    number: '03',
    icon: Wrench,
    title: 'Implementação com suporte',
    description:
      'Do projeto de lei à abertura da conta bancária, você conta com consultoria especializada em cada etapa.',
  },
  {
    number: '04',
    icon: TrendingUp,
    title: 'Gestão e crescimento',
    description:
      'Fundo criado, a gente segue junto — captação de recursos, transparência, prestação de contas e evolução contínua.',
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const noteRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headRef.current?.children ?? [],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        },
      );

      gsap.fromTo(
        gridRef.current?.querySelectorAll('[data-step]') ?? [],
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        },
      );

      gsap.fromTo(
        noteRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: noteRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        },
      );

      // Hover lift on step cards
      if (window.innerWidth >= 768) {
        const cards =
          gridRef.current?.querySelectorAll<HTMLElement>('[data-step]') ?? [];
        cards.forEach((card) => {
          const enter = () =>
            gsap.to(card, {
              y: -8,
              boxShadow: '0 16px 40px rgba(12,74,140,0.15)',
              duration: 0.35,
              ease: 'power3.out',
            });
          const leave = () =>
            gsap.to(card, {
              y: 0,
              boxShadow: '0 4px 24px rgba(12,74,140,0.08)',
              duration: 0.35,
              ease: 'power3.out',
            });
          card.addEventListener('pointerenter', enter);
          card.addEventListener('pointerleave', leave);
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="como-funciona"
      ref={sectionRef}
      aria-labelledby="como-funciona-heading"
      className="py-[120px] lg:py-[140px] bg-white"
    >
      <div className="container-x">
        <div ref={headRef} className="max-w-3xl mb-16">
          <SectionLabel>Como funciona</SectionLabel>
          <h2
            id="como-funciona-heading"
            className="mt-5 text-[32px] sm:text-[40px] lg:text-[44px] font-medium leading-[1.15] tracking-[-0.02em] text-text-primary"
          >
            Da decisão à implementação, a Rede Geronto faz{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #2196C9, #28A87A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline',
              }}
            >
              junto com você
            </span>
          </h2>
        </div>

        <div ref={gridRef} className="relative">
          {/* Dotted connector (desktop) */}
          <svg
            aria-hidden="true"
            className="hidden lg:block absolute left-0 right-0 top-[78px] -z-0 pointer-events-none"
            height="2"
            width="100%"
            preserveAspectRatio="none"
          >
            <line
              x1="0"
              y1="1"
              x2="100%"
              y2="1"
              stroke="#B5D4F4"
              strokeWidth="2"
              strokeDasharray="4 8"
            />
          </svg>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((step) => (
              <article
                key={step.number}
                data-step
                className="rounded-[20px] bg-white p-8 flex flex-col will-change-transform"
                style={{
                  border: '1px solid rgba(12,74,140,0.08)',
                  boxShadow: '0 4px 24px rgba(12,74,140,0.08)',
                }}
              >
                <div className="flex items-start justify-between">
                  <p
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
                    {step.number}
                  </p>
                  <span className="inline-flex w-10 h-10 rounded-full bg-blue-light items-center justify-center text-blue-deep mt-2">
                    <step.icon size={18} aria-hidden="true" />
                  </span>
                </div>
                <h3 className="mt-6 text-[20px] font-medium text-text-primary tracking-[-0.01em]">
                  {step.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.65] text-text-secondary">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div
          ref={noteRef}
          className="mt-12 rounded-[16px] grad-bg-blue-deep text-white px-7 py-6 md:px-9 md:py-7 flex flex-col md:flex-row gap-4 md:items-center shadow-[0_12px_32px_rgba(12,74,140,0.20)]"
        >
          <span
            className="inline-flex w-11 h-11 shrink-0 rounded-full bg-white/15 items-center justify-center"
            aria-hidden="true"
          >
            <Wrench size={20} />
          </span>
          <p className="text-[16px] leading-[1.6]">
            Tudo isso em uma plataforma completa — diagnóstico, mapa de fundos,
            biblioteca de recursos e benchmarking com outros municípios.
          </p>
        </div>
      </div>
    </section>
  );
}
