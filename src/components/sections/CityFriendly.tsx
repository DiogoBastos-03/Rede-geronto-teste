import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';
import SectionLabel from '../ui/SectionLabel';
import Button from '../ui/Button';
import { EIXOS } from '../../data/eixos';

export default function CityFriendly() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        leftRef.current,
        { opacity: 0, x: -60 },
        {
          opacity: 1,
          x: 0,
          duration: 1.1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        },
      );

      gsap.fromTo(
        rightRef.current,
        { opacity: 0, x: 60 },
        {
          opacity: 1,
          x: 0,
          duration: 1.1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        },
      );

      gsap.fromTo(
        rightRef.current?.querySelectorAll('[data-pillar]') ?? [],
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
          delay: 0.4,
          scrollTrigger: {
            trigger: rightRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        },
      );

      // Hover on pillars
      if (window.innerWidth >= 768) {
        const items =
          rightRef.current?.querySelectorAll<HTMLLIElement>('[data-pillar]') ??
          [];
        items.forEach((item) => {
          const enter = () => {
            gsap.to(item, {
              scale: 1.05,
              boxShadow: '0 12px 28px rgba(26,122,94,0.18)',
              duration: 0.3,
              ease: 'power2.out',
            });
          };
          const leave = () => {
            gsap.to(item, {
              scale: 1,
              boxShadow: '0 0 0 rgba(0,0,0,0)',
              duration: 0.3,
              ease: 'power2.out',
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
      id="cidade-amiga"
      ref={sectionRef}
      aria-labelledby="cidade-amiga-heading"
      className="py-[120px] lg:py-[140px] overflow-hidden w-full"
      style={{ backgroundColor: '#F0F7FF' }}
    >
      <div className="container-x max-w-full px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div ref={leftRef} className="lg:col-span-6 min-w-0">
            <SectionLabel tone="green">Cidade Amiga do Idoso</SectionLabel>
            <h2
              id="cidade-amiga-heading"
              className="mt-5 text-[28px] sm:text-[40px] lg:text-[44px] font-medium leading-[1.15] tracking-[-0.02em] text-text-primary break-words hyphens-auto"
            >
              O fundo é o começo. A Cidade Amiga do Idoso é o{' '}
              <em className="font-serif italic text-green-water font-normal">
                destino.
              </em>
            </h2>
            <div className="mt-6 space-y-5 text-[16px] sm:text-[17px] leading-[1.7] text-text-secondary break-words">
              <p>
                Municípios com recursos estruturados podem ir além — e
                transformar o jeito como a cidade inteira se relaciona com a
                população idosa. Transporte acessível, saúde próxima, espaços
                de convivência, participação social. Isso é o que a metodologia
                da OMS chama de Cidade Amiga do Idoso.
              </p>
              <p>
                Com o Fundo criado e funcionando, seu município tem a base
                financeira e institucional para embarcar nessa jornada.
              </p>
            </div>
            <div className="mt-10 max-w-full">
              <Button
                href="/cidade-amiga"
                variant="green"
                size="lg"
                className="max-w-full !whitespace-normal text-center sm:!whitespace-nowrap"
              >
                Conheça o programa Cidade Amiga do Idoso
                <ArrowRight size={18} aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div ref={rightRef} className="lg:col-span-6 min-w-0">
            <div
              className="rounded-[20px] p-7 lg:p-9 bg-white"
              style={{
                border: '1px solid #5DCAA5',
                boxShadow: '0 8px 32px rgba(26,122,94,0.12)',
              }}
            >
              <p className="text-[12px] font-medium uppercase tracking-[1.2px] text-green-forest">
                Metodologia OMS
              </p>
              <p className="mt-2 text-[22px] font-medium text-text-primary tracking-[-0.01em]">
                Pilares de uma Cidade Amiga
              </p>
              <ul className="mt-7 grid grid-cols-2 gap-2.5" role="list">
                {EIXOS.map(({ number, title, Icon }) => (
                  <li
                    key={number}
                    data-pillar
                    className="flex items-center gap-2.5 p-3 rounded-[12px] bg-green-light cursor-default"
                  >
                    <span className="inline-flex w-8 h-8 shrink-0 rounded-full bg-white items-center justify-center border border-green-border">
                      <Icon
                        size={15}
                        className="text-green-forest"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="text-[12px] font-medium leading-snug text-text-primary">
                      {title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
