import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Footer() {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.innerWidth < 768) return;

    const links = el.querySelectorAll<HTMLAnchorElement>('[data-footer-link]');
    const cleanups: Array<() => void> = [];
    links.forEach((link) => {
      const enter = () =>
        gsap.to(link, {
          color: '#FFFFFF',
          duration: 0.25,
          ease: 'power2.out',
        });
      const leave = () =>
        gsap.to(link, {
          color: 'rgba(255,255,255,0.6)',
          duration: 0.25,
          ease: 'power2.out',
        });
      link.addEventListener('pointerenter', enter);
      link.addEventListener('pointerleave', leave);
      cleanups.push(() => {
        link.removeEventListener('pointerenter', enter);
        link.removeEventListener('pointerleave', leave);
      });
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <footer
      ref={ref}
      id="footer"
      className="relative overflow-hidden"
      style={{ backgroundColor: '#0A1628' }}
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Rodapé
      </h2>

      <div className="container-x py-20 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div>
            <p className="font-medium text-[20px] tracking-[-0.02em] mb-5 flex items-baseline gap-[2px] text-white">
              <span>Rede</span>
              <span
                style={{
                  background: 'linear-gradient(135deg, #0C4A8C, #2196C9)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'inline',
                }}
              >
                Geronto
              </span>
            </p>
            <p
              className="text-[14px] leading-relaxed max-w-xs"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              Estruturando municípios para o futuro do envelhecimento no
              Brasil.
            </p>
          </div>

          <div>
            <h3
              className="text-[12px] font-medium uppercase tracking-[1.2px] mb-5"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              Plataforma
            </h3>
            <ul className="space-y-3 text-[14px]">
              {[
                ['Diagnóstico Gratuito', '/diagnostico'],
                ['Mapa de Fundos', '/dashboard'],
                ['Dashboard', '/dashboard'],
                ['Biblioteca de Recursos', '/recursos'],
              ].map(([label, href]) => (
                <li key={label}>
                  <a
                    data-footer-link
                    href={href}
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3
              className="text-[12px] font-medium uppercase tracking-[1.2px] mb-5"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              Programa
            </h3>
            <ul className="space-y-3 text-[14px]">
              {[
                ['Cidade Amiga do Idoso', '/cidade-amiga'],
                ['Consultoria', '/consultoria'],
                ['Contato', '/contato'],
              ].map(([label, href]) => (
                <li key={label}>
                  <a
                    data-footer-link
                    href={href}
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3
              className="text-[12px] font-medium uppercase tracking-[1.2px] mb-5"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              Contato
            </h3>
            <address
              className="not-italic space-y-3 text-[14px]"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              <p>
                Centro de Atividades 11, Bloco B, Sala 302
                <br />
                Brasília/DF
              </p>
              <p>
                <a
                  data-footer-link
                  href="tel:+556198091562"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  +55 61 9809-1562
                </a>
              </p>
              <p>
                <a
                  data-footer-link
                  href="mailto:contato@redegeronto.com.br"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  contato@redegeronto.com.br
                </a>
              </p>
              <p>Segunda a Sexta, 8h às 18h</p>
            </address>
          </div>
        </div>

        <div
          className="mt-16 pt-8 flex justify-center text-center"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p
            className="text-[13px]"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            © 2026 Rede Geronto — CNPJ 44.126.926/0001-01. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
