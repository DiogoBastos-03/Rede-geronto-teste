import { useState } from 'react';
import { CheckCircle2, Star, ArrowRight } from 'lucide-react';
import { useContato } from '../contexts/ContatoContext';
import PageHeader from '../components/layout/PageHeader';
import Footer from '../components/layout/Footer';
import RecursosHero from '../components/sections/recursos/RecursosHero';
import RecursoCard from '../components/sections/RecursoCard';
import type { Recurso } from '../components/sections/RecursoCard';
import recursosData from '../data/recursos.json';

const recursos = recursosData.recursos as Recurso[];
const _meta = recursosData._meta;
const destaques = recursos.filter((r) => r.destaque === true);

export default function Recursos() {
  const [activeTab, setActiveTab] = useState('todos');
  const { openContato } = useContato();

  const filtered =
    activeTab === 'todos'
      ? recursos
      : recursos.filter((r) => r.categoria === activeTab);

  return (
    <div className="min-h-screen bg-bg-primary">
      <a
        href="#recursos-hero"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-blue-deep focus:text-white focus:px-4 focus:py-2 focus:rounded-pill"
      >
        Pular para o conteúdo
      </a>
      <PageHeader
        pageName="Recursos"
        links={[
          { label: 'Essenciais', href: '#essenciais' },
          { label: 'Biblioteca', href: '#biblioteca' },
        ]}
      />

      <main>
        <RecursosHero />

      {/* Stats bar */}
      <div className="border-b border-[rgba(0,0,0,0.07)] bg-white">
        <div className="container-x py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-8">
            {_meta.stats.map((s) => (
              <div key={s.label}>
                <span className="text-[28px] font-bold text-text-primary">{s.n}</span>
                <span className="text-[13px] ml-2 text-text-secondary">{s.label}</span>
              </div>
            ))}
          </div>
          <div
            className="flex items-center gap-2 text-[13px]"
            style={{ color: '#5F5E5A' }}
          >
            <CheckCircle2 size={16} style={{ color: '#28A87A' }} aria-hidden="true" />
            {_meta.fontesVerificadas}
          </div>
        </div>
      </div>

      {/* Essenciais */}
      <section id="essenciais" className="py-16 bg-[#F8FAFB]" aria-labelledby="essenciais-heading">
        <div className="container-x">
          <div className="flex items-center gap-2 mb-8">
            <Star size={18} style={{ color: '#F59E0B' }} aria-hidden="true" />
            <h2 id="essenciais-heading" className="text-[22px] font-semibold text-text-primary">
              Documentos Essenciais
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {destaques.map((r) => (
              <RecursoCard key={r.id} recurso={r} />
            ))}
          </div>
        </div>
      </section>

      {/* Biblioteca Completa */}
      <section id="biblioteca" className="py-16 bg-white" aria-labelledby="biblioteca-heading">
        <div className="container-x">
          <h2 id="biblioteca-heading" className="text-[22px] font-semibold mb-6 text-text-primary">
            Biblioteca Completa
          </h2>

          {/* Tabs */}
          <div role="tablist" className="flex flex-wrap gap-2 mb-8" aria-label="Filtrar por categoria">
            {_meta.categorias.map((cat) => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={activeTab === cat.id}
                onClick={() => setActiveTab(cat.id)}
                className="px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors border"
                style={{
                  backgroundColor: activeTab === cat.id ? '#0C4A8C' : '#F7F9FC',
                  color: activeTab === cat.id ? '#FFFFFF' : '#4A5568',
                  borderColor: activeTab === cat.id ? '#0C4A8C' : '#D5E3F0',
                }}
              >
                {cat.label}{' '}
                <span className="ml-1 opacity-60">{cat.count}</span>
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((r) => (
              <RecursoCard key={r.id} recurso={r} />
            ))}
          </div>
        </div>
      </section>

      {/* Nota discreta */}
      <div className="container-x py-8 border-t border-[rgba(0,0,0,0.07)]">
        <p
          className="text-[12px] leading-relaxed max-w-3xl"
          style={{ color: '#9CA3AF' }}
        >
          {_meta.notaSolicitar}
        </p>
      </div>

      {/* CTA Final */}
      <section
        className="py-20"
        style={{ background: 'linear-gradient(135deg,#0C4A8C 0%,#135C99 100%)' }}
        aria-labelledby="cta-recursos-heading"
      >
        <div className="container-x text-center">
          <h2
            id="cta-recursos-heading"
            className="text-[28px] sm:text-[36px] font-semibold text-white mb-4"
          >
            {_meta.ctaFinal.titulo}
          </h2>
          <p
            className="text-[17px] max-w-2xl mx-auto mb-8"
            style={{ color: 'rgba(255,255,255,0.75)' }}
          >
            {_meta.ctaFinal.texto}
          </p>
          <button
            type="button"
            onClick={() => openContato({ tipo: 'Solicitar Consultoria', mensagem: 'Gostaria de saber mais sobre a consultoria para implementar um fundo no meu município.' })}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold text-white transition-shadow hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)]"
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.30)',
            }}
          >
            {_meta.ctaFinal.botao}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
}
