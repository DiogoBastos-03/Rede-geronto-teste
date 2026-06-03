import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import Button from '../../ui/Button';
import SectionLabel from '../../ui/SectionLabel';
import { wrapWordsPreservingMarkup } from '../../../utils/wrapWords';

export default function ConsultoriaHero() {
  const sectionRef  = useRef<HTMLElement | null>(null);
  const overlayRef  = useRef<HTMLDivElement | null>(null);
  const blobBlueRef = useRef<HTMLDivElement | null>(null);
  const blobGreenRef = useRef<HTMLDivElement | null>(null);
  const labelRef    = useRef<HTMLSpanElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const sozinhoRef  = useRef<HTMLSpanElement | null>(null);
  const subRef      = useRef<HTMLParagraphElement | null>(null);
  const ctaRef      = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Word-split headline, preserving the gradient span
      const textSpan = headlineRef.current?.querySelector(
        '.headline-text',
      ) as HTMLElement | null;
      if (textSpan) wrapWordsPreservingMarkup(textSpan, 'consult-hero-word');

      // Initial states
      gsap.set(labelRef.current,            { y: 20, autoAlpha: 0 });
      gsap.set('.consult-hero-word',        { y: 30, autoAlpha: 0 });
      gsap.set(sozinhoRef.current,          { autoAlpha: 0 });
      gsap.set(subRef.current,              { y: 16, autoAlpha: 0 });
      gsap.set(ctaRef.current?.children ?? [], { scale: 0.92, autoAlpha: 0 });
      gsap.set(blobBlueRef.current,         { autoAlpha: 0, scale: 0.85 });
      gsap.set(blobGreenRef.current,        { autoAlpha: 0, scale: 0.85 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to(overlayRef.current, { autoAlpha: 0, duration: 0.6, ease: 'power2.out' })
        .to(
          [blobBlueRef.current, blobGreenRef.current],
          { autoAlpha: 1, scale: 1, duration: 1.2, stagger: 0.1 },
          0.1,
        )
        .to(labelRef.current, { y: 0, autoAlpha: 1, duration: 0.8 }, 0.3)
        .to('.consult-hero-word', { y: 0, autoAlpha: 1, duration: 0.85, stagger: 0.05 }, 0.7)
        .to(sozinhoRef.current, { autoAlpha: 1, duration: 0.6 }, 1.3)
        .to(subRef.current,  { y: 0, autoAlpha: 1, duration: 0.8 }, 1.1)
        .to(
          ctaRef.current?.children ?? [],
          { scale: 1, autoAlpha: 1, duration: 0.9, stagger: 0.1, ease: 'expo.out' },
          1.4,
        );

      // Blob parallax
      if (window.innerWidth >= 768) {
        gsap.to(blobBlueRef.current, {
          y: -40, ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 1.5 },
        });
        gsap.to(blobGreenRef.current, {
          y: -60, ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 1.5 },
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
      id="consultoria-hero"
      ref={sectionRef}
      aria-labelledby="consultoria-hero-heading"
      className="relative pt-32 md:pt-40 lg:pt-48 pb-24 md:pb-32 overflow-hidden bg-white"
    >
      {/* Entrance overlay */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="fixed inset-0 z-[60] pointer-events-none"
        style={{ backgroundColor: '#0a0f1a' }}
      />

      {/* Decorative blobs */}
      <div
        ref={blobBlueRef}
        aria-hidden="true"
        className="absolute -z-0 left-[-10%] top-[8%] w-[700px] h-[500px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 600px 400px at center, rgba(33,150,201,0.15), transparent 70%)',
        }}
      />
      <div
        ref={blobGreenRef}
        aria-hidden="true"
        className="absolute -z-0 right-[-8%] bottom-[5%] w-[600px] h-[450px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 500px 350px at center, rgba(40,168,122,0.12), transparent 70%)',
        }}
      />

      {/* Single centred column */}
      <div className="container-x relative">
        <div className="mx-auto max-w-3xl text-center">
          <span ref={labelRef} className="inline-block">
            <SectionLabel>Consultoria especializada</SectionLabel>
          </span>

          <h1
            ref={headlineRef}
            id="consultoria-hero-heading"
            className="mt-6 text-[38px] sm:text-[48px] lg:text-[56px] font-medium leading-[1.1] tracking-[-0.02em] text-text-primary"
          >
            <span className="headline-text">
              Seu município não precisa fazer isso{' '}
            </span>
            <span
              ref={sozinhoRef}
              style={{
                background: 'linear-gradient(135deg, #2196C9, #28A87A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline',
              }}
            >
              sozinho.
            </span>
          </h1>

          <p
            ref={subRef}
            className="mt-7 text-[18px] leading-[1.7] text-text-secondary mx-auto max-w-2xl"
          >
            A Rede Geronto acompanha municípios em cada etapa — do diagnóstico
            inicial à gestão contínua do Fundo do Idoso e do Programa Cidade
            Amiga. O escopo é sempre definido em conjunto, adaptado ao porte e
            momento do seu município.
          </p>

          <div
            ref={ctaRef}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <Button href="#formulario" variant="primary" size="lg">
              Solicitar proposta personalizada
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
