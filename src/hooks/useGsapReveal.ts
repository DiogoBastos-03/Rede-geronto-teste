import { RefObject, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export interface RevealOptions {
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  stagger?: number;
  selector?: string;
  once?: boolean;
  start?: string;
  end?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  /** Disable on mobile width entirely (no animation) */
  disableOnMobile?: boolean;
  /** Run immediately without ScrollTrigger (used for in-view content on mount) */
  immediate?: boolean;
}

const MOBILE_BREAKPOINT = 768;

export function useGsapReveal<T extends HTMLElement = HTMLDivElement>(
  options: RevealOptions = {},
): RefObject<T> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const isMobile =
      typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;

    const {
      from = { opacity: 0, y: 40 },
      to = {},
      stagger = 0.12,
      selector,
      once = false,
      start = 'top 85%',
      end = 'bottom top',
      delay = 0,
      duration = 0.9,
      ease = 'power3.out',
      disableOnMobile = false,
      immediate = false,
    } = options;

    const targets: gsap.TweenTarget = selector
      ? Array.from(el.querySelectorAll(selector))
      : el;

    const targetCount = Array.isArray(targets)
      ? targets.length
      : 'length' in (targets as ArrayLike<unknown>)
        ? (targets as ArrayLike<unknown>).length
        : 1;
    if (targetCount === 0) return;

    if (isMobile && disableOnMobile) {
      gsap.set(targets, { clearProps: 'all', opacity: 1 });
      return;
    }

    // Mobile: simple fade only
    if (isMobile) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          targets,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.06,
            scrollTrigger: immediate
              ? undefined
              : {
                  trigger: el,
                  start,
                  once: true,
                },
            delay,
          },
        );
      }, el);
      return () => ctx.revert();
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        from,
        {
          opacity: 1,
          y: 0,
          x: 0,
          duration,
          ease,
          stagger,
          delay,
          ...to,
          scrollTrigger: immediate
            ? undefined
            : {
                trigger: el,
                start,
                end,
                toggleActions: once
                  ? 'play none none none'
                  : 'play none none reverse',
              },
        },
      );
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref as RefObject<T>;
}

/** Attaches GSAP scale-on-hover to a ref'd element. */
export function useGsapHoverScale<T extends HTMLElement = HTMLElement>(
  scale = 1.04,
  shadowBoost?: string,
): RefObject<T> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const isMobile =
      typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;
    if (isMobile) return;

    const baseShadow = window.getComputedStyle(el).boxShadow;
    const enter = () =>
      gsap.to(el, {
        scale,
        boxShadow: shadowBoost ?? baseShadow,
        duration: 0.3,
        ease: 'power2.out',
      });
    const leave = () =>
      gsap.to(el, {
        scale: 1,
        boxShadow: baseShadow,
        duration: 0.3,
        ease: 'power2.out',
      });

    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
    };
  }, [scale, shadowBoost]);

  return ref as RefObject<T>;
}
