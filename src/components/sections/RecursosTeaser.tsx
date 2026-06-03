import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, CheckCircle2, ExternalLink, Star } from 'lucide-react';
import SectionLabel from '../ui/SectionLabel';
import Button from '../ui/Button';
import recursosData from '../../data/recursos.json';
import type { Recurso } from './RecursoCard';

const { _meta, recursos } = recursosData as {
  _meta: typeof recursosData._meta;
  recursos: Recurso[];
};

const destaques = recursos.filter((r) => r.destaque).slice(0, 4);

const gradientText = {
  background: 'linear-gradient(135deg, #0C4A8C, #2196C9)',
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent' as const,
  backgroundClip: 'text' as const,
  display: 'inline-block' as const,
};

const CAT_STYLE: Record<string, { bg: string; text: string }> = {
  legislacao: { bg: '#DBEAFE', text: '#1E40AF' },
  cartilhas:  { bg: '#D1FAE5', text: '#065F46' },
  modelos:    { bg: '#EDE9FE', text: '#5B21B6' },
  guias:      { bg: '#FEF3C7', text: '#92400E' },
};

// ── Inline showcase card ───────────────────────────────────────────────────────

function ShowcaseCard({ recurso, featured = false }: { recurso: Recurso; featured?: boolean }) {
  const cat = CAT_STYLE[recurso.categoria] ?? CAT_STYLE.guias;
  return (
    <div
      className={`flex flex-col rounded-[20px] bg-white overflow-hidden h-full ${
        featured
          ? 'shadow-[0_8px_32px_rgba(12,74,140,0.12)]'
          : 'shadow-[0_4px_16px_rgba(0,0,0,0.07)]'
      }`}
      style={{
        border: featured
          ? '1px solid rgba(12,74,140,0.12)'
          : '1px solid rgba(0,0,0,0.07)',
      }}
    >
      <div className="px-4 pt-4 pb-2 flex flex-wrap gap-1.5">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
          style={{ backgroundColor: cat.bg, color: cat.text }}
        >
          {recurso.tipo}
        </span>
        {recurso.badge && (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
            style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}
          >
            {recurso.badge}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 px-4 pb-5 gap-2">
        <h3
          className={`font-semibold text-text-primary leading-snug ${
            featured ? 'text-[15px]' : 'text-[13px]'
          }`}
        >
          {recurso.titulo}
        </h3>

        {featured && (
          <p className="text-[13px] leading-relaxed text-text-secondary flex-1">
            {recurso.descricao}
          </p>
        )}

        <p className="text-[11px] mt-auto" style={{ color: '#9CA3AF' }}>
          {recurso.fonte} · {recurso.ano}
        </p>

        {featured && (
          <div className="mt-2">
            {recurso.acao === 'acessar' ? (
              <a
                href={recurso.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-[12px] font-medium"
                style={{ backgroundColor: '#EBF4FF', color: '#0C4A8C', border: '1px solid #BFDBFE' }}
              >
                Acessar
                <ExternalLink size={12} aria-hidden="true" />
              </a>
            ) : (
              <a
                href="/contato"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-[12px] font-medium"
                style={{ backgroundColor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}
              >
                Solicitar
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function RecursosTeaser() {
  const sectionRef  = useRef<HTMLElement | null>(null);
  const headRef     = useRef<HTMLDivElement | null>(null);
  const statsRef    = useRef<HTMLDivElement | null>(null);
  const credRef     = useRef<HTMLDivElement | null>(null);
  const ctaRef      = useRef<HTMLDivElement | null>(null);
  const showcaseRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Left column animations ─────────────────────────────────────────────
      const headChildren = Array.from(headRef.current?.children ?? []);
      gsap.set(headChildren, { y: 28, autoAlpha: 0 });
      gsap.fromTo(headChildren, { y: 28, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1,
        duration: 0.9, stagger: 0.12, ease: 'power3.out', immediateRender: false,
        scrollTrigger: { trigger: headRef.current, start: 'top 80%', once: true },
      });

      const statItems = statsRef.current?.querySelectorAll('[data-stat]') ?? [];
      gsap.set(statItems, { y: 20, autoAlpha: 0 });
      gsap.fromTo(statItems, { y: 20, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1,
        duration: 0.7, stagger: 0.08, ease: 'power3.out', immediateRender: false,
        scrollTrigger: { trigger: statsRef.current, start: 'top 82%', once: true },
      });

      gsap.set(credRef.current, { y: 12, autoAlpha: 0 });
      gsap.fromTo(credRef.current, { y: 12, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', immediateRender: false,
        scrollTrigger: { trigger: credRef.current, start: 'top 85%', once: true },
      });

      gsap.set(ctaRef.current, { y: 12, scale: 0.96, autoAlpha: 0 });
      gsap.fromTo(ctaRef.current, { y: 12, scale: 0.96, autoAlpha: 0 }, {
        y: 0, scale: 1, autoAlpha: 1, duration: 0.8, ease: 'expo.out', immediateRender: false,
        scrollTrigger: { trigger: ctaRef.current, start: 'top 88%', once: true },
      });

      // ── Right column — showcase stagger ───────────────────────────────────
      const cards = showcaseRef.current?.querySelectorAll('[data-showcase]') ?? [];
      gsap.set(cards, { y: 48, autoAlpha: 0 });
      gsap.fromTo(cards, { y: 48, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1,
        duration: 0.85, stagger: 0.14, ease: 'power3.out', immediateRender: false,
        scrollTrigger: { trigger: showcaseRef.current, start: 'top 78%', once: true },
      });

      // Hover lift on desktop
      if (window.innerWidth >= 768) {
        cards.forEach((card) => {
          const el = card as HTMLElement;
          el.addEventListener('pointerenter', () =>
            gsap.to(el, { y: -6, boxShadow: '0 20px 40px rgba(12,74,140,0.16)', duration: 0.3, ease: 'power2.out' }),
          );
          el.addEventListener('pointerleave', () =>
            gsap.to(el, { y: 0, boxShadow: '', duration: 0.3, ease: 'power2.out' }),
          );
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
      id="recursos"
      ref={sectionRef}
      aria-labelledby="recursos-teaser-heading"
      className="relative py-[120px] lg:py-[140px] overflow-hidden"
      style={{ backgroundColor: '#F8FAFB' }}
    >
      {/* Decorative blob */}
      <div
        aria-hidden="true"
        className="absolute -z-0 right-[-12%] top-[10%] w-[600px] h-[500px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 500px 400px at center, rgba(33,150,201,0.07), transparent 70%)',
        }}
      />

      <div className="container-x relative">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">

          {/* ── Left column (5/12) ── */}
          <div className="lg:col-span-5 flex flex-col gap-8">

            {/* Header block */}
            <div ref={headRef}>
              <SectionLabel>Recursos Educativos</SectionLabel>
              <h2
                id="recursos-teaser-heading"
                className="mt-5 text-[32px] sm:text-[40px] lg:text-[44px] font-medium leading-[1.15] tracking-[-0.02em] text-text-primary"
              >
                Tudo para implementar{' '}
                <em className="font-serif italic font-normal" style={{ color: '#0C4A8C' }}>
                  o Fundo Municipal.
                </em>
              </h2>
              <p className="mt-5 text-[17px] leading-[1.65] text-text-secondary">
                Legislação, cartilhas do MDH, modelos jurídicos e guias técnicos — reunidos e verificados para apoiar gestores e técnicos municipais.
              </p>
            </div>

            {/* Stats 2×2 */}
            <div ref={statsRef} className="grid grid-cols-2 gap-3">
              {_meta.stats.map((s) => (
                <div
                  key={s.label}
                  data-stat
                  className="flex flex-col gap-1 rounded-[14px] p-4"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid rgba(0,0,0,0.07)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                >
                  <span
                    className="text-[36px] leading-none tracking-[-0.03em] font-extrabold"
                    style={gradientText}
                  >
                    {s.n}
                  </span>
                  <span className="text-[13px] text-text-secondary">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Credibility chip */}
            <div
              ref={credRef}
              className="flex items-start gap-2 text-[12px] leading-relaxed"
              style={{ color: '#5F5E5A' }}
            >
              <CheckCircle2
                size={15}
                aria-hidden="true"
                className="shrink-0 mt-0.5"
                style={{ color: '#28A87A' }}
              />
              <span>{_meta.fontesVerificadas}</span>
            </div>

          </div>

          {/* ── Right column (7/12) — showcase ── */}
          <div className="lg:col-span-7 flex flex-col gap-4 lg:justify-between" ref={showcaseRef}>

            {/* Section label */}
            <div className="flex items-center gap-2">
              <Star size={16} aria-hidden="true" style={{ color: '#F59E0B' }} />
              <span className="text-[13px] font-semibold text-text-primary">
                Documentos Essenciais
              </span>
            </div>

            {/* Featured card — first destaque */}
            <div data-showcase="0" className="will-change-transform cursor-default">
              <ShowcaseCard recurso={destaques[0]} featured />
            </div>

            {/* Three compact cards in a row */}
            <div className="grid grid-cols-3 gap-3">
              {destaques.slice(1, 4).map((doc, i) => (
                <div key={doc.id} data-showcase={i + 1} className="will-change-transform cursor-default">
                  <ShowcaseCard recurso={doc} />
                </div>
              ))}
            </div>

            {/* CTA — fecha a coluna direita, alinha com a base da esquerda */}
            <div ref={ctaRef} className="mt-auto pt-5 flex justify-center">
              <Button href="/recursos" variant="primary" size="lg">
                Ver biblioteca completa
                <ArrowRight size={18} aria-hidden="true" />
              </Button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
