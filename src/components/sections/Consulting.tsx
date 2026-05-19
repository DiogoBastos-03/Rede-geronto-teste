import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';
import SectionLabel from '../ui/SectionLabel';
import Button from '../ui/Button';

export default function Consulting() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        innerRef.current?.children ?? [],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.95,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 78%',
            toggleActions: 'play none none reverse',
          },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="consultoria"
      ref={sectionRef}
      aria-labelledby="consultoria-heading"
      className="py-[120px] lg:py-[140px] bg-white"
    >
      <div className="container-x">
        <div
          ref={innerRef}
          className="max-w-3xl mx-auto text-center"
        >
          <SectionLabel>Consultoria</SectionLabel>
          <h2
            id="consultoria-heading"
            className="mt-5 text-[32px] sm:text-[40px] font-medium leading-[1.15] tracking-[-0.02em] text-text-primary"
          >
            Seu município não precisa fazer isso sozinho
          </h2>
          <p className="mt-7 text-[17px] leading-[1.7] text-text-secondary">
            A Rede Geronto acompanha municípios em cada etapa — do diagnóstico
            inicial até a gestão contínua do fundo. Temos pacotes adaptáveis ao
            porte e ao momento do seu município, definidos sempre em conjunto
            com a sua equipe.
          </p>
          <div className="mt-10 flex justify-center">
            <Button href="/consultoria" variant="secondary" size="lg">
              Conheça os pacotes de consultoria
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
