import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionLabel from '../ui/SectionLabel';

const stats = [
  {
    prefix: 'R$',
    target: 145,
    suffix: 'mi',
    label: 'em doações disponíveis em 2024',
    format: (v: number) => Math.round(v).toString(),
  },
  {
    prefix: '+',
    target: 57,
    suffix: '%',
    label: 'dos municípios sem fundo estruturado',
    format: (v: number) => Math.round(v).toString(),
  },
  {
    prefix: '',
    target: 1,
    suffix: ' decisão',
    label: 'de gestão para começar',
    format: (v: number) => Math.round(v).toString(),
  },
];

export default function Problem() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const paragraphsRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const ctx = gsap.context(() => {
      // Title clip-path reveal
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          {
            clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
            y: 30,
          },
          {
            clipPath: 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)',
            y: 0,
            duration: 1.1,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      }

      // Paragraphs stagger from left
      const paragraphs = paragraphsRef.current?.querySelectorAll('p') ?? [];
      gsap.fromTo(
        paragraphs,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: paragraphsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        },
      );

      // Cards stagger up + counter
      const cards = cardsRef.current?.querySelectorAll<HTMLElement>(
        '[data-stat-card]',
      );
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.15,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          },
        );

        // Counters — once: true
        cards.forEach((card, i) => {
          const valueEl = card.querySelector<HTMLElement>('[data-stat-value]');
          if (!valueEl) return;
          const stat = stats[i];
          const state = { val: 0 };
          gsap.to(state, {
            val: stat.target,
            duration: 1.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              once: true,
            },
            onUpdate: () => {
              valueEl.textContent = stat.format(state.val);
            },
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
      id="problema"
      ref={sectionRef}
      aria-labelledby="problema-heading"
      className="relative py-[120px] lg:py-[140px]"
      style={{ backgroundColor: '#0D1B2A' }}
    >
      {/* Decorative gradient line */}
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
        <div className="max-w-3xl">
          <SectionLabel className="!text-white/70">O problema</SectionLabel>
          <div
            className="mt-5 overflow-hidden"
            style={{ paddingBottom: '4px' }}
          >
            <h2
              ref={titleRef}
              id="problema-heading"
              className="text-[32px] sm:text-[40px] lg:text-[44px] font-medium leading-[1.15] tracking-[-0.02em] text-white"
            >
              O dinheiro{' '}
              <em className="font-serif italic text-blue-sky font-normal">
                existe.
              </em>{' '}
              A estrutura, ainda não.
            </h2>
          </div>
          <div
            ref={paragraphsRef}
            className="mt-8 space-y-5 text-[17px] leading-[1.7]"
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            <p>
              Todo ano, brasileiros destinam parte do imposto de renda para
              fundos de defesa do idoso. Em 2024, foram mais de{' '}
              <strong className="text-white font-medium">
                R$ 145 milhões em doações disponíveis
              </strong>
              .
            </p>
            <p>
              O problema: a maioria dos municípios não tem o fundo criado. Sem
              ele, esse dinheiro passa direto — e vai para cidades que já se
              organizaram.
            </p>
            <p>
              Criar o fundo não é burocracia. É uma decisão de gestão que
              qualquer município pode tomar.
            </p>
          </div>
        </div>

        <div
          ref={cardsRef}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6"
        >
          {stats.map((s, i) => (
            <article
              key={i}
              data-stat-card
              className="relative rounded-[20px] p-7 md:p-8 text-white overflow-hidden backdrop-blur-sm"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              <div
                aria-hidden="true"
                className="absolute -top-12 -right-12 w-48 h-48 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(33,150,201,0.18), transparent 60%)',
                }}
              />
              <p
                className="text-[52px] leading-none tracking-tight"
                style={{ fontWeight: 800 }}
              >
                {s.prefix}
                <span data-stat-value>0</span>
                {s.suffix}
              </p>
              <p
                className="mt-3 text-[14px] leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                {s.label}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
