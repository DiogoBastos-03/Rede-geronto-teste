import { useEffect, useRef, useState, FormEvent } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Calendar, CheckCircle, ChevronDown } from 'lucide-react';
import SectionLabel from '../../ui/SectionLabel';

type ObjetivoOption = '' | 'Fundo do Idoso' | 'Cidade Amiga' | 'Ambos';

interface FormState {
  nome: string;
  cargo: string;
  municipio: string;
  estado: string;
  email: string;
  telefone: string;
  objetivo: ObjetivoOption;
  mensagem: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const REQUIRED_FIELDS: (keyof FormState)[] = [
  'nome',
  'cargo',
  'municipio',
  'estado',
  'email',
  'telefone',
  'objetivo',
];

const initialState: FormState = {
  nome: '',
  cargo: '',
  municipio: '',
  estado: '',
  email: '',
  telefone: '',
  objetivo: '',
  mensagem: '',
};

export default function Formulario() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headRef = useRef<HTMLDivElement | null>(null);
  const fieldsRef = useRef<HTMLDivElement | null>(null);
  const submitRef = useRef<HTMLButtonElement | null>(null);
  const altRef = useRef<HTMLAnchorElement | null>(null);
  const successRef = useRef<HTMLDivElement | null>(null);

  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const headChildren = Array.from(headRef.current?.children ?? []);
      if (headChildren.length > 0) {
        gsap.set(headChildren, { y: 30, autoAlpha: 0 });
        gsap.fromTo(
          headChildren,
          { y: 30, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.9,
            stagger: 0.12,
            ease: 'power3.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: headRef.current,
              start: 'top 85%',
              once: true,
            },
          },
        );
      }

      const fields = fieldsRef.current?.querySelectorAll('[data-field]') ?? [];
      gsap.set(fields, { x: -20, autoAlpha: 0 });
      gsap.fromTo(
        fields,
        { x: -20, autoAlpha: 0 },
        {
          x: 0,
          autoAlpha: 1,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: fieldsRef.current,
            start: 'top 80%',
            once: true,
          },
        },
      );

      gsap.set([submitRef.current, altRef.current], {
        scale: 0.8,
        autoAlpha: 0,
      });
      gsap.fromTo(
        [submitRef.current, altRef.current],
        { scale: 0.8, autoAlpha: 0 },
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'expo.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: submitRef.current,
            start: 'top 90%',
            once: true,
          },
        },
      );
    }, sectionRef);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  // Success animation when submitted toggles on
  useEffect(() => {
    if (!submitted || !successRef.current) return;
    gsap.fromTo(
      successRef.current,
      { y: 20, autoAlpha: 0, scale: 0.96 },
      {
        y: 0,
        autoAlpha: 1,
        scale: 1,
        duration: 0.7,
        ease: 'expo.out',
      },
    );
  }, [submitted]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((s) => ({ ...s, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    REQUIRED_FIELDS.forEach((k) => {
      if (!form[k] || String(form[k]).trim().length === 0) {
        next[k] = 'Campo obrigatório';
      }
    });
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      next.email = 'Informe um e-mail válido';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
  };

  return (
    <section
      id="formulario"
      ref={sectionRef}
      aria-labelledby="formulario-heading"
      className="relative py-[120px] lg:py-[140px]"
      style={{ backgroundColor: '#F0FAF6' }}
    >
      <div className="container-x">
        <div
          className="max-w-2xl mx-auto bg-white rounded-[24px] px-6 py-8 md:px-12 md:py-10"
          style={{
            border: '1px solid #B5D4F4',
            boxShadow: '0 8px 32px rgba(12,74,140,0.08)',
          }}
        >
          {submitted ? (
            <div
              ref={successRef}
              role="status"
              aria-live="polite"
              className="flex flex-col sm:flex-row items-start gap-5"
            >
              <span
                className="inline-flex w-12 h-12 shrink-0 rounded-full items-center justify-center"
                style={{
                  backgroundColor: 'rgba(40,168,122,0.15)',
                  color: '#1A7A5E',
                }}
                aria-hidden="true"
              >
                <CheckCircle size={26} />
              </span>
              <div>
                <h3 className="text-[20px] font-medium text-text-primary leading-snug">
                  Proposta solicitada com sucesso!
                </h3>
                <p className="mt-2 text-[15px] text-text-secondary leading-relaxed">
                  Entraremos em contato em até 2 dias úteis.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div ref={headRef}>
                <SectionLabel tone="green">Solicitar proposta</SectionLabel>
                <h2
                  id="formulario-heading"
                  className="mt-4 text-[26px] sm:text-[30px] lg:text-[34px] font-medium leading-[1.2] tracking-[-0.02em] text-text-primary"
                >
                  Solicitar proposta personalizada
                </h2>
                <p className="mt-4 text-[15px] sm:text-[16px] leading-[1.6] text-text-secondary">
                  Preencha o formulário e nossa equipe entrará em contato em
                  até 2 dias úteis para adaptar a proposta à realidade do seu
                  município.
                </p>
              </div>

              <form
                onSubmit={onSubmit}
                noValidate
                aria-describedby="formulario-heading"
                className="mt-8"
              >
              <div ref={fieldsRef} className="grid grid-cols-1 gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5" data-field>
                  <Field
                    label="Nome completo"
                    name="nome"
                    value={form.nome}
                    onChange={(v) => setField('nome', v)}
                    error={errors.nome}
                    required
                  />
                  <Field
                    label="Cargo / função"
                    name="cargo"
                    value={form.cargo}
                    onChange={(v) => setField('cargo', v)}
                    error={errors.cargo}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5" data-field>
                  <Field
                    label="Município"
                    name="municipio"
                    value={form.municipio}
                    onChange={(v) => setField('municipio', v)}
                    error={errors.municipio}
                    required
                  />
                  <Field
                    label="Estado"
                    name="estado"
                    value={form.estado}
                    onChange={(v) => setField('estado', v)}
                    error={errors.estado}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5" data-field>
                  <Field
                    label="E-mail institucional"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={(v) => setField('email', v)}
                    error={errors.email}
                    required
                  />
                  <Field
                    label="Telefone"
                    name="telefone"
                    type="tel"
                    value={form.telefone}
                    onChange={(v) => setField('telefone', v)}
                    error={errors.telefone}
                    required
                  />
                </div>

                <div data-field>
                  <SelectField
                    label="Objetivo principal"
                    name="objetivo"
                    value={form.objetivo}
                    onChange={(v) =>
                      setField('objetivo', v as ObjetivoOption)
                    }
                    error={errors.objetivo}
                    options={[
                      { value: '', label: 'Selecione uma opção' },
                      { value: 'Fundo do Idoso', label: 'Fundo do Idoso' },
                      { value: 'Cidade Amiga', label: 'Cidade Amiga' },
                      { value: 'Ambos', label: 'Ambos' },
                    ]}
                    required
                  />
                </div>

                <div data-field>
                  <TextareaField
                    label="Mensagem"
                    name="mensagem"
                    value={form.mensagem}
                    onChange={(v) => setField('mensagem', v)}
                    optional
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col items-start gap-5">
                <button
                  ref={submitRef}
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-pill px-8 min-h-[52px] py-[15px] font-medium text-[16px] text-white cursor-pointer will-change-transform transition-shadow hover:shadow-[0_10px_28px_rgba(12,74,140,0.45)]"
                  style={{
                    background: 'linear-gradient(135deg, #0C4A8C, #2196C9)',
                    boxShadow: '0 4px 14px rgba(12,74,140,0.35)',
                  }}
                >
                  Enviar solicitação
                  <ArrowRight size={18} aria-hidden="true" />
                </button>

                <a
                  ref={altRef}
                  href="/contato"
                  className="inline-flex items-center gap-2 text-[14px] font-medium text-blue-deep hover:underline"
                >
                  <Calendar size={16} aria-hidden="true" />
                  Prefere uma conversa antes? Agende um webinário gratuito
                  <ArrowRight size={14} aria-hidden="true" />
                </a>
              </div>
            </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// -- Field components ---------------------------------------------------------

interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  required?: boolean;
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  type = 'text',
  required,
}: FieldProps) {
  const id = `field-${name}`;
  const hasError = Boolean(error);
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[12px] font-medium mb-1.5"
        style={{ color: '#2C2C2A' }}
      >
        {label}
        {required && (
          <span className="ml-1 text-error" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? `${id}-error` : undefined}
        required={required}
        className="w-full rounded-input px-3.5 py-2.5 text-[14px] outline-none transition-colors"
        style={{
          border: hasError ? '1px solid #E24B4A' : '1px solid #B5D4F4',
          backgroundColor: hasError ? '#FFF8F8' : '#F7F9FC',
          color: '#2C2C2A',
        }}
      />
      {hasError && (
        <p
          id={`${id}-error`}
          className="mt-1 text-[11px]"
          style={{ color: '#A32D2D' }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

interface SelectFieldProps extends Omit<FieldProps, 'type'> {
  options: Array<{ value: string; label: string }>;
}

function SelectField({
  label,
  name,
  value,
  onChange,
  error,
  options,
  required,
}: SelectFieldProps) {
  const id = `field-${name}`;
  const hasError = Boolean(error);
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[12px] font-medium mb-1.5"
        style={{ color: '#2C2C2A' }}
      >
        {label}
        {required && (
          <span className="ml-1 text-error" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${id}-error` : undefined}
          required={required}
          className="w-full appearance-none rounded-input px-3.5 py-2.5 pr-10 text-[14px] outline-none transition-colors"
          style={{
            border: hasError ? '1px solid #E24B4A' : '1px solid #B5D4F4',
            backgroundColor: hasError ? '#FFF8F8' : '#F7F9FC',
            color: value ? '#2C2C2A' : '#5F5E5A',
          }}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: '#5F5E5A' }}
        />
      </div>
      {hasError && (
        <p
          id={`${id}-error`}
          className="mt-1 text-[11px]"
          style={{ color: '#A32D2D' }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

interface TextareaFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  optional?: boolean;
}

function TextareaField({
  label,
  name,
  value,
  onChange,
  optional,
}: TextareaFieldProps) {
  const id = `field-${name}`;
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[12px] font-medium mb-1.5"
        style={{ color: '#2C2C2A' }}
      >
        {label}
        {optional && (
          <span className="ml-1 text-text-muted font-normal">(opcional)</span>
        )}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full rounded-input px-3.5 py-2.5 text-[14px] outline-none transition-colors"
        style={{
          border: '1px solid #B5D4F4',
          backgroundColor: '#F7F9FC',
          color: '#2C2C2A',
          resize: 'none',
        }}
      />
    </div>
  );
}
