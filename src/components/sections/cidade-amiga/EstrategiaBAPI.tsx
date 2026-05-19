import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scale, FileText, Award, ArrowRight, ArrowUpRight } from 'lucide-react';
import Button from '../../ui/Button';
import SectionLabel from '../../ui/SectionLabel';

interface BaseLegal {
  Icon: typeof Scale;
  title: string;
  description: string;
}

const baseLegais: BaseLegal[] = [
  {
    Icon: Scale,
    title: 'Estatuto do Idoso (Lei 10.741/2003)',
    description:
      'direitos fundamentais da pessoa idosa e obrigações municipais',
  },
  {
    Icon: FileText,
    title: 'Política Nacional do Idoso (Lei 8.842/1994)',
    description: 'diretrizes para ação municipal',
  },
  {
    Icon: Award,
    title: 'Estratégia BAPI',
    description:
      'adesão gratuita pelo MDH, capacitação e reconhecimento federal',
  },
];

export default function EstrategiaBAPI() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const lineRef = useRef<HTMLSpanElement | null>(null);
  const headRef = useRef<HTMLDivElement | null>(null);
  const titleWrapRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const introRef = useRef<HTMLParagraphElement | null>(null);
  const baseLegalLabelRef = useRef<HTMLParagraphElement | null>(null);
  const cardsRef = useRef<HTMLUListElement | null>(null);
  const ctasRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Decorative line — width 0 -> 60px
      if (lineRef.current) {
        gsap.set(lineRef.current, { width: 0 });
        gsap.to(lineRef.current, {
          width: 60,
          duration: 0.9,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            once: true,
          },
        });
      }

      // Label fade-in
      const labelEl = headRef.current?.querySelector('[data-label]');
      if (labelEl) {
        gsap.set(labelEl, { y: 20, autoAlpha: 0 });
        gsap.to(labelEl, {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headRef.current,
            start: 'top 80%',
            once: true,
          },
        });
      }

      // Title clip-path reveal — set initial state immediately, then fromTo on scroll
      if (titleRef.current) {
        // Hide right away so the title doesn't flash before the trigger fires
        gsap.set(titleRef.current, {
          clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
          y: 24,
        });
        gsap.fromTo(
          titleRef.current,
          {
            clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
            y: 24,
          },
          {
            clipPath: 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)',
            y: 0,
            duration: 1.1,
            ease: 'expo.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: titleRef.current,
              start: 'top 85%',
              once: true,
            },
          },
        );
      }

      // Intro paragraph
      gsap.set(introRef.current, { y: 20, autoAlpha: 0 });
      gsap.to(introRef.current, {
        y: 0,
        autoAlpha: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: introRef.current,
          start: 'top 85%',
          once: true,
        },
      });

      // Base legal label
      gsap.set(baseLegalLabelRef.current, { y: 16, autoAlpha: 0 });
      gsap.to(baseLegalLabelRef.current, {
        y: 0,
        autoAlpha: 1,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: baseLegalLabelRef.current,
          start: 'top 85%',
          once: true,
        },
      });

      // Cards stagger
      const cards = cardsRef.current?.querySelectorAll('[data-bapi-card]') ?? [];
      gsap.set(cards, { y: 40, autoAlpha: 0 });
      gsap.to(cards, {
        y: 0,
        autoAlpha: 1,
        duration: 0.85,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardsRef.current,
          start: 'top 80%',
          once: true,
        },
      });

      // CTAs
      gsap.set(ctasRef.current?.children ?? [], { y: 20, autoAlpha: 0 });
      gsap.to(ctasRef.current?.children ?? [], {
        y: 0,
        autoAlpha: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: ctasRef.current,
          start: 'top 88%',
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
      id="bapi"
      ref={sectionRef}
      aria-labelledby="bapi-heading"
      className="relative py-[120px] lg:py-[140px] overflow-hidden"
      style={{ backgroundColor: '#0D1B2A' }}
    >
      {/* Decorative gradient line */}
      <span
        ref={lineRef}
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 block"
        style={{
          width: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #2196C9, #28A87A)',
          borderRadius: '2px',
        }}
      />

      <div className="container-x relative">
        <div ref={headRef} className="max-w-3xl mb-12">
          <div data-label className="inline-block">
            <SectionLabel tone="neutral" className="!text-white/70">
              Contexto brasileiro
            </SectionLabel>
          </div>
          <div
            ref={titleWrapRef}
            className="mt-5 overflow-hidden"
            style={{ paddingBottom: '4px' }}
          >
            <h2
              ref={titleRef}
              id="bapi-heading"
              className="text-[32px] sm:text-[40px] lg:text-[44px] font-medium leading-[1.15] tracking-[-0.02em] text-white"
            >
              A Estratégia Brasil Amigo da Pessoa Idosa
            </h2>
          </div>
          <p
            ref={introRef}
            className="mt-8 text-[17px] leading-[1.7]"
            style={{ color: 'rgba(255,255,255,0.75)' }}
          >
            No Brasil, a Estratégia Brasil Amigo da Pessoa Idosa (BAPI),
            coordenada pelo Ministério dos Direitos Humanos, é o instrumento
            nacional que conecta municípios à Rede Global da OMS. A adesão é
            gratuita e garante capacitação e reconhecimento federal.
          </p>
        </div>

        <p
          ref={baseLegalLabelRef}
          className="text-[12px] uppercase tracking-[1.2px] font-medium mb-6"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          Base legal
        </p>

        <ul
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6"
          role="list"
        >
          {baseLegais.map(({ Icon, title, description }, i) => (
            <li
              key={i}
              data-bapi-card
              className="rounded-[20px] p-7 lg:p-8 backdrop-blur-sm flex flex-col gap-4"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              <span
                className="inline-flex w-12 h-12 rounded-full items-center justify-center"
                style={{
                  backgroundColor: 'rgba(33,150,201,0.15)',
                  color: '#85B7EB',
                }}
                aria-hidden="true"
              >
                <Icon size={22} />
              </span>
              <h3 className="text-[18px] lg:text-[19px] font-medium text-white leading-snug tracking-[-0.01em]">
                {title}
              </h3>
              <p
                className="text-[14px] leading-[1.65]"
                style={{ color: 'rgba(255,255,255,0.70)' }}
              >
                {description}
              </p>
            </li>
          ))}
        </ul>

        <div
          ref={ctasRef}
          className="mt-12 lg:mt-14 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
        >
          <Button href="/diagnostico" variant="primary" size="lg">
            Quero implementar no meu município
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
          <a
            href="https://www.gov.br/mdh/pt-br/assuntos/noticias/2018/marco/estrategia-brasil-amigo-da-pessoa-idosa"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-pill px-8 min-h-[52px] py-[15px] font-medium text-[16px] text-white cursor-pointer transition-colors hover:bg-white/10"
            style={{
              border: '2px solid rgba(255,255,255,0.5)',
            }}
          >
            Conhecer a Estratégia BAPI
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
