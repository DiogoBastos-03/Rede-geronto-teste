import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import SectionLabel from '../ui/SectionLabel';
import heroImage from '../../assets/heroGerontoEdit.png';

/**
 * Recursively wrap each word in a text node with a span (for stagger anim),
 * preserving existing element children (e.g. gradient highlight spans).
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
  const sectionRef  = useRef<HTMLElement | null>(null);
  const overlayRef  = useRef<HTMLDivElement | null>(null);
  const labelRef    = useRef<HTMLSpanElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const subRef      = useRef<HTMLParagraphElement | null>(null);
  const ctaRef      = useRef<HTMLDivElement | null>(null);
  const solutionRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Word-split headline preserving gradient <span>
      const textSpan = headlineRef.current?.querySelector(
        '.headline-text',
      ) as HTMLElement | null;
      if (textSpan) wrapWordsPreservingMarkup(textSpan);

      // Initial hidden states
      gsap.set(labelRef.current,    { y: 24, autoAlpha: 0 });
      gsap.set('.word-anim',        { y: 30, autoAlpha: 0 });
      gsap.set(subRef.current,      { y: 16, autoAlpha: 0 });
      gsap.set(ctaRef.current,      { y: 12, autoAlpha: 0 });
      // Use opacity only (not autoAlpha) — autoAlpha sets visibility:hidden which
      // breaks WebkitBackgroundClip:'text' when toggled back to visible on Webkit.
      gsap.set(solutionRef.current, { opacity: 0 });

      // Entrance timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // 1. Fade the dark entrance overlay out
      tl.to(overlayRef.current, {
        autoAlpha: 0,
        duration: 0.7,
        ease: 'power2.out',
      })
        // 2. Section label
        .to(labelRef.current, { y: 0, autoAlpha: 1, duration: 0.9 }, 0.5)
        // 3. Headline words stagger
        .to(
          headlineRef.current?.querySelectorAll('.word-anim') ?? [],
          { y: 0, autoAlpha: 1, duration: 0.85, stagger: 0.05 },
          0.7,
        )
        // 4. Gradient "solução." — opacity only, never touch visibility
        .to(
          solutionRef.current,
          { opacity: 1, duration: 0.6, ease: 'power2.out' },
          0.9,
        )
        // 5. Subheadline
        .to(subRef.current, { y: 0, autoAlpha: 1, duration: 0.8 }, 1.1)
        // 6. CTAs
        .to(
          ctaRef.current,
          { y: 0, autoAlpha: 1, duration: 0.85, ease: 'expo.out' },
          1.3,
        );
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
      className="relative min-h-screen flex items-center overflow-hidden [background-position:30%_center] md:[background-position:center_center]"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* ── Entrance overlay (dark → transparent at mount) ── */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="fixed inset-0 z-[60] pointer-events-none"
        style={{ backgroundColor: '#0a0f1a' }}
      />

      {/* ── Content ── */}
      <div className="container-x relative z-10 flex justify-end w-full">
        <div className="w-full md:w-1/2 flex flex-col justify-center py-36 md:py-32">

          {/* Label */}
          <span ref={labelRef} className="inline-block">
            <SectionLabel
              tone="neutral"
              className="!text-white/70 !tracking-[1.6px]"
            >
              Rede Geronto
            </SectionLabel>
          </span>

          {/* Headline */}
          <h1
            ref={headlineRef}
            id="hero-heading"
            className="mt-5 text-[36px] sm:text-[44px] lg:text-[52px] font-medium leading-[1.1] tracking-[-0.02em]"
            style={{ color: '#FFFFFF' }}
          >
            <span className="headline-text">
              Seu município ainda não tem Fundo do Idoso? Isso tem{' '}
            </span>
            <span
              ref={solutionRef}
              style={{
                color: '#52D9A8',
                display: 'inline',
              }}
            >
              solução.
            </span>
          </h1>

          {/* Subheadline */}
          <p
            ref={subRef}
            className="mt-6 text-[17px] leading-[1.65] max-w-xl"
            style={{ color: 'rgba(255,255,255,0.80)' }}
          >
            Mais da metade dos municípios brasileiros ainda não criaram o Fundo
            de Direitos da Pessoa Idosa — e estão deixando de acessar milhões
            em recursos, que já existem, esperando para serem usados.
          </p>

          {/* CTAs */}
          <div
            ref={ctaRef}
            className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <Button href="/diagnostico" variant="primary" size="lg">
              Fazer Diagnóstico Gratuito
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
            <a
              href="#problema"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: '1.5px solid rgba(255,255,255,0.7)',
                color: '#FFFFFF',
                padding: '12px 28px',
                borderRadius: '100px',
                fontSize: '15px',
                fontWeight: 500,
                cursor: 'pointer',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'background 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background =
                  'rgba(255,255,255,0.12)';
                (e.currentTarget as HTMLAnchorElement).style.borderColor =
                  'rgba(255,255,255,0.9)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background =
                  'transparent';
                (e.currentTarget as HTMLAnchorElement).style.borderColor =
                  'rgba(255,255,255,0.7)';
              }}
            >
              Entenda o cenário
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
