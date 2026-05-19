import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import SectionLabel from '../ui/SectionLabel';
import elderlySvg from '../../assets/elderly.svg';

/**
 * Recursively wrap each word in a text node with a span (for stagger anim),
 * while preserving existing element children (e.g. highlight spans).
 */
function wrapWordsPreservingMarkup(root: HTMLElement) {
  if (root.dataset.split === '1') return;
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? '';
      if (!text.trim()) return;
      const parts = text.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      parts.forEach((p) => {
        if (!p) return;
        if (/^\s+$/.test(p)) {
          frag.appendChild(document.createTextNode(p));
        } else {
          const span = document.createElement('span');
          span.className = 'word-anim';
          span.style.display = 'inline-block';
          span.textContent = p;
          frag.appendChild(span);
        }
      });
      node.parentNode?.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(walk);
    }
  };
  Array.from(root.childNodes).forEach(walk);
  root.dataset.split = '1';
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const blobBlueRef = useRef<HTMLDivElement | null>(null);
  const blobGreenRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const subRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const solutionRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Wrap each word of the headline in span for stagger (preserves highlight markup)
      const textSpan = headlineRef.current?.querySelector(
        '.headline-text',
      ) as HTMLElement | null;
      if (textSpan) wrapWordsPreservingMarkup(textSpan);

      // Initial states
      gsap.set(canvasWrapRef.current, { x: 100, autoAlpha: 0 });
      gsap.set(labelRef.current, { y: 24, autoAlpha: 0 });
      gsap.set('.word-anim', { y: 30, autoAlpha: 0 });
      gsap.set(subRef.current, { y: 16, autoAlpha: 0 });
      gsap.set(ctaRef.current, { scale: 0.8, autoAlpha: 0 });
      gsap.set(blobBlueRef.current, { autoAlpha: 0, scale: 0.85 });
      gsap.set(blobGreenRef.current, { autoAlpha: 0, scale: 0.85 });
      gsap.set(solutionRef.current, { autoAlpha: 0 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to(overlayRef.current, {
        autoAlpha: 0,
        duration: 0.6,
        ease: 'power2.out',
      })
        .to(
          [blobBlueRef.current, blobGreenRef.current],
          { autoAlpha: 1, scale: 1, duration: 1.4, stagger: 0.1 },
          0.1,
        )
        .to(
          canvasWrapRef.current,
          { x: 0, autoAlpha: 1, duration: 1.2, ease: 'expo.out' },
          0.3,
        )
        .to(labelRef.current, { y: 0, autoAlpha: 1, duration: 0.9 }, 0.3 + 0.5)
        .to(
          headlineRef.current?.querySelectorAll('.word-anim') ?? [],
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.85,
            stagger: 0.05,
            ease: 'power3.out',
          },
          0.3 + 0.7,
        )
        .to(subRef.current, { y: 0, autoAlpha: 1, duration: 0.8 }, 0.3 + 1.1)
        .to(
          ctaRef.current,
          { scale: 1, autoAlpha: 1, duration: 0.9, ease: 'expo.out' },
          0.3 + 1.3,
        )
        .to(
          solutionRef.current,
          { autoAlpha: 1, duration: 0.6, ease: 'power2.out' },
          0.3 + 1.2,
        );

      // Breathing pulse on the illustration (independent of entrance tween)
      gsap.to(canvasWrapRef.current, {
        scale: 1.03,
        duration: 3,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: 1.8,
        transformOrigin: 'center center',
      });

      // Parallax blobs on scroll (desktop only)
      if (!isMobile) {
        gsap.to(blobBlueRef.current, {
          y: -30,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
        gsap.to(blobGreenRef.current, {
          y: -50,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
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
      id="hero"
      ref={sectionRef}
      aria-labelledby="hero-heading"
      className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-white"
    >
      {/* Entrance overlay — fades out at mount */}
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
        className="absolute -z-0 left-[-10%] top-[10%] w-[700px] h-[500px] pointer-events-none"
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

      <div className="container-x relative">
        <div className="grid md:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[560px] md:min-h-[640px]">
          {/* Illustration — desktop/tablet */}
          <div className="hidden md:block md:col-span-6 lg:col-span-7 relative">
            <div
              ref={canvasWrapRef}
              className="hidden md:flex items-center justify-center will-change-transform"
            >
              <img
                src={elderlySvg}
                alt=""
                aria-hidden="true"
                className="w-full max-w-[520px] h-auto drop-shadow-xl"
                loading="eager"
              />
            </div>
          </div>

          {/* Mobile illustration */}
          <div className="md:hidden flex justify-center mb-6">
            <img
              src={elderlySvg}
              alt=""
              aria-hidden="true"
              className="w-64 h-auto"
              loading="eager"
            />
          </div>

          {/* Hero content */}
          <div className="md:col-span-6 lg:col-span-5">
            <span ref={labelRef} className="inline-block">
              <SectionLabel>Rede Geronto</SectionLabel>
            </span>
            <h1
              ref={headlineRef}
              id="hero-heading"
              className="mt-5 text-[36px] sm:text-[44px] lg:text-[52px] font-medium leading-[1.1] tracking-[-0.02em] text-text-primary"
            >
              <span className="headline-text">
                Seu município ainda não tem Fundo do Idoso. Isso tem{' '}
              </span>
              <span
                ref={solutionRef}
                style={{
                  background: 'linear-gradient(135deg, #2196C9, #28A87A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'inline',
                }}
              >
                solução.
              </span>
            </h1>
            <p
              ref={subRef}
              className="mt-6 text-[17px] leading-[1.65] text-text-secondary max-w-xl"
            >
              Mais da metade dos municípios brasileiros ainda não criaram o
              Fundo de Direitos da Pessoa Idosa — e estão deixando de acessar
              milhões em recursos que já existem, esperando para ser usados.
            </p>
            <div
              ref={ctaRef}
              className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 origin-left"
            >
              <Button href="/diagnostico" variant="primary" size="lg">
                Fazer Diagnóstico Gratuito
                <ArrowRight size={18} aria-hidden="true" />
              </Button>
              <Button href="#problema" variant="ghost" size="lg">
                Entenda o cenário
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
