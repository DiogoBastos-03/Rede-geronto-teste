import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import gsap from 'gsap';
import { UF_LIST } from '../diagnostico/types';
import {
  useContato,
  type ContatoTipo,
  type ContatoPreset,
} from '../contexts/ContatoContext';
import { openWhatsApp } from '../utils/whatsapp';

// ── Constants ──────────────────────────────────────────────────────────────────

const TIPOS: ContatoTipo[] = [
  'Solicitar Consultoria',
  'Agendar Webinário',
  'Tirar Dúvidas',
  'Outro Assunto',
];

const inputBase =
  'w-full px-4 py-3 rounded-[12px] text-[14px] bg-[#F7F9FC] border transition-colors outline-none focus:border-[#0C4A8C] focus:bg-white focus:ring-2 focus:ring-[rgba(12,74,140,0.12)]';

// ── Form data ─────────────────────────────────────────────────────────────────

interface FormValues {
  tipo: ContatoTipo | '';
  nome: string;
  email: string;
  telefone: string;
  municipio: string;
  uf: string;
  mensagem: string;
}

const empty = (): FormValues => ({
  tipo: '',
  nome: '',
  email: '',
  telefone: '',
  municipio: '',
  uf: '',
  mensagem: '',
});

function fromPreset(preset: ContatoPreset): FormValues {
  return { ...empty(), tipo: preset.tipo ?? '', mensagem: preset.mensagem ?? '' };
}

// ── Message builder ───────────────────────────────────────────────────────────

