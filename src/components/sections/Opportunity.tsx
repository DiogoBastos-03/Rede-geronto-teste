import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  FileText,
  Scale,
  Building2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import SectionLabel from '../ui/SectionLabel';

const benefits = [
  {
    icon: FileText,
    text: 'Captar doações via declaração do Imposto de Renda',
  },
  {
    icon: Scale,
    text: 'Ter instrumento legal para políticas públicas voltadas ao idoso',
  },
  {
    icon: Building2,
    text: 'Engajar empresas e entidades locais como doadores',
  },
  {
    icon: ShieldCheck,
    text: 'Garantir transparência e controle social nas aplicações',
  },
  {
    icon: Sparkles,
    text: 'Construir a base para tornar o município uma Cidade Amiga do Idoso',
  },
];

export default function Opportunity() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const blobRef = useRef<HTMLDivElement | null>(null);

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
        listRef.current?.querySelectorAll('[data-benefit]') ?? [],
        { opacity: 0, x: 40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.85,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: listRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        },
      );

      // Parallax on blob
      if (blobRef.current) {
        gsap.to(blobRef.current, {
          y: -60,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
      }

      // Hover behaviors per item
      if (window.innerWidth >= 768) {
        const items =
          listRef.current?.querySelectorAll<HTMLLIElement>('[data-benefit]') ??
          [];
        items.forEach((item) => {
          const arrow = item.querySelector('[data-arrow]');
          const enter = () => {
            gsap.to(arrow, {
              x: 0,
              autoAlpha: 1,
              duration: 0.35,
              ease: 'power3.out',
            });
            gsap.to(item, {
              backgroundColor: 'rgba(12,74,140,0.03)',
              duration: 0.3,
            });
          };
          const leave = () => {
            gsap.to(arrow, {
              x: -8,
              autoAlpha: 0,
              duration: 0.3,
              ease: 'power3.in',
            });
            gsap.to(item, {
              backgroundColor: 'rgba(0,0,0,0)',
              duration: 0.3,
            });
          };
          item.addEventListener('pointerenter', enter);
          item.addEventListener('pointerleave', leave);
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="oportunidade"
      ref={sectionRef}
      aria-labelledby="oportunidade-heading"
      className="relative py-[120px] lg:py-[140px] overflow-hidden bg-white"
    >
      <div
        ref={blobRef}
        aria-hidden="true"
        className="absolute right-[-10%] top-[10%] w-[600px] h-[500px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 500px 400px at center, rgba(40,168,122,0.10), transparent 70%)',
        }}
      />

      <div className="container-x relative">
        <div ref={headRef} className="max-w-3xl mb-14">
          <SectionLabel tone="green">A oportunidade</SectionLabel>
          <h2
            id="oportunidade-heading"
            className="mt-5 text-[32px] sm:text-[40px] lg:text-[44px] font-medium leading-[1.15] tracking-[-0.02em] text-text-primary"
          >
            O que um Fundo do Idoso muda na prática?
          </h2>
          <p className="mt-6 text-[17px] leading-[1.7] text-text-secondary">
            Com o fundo estruturado, seu município passa a:
          </p>
        </div>

        <ul
          ref={listRef}
          role="list"
          className="max-w-5xl divide-y divide-[rgba(12,74,140,0.08)] border-y border-[rgba(12,74,140,0.08)]"
        >
          {benefits.map(({ icon: Icon, text }, i) => (
            <li
              key={i}
              data-benefit
              className="group flex items-center gap-5 py-6 md:py-7 px-2 md:px-3 cursor-default"
            >
              <span className="inline-flex w-11 h-11 shrink-0 rounded-full bg-white items-center justify-center border border-[rgba(12,74,140,0.08)]">
                <Icon size={20} className="text-blue-deep" aria-hidden="true" />
              </span>
              <span className="flex-1 text-[17px] leading-[1.5] text-text-primary">
                {text}
              </span>
              <span
                data-arrow
                aria-hidden="true"
                className="text-blue-deep opacity-0 -translate-x-2 inline-flex"
              >
                <ArrowRight size={20} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
