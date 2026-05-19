import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  ArrowUpRight,
  Globe,
  Heart,
  Users,
  Building2,
  Bus,
  Home as HomeIcon,
} from 'lucide-react';
import Button from '../../ui/Button';
import SectionLabel from '../../ui/SectionLabel';
import { wrapWordsPreservingMarkup } from '../../../utils/wrapWords';

export default function CidadeAmigaHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const blobBlueRef = useRef<HTMLDivElement | null>(null);
  const blobGreenRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const destinoRef = useRef<HTMLSpanElement | null>(null);
  const subRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const visualRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      // Word-wrap the headline body, preserving the gradient span
      const textSpan = headlineRef.current?.querySelector(
        '.headline-text',
      ) as HTMLElement | null;
      if (textSpan) wrapWordsPreservingMarkup(textSpan, 'ca-hero-word');

      // Initial states
      gsap.set(labelRef.current, { y: 20, autoAlpha: 0 });
      gsap.set('.ca-hero-word', { y: 30, autoAlpha: 0 });
      gsap.set(destinoRef.current, { autoAlpha: 0 });
      gsap.set(subRef.current, { y: 16, autoAlpha: 0 });
      gsap.set(ctaRef.current?.children ?? [], { scale: 0.8, autoAlpha: 0 });
      gsap.set(blobBlueRef.current, { autoAlpha: 0, scale: 0.85 });
      gsap.set(blobGreenRef.current, { autoAlpha: 0, scale: 0.85 });
      gsap.set(visualRef.current, { x: 100, autoAlpha: 0 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to(overlayRef.current, {
        autoAlpha: 0,
        duration: 0.6,
        ease: 'power2.out',
      })
        .to(
          [blobBlueRef.current, blobGreenRef.current],
          { autoAlpha: 1, scale: 1, duration: 1.2, stagger: 0.1 },
          0.1,
        )
        .to(labelRef.current, { y: 0, autoAlpha: 1, duration: 0.8 }, 0.3)
        .to(
          visualRef.current,
          { x: 0, autoAlpha: 1, duration: 1.2, ease: 'expo.out' },
          0.8,
        )
        .to(
          '.ca-hero-word',
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.85,
            stagger: 0.05,
          },
          1.0,
        )
        .to(
          destinoRef.current,
          { autoAlpha: 1, duration: 0.6, ease: 'power2.out' },
          1.5,
        )
        .to(subRef.current, { y: 0, autoAlpha: 1, duration: 0.8 }, 1.4)
        .to(
          ctaRef.current?.children ?? [],
          {
            scale: 1,
            autoAlpha: 1,
            duration: 0.9,
            stagger: 0.1,
            ease: 'expo.out',
          },
          1.6,
        );

      if (!isMobile) {
        // Parallax blobs
        gsap.to(blobBlueRef.current, {
          y: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
        gsap.to(blobGreenRef.current, {
          y: -60,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
          },
        });

        // Floating icon composition — gentle parallax
        gsap.to(visualRef.current, {
          y: -20,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
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
      id="cidade-amiga-hero"
      ref={sectionRef}
      aria-labelledby="cidade-amiga-hero-heading"
      className="relative pt-28 md:pt-32 lg:pt-36 pb-20 md:pb-28 overflow-hidden bg-white"
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

      <div className="container-x relative">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center min-h-[520px]">
          {/* Text column */}
          <div className="lg:col-span-7">
            <span ref={labelRef} className="inline-block">
              <SectionLabel tone="green">Metodologia OMS</SectionLabel>
            </span>
            <h1
              ref={headlineRef}
              id="cidade-amiga-hero-heading"
              className="mt-5 text-[36px] sm:text-[44px] lg:text-[52px] font-medium leading-[1.1] tracking-[-0.02em] text-text-primary"
            >
              <span className="headline-text">
                O fundo é o começo. A Cidade Amiga do Idoso é o{' '}
              </span>
              <span
                ref={destinoRef}
                style={{
                  background: 'linear-gradient(135deg, #1A7A5E, #28A87A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'inline',
                }}
              >
                destino.
              </span>
            </h1>
            <p
              ref={subRef}
              className="mt-6 text-[17px] leading-[1.65] text-text-secondary max-w-2xl"
            >
              Baseado no Guia Global da OMS e na Estratégia Brasil Amigo da
              Pessoa Idosa, o Programa Cidade Amiga orienta municípios a
              criarem ambientes urbanos inclusivos, seguros e participativos
              para a população com 60 anos ou mais.
            </p>
            <div
              ref={ctaRef}
              className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 origin-left"
            >
              <Button href="/diagnostico" variant="green" size="lg">
                Quero implementar no meu município
                <ArrowRight size={18} aria-hidden="true" />
              </Button>
              <Button
                href="https://extranet.who.int/agefriendlyworld/"
                variant="ghost"
                size="lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                Acessar o Guia Global OMS
                <ArrowUpRight size={18} aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* Decorative icon composition column */}
          <div
            className="lg:col-span-5 relative hidden md:block"
            aria-hidden="true"
          >
            <div
              ref={visualRef}
              className="relative mx-auto w-full max-w-[480px] aspect-square"
            >
              {/* Center large card */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 lg:w-32 lg:h-32 rounded-full flex items-center justify-center"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(12,74,140,0.10), rgba(26,122,94,0.10))',
                  border: '1px solid rgba(12,74,140,0.18)',
                  boxShadow: '0 8px 32px rgba(12,74,140,0.10)',
                }}
              >
                <Globe size={48} className="text-blue-deep" />
              </div>

              {/* Top */}
              <IconBubble
                className="left-1/2 top-[6%] -translate-x-1/2"
                size="md"
                tone="green"
              >
                <Heart size={26} />
              </IconBubble>

              {/* Right */}
              <IconBubble
                className="right-[4%] top-[28%]"
                size="lg"
                tone="blue"
              >
                <Users size={32} />
              </IconBubble>

              {/* Bottom right */}
              <IconBubble
                className="right-[10%] bottom-[10%]"
                size="sm"
                tone="green"
              >
                <Bus size={22} />
              </IconBubble>

              {/* Bottom */}
              <IconBubble
                className="left-1/2 bottom-[4%] -translate-x-1/2"
                size="md"
                tone="blue"
              >
                <Building2 size={26} />
              </IconBubble>

              {/* Bottom left */}
              <IconBubble
                className="left-[8%] bottom-[18%]"
                size="lg"
                tone="green"
              >
                <HomeIcon size={30} />
              </IconBubble>

              {/* Left */}
              <IconBubble
                className="left-[4%] top-[30%]"
                size="sm"
                tone="blue"
              >
                <Globe size={20} />
              </IconBubble>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type BubbleTone = 'blue' | 'green';
type BubbleSize = 'sm' | 'md' | 'lg';

interface BubbleProps {
  className?: string;
  tone: BubbleTone;
  size: BubbleSize;
  children: React.ReactNode;
}

function IconBubble({ className = '', tone, size, children }: BubbleProps) {
  const dims = {
    sm: 'w-14 h-14',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  }[size];
  const toneStyle: React.CSSProperties =
    tone === 'blue'
      ? {
          backgroundColor: 'rgba(12,74,140,0.08)',
          border: '1px solid rgba(12,74,140,0.12)',
          color: '#0C4A8C',
        }
      : {
          backgroundColor: 'rgba(26,122,94,0.08)',
          border: '1px solid rgba(26,122,94,0.14)',
          color: '#1A7A5E',
        };
  return (
    <div
      className={`absolute ${dims} rounded-full flex items-center justify-center ${className}`}
      style={{
        ...toneStyle,
        boxShadow:
          tone === 'blue'
            ? '0 4px 16px rgba(12,74,140,0.10)'
            : '0 4px 16px rgba(26,122,94,0.10)',
      }}
    >
      {children}
    </div>
  );
}
