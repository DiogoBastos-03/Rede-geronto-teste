import { getPackageKey } from '../../diagnostico/scoring';
import { useContato } from '../../contexts/ContatoContext';

interface ConsultoriaPackagesProps {
  score: number;
}

const PACKAGES = [
  {
    key: 'diagnostico-planejamento',
    name: 'Diagnóstico e Planejamento',
    preco: 'R$ 15.000 – R$ 25.000',
    prazo: '4–6 semanas',
    color: '#2196C9',
    bg: '#EBF8FF',
    border: '#BFDBFE',
    descricao:
      'Levantamento completo da situação atual, análise das lacunas e entrega de plano estratégico personalizado para criação do fundo.',
    itens: [
      'Entrevistas com gestores e conselheiros',
      'Análise documental e diagnóstico jurídico',
      'Plano estratégico de implementação',
      'Capacitação introdutória da equipe',
    ],
  },
  {
    key: 'implementacao-completa',
    name: 'Implementação Completa',
    preco: 'R$ 40.000 – R$ 60.000',
    prazo: '12–16 semanas',
    color: '#0C4A8C',
    bg: '#EEF4FF',
    border: '#C7D7F6',
    descricao:
      'Acompanhamento ponta a ponta: do diagnóstico à criação legal do fundo, instalação do conselho, cadastro no IRPF e primeiras captações.',
    itens: [
      'Assessoria jurídica para lei de criação',
      'Estruturação do Conselho Municipal do Idoso',
      'Cadastro no sistema IRPF da Receita Federal',
      'Treinamento completo da equipe',
      'Campanha de captação inicial',
    ],
  },
  {
    key: 'gestao-continua',
    name: 'Gestão Contínua',
    preco: 'R$ 5.000/mês',
    prazo: '12 meses',
    color: '#28A87A',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    descricao:
      'Suporte mensal contínuo para municípios que já possuem o fundo, focando em captação de recursos, transparência e melhoria contínua.',
    itens: [
      'Relatórios mensais de captação e aplicação',
      'Suporte a reuniões do Conselho',
      'Assessoria em editais e seleção de projetos',
      'Capacitação contínua da equipe',
    ],
  },
];

export default function ConsultoriaPackages({ score }: ConsultoriaPackagesProps) {
  const recommended = getPackageKey(score);
  const { openContato } = useContato();

  return (
    <div className="flex flex-col gap-5">
      <p className="text-[14px] text-text-secondary">
        Com base no escore de prontidão <strong className="text-text-primary">{score}/100</strong>,
        o pacote <strong className="text-text-primary">recomendado para o seu perfil</strong> está
        destacado abaixo.
      </p>

      {PACKAGES.map((pkg) => {
        const isRecommended = pkg.key === recommended;
        return (
          <div
            key={pkg.key}
            className="rounded-[16px] p-5 flex flex-col gap-4 relative overflow-hidden"
            style={{
              backgroundColor: isRecommended ? pkg.bg : '#FAFBFC',
              border: isRecommended
                ? `2px solid ${pkg.color}`
                : '1px solid #E5E7EB',
            }}
          >
            {/* Recommended badge */}
            {isRecommended && (
              <div
                className="absolute top-0 right-0 px-3 py-1 text-[11px] font-bold text-white rounded-bl-[12px]"
                style={{ backgroundColor: pkg.color }}
              >
                ★ Recomendado para seu perfil
              </div>
            )}

            <div className="flex flex-col gap-1 pr-4">
              <h3
                className="text-[17px] font-bold"
                style={{ color: isRecommended ? pkg.color : '#1F2937' }}
              >
                {pkg.name}
              </h3>
              <p className="text-[13px] text-text-secondary leading-relaxed">
                {pkg.descricao}
              </p>
            </div>

            {/* Price + prazo row */}
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="text-[15px] font-bold"
                style={{ color: pkg.color }}
              >
                {pkg.preco}
              </span>
              <span
                className="px-2.5 py-0.5 rounded-full text-[12px] font-medium"
                style={{
                  backgroundColor: pkg.color + '18',
                  color: pkg.color,
                }}
              >
                {pkg.prazo}
              </span>
            </div>

            {/* Feature list */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {pkg.itens.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[13px] text-text-secondary">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                    className="shrink-0 mt-0.5"
                  >
                    <circle cx="7" cy="7" r="6" fill={pkg.color} fillOpacity="0.15" />
                    <path
                      d="M4.5 7l2 2 3-3"
                      stroke={pkg.color}
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => openContato({
                  tipo: 'Solicitar Consultoria',
                  mensagem: `Gostaria de solicitar uma proposta para o pacote "${pkg.name}".`,
                })}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-shadow hover:shadow-md text-white"
                style={{ backgroundColor: pkg.color }}
              >
                Solicitar proposta
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M2.5 7h9M8 3.5L11.5 7 8 10.5"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
