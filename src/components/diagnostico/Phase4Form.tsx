import type { Phase4Data } from '../../diagnostico/types';
import RatingInput from './RatingInput';

interface Props {
  data: Phase4Data;
  onChange: (d: Phase4Data) => void;
  errors: Record<string, boolean>;
}

const CRITERIA: Array<{
  key: keyof Phase4Data;
  label: string;
  description: string;
}> = [
  {
    key: 'apoioPrefeitura',
    label: 'Apoio da Prefeitura / Secretarias',
    description:
      'Nível de engajamento e suporte da gestão executiva municipal (Prefeito, Secretário de Assistência Social, etc.).',
  },
  {
    key: 'disposicaoCamara',
    label: 'Disposição da Câmara Municipal',
    description:
      'Receptividade dos vereadores à aprovação de legislação para criação ou fortalecimento do Fundo Municipal do Idoso.',
  },
  {
    key: 'engajamentoSociedadeCivil',
    label: 'Engajamento da Sociedade Civil',
    description:
      'Grau de mobilização de ONGs, lideranças comunitárias e entidades na defesa dos direitos do idoso.',
  },
  {
    key: 'historicoPoliticasSociais',
    label: 'Histórico de Políticas Sociais',
    description:
      'Tradição do município em implementar e sustentar políticas públicas sociais ao longo das gestões.',
  },
];

export default function Phase4Form({ data, onChange, errors }: Props) {
  const set = (key: keyof Phase4Data, val: number) =>
    onChange({ ...data, [key]: val });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[22px] font-semibold text-text-primary mb-1">
          Prontidão Política
        </h2>
        <p className="text-[14px] text-text-secondary">
          Avalie o suporte político-institucional disponível para a
          implementação do fundo. Todos os critérios são obrigatórios.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {CRITERIA.map(({ key, label, description }) => (
          <div
            key={key}
            className="rounded-[14px] p-5"
            style={{
              backgroundColor: '#FAFBFC',
              border: errors[key] ? '1.5px solid #EF4444' : '1px solid #DDE5EE',
            }}
          >
            <RatingInput
              label={label}
              description={description}
              value={data[key]}
              onChange={(v) => set(key, v)}
              hasError={errors[key]}
            />
          </div>
        ))}
      </div>

      {/* Summary box */}
      <div
        className="rounded-[16px] p-5 flex flex-col gap-3"
        style={{
          background: 'linear-gradient(135deg, #EBF4FF, #E8F5F0)',
          border: '1px solid #BFDBFE',
        }}
      >
        <p className="text-[13px] font-semibold text-text-primary">
          Ao finalizar, você receberá:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            'Escore de Prontidão (0–100)',
            'Análise SWOT personalizada',
            'Roadmap de implementação em 4 etapas',
            'Recomendação de pacote de consultoria',
            'Relatório completo para impressão',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-[13px] text-text-secondary">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                className="shrink-0 mt-0.5"
              >
                <circle cx="8" cy="8" r="7" fill="#28A87A" fillOpacity="0.15" />
                <path
                  d="M5 8l2 2 4-4"
                  stroke="#28A87A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {errors._phase4 && (
        <p className="text-[13px] text-center" style={{ color: '#EF4444' }}>
          Avalie todos os 4 critérios antes de finalizar.
        </p>
      )}
    </div>
  );
}
