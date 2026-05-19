import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Globe } from 'lucide-react';
import SectionLabel from '../../ui/SectionLabel';

export default function OQueE() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const titleWrapRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const paragraphsRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
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

      if (cardRef.current) {
        gsap.set(cardRef.current, { scale: 0.95, autoAlpha: 0 });
        gsap.to(cardRef.current, {
          scale: 1,
          autoAlpha: 1,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 85%',
            once: true,
          },
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
      id="o-que-e"
      ref={sectionRef}
      aria-labelledby="o-que-e-heading"
      className="relative py-[120px] lg:py-[140px]"
      style={{ backgroundColor: '#F0F7FF' }}
    >
      <div className="container-x">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Text column (60%) */}
          <div className="lg:col-span-7">
            <SectionLabel>O conceito</SectionLabel>
            <div
              ref={titleWrapRef}
              className="mt-5 overflow-hidden"
              style={{ paddingBottom: '4px' }}
            >
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
                aumentando a qualidade de vida à medida que as pessoas
                envelhecem.
              </p>
              <p>
                Na prática, ela adapta suas estruturas e serviços para que
                sejam acessíveis e promovam a inclusão de idosos com diferentes
                necessidades e graus de capacidade.
              </p>
              <p>
                O conceito foi desenvolvido pela Organização Mundial da Saúde a
                partir de pesquisa realizada em 33 cidades de todas as regiões
                do mundo. Hoje, centenas de cidades ao redor do planeta fazem
                parte da Rede Global de Cidades Amigáveis da OMS.
              </p>
            </div>
          </div>

          {/* Highlight card column (40%) */}
          <div className="lg:col-span-5">
            <div
              ref={cardRef}
              className="rounded-[20px] bg-white p-8 lg:p-10"
              style={{
                border: '1px solid #B5D4F4',
                boxShadow: '0 12px 40px rgba(12,74,140,0.10)',
              }}
            >
              <span
                className="inline-flex w-12 h-12 rounded-full items-center justify-center mb-6"
                style={{
                  backgroundColor: 'rgba(12,74,140,0.08)',
                  color: '#0C4A8C',
                }}
                aria-hidden="true"
              >
                <Globe size={24} />
              </span>
              <p
                className="leading-none tracking-[-0.03em]"
                style={{
                  fontSize: '56px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #0C4A8C, #2196C9)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'inline-block',
                }}
              >
                33 cidades
              </p>
              <p className="mt-3 text-[15px] text-text-secondary leading-relaxed">
                em todas as regiões do mundo deram origem ao conceito da OMS.
              </p>
              <div
                className="my-6 h-px w-full"
                style={{ backgroundColor: 'rgba(12,74,140,0.10)' }}
                aria-hidden="true"
              />
              <p
                className="leading-none tracking-[-0.02em]"
                style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#1A7A5E',
                }}
              >
                Centenas de cidades
              </p>
              <p className="mt-3 text-[15px] text-text-secondary leading-relaxed">
                fazem parte hoje da Rede Global de Cidades Amigáveis da OMS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
