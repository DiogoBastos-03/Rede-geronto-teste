import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowRight, Map, BookOpen } from 'lucide-react';
import { useContato } from '../contexts/ContatoContext';
import PageHeader from '../components/layout/PageHeader';
import Footer from '../components/layout/Footer';
import ScoreGauge from '../components/diagnostico/ScoreGauge';
import DimensionBars from '../components/diagnostico/DimensionBars';
import SWOTPanel from '../components/diagnostico/SWOTPanel';
import RoadmapSteps from '../components/diagnostico/RoadmapSteps';
import ConsultoriaPackages from '../components/diagnostico/ConsultoriaPackages';
import Button from '../components/ui/Button';
import { getDiagnostico } from '../diagnostico/storage';

type ActiveTab = 'swot' | 'roadmap' | 'consultoria';

const TABS: Array<{ key: ActiveTab; label: string }> = [
  { key: 'swot',        label: 'Análise SWOT' },
  { key: 'roadmap',     label: 'Roadmap' },
  { key: 'consultoria', label: 'Consultoria' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

// ── Not-found state ────────────────────────────────────────────────────────────

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFB]">
      <div className="text-center px-6">
        <p className="text-[12px] uppercase tracking-[1.2px] font-medium mb-3" style={{ color: '#0C4A8C' }}>
          Resultado não encontrado
        </p>
        <h1 className="text-[28px] font-semibold text-text-primary mb-4">
          Diagnóstico não localizado
        </h1>
        <p className="text-text-secondary mb-8 max-w-sm mx-auto text-[15px]">
          O resultado pode ter sido limpo do armazenamento local. Faça um novo diagnóstico para gerar um relatório.
        </p>
        <Button href="/diagnostico" variant="primary">
          Novo Diagnóstico
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function Resultado() {
  const { id } = useParams<{ id: string }>();
  const { openContato } = useContato();
  const result = id ? getDiagnostico(id) : null;
  const [activeTab, setActiveTab] = useState<ActiveTab>('swot');

  if (!result) return <NotFound />;

  const { formData, score, status, swot } = result;
  const { municipio, uf } = formData.phase1;

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          header { display: none !important; }
          footer { display: none !important; }
          .tab-content { display: block !important; }
          body { background: white; }
          .resultado-container { padding: 24px; }
        }
      `}</style>

      <div className="min-h-screen" style={{ backgroundColor: '#F8FAFB' }}>
        <div className="no-print">
          <PageHeader
            pageName={`Diagnóstico — ${municipio}`}
            links={[
              { label: 'Resumo', href: '#resumo' },
              { label: 'Análise', href: '#analise' },
            ]}
          />
        </div>

        <main className="pt-24 pb-20 md:pt-28 resultado-container">
          <div className="container-x">

            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
              <div>
                <p
                  className="text-[12px] uppercase tracking-[1.2px] font-medium mb-1"
                  style={{ color: '#0C4A8C' }}
                >
                  Diagnóstico Municipal
                </p>
                <h1 className="text-[26px] sm:text-[32px] font-bold text-text-primary leading-snug tracking-[-0.02em]">
                  {municipio}
                  <span className="ml-2 text-[20px] font-medium" style={{ color: '#6B7280' }}>
                    / {uf}
                  </span>
                </h1>
                <p className="mt-1 text-[13px] text-text-secondary">
                  Realizado em {formatDate(result.createdAt)} · Protocolo #{result.id}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 no-print">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium transition-colors"
                  style={{
                    color: '#4A5568',
                    backgroundColor: 'white',
                    border: '1.5px solid #DDE5EE',
                  }}
                >
                  <Printer size={14} aria-hidden="true" />
                  Imprimir / PDF
                </button>
                <Button variant="primary" size="sm" onClick={() => openContato({ tipo: 'Solicitar Consultoria', mensagem: `Gostaria de solicitar uma proposta de consultoria para ${municipio}/${uf}.` })}>
                  Solicitar Consultoria
                  <ArrowRight size={14} />
                </Button>
              </div>
            </div>

            {/* ── Resumo: Score + Dimension Bars ── */}
            <section id="resumo" aria-labelledby="resumo-heading" className="mb-6">
              <h2 id="resumo-heading" className="sr-only">Resumo do Diagnóstico</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Score card */}
                <div
                  className="rounded-[20px] p-6 sm:p-8 flex flex-col items-center"
                  style={{
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <h3 className="text-[16px] font-semibold text-text-primary mb-5 self-start">
                    Escore de Prontidão
                  </h3>
                  <ScoreGauge score={score} status={status} />
                </div>

                {/* Dimension bars card */}
                <div
                  className="rounded-[20px] p-6 sm:p-8"
                  style={{
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <h3 className="text-[16px] font-semibold text-text-primary mb-5">
                    Resumo por Dimensão
                  </h3>
                  <DimensionBars
                    formData={formData}
                    possuiConselho={formData.phase1.possuiConselhoIdoso}
                    possuiFundo={formData.phase1.possuiFundoIdoso}
                  />
                </div>
              </div>
            </section>

            {/* ── Análise: Tabs ── */}
            <section id="analise" aria-labelledby="analise-heading" className="mb-8">
              <h2 id="analise-heading" className="sr-only">Análise Detalhada</h2>

              <div
                className="rounded-[20px] overflow-hidden"
                style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                {/* Tab bar */}
                <div
                  className="flex border-b no-print"
                  style={{ borderColor: 'rgba(0,0,0,0.08)' }}
                  role="tablist"
                  aria-label="Seções do diagnóstico"
                >
                  {TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        role="tab"
                        aria-selected={isActive}
                        aria-controls={`panel-${tab.key}`}
                        id={`tab-${tab.key}`}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className="flex-1 sm:flex-none px-5 py-4 text-[14px] font-medium transition-colors relative"
                        style={{ color: isActive ? '#0C4A8C' : '#6B7280' }}
                      >
                        {tab.label}
                        {isActive && (
                          <span
                            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                            style={{ backgroundColor: '#0C4A8C' }}
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Tab panels */}
                <div className="p-6 sm:p-8">
                  <div
                    id="panel-swot"
                    role="tabpanel"
                    aria-labelledby="tab-swot"
                    className="tab-content"
                    hidden={activeTab !== 'swot'}
                  >
                    <SWOTPanel swot={swot} />
                  </div>

                  <div
                    id="panel-roadmap"
                    role="tabpanel"
                    aria-labelledby="tab-roadmap"
                    className="tab-content"
                    hidden={activeTab !== 'roadmap'}
                  >
                    <RoadmapSteps />
                  </div>

                  <div
                    id="panel-consultoria"
                    role="tabpanel"
                    aria-labelledby="tab-consultoria"
                    className="tab-content"
                    hidden={activeTab !== 'consultoria'}
                  >
                    <ConsultoriaPackages score={score} />
                  </div>
                </div>
              </div>
            </section>

            {/* ── Bottom action bar ── */}
            <div
              className="flex flex-wrap items-center justify-center gap-4 no-print"
              aria-label="Ações disponíveis"
            >
              <Button variant="primary" size="md" onClick={() => openContato({ tipo: 'Solicitar Consultoria', mensagem: `Gostaria de solicitar uma proposta de consultoria para ${municipio}/${uf}.` })}>
                <span>Solicitar Consultoria</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Button>

              <Button href="/#dados" variant="secondary" size="md">
                <Map size={16} aria-hidden="true" />
                <span>Ver Mapa de Fundos</span>
              </Button>

              <Button href="/recursos" variant="ghost" size="md">
                <BookOpen size={16} aria-hidden="true" />
                <span>Acessar Recursos</span>
              </Button>
            </div>

            {/* ── Refazer diagnóstico (small link) ── */}
            <p className="text-center mt-6 text-[13px] text-text-secondary no-print">
              Quer refazer com dados atualizados?{' '}
              <Link
                to="/diagnostico"
                className="font-medium underline underline-offset-2 hover:text-text-primary transition-colors"
                style={{ color: '#0C4A8C' }}
              >
                Novo diagnóstico
              </Link>
            </p>

          </div>
        </main>

        <div className="no-print">
          <Footer />
        </div>
      </div>
    </>
  );
}
