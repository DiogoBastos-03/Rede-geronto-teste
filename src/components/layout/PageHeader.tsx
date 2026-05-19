import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import gsap from "gsap";
import Button from "../ui/Button";
import logo from "../../assets/logo.webp";

export interface PageHeaderLink {
  label: string;
  href: string;
}

interface PageHeaderProps {
  pageName: string;
  links: PageHeaderLink[];
}

const COLOR_DEFAULT = "#4A5568";
const COLOR_ACTIVE = "#0C4A8C";

export default function PageHeader({ pageName, links }: PageHeaderProps) {
  const headerRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Keep latest activeId in a ref so pointer handlers (set once) read fresh state
  const activeRef = useRef<string | null>(null);
  useEffect(() => {
    activeRef.current = activeId;
  }, [activeId]);

  // Scrolled-state shadow via GSAP
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    let scrolled = false;
    const apply = (next: boolean) => {
      if (next === scrolled) return;
      scrolled = next;
      gsap.to(el, {
        boxShadow: next
          ? "0 1px 24px rgba(0,0,0,0.08)"
          : "0 0px 0px rgba(0,0,0,0)",
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const onScroll = () => apply(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Animated underline + color hover on nav links (desktop only)
  useEffect(() => {
    if (window.innerWidth < 1024) return;
    const linkEls =
      headerRef.current?.querySelectorAll<HTMLAnchorElement>("[data-nav-link]");
    if (!linkEls) return;

    const cleanups: Array<() => void> = [];
    linkEls.forEach((link) => {
      const id = link.dataset.targetId ?? "";
      const underline = link.querySelector(".nav-underline") as HTMLSpanElement;
      const enter = () => {
        gsap.to(link, {
          color: COLOR_ACTIVE,
          duration: 0.25,
          ease: "power2.out",
        });
        gsap.to(underline, {
          scaleX: 1,
          duration: 0.35,
          ease: "power3.out",
        });
      };
      const leave = () => {
        const isActive = activeRef.current === id;
        gsap.to(link, {
          color: isActive ? COLOR_ACTIVE : COLOR_DEFAULT,
          duration: 0.25,
          ease: "power2.out",
        });
        gsap.to(underline, {
          scaleX: isActive ? 1 : 0,
          duration: 0.3,
          ease: "power3.in",
        });
      };
      link.addEventListener("pointerenter", enter);
      link.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        link.removeEventListener("pointerenter", enter);
        link.removeEventListener("pointerleave", leave);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  // Reflect activeId changes on every nav link (color + underline)
  useEffect(() => {
    const linkEls =
      headerRef.current?.querySelectorAll<HTMLAnchorElement>("[data-nav-link]");
    if (!linkEls) return;
    linkEls.forEach((link) => {
      const id = link.dataset.targetId ?? "";
      const isActive = id === activeId;
      const underline = link.querySelector(".nav-underline") as HTMLSpanElement;
      gsap.to(link, {
        color: isActive ? COLOR_ACTIVE : COLOR_DEFAULT,
        duration: 0.25,
        ease: "power2.out",
      });
      if (underline) {
        gsap.to(underline, {
          scaleX: isActive ? 1 : 0,
          duration: 0.3,
          ease: "power3.out",
        });
      }
    });
  }, [activeId]);

  // Scrollspy via IntersectionObserver
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const ids = links.map((l) => l.href.replace(/^#/, "")).filter(Boolean);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            visible.set(id, entry.intersectionRatio);
          } else {
            visible.delete(id);
          }
        });

        if (visible.size === 0) return;

        // Prefer the section whose top is closest to the top of the viewport
        // (smallest positive bounding rect top)
        let bestId: string | null = null;
        let bestScore = -Infinity;
        elements.forEach((el) => {
          if (!visible.has(el.id)) return;
          const rect = el.getBoundingClientRect();
          // Higher score = closer to the just-below-header line
          const score = -Math.abs(rect.top - 96);
          if (score > bestScore) {
            bestScore = score;
            bestId = el.id;
          }
        });
        if (bestId) setActiveId(bestId);
      },
      {
        // Trigger as soon as a section enters the area below the header
        rootMargin: "-96px 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [links]);

  const onAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    const headerOffset = headerRef.current?.offsetHeight ?? 72;
    const y =
      el.getBoundingClientRect().top + window.scrollY - headerOffset - 8;
    window.scrollTo({ top: y, behavior: "smooth" });
    setOpen(false);
    setActiveId(id);
  };

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 w-full z-50 bg-white/80 backdrop-blur-[12px] border-b border-[rgba(0,0,0,0.06)]"
      style={{ boxShadow: "0 0px 0px rgba(0,0,0,0)" }}
    >
      <div className="w-full max-w-[1280px] mx-auto px-6 lg:px-8 flex items-center justify-between h-16 md:h-[72px] gap-4">
        {/* Left: Logo + divider + page name */}
        <div className="flex items-center min-w-0">
          <Link
            to="/"
            aria-label="Rede Geronto — voltar ao início"
            className="shrink-0"
          >
            <img src={logo} alt="Rede Geronto" className="h-8 w-auto" />
          </Link>

          <span
            aria-hidden="true"
            className="hidden sm:inline-block w-px self-stretch mx-4 md:mx-6 my-3"
            style={{ backgroundColor: "rgba(0,0,0,0.12)" }}
          />

          <span
            className="hidden sm:inline-block truncate"
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#2C2C2A",
            }}
          >
            {pageName}
          </span>
        </div>

        {/* Center-right: Section nav links (desktop) */}
        <nav
          aria-label="Navegação da página"
          className="hidden lg:flex items-center gap-8"
        >
          {links.map((link) => {
            const id = link.href.replace(/^#/, "");
            const isActive = id === activeId;
            return (
              <a
                key={link.href}
                href={link.href}
                data-nav-link
                data-target-id={id}
                onClick={(e) => onAnchorClick(e, link.href)}
                aria-current={isActive ? "true" : undefined}
                className="relative text-[14px] font-medium"
                style={{ color: isActive ? COLOR_ACTIVE : COLOR_DEFAULT }}
              >
                <span>{link.label}</span>
                <span
                  aria-hidden="true"
                  className="nav-underline absolute left-0 -bottom-1.5 h-[2px] w-full origin-left bg-blue-deep"
                  style={{ transform: isActive ? "scaleX(1)" : "scaleX(0)" }}
                />
              </a>
            );
          })}
        </nav>

        {/* Right: CTA + mobile hamburger */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center">
            <Button href="/diagnostico" variant="primary" size="sm">
              Fazer Diagnóstico
            </Button>
          </div>

          <button
            type="button"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-full text-blue-deep hover:bg-blue-light"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden w-full border-t border-[rgba(0,0,0,0.06)] bg-white">
          <nav
            aria-label="Navegação móvel da página"
            className="w-full max-w-[1280px] mx-auto px-6 lg:px-8 py-4 flex flex-col gap-1"
          >
            <span
              className="px-2 pb-2 text-[12px] uppercase tracking-[1.2px] font-medium"
              style={{ color: "#5F5E5A" }}
            >
              {pageName}
            </span>
            {links.map((link) => {
              const id = link.href.replace(/^#/, "");
              const isActive = id === activeId;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => onAnchorClick(e, link.href)}
                  aria-current={isActive ? "true" : undefined}
                  className="py-3 px-2 text-[15px] rounded-input hover:bg-blue-light transition-colors"
                  style={{
                    color: isActive ? COLOR_ACTIVE : "#2C2C2A",
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  {link.label}
                </a>
              );
            })}
            <div className="pt-3 sm:hidden">
              <Button
                href="/diagnostico"
                variant="primary"
                size="md"
                className="w-full"
              >
                Fazer Diagnóstico
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
