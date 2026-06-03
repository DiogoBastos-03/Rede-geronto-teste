import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionLabel from '../ui/SectionLabel';
import Button from '../ui/Button';
import RecursoCard from './RecursoCard';
import type { Recurso } from './RecursoCard';
import recursosData from '../../data/recursos.json';

gsap.registerPlugin(ScrollTrigger);

const recursos = recursosData.recursos as Recurso[];
const _meta = recursosData._meta;
const destaques = recursos.filter((r) => r.destaque === true);

export default function RecursosTeaser() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headRef    = useRef<HTMLDivElement | null>(null);
  const statsRef   = useRef<HTMLDivElement | null>(null);
  const gridRef    = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Head children
      if (headRef.current) {
        gsap.fromTo(
          headRef.current.children,
          { y: 24, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headRef.current,
              start: 'top 85%',
              once: true,
            },
          },
        );
      }

      // Stats
      if (statsRef.current) {
        gsap.fromTo(
          statsRef.current.querySelectorAll('[data-stat]'),
          { y: 20, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 85%',
              once: true,
            },
          },
        );
      }

      // Grid cards
      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current.querySelectorAll('[data-card]'),
          { y: 32, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            stagger: 0.09,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 85%',
              once: true,
            },
          },
        );
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
      className="py-[120px] lg:py-[140px] bg-[#F0F7FF]"
    >
      <div className="container-x">
        {/* Header */}
        <div ref={headRef} className="max-w-3xl mb-12">
          <SectionLabel>Recursos Educativos</SectionLabel>
          <h2
            id="recursos-teaser-heading"
            className="mt-5 text-[32px] sm:text-[40px] font-medium leading-[1.15] tracking-[-0.02em] text-text-primary"
          >
            Tudo para implementar o Fundo Municipal
          </h2>
          <p className="mt-5 text-[17px] leading-[1.7] text-text-secondary">
            Legislação, cartilhas oficiais, modelos de documentos e guias técnicos — reunidos em um só lugar.
          </p>
        </div>

        {/* Stats — 2×2 mobile / 1×4 desktop */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14"
        >
          {_meta.stats.map((s) => (
            <div
              key={s.label}
              data-stat
              className="rounded-[16px] bg-white px-5 py-6 flex flex-col gap-1"
              style={{
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              }}
            >
              <span
                className="text-[40px] font-bold leading-none"
                style={{
                  background: 'linear-gradient(135deg,#0C4A8C,#2196C9)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'inline-block',
                }}
              >
                {s.n}
              </span>
              <span className="text-[13px] text-text-secondary">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Preview — 4 destaques, compact */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {destaques.slice(0, 4).map((r) => (
            <div key={r.id} data-card>
              <RecursoCard recurso={r} compact />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button href="/recursos" variant="primary" size="lg">
            Ver biblioteca completa
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}
