import { ExternalLink } from 'lucide-react';
import { useContato } from '../../contexts/ContatoContext';

export interface Recurso {
  id: number;
  titulo: string;
  tipo: string;
  badge?: string | null;
  descricao: string;
  fonte: string;
  ano: number;
  url: string;
  acao: 'acessar' | 'solicitar';
  categoria: 'legislacao' | 'cartilhas' | 'modelos' | 'guias';
  destaque?: boolean;
}

// Paleta por categoria
const CAT_STYLE: Record<string, { bg: string; text: string }> = {
  legislacao: { bg: '#DBEAFE', text: '#1E40AF' },
  cartilhas:  { bg: '#D1FAE5', text: '#065F46' },
  modelos:    { bg: '#EDE9FE', text: '#5B21B6' },
  guias:      { bg: '#FEF3C7', text: '#92400E' },
};

// Paleta de badge
const BADGE_STYLE: Record<string, { bg: string; text: string }> = {
  'Essencial':          { bg: '#D1FAE5', text: '#065F46' },
  'PDF Oficial':        { bg: '#DBEAFE', text: '#1E40AF' },
  '2025':               { bg: '#E0F2FE', text: '#0369A1' },
  'Gratuito':           { bg: '#D1FAE5', text: '#065F46' },
  'Referência Nacional':{ bg: '#EDE9FE', text: '#5B21B6' },
  'Solicitar':          { bg: '#FEF3C7', text: '#92400E' },
};

interface RecursoCardProps {
  recurso: Recurso;
  compact?: boolean;
}

export default function RecursoCard({ recurso, compact = false }: RecursoCardProps) {
  const { openContato } = useContato();
  const catStyle = CAT_STYLE[recurso.categoria] ?? { bg: '#F3F4F6', text: '#374151' };
  const badgeStyle = recurso.badge ? (BADGE_STYLE[recurso.badge] ?? { bg: '#F3F4F6', text: '#374151' }) : null;

  return (
    <div
      className="rounded-[16px] bg-white flex flex-col overflow-hidden h-full"
      style={{
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      <div className="px-4 pt-4 pb-4 flex flex-col gap-2.5 h-full">
        {/* Chips */}
        <div className="flex flex-wrap gap-1.5">
          <span
            className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: catStyle.bg, color: catStyle.text }}
          >
            {recurso.tipo}
          </span>
          {recurso.badge && badgeStyle && (
            <span
              className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.text }}
            >
              {recurso.badge}
            </span>
          )}
        </div>

        {/* Título */}
        <h3
          className={`font-semibold leading-[1.35] text-text-primary ${compact ? 'text-[13px]' : 'text-[15px]'}`}
        >
          {recurso.titulo}
        </h3>

        {/* Descrição — só quando não compact */}
        {!compact && (
          <p className="text-[13px] leading-[1.6] text-text-secondary flex-1">
            {recurso.descricao}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Rodapé */}
        <p className="text-[11px]" style={{ color: '#9CA3AF' }}>
          {recurso.fonte} · {recurso.ano}
        </p>

        {/* Botão de ação */}
        {recurso.acao === 'acessar' ? (
          <a
            href={recurso.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors"
            style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}
          >
            Acessar
            <ExternalLink size={12} aria-hidden="true" />
          </a>
        ) : (
          <button
            type="button"
            onClick={() => openContato({
              tipo: 'Solicitar Consultoria',
              mensagem: `Gostaria de solicitar o documento "${recurso.titulo}".`,
            })}
            className="inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors"
            style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}
          >
            Solicitar
          </button>
        )}
      </div>
    </div>
  );
}
