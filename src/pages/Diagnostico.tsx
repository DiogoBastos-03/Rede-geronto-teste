import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import Footer from '../components/layout/Footer';
import ProgressBar from '../components/diagnostico/ProgressBar';
import Phase1Form from '../components/diagnostico/Phase1Form';
import Phase2Form from '../components/diagnostico/Phase2Form';
import Phase3Form from '../components/diagnostico/Phase3Form';
import Phase4Form from '../components/diagnostico/Phase4Form';
import Button from '../components/ui/Button';
import {
  emptyPhase1,
  emptyPhase2,
  emptyPhase3,
  emptyPhase4,
  type Phase1Data,
  type Phase2Data,
  type Phase3Data,
  type Phase4Data,
} from '../diagnostico/types';
import { saveDiagnostico } from '../diagnostico/storage';

const PHASE_NAMES = [
  'Dados Básicos',
  'Capacidade Institucional',
  'Contexto Local',
  'Prontidão Política',
];

// ── Validation ─────────────────────────────────────────────────────────────────

function validatePhase1(d: Phase1Data): [Record<string, boolean>, string | null] {
  const errors: Record<string, boolean> = {};
  if (!d.municipio.trim()) errors.municipio = true;
  if (!d.uf) errors.uf = true;
  const hasErrors = Object.keys(errors).length > 0;
  return [errors, hasErrors ? 'Preencha os campos obrigatórios (Município e Estado).' : null];
}

function validatePhase2(d: Phase2Data): [Record<string, boolean>, string | null] {
  const errors: Record<string, boolean> = {};
  const keys: (keyof Phase2Data)[] = [
    'estruturaAdministrativa',
    'recursosHumanos',
    'conhecimentoLegislacao',
    'experienciaFundos',
    'articulacaoSociedade',
  ];
  keys.forEach((k) => { if (!d[k]) errors[k] = true; });
  const hasErrors = Object.keys(errors).length > 0;
  if (hasErrors) errors._phase2 = true;
  return [errors, hasErrors ? 'Avalie todos os 5 critérios antes de continuar.' : null];
}

function validatePhase3(d: Phase3Data): [Record<string, boolean>, string | null] {
  const errors: Record<string, boolean> = {};
  if (!d.nivelPoliticasPublicas) errors.nivelPoliticasPublicas = true;
  const hasErrors = Object.keys(errors).length > 0;
  return [errors, hasErrors ? 'Avalie o nível de políticas públicas para idosos antes de continuar.' : null];
}

function validatePhase4(d: Phase4Data): [Record<string, boolean>, string | null] {
  const errors: Record<string, boolean> = {};
  const keys: (keyof Phase4Data)[] = [
    'apoioPrefeitura',
    'disposicaoCamara',
    'engajamentoSociedadeCivil',
    'historicoPoliticasSociais',
  ];
  keys.forEach((k) => { if (!d[k]) errors[k] = true; });
  const hasErrors = Object.keys(errors).length > 0;
  if (hasErrors) errors._phase4 = true;
  return [errors, hasErrors ? 'Avalie todos os 4 critérios antes de finalizar.' : null];
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function Diagnostico() {
  const navigate = useNavigate();

  const [phase, setPhase] = useState(1);
  const [phase1, setPhase1] = useState<Phase1Data>(emptyPhase1());
  const [phase2, setPhase2] = useState<Phase2Data>(emptyPhase2());
  const [phase3, setPhase3] = useState<Phase3Data>(emptyPhase3());
  const [phase4, setPhase4] = useState<Phase4Data>(emptyPhase4());
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const clearErrors = () => {
    setErrors({});
    setErrorMsg(null);
  };

  const handleNext = () => {
    let errs: Record<string, boolean> = {};
    let msg: string | null = null;

    if (phase === 1) [errs, msg] = validatePhase1(phase1);
    if (phase === 2) [errs, msg] = validatePhase2(phase2);
    if (phase === 3) [errs, msg] = validatePhase3(phase3);

    if (msg) {
      setErrors(errs);
      setErrorMsg(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    clearErrors();
    setPhase((p) => p + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    clearErrors();
    setPhase((p) => p - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinish = () => {
    const [errs, msg] = validatePhase4(phase4);
    if (msg) {
      setErrors(errs);
      setErrorMsg(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    try {
      const result = saveDiagnostico({ phase1, phase2, phase3, phase4 });
      navigate(`/resultado/${result.id}`);
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFB' }}>
      <PageHeader
        pageName="Diagnóstico Municipal"
        links={[]}
      />

      <main className="pt-24 pb-20 md:pt-28">
        <div className="container-x">
          <div className="max-w-2xl mx-auto">

            {/* Hero text */}
            <div className="text-center mb-10">
              <h1 className="text-[28px] sm:text-[34px] font-semibold text-text-primary leading-[1.2] tracking-[-0.02em]">
                Diagnóstico de Prontidão Municipal
              </h1>
              <p className="mt-3 text-[15px] text-text-secondary max-w-lg mx-auto leading-relaxed">
                Responda as 4 fases e receba um escore personalizado, análise SWOT e roadmap de implementação para o seu município.
              </p>
            </div>

            {/* Progress */}
            <ProgressBar current={phase} total={4} phases={PHASE_NAMES} />

            {/* Error banner */}
            {errorMsg && (
              <div
                className="mt-5 px-4 py-3 rounded-[12px] flex items-center gap-3 text-[13px] font-medium"
                style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#B91C1C',
                }}
                role="alert"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
                  <circle cx="8" cy="8" r="7" fill="#EF4444" fillOpacity="0.2" />
                  <path d="M8 5v4M8 10.5v.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {errorMsg}
              </div>
            )}

            {/* Form card */}
            <div
              className="mt-5 rounded-[20px] p-6 sm:p-8 md:p-10"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              {phase === 1 && (
                <Phase1Form data={phase1} onChange={setPhase1} errors={errors} />
              )}
              {phase === 2 && (
                <Phase2Form data={phase2} onChange={setPhase2} errors={errors} />
              )}
              {phase === 3 && (
                <Phase3Form data={phase3} onChange={setPhase3} errors={errors} />
              )}
              {phase === 4 && (
                <Phase4Form data={phase4} onChange={setPhase4} errors={errors} />
              )}
            </div>

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between gap-4">
              {phase > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-medium transition-colors"
                  style={{
                    color: '#4A5568',
                    backgroundColor: 'white',
                    border: '1.5px solid #DDE5EE',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Anterior
                </button>
              ) : (
                <div />
              )}

              {/* Phase indicator (mobile) */}
              <span className="sm:hidden text-[12px] text-text-secondary">
                {phase} / 4
              </span>

              {phase < 4 ? (
                <Button variant="primary" size="md" onClick={handleNext}>
                  Próxima Fase
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M6 3l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Button>
              ) : (
                <Button
                  variant="green"
                  size="md"
                  onClick={handleFinish}
                  disabled={submitting}
                >
                  {submitting ? 'Processando…' : 'Finalizar Diagnóstico'}
                  {!submitting && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </Button>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
