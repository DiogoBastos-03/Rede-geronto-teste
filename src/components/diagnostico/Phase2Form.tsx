import type { Phase2Data } from '../../diagnostico/types';
import RatingInput from './RatingInput';

interface Props {
  data: Phase2Data;
  onChange: (d: Phase2Data) => void;
  errors: Record<string, boolean>;
}

const CRITERIA: Array<{
  key: keyof Phase2Data;
  label: string;
  description: string;
}> = [
  {
    key: 'estruturaAdministrativa',
    label: 'a) Estrutura administrativa para gestão de fundos',
    description:
      'Existência de setor, coordenação ou secretaria responsável pela gestão de fundos públicos municipais.',
  },
  {
    key: 'recursosHumanos',
    label: 'b) Recursos humanos disponíveis',
    description:
      'Quantidade e qualificação dos servidores que poderiam atuar na gestão e prestação de contas do fundo.',
  },
  {
    key: 'conhecimentoLegislacao',
    label: 'c) Conhecimento sobre legislação federal do idoso',
    description:
      'Domínio da equipe sobre a Lei nº 10.741/2003 (Estatuto), Lei nº 12.213/2010 (IRPF) e normativas do CNAS.',
  },
  {
    key: 'experienciaFundos',
    label: 'd) Experiência anterior com fundos especiais',
    description:
      'Histórico de gestão de outros fundos (Saúde, Assistência Social, DCA, etc.) que indica familiaridade com o modelo.',
  },
  {
    key: 'articulacaoSociedade',
    label: 'e) Articulação com sociedade civil',
    description:
      'Capacidade de mobilizar ONGs, associações, igrejas e entidades para participar do Conselho e do controle social.',
  },
];

export default function Phase2Form({ data, onChange, errors }: Props) {
  const set = (key: keyof Phase2Data, val: number) =>
    onChange({ ...data, [key]: val });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[22px] font-semibold text-text-primary mb-1">
          Capacidade Institucional
        </h2>
        <p className="text-[14px] text-text-secondary">
          Avalie cada critério de 1 (Muito baixo) a 5 (Muito alto). Todos os
          campos são obrigatórios.
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

      {errors._phase2 && (
        <p
          className="text-[13px] text-center"
          style={{ color: '#EF4444' }}
        >
          Avalie todos os 5 critérios antes de continuar.
        </p>
      )}
    </div>
  );
}
