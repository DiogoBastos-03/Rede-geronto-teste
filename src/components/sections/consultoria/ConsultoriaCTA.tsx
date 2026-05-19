import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import SectionLabel from '../../ui/SectionLabel';
import { wrapWordsPreservingMarkup } from '../../../utils/wrapWords';

export default function ConsultoriaCTA() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const subRef = useRef<HTMLParagraphElement | null>(null);
  const ctasRef = useRef<HTMLDivElement | null>(null);
  const blobRef = useRef<HTMLDivElement | null>(null);
  const primaryRef = useRef<HTMLAnchorElement | null>(null);
  const secondaryRef = useRef<HTMLAnchorElement | null>(null);
  const secondaryFillRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      if (headlineRef.current) {
        wrapWordsPreservingMarkup(headlineRef.current, 'consult-cta-word');
      }

      gsap.set('.consult-cta-word', { y: 30, autoAlpha: 0 });
      gsap.set(subRef.current, { y: 20, autoAlpha: 0 });
      gsap.set(ctasRef.current?.children ?? [], {
        scale: 0.8,
        autoAlpha: 0,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          once: true,
        },
        defaults: { ease: 'power3.out' },
      });
      tl.to('.consult-cta-word', {
        y: 0,
        autoAlpha: 1,
        duration: 0.85,
        stagger: 0.05,
      })
        .to(subRef.current, { y: 0, autoAlpha: 1, duration: 0.8 }, '-=0.4')
        .to(
          ctasRef.current?.children ?? [],
          {
            scale: 1,
            autoAlpha: 1,
            duration: 0.9,
            stagger: 0.1,
            ease: 'expo.out',
          },
          '-=0.3',
        );

      if (blobRef.current) {
        gsap.to(blobRef.current, {
          y: 60,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        });
      }

      if (!isMobile) {
        if (primaryRef.current) {
          const el = primaryRef.current;
          const base = window.getComputedStyle(el).boxShadow;
          el.addEventListener('pointerenter', () =>
            gsap.to(el, {
              scale: 1.04,
              boxShadow: '0 14px 32px rgba(0,0,0,0.30)',
              duration: 0.3,
              ease: 'power2.out',
            }),
          );
          el.addEventListener('pointerleave', () =>
            gsap.to(el, {
              scale: 1,
              boxShadow: base,
              duration: 0.3,
              ease: 'power2.out',
            }),
          );
        }
        if (secondaryRef.current && secondaryFillRef.current) {
          const el = secondaryRef.current;
          const fill = secondaryFillRef.current;
          const label = el.querySelector('.btn-label-consult-cta');
          el.addEventListener('pointerenter', () => {
            gsap.to(fill, {
              scaleX: 1,
              duration: 0.45,
              ease: 'power3.out',
            });
            gsap.to(label, {
              color: '#0C4A8C',
              duration: 0.3,
              ease: 'power2.out',
            });
          });
          el.addEventListener('pointerleave', () => {
            gsap.to(fill, {
              scaleX: 0,
              duration: 0.4,
              ease: 'power3.in',
            });
            gsap.to(label, {
              color: '#ffffff',
              duration: 0.3,
              ease: 'power2.out',
            });
          });
        }
      }
    }, sectionRef);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section
      id="consultoria-cta"
      ref={sectionRef}
      aria-labelledby="consultoria-cta-heading"
      className="relative py-[140px] lg:py-[160px] overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #0C4A8C 0%, #0A3D6E 50%, #1A7A5E 100%)',
      }}
    >
      <div
        ref={blobRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 700px 500px at 50% 40%, rgba(255,255,255,0.10), transparent 70%)',
        }}
      />

      <div className="container-x relative">
        <div className="max-w-3xl mx-auto text-center">
          <SectionLabel tone="neutral" className="!text-white/75">
            Antes de qualquer consultoria
          </SectionLabel>
          <h2
            ref={headlineRef}
            id="consultoria-cta-heading"
            className="mt-5 text-[36px] sm:text-[44px] lg:text-[52px] font-bold leading-[1.1] tracking-[-0.02em] text-white"
            style={{ fontWeight: 700 }}
          >
            Não sabe por onde começar?
          </h2>
          <p
            ref={subRef}
            className="mt-7 text-[17px] leading-[1.7] max-w-2xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            O diagnóstico gratuito leva menos de 10 minutos e já entrega um
            caminho claro para o seu município. É o primeiro passo antes de
            qualquer consultoria.
          </p>

          <div
            ref={ctasRef}
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a
              ref={primaryRef}
              href="/diagnostico"
              className="inline-flex items-center justify-center gap-2 rounded-pill px-8 min-h-[52px] py-[15px] font-medium text-[16px] bg-white text-blue-deep cursor-pointer will-change-transform shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
            >
              Fazer Diagnóstico Gratuito
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a
              ref={secondaryRef}
              href="#pacotes"
              className="relative isolate inline-flex items-center justify-center rounded-pill px-8 min-h-[52px] py-[15px] font-medium text-[16px] cursor-pointer overflow-hidden"
              style={{ border: '2px solid rgba(255,255,255,0.85)' }}
            >
              <span
                ref={secondaryFillRef}
                aria-hidden="true"
                className="absolute inset-0 bg-white origin-left -z-10"
                style={{ transform: 'scaleX(0)' }}
              />
              <span className="btn-label-consult-cta relative z-10 inline-flex items-center gap-2 text-white">
                Ver pacotes em detalhe
                <ArrowRight size={18} aria-hidden="true" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
