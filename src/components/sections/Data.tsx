import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Map as MapIcon, ArrowRight } from 'lucide-react';
import SectionLabel from '../ui/SectionLabel';
import Button from '../ui/Button';

export default function Data() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const numberRef = useRef<HTMLSpanElement | null>(null);
  const headRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);

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
        mapRef.current,
        { opacity: 0, y: 60, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: mapRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        },
      );

      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.3,
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        },
      );

      // Counter for 57
      if (numberRef.current) {
        const state = { val: 0 };
        gsap.to(state, {
          val: 57,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: numberRef.current,
            start: 'top 85%',
            once: true,
          },
          onUpdate: () => {
            if (numberRef.current) {
              numberRef.current.textContent = `${Math.round(state.val)}%`;
            }
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="dados"
      ref={sectionRef}
      aria-labelledby="dados-heading"
      className="py-[120px] lg:py-[140px]"
      style={{ backgroundColor: '#F0FAF6' }}
    >
      <div className="container-x">
        <div ref={headRef} className="max-w-3xl mb-14">
          <SectionLabel>Dados</SectionLabel>
          <h2
            id="dados-heading"
            className="mt-5 text-[32px] sm:text-[40px] lg:text-[44px] font-medium leading-[1.15] tracking-[-0.02em] text-text-primary"
          >
            Veja como está o Brasil
          </h2>
          <p className="mt-6 text-[17px] leading-[1.7] text-text-secondary">
            <strong className="text-text-primary font-medium">
              57% dos municípios brasileiros
            </strong>{' '}
            ainda não implementaram o Fundo do Idoso. No mapa abaixo, você
            consegue visualizar a situação do seu estado — e entender onde
            estão as oportunidades.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-4">
            <span
              ref={numberRef}
              className="block leading-none tracking-[-0.04em]"
              style={{
                fontSize: 'clamp(72px, 11vw, 96px)',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #0C4A8C, #2196C9)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline-block',
              }}
              aria-label="57 por cento"
            >
              0%
            </span>
            <p className="mt-4 text-[16px] leading-[1.6] text-text-secondary max-w-sm">
              dos municípios brasileiros ainda não implementaram o Fundo do
              Idoso.
            </p>
          </div>

          <div
            ref={mapRef}
            className="lg:col-span-8 rounded-[20px] grad-bg-map relative overflow-hidden"
            style={{ height: '320px', minHeight: '280px' }}
            aria-label="Mapa interativo do Brasil — em breve"
            role="img"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <span className="inline-flex w-16 h-16 rounded-full bg-white items-center justify-center text-blue-deep mb-5 shadow-[0_8px_24px_rgba(12,74,140,0.10)]">
                <MapIcon size={28} aria-hidden="true" />
              </span>
              <p className="text-[20px] font-medium text-text-primary tracking-[-0.01em]">
                Mapa interativo em breve
              </p>
              <p className="mt-2 text-[14px] text-text-secondary max-w-md">
                Visualização por estado e município com situação do Fundo do
                Idoso em todo o Brasil.
              </p>
            </div>
          </div>
        </div>

        <div ref={ctaRef} className="mt-12 flex justify-center">
          <Button href="/dashboard" variant="secondary" size="lg">
            Ver dashboard completo com dados por município
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}
