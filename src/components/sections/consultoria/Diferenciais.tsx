import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Compass, Network, GraduationCap, Layers } from 'lucide-react';
import SectionLabel from '../../ui/SectionLabel';

interface Diferencial {
  Icon: typeof Compass;
  title: string;
  description: string;
}

const diferenciais: Diferencial[] = [
  {
    Icon: Compass,
    title: 'Expertise Técnica',
    description:
      'Especialistas em gerontologia e políticas públicas com experiência comprovada em municípios brasileiros.',
  },
  {
    Icon: Network,
    title: 'Rede de Contatos',
    description:
      'Acesso a gestores de estados com fundos já implementados — benchmarking real, não teoria.',
  },
  {
    Icon: GraduationCap,
    title: 'Credibilidade Acadêmica',
    description:
      'Pesquisas e publicações científicas reconhecidas na área de envelhecimento que embasam cada recomendação.',
  },
  {
    Icon: Layers,
    title: 'Abordagem Integrada',
    description:
      'Perspectiva interdisciplinar que considera os aspectos jurídicos, sociais e políticos de cada município.',
  },
];

export default function Diferenciais() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const gridRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      // Label
      gsap.set(labelRef.current, { y: 20, autoAlpha: 0 });
      gsap.fromTo(
        labelRef.current,
        { y: 20, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: labelRef.current,
            start: 'top 85%',
            once: true,
          },
        },
      );

      // Title clip-path reveal
      if (titleRef.current) {
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

      // Cards
      const cards = gridRef.current?.querySelectorAll('[data-dif-card]') ?? [];
      gsap.set(cards, { y: 60, autoAlpha: 0 });
      gsap.fromTo(
        cards,
        { y: 60, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 82%',
            once: true,
          },
        },
      );

      // Hover y: -6 + shadow
      if (!isMobile) {
        cards.forEach((card) => {
          const el = card as HTMLElement;
          const baseShadow = '0 4px 24px rgba(12,74,140,0.06)';
          el.addEventListener('pointerenter', () => {
            gsap.to(el, {
              y: -6,
              boxShadow: '0 16px 40px rgba(12,74,140,0.15)',
              duration: 0.25,
              ease: 'power2.out',
            });
          });
          el.addEventListener('pointerleave', () => {
            gsap.to(el, {
              y: 0,
              boxShadow: baseShadow,
              duration: 0.25,
              ease: 'power2.out',
            });
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
      id="diferenciais"
      ref={sectionRef}
      aria-labelledby="diferenciais-heading"
      className="relative py-[120px] lg:py-[140px]"
      style={{ backgroundColor: '#F0F7FF' }}
    >
      <div className="container-x">
        <div className="max-w-3xl mb-14 lg:mb-20">
          <span ref={labelRef} className="inline-block">
            <SectionLabel>Por que escolher a Rede Geronto</SectionLabel>
          </span>
          <div className="mt-5 overflow-hidden" style={{ paddingBottom: '4px' }}>
            <h2
              ref={titleRef}
              id="diferenciais-heading"
              className="text-[32px] sm:text-[40px] lg:text-[44px] font-medium leading-[1.15] tracking-[-0.02em] text-text-primary"
            >
              Expertise que transforma intenção em{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #0C4A8C, #2196C9)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'inline',
                }}
              >
                resultado.
              </span>
            </h2>
          </div>
        </div>

        <ul
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6"
          role="list"
        >
          {diferenciais.map(({ Icon, title, description }, i) => (
            <li
              key={i}
              data-dif-card
              className="rounded-[20px] bg-white p-7 lg:p-7 flex flex-col gap-4 will-change-transform"
              style={{
                border: '1px solid rgba(12,74,140,0.08)',
                boxShadow: '0 4px 24px rgba(12,74,140,0.06)',
              }}
            >
              <span
                className="inline-flex w-12 h-12 rounded-full items-center justify-center"
                style={{
                  backgroundColor: 'rgba(12,74,140,0.08)',
                  color: '#0C4A8C',
                }}
                aria-hidden="true"
              >
                <Icon size={22} />
              </span>
              <h3 className="text-[18px] lg:text-[19px] font-medium text-text-primary leading-snug tracking-[-0.01em]">
                {title}
              </h3>
              <p className="text-[14px] leading-[1.65] text-text-secondary">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
