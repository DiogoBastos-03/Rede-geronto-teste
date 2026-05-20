import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import gsap from "gsap";
import Button from "../ui/Button";
import logo from "../../assets/logo.webp";

const navLinks = [
  { label: "Problema", href: "#problema" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Cidade Amiga", href: "#cidade-amiga" },
  { label: "Dados", href: "#dados" },
  { label: "Consultoria", href: "#consultoria" },
];

export default function Header() {
  const headerRef   = useRef<HTMLElement | null>(null);
  const scrolledRef = useRef(false); // mutable ref for GSAP closures
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // ── Scroll detection — drives transparent → frosted-white transition ──────
  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 60;
      if (next === scrolledRef.current) return;
      scrolledRef.current = next;
      setScrolled(next);
    };
    onScroll(); // sync on mount
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Animated underline + colour hover on desktop nav links ───────────────
  // Uses scrolledRef (not scrolled state) so closures always see latest value
  useEffect(() => {
    if (window.innerWidth < 1024) return;
    const links =
      headerRef.current?.querySelectorAll<HTMLAnchorElement>("[data-nav-link]");
    if (!links) return;

    const cleanups: Array<() => void> = [];
    links.forEach((link) => {
      const underline = link.querySelector(".nav-underline") as HTMLSpanElement | null;

      const enter = () => {
        gsap.to(link, {
          color: scrolledRef.current ? "#0C4A8C" : "#FFFFFF",
          duration: 0.25,
          ease: "power2.out",
        });
        if (underline) {
          gsap.to(underline, { scaleX: 1, duration: 0.35, ease: "power3.out" });
        }
      };

      const leave = () => {
        gsap.to(link, {
          color: scrolledRef.current ? "#4A5568" : "rgba(255,255,255,0.9)",
          duration: 0.25,
          ease: "power2.out",
        });
        if (underline) {
          gsap.to(underline, { scaleX: 0, duration: 0.3, ease: "power3.in" });
        }
      };

      link.addEventListener("pointerenter", enter);
      link.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        link.removeEventListener("pointerenter", enter);
        link.removeEventListener("pointerleave", leave);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []); // set up once — closures read scrolledRef dynamically

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 w-full z-50"
      style={{
        background: scrolled ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.50)",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(0,0,0,0.06)"
          : "1px solid transparent",
        boxShadow: scrolled ? "0 1px 24px rgba(0,0,0,0.06)" : "none",
        transition:
          "background 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease",
      }}
    >
      <div className="w-full max-w-[1280px] mx-auto px-6 lg:px-8 flex items-center justify-between h-16 md:h-[72px]">

        {/* Logo — white when transparent, colour when scrolled */}
        <Link to="/" aria-label="Rede Geronto — voltar ao início">
          <img
            src={logo}
            alt="Rede Geronto"
            className="h-8 w-auto transition-all duration-300"
            style={{
              filter: scrolled ? 'none' : 'brightness(10) saturate(0)',
            }}
          />
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Navegação principal"
          className="hidden lg:flex items-center gap-8"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              data-nav-link
              className="relative text-[14px] font-medium"
              style={{
                color: scrolled ? "#4A5568" : "rgba(255,255,255,0.9)",
                transition: "color 0.35s ease",
              }}
            >
              <span>{link.label}</span>
              <span
                aria-hidden="true"
                className="nav-underline absolute left-0 -bottom-1.5 h-[2px] w-full origin-left"
                style={{
                  transform: "scaleX(0)",
                  backgroundColor: scrolled ? "#0C4A8C" : "rgba(255,255,255,0.85)",
                  transition: "background-color 0.35s ease",
                }}
              />
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button href="/diagnostico" variant="primary" size="sm">
            Fazer Diagnóstico
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full"
          style={{
            color: scrolled ? "#0C4A8C" : "#FFFFFF",
            transition: "color 0.35s ease",
          }}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer — always white */}
      {open && (
        <div className="md:hidden w-full border-t border-[rgba(0,0,0,0.06)] bg-white">
          <nav
            aria-label="Navegação móvel"
            className="w-full max-w-[1280px] mx-auto px-6 py-4 flex flex-col gap-1"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 px-2 text-[15px] text-text-primary rounded-input hover:bg-blue-light"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3">
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