function buildWhatsAppMessage(d: FormValues): string {
  const lines: string[] = ['Olá! Vim pelo site da Rede Geronto.', ''];
  lines.push(`Tipo de contato: ${d.tipo}`);
  lines.push(`Nome: ${d.nome}`);
  lines.push(`E-mail: ${d.email}`);
  if (d.telefone.trim()) lines.push(`Telefone: ${d.telefone}`);
  const local = [d.municipio.trim(), d.uf].filter(Boolean).join('/');
  if (local) lines.push(`Município/UF: ${local}`);
  lines.push('', 'Mensagem:', d.mensagem);
  return lines.join('\n');
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export default function ContatoModal() {
  const { isOpen, preset, closeContato } = useContato();

  // Mount state — stays true until close animation ends
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);

  const [form, setForm]       = useState<FormValues>(empty());
  const [errors, setErrors]   = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync preset → form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(fromPreset(preset));
      setErrors({});
      setErrorMsg(null);
      setMounted(true);
    }
  }, [isOpen, preset]);

  // GSAP open / close animation
  useEffect(() => {
    if (!mounted) return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 28, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'expo.out' },
      );
    } else {
      // Animate out, then unmount
      const tl = gsap.timeline({
        onComplete: () => {
          setMounted(false);
          document.body.style.overflow = '';
        },
      });
      tl.to(cardRef.current, { opacity: 0, y: 16, scale: 0.97, duration: 0.2, ease: 'power2.in' });
      tl.to(overlayRef.current, { opacity: 0, duration: 0.15 }, '-=0.1');
    }
  }, [isOpen, mounted]);

  // Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) closeContato(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, closeContato]);

  if (!mounted) return null;

  // ── Helpers ───────────────────────────────────────────────────────────────

  const set = (partial: Partial<FormValues>) =>
    setForm((f) => ({ ...f, ...partial }));

  const errBorder = (key: string) => ({
    borderColor: errors[key] ? '#EF4444' : '#DDE5EE',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, boolean> = {};
    if (!form.tipo)           errs.tipo     = true;
    if (!form.nome.trim())    errs.nome     = true;
    if (!form.email.trim())   errs.email    = true;
    if (!form.mensagem.trim()) errs.mensagem = true;

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setErrorMsg('Preencha os campos obrigatórios antes de continuar.');
      return;
    }

    const text = buildWhatsAppMessage(form);
    openWhatsApp(text);
    closeContato();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    /* Overlay */
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) closeContato(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contato-modal-title"
    >
      {/* Card */}
      <div
        ref={cardRef}
        className="relative w-full max-w-lg bg-white rounded-[24px] overflow-hidden"
        style={{ maxHeight: '90dvh', boxShadow: '0 24px 80px rgba(0,0,0,0.22)' }}
      >
        {/* Scrollable area */}
        <div className="overflow-y-auto" style={{ maxHeight: '90dvh' }}>

          {/* Sticky header */}
          <div
            className="sticky top-0 z-10 flex items-start justify-between px-6 pt-6 pb-4 bg-white"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}
          >
            <div>
              <h2 id="contato-modal-title" className="text-[20px] font-semibold text-text-primary leading-snug">
                Fale com a Rede Geronto
              </h2>
              <p className="mt-0.5 text-[13px] text-text-secondary">
                Preencha o formulário e envie pelo WhatsApp.
              </p>
            </div>
            <button
              type="button"
              onClick={closeContato}
              aria-label="Fechar formulário de contato"
              className="shrink-0 ml-4 w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-[#F3F4F6]"
              style={{ color: '#6B7280' }}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="px-6 pb-7 pt-5 flex flex-col gap-4"
          >
            {/* Error banner */}
            {errorMsg && (
              <div
                className="px-4 py-3 rounded-[10px] text-[13px] font-medium flex items-center gap-2"
                role="alert"
                style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="shrink-0">
                  <circle cx="7" cy="7" r="6" fill="#EF4444" fillOpacity="0.2" />
                  <path d="M7 4.5v3M7 9v.5" stroke="#EF4444" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                {errorMsg}
              </div>
            )}

            {/* Tipo de Contato */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-text-primary" htmlFor="cm-tipo">
                Tipo de Contato <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                id="cm-tipo"
                value={form.tipo}
                onChange={(e) => { set({ tipo: e.target.value as ContatoTipo | '' }); setErrors((r) => ({ ...r, tipo: false })); }}
                className={inputBase}
                style={errBorder('tipo')}
                required
                aria-invalid={errors.tipo}
              >
                <option value="">Selecione o assunto…</option>
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Nome + E-mail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-text-primary" htmlFor="cm-nome">
                  Nome Completo <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  id="cm-nome"
                  type="text"
                  value={form.nome}
                  onChange={(e) => { set({ nome: e.target.value }); setErrors((r) => ({ ...r, nome: false })); }}
                  placeholder="Seu nome"
                  className={inputBase}
                  style={errBorder('nome')}
                  required
                  aria-invalid={errors.nome}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-text-primary" htmlFor="cm-email">
                  E-mail <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  id="cm-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => { set({ email: e.target.value }); setErrors((r) => ({ ...r, email: false })); }}
                  placeholder="seu@email.com"
                  className={inputBase}
                  style={errBorder('email')}
                  required
                  aria-invalid={errors.email}
                />
              </div>
            </div>

            {/* Telefone + Município */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-text-primary" htmlFor="cm-tel">
                  Telefone
                </label>
                <input
                  id="cm-tel"
                  type="tel"
                  value={form.telefone}
                  onChange={(e) => set({ telefone: e.target.value })}
                  placeholder="(00) 90000-0000"
                  className={inputBase}
                  style={{ borderColor: '#DDE5EE' }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-text-primary" htmlFor="cm-municipio">
                  Município
                </label>
                <input
                  id="cm-municipio"
                  type="text"
                  value={form.municipio}
                  onChange={(e) => set({ municipio: e.target.value })}
                  placeholder="Nome da cidade"
                  className={inputBase}
                  style={{ borderColor: '#DDE5EE' }}
                />
              </div>
            </div>

            {/* Estado */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-text-primary" htmlFor="cm-uf">
                Estado
              </label>
              <select
                id="cm-uf"
                value={form.uf}
                onChange={(e) => set({ uf: e.target.value })}
                className={inputBase}
                style={{ borderColor: '#DDE5EE' }}
              >
                <option value="">Selecione o estado…</option>
                {UF_LIST.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>

            {/* Mensagem */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-text-primary" htmlFor="cm-msg">
                Mensagem <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <textarea
                id="cm-msg"
                rows={4}
                value={form.mensagem}
                onChange={(e) => { set({ mensagem: e.target.value }); setErrors((r) => ({ ...r, mensagem: false })); }}
                placeholder="Como podemos ajudar o seu município?"
                className={`${inputBase} resize-none`}
                style={errBorder('mensagem')}
                required
                aria-invalid={errors.mensagem}
              />
            </div>

            {/* Submit — WhatsApp green */}
            <button
              type="submit"
              className="mt-1 w-full rounded-full py-3.5 text-[15px] font-semibold text-white flex items-center justify-center gap-2.5 transition-shadow hover:shadow-[0_8px_28px_rgba(37,211,102,0.4)] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
            >
              {/* WhatsApp logo SVG */}
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Enviar pelo WhatsApp
            </button>

            <p className="text-[11px] text-center leading-relaxed" style={{ color: '#9CA3AF' }}>
              Você será direcionado ao WhatsApp para confirmar o envio.
              Campos com <span style={{ color: '#EF4444' }}>*</span> são obrigatórios.
            </p>
          </form>

        </div>
      </div>
    </div>
  );
}
