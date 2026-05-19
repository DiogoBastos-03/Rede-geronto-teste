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
  const headerRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);

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

  // Animated underline + color hover on nav links
  useEffect(() => {
    if (window.innerWidth < 1024) return;
    const links =
      headerRef.current?.querySelectorAll<HTMLAnchorElement>("[data-nav-link]");
    if (!links) return;

    const cleanups: Array<() => void> = [];
    links.forEach((link) => {
      const underline = link.querySelector(".nav-underline") as HTMLSpanElement;
      const enter = () => {
        gsap.to(link, { color: "#0C4A8C", duration: 0.25, ease: "power2.out" });
        gsap.to(underline, {
          scaleX: 1,
          duration: 0.35,
          ease: "power3.out",
        });
      };
      const leave = () => {
        gsap.to(link, { color: "#4A5568", duration: 0.25, ease: "power2.out" });
        gsap.to(underline, {
          scaleX: 0,
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

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 w-full z-50 bg-white/80 backdrop-blur-[12px] border-b border-[rgba(0,0,0,0.06)]"
      style={{ boxShadow: "0 0px 0px rgba(0,0,0,0)" }}
    >
      <div className="w-full max-w-[1280px] mx-auto px-6 lg:px-8 flex items-center justify-between h-16 md:h-[72px]">
        <Link to="/" aria-label="Rede Geronto — voltar ao início">
          <img src={logo} alt="Rede Geronto" className="h-8 w-auto" />
        </Link>

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
              style={{ color: "#4A5568" }}
            >
              <span>{link.label}</span>
              <span
                aria-hidden="true"
                className="nav-underline absolute left-0 -bottom-1.5 h-[2px] w-full origin-left bg-blue-deep"
                style={{ transform: "scaleX(0)" }}
              />
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button href="/diagnostico" variant="primary" size="sm">
            Fazer Diagnóstico
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full text-blue-deep hover:bg-blue-light"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden w-full border-t border-[rgba(0,0,0,0.06)] bg-white">
          <nav
            aria-label="Navegação móvel"
            className="w-full max-w-[1280px] mx-auto px-6 lg:px-8 py-4 flex flex-col gap-1"
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
