import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import Button from "../ui/Button";
import SectionLabel from "../ui/SectionLabel";

const TEXTURE_BASE = "https://unpkg.com/three-globe/example/img/";
const TEX = {
  blueMarble: `${TEXTURE_BASE}earth-blue-marble.jpg`,
  topology: `${TEXTURE_BASE}earth-topology.png`,
  water: `${TEXTURE_BASE}earth-water.png`,
  clouds: `${TEXTURE_BASE}earth-clouds.png`,
};

const HEADLINE =
  "Seu município ainda não tem Fundo do Idoso. Isso tem solução.";

/**
 * Recursively wrap each word in a text node with a span (for stagger anim),
 * while preserving existing element children (e.g. highlight spans).
 */
function wrapWordsPreservingMarkup(root: HTMLElement) {
  if (root.dataset.split === "1") return;
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";
      if (!text.trim()) return;
      const parts = text.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      parts.forEach((p) => {
        if (!p) return;
        if (/^\s+$/.test(p)) {
          frag.appendChild(document.createTextNode(p));
        } else {
          const span = document.createElement("span");
          span.className = "word-anim";
          span.style.display = "inline-block";
          span.textContent = p;
          frag.appendChild(span);
        }
      });
      node.parentNode?.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(walk);
    }
  };
  Array.from(root.childNodes).forEach(walk);
  root.dataset.split = "1";
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const blobBlueRef = useRef<HTMLDivElement | null>(null);
  const blobGreenRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const subRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const solutionRef = useRef<HTMLSpanElement | null>(null);

  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ---- ENTRANCE TIMELINE + Three.js scene (desktop) ----
  useEffect(() => {
    if (isMobile) {
      // Simple mobile fade-in for text content
      const ctx = gsap.context(() => {
        gsap.from(
          [
            labelRef.current,
            headlineRef.current,
            subRef.current,
            ctaRef.current,
          ],
          {
            opacity: 0,
            y: 20,
            duration: 0.7,
            stagger: 0.12,
            ease: "power2.out",
          },
        );
        gsap.from(overlayRef.current, {
          autoAlpha: 1,
          duration: 0.5,
        });
        gsap.to(overlayRef.current, {
          autoAlpha: 0,
          duration: 0.5,
          ease: "power2.out",
        });
      }, sectionRef);
      return () => ctx.revert();
    }

    const mount = mountRef.current;
    const section = sectionRef.current;
    if (!mount || !section) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // --- Three.js scene ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 1.1);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x85b7eb, 0.45);
    rim.position.set(-5, -2, -3);
    scene.add(rim);

    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    const breath = new THREE.Group();
    earthGroup.add(breath);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: loader.load(TEX.blueMarble),
      bumpMap: loader.load(TEX.topology),
      bumpScale: 0.04,
      specularMap: loader.load(TEX.water),
      specular: new THREE.Color(0x2196c9),
      shininess: 14,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    breath.add(earth);

    const cloudsGeometry = new THREE.SphereGeometry(1.012, 64, 64);
    const cloudsMaterial = new THREE.MeshPhongMaterial({
      map: loader.load(TEX.clouds),
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    breath.add(clouds);

    const atmGeometry = new THREE.SphereGeometry(1.07, 64, 64);
    const atmMaterial = new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: new THREE.Color(0x85b7eb) } },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(glowColor, 1.0) * intensity;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });
    const atmosphere = new THREE.Mesh(atmGeometry, atmMaterial);
    earthGroup.add(atmosphere);

    earthGroup.rotation.z = -0.25;

    // RAF: spin only — position/scale driven by GSAP
    let raf = 0;
    let lastTime = performance.now();
    const animate = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      earth.rotation.y += dt * 0.12;
      clouds.rotation.y += dt * 0.16;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    const onResizeCanvas = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResizeCanvas);

    // --- GSAP: entrance timeline + ScrollTrigger ---
    const ctx = gsap.context(() => {
      // Wrap each word of the headline in span for stagger (preserves highlight markup)
      const textSpan = headlineRef.current?.querySelector(
        ".headline-text",
      ) as HTMLElement | null;
      if (textSpan) {
        wrapWordsPreservingMarkup(textSpan);
      }

      // Initial states
      gsap.set(canvasWrapRef.current, { x: 200, autoAlpha: 0 });
      gsap.set(labelRef.current, { y: 24, autoAlpha: 0 });
      gsap.set(".hero-word", { y: 30, autoAlpha: 0 });
      gsap.set(subRef.current, { y: 16, autoAlpha: 0 });
      gsap.set(ctaRef.current, { scale: 0.8, autoAlpha: 0 });
      gsap.set(blobBlueRef.current, { autoAlpha: 0, scale: 0.85 });
      gsap.set(blobGreenRef.current, { autoAlpha: 0, scale: 0.85 });
      gsap.set(solutionRef.current, { autoAlpha: 0 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(overlayRef.current, {
        autoAlpha: 0,
        duration: 0.6,
        ease: "power2.out",
      })
        .to(
          [blobBlueRef.current, blobGreenRef.current],
          { autoAlpha: 1, scale: 1, duration: 1.4, stagger: 0.1 },
          0.1,
        )
        .to(
          canvasWrapRef.current,
          { x: 0, autoAlpha: 1, duration: 1.4, ease: "expo.out" },
          0.3,
        )
        .to(labelRef.current, { y: 0, autoAlpha: 1, duration: 0.9 }, 0.3 + 0.8)
        .to(
          headlineRef.current?.querySelectorAll(".word-anim") ?? [],
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.85,
            stagger: 0.05,
            ease: "power3.out",
          },
          0.3 + 1.0,
        )
        .to(subRef.current, { y: 0, autoAlpha: 1, duration: 0.8 }, 0.3 + 1.4)
        .to(
          ctaRef.current,
          { scale: 1, autoAlpha: 1, duration: 0.9, ease: "expo.out" },
          0.3 + 1.6,
        )
        .to(
          solutionRef.current,
          { autoAlpha: 1, duration: 0.6, ease: "power2.out" },
          0.3 + 1.5,
        );

      // Breathing pulse on the inner breath group (independent of parent scale)
      gsap.to(breath.scale, {
        x: 1.03,
        y: 1.03,
        z: 1.03,
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 1.8,
      });

      // ScrollTrigger: planet flies left + scales down, text fades in from right
      // (text already on screen — keeping behavior subtle for the scroll exit)
      gsap.to(earthGroup.position, {
        x: -1.3,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });
      gsap.to(earthGroup.scale, {
        x: 0.75,
        y: 0.75,
        z: 0.75,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });

      // Parallax blobs
      gsap.to(blobBlueRef.current, {
        y: -30,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });
      gsap.to(blobGreenRef.current, {
        y: -50,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    }, sectionRef);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResizeCanvas);
      ctx.revert();
      renderer.dispose();
      earthGeometry.dispose();
      earthMaterial.dispose();
      cloudsGeometry.dispose();
      cloudsMaterial.dispose();
      atmGeometry.dispose();
      atmMaterial.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [isMobile]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      aria-labelledby="hero-heading"
      className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-white"

    >
      {/* Entrance overlay — fades out at mount */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="fixed inset-0 z-[60] pointer-events-none"
        style={{ backgroundColor: "#0a0f1a" }}
      />

      {/* Decorative blobs */}
      <div
        ref={blobBlueRef}
        aria-hidden="true"
        className="absolute -z-0 left-[-10%] top-[10%] w-[700px] h-[500px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 600px 400px at center, rgba(33,150,201,0.15), transparent 70%)",
        }}
      />
      <div
        ref={blobGreenRef}
        aria-hidden="true"
        className="absolute -z-0 right-[-8%] bottom-[5%] w-[600px] h-[450px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 500px 350px at center, rgba(40,168,122,0.12), transparent 70%)",
        }}
      />

      <div className="container-x relative">
        <div className="grid md:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[560px] md:min-h-[660px]">
          {/* Earth canvas — desktop/tablet only */}
          <div
            className="hidden md:block md:col-span-6 lg:col-span-7 relative"
            aria-hidden="true"
          >
            <div ref={canvasWrapRef} className="will-change-transform">
              <div
                ref={mountRef}
                className="w-full aspect-square max-w-[640px] mx-auto"
              />
            </div>
          </div>

          {/* Mobile fallback — static earth visual */}
          <div
            className="md:hidden flex justify-center mb-4"
            aria-hidden="true"
          >
            <div className="relative w-48 h-48 rounded-full overflow-hidden ring-1 ring-blue-border/60 shadow-[0_20px_50px_rgba(12,74,140,0.25)] bg-blue-deep">
              <img
                src={TEX.blueMarble}
                alt=""
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-deep/40 via-transparent to-blue-sky/20" />
            </div>
          </div>

          {/* Hero content */}
          <div className="md:col-span-6 lg:col-span-5">
            <span ref={labelRef} className="inline-block">
              <SectionLabel>Rede Geronto</SectionLabel>
            </span>
            <h1
              ref={headlineRef}
              id="hero-heading"
              className="mt-5 text-[36px] sm:text-[44px] lg:text-[52px] font-medium leading-[1.1] tracking-[-0.02em] text-text-primary"
            >
              <span className="headline-text">
                Seu município ainda não tem Fundo do Idoso. Isso tem{" "}
              </span>
              <span
                ref={solutionRef}
                style={{
                  background: "linear-gradient(135deg, #2196C9, #28A87A)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  display: "inline",
                }}
              >
                solução.
              </span>
            </h1>
            <p
              ref={subRef}
              className="mt-6 text-[17px] leading-[1.65] text-text-secondary max-w-xl"
            >
              Mais da metade dos municípios brasileiros ainda não criaram o
              Fundo de Direitos da Pessoa Idosa — e estão deixando de acessar
              milhões em recursos que já existem, esperando para ser usados.
            </p>
            <div
              ref={ctaRef}
              className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 origin-left"
            >
              <Button href="/diagnostico" variant="primary" size="lg">
                Fazer Diagnóstico Gratuito
                <ArrowRight size={18} aria-hidden="true" />
              </Button>
              <Button href="#problema" variant="ghost" size="lg">
                Entenda o cenário
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
