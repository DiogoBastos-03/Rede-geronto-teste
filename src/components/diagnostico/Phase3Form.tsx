import type { Phase3Data } from '../../diagnostico/types';
import RatingInput from './RatingInput';
import ToggleField from './ToggleField';

interface Props {
  data: Phase3Data;
  onChange: (d: Phase3Data) => void;
  errors: Record<string, boolean>;
}

const inputBase =
  'w-full px-4 py-3 rounded-[12px] text-[14px] bg-[#F7F9FC] border border-[#DDE5EE] transition-colors outline-none focus:border-[#0C4A8C] focus:bg-white focus:ring-2 focus:ring-[rgba(12,74,140,0.12)]';

export default function Phase3Form({ data, onChange, errors }: Props) {
  const set = (partial: Partial<Phase3Data>) => onChange({ ...data, ...partial });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[22px] font-semibold text-text-primary mb-1">
          Contexto Local
        </h2>
        <p className="text-[14px] text-text-secondary">
          Informações sobre o ecossistema institucional e social do município.
        </p>
      </div>

      {/* Toggle IES */}
      <div
        className="rounded-[14px] p-5"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #DDE5EE' }}
      >
        <ToggleField
          id="ies"
          label="Há Instituição de Ensino Superior (IES) no município?"
          description="Universidade, faculdade ou instituto federal que pode firmar parceria técnica."
          checked={data.hasIES}
          onChange={(v) => set({ hasIES: v })}
        />
      </div>

      {/* Quantitativos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-text-primary" htmlFor="numEntidades">
            Nº de entidades civis atuantes
          </label>
          <p className="text-[12px] text-text-secondary -mt-1">
            ONGs, associações, grupos de terceira idade, etc.
          </p>
          <input
            id="numEntidades"
            type="number"
            min="0"
            value={data.numEntidadesCivis}
            onChange={(e) => set({ numEntidadesCivis: e.target.value })}
            placeholder="Ex.: 8"
            className={inputBase}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-text-primary" htmlFor="numEmpresas">
            Nº de empresas potencialmente interessadas
          </label>
          <p className="text-[12px] text-text-secondary -mt-1">
            Empresas locais que poderiam destinar IRPF ao fundo.
          </p>
          <input
            id="numEmpresas"
            type="number"
            min="0"
            value={data.numEmpresasInteressadas}
            onChange={(e) => set({ numEmpresasInteressadas: e.target.value })}
            placeholder="Ex.: 15"
            className={inputBase}
          />
        </div>
      </div>

      {/* Nível políticas públicas */}
      <div
        className="rounded-[14px] p-5"
        style={{
          backgroundColor: '#FAFBFC',
          border: errors.nivelPoliticasPublicas ? '1.5px solid #EF4444' : '1px solid #DDE5EE',
        }}
      >
        <RatingInput
          label="Nível de políticas públicas para idosos no município"
          description="Avalie a amplitude e qualidade das ações municipais já existentes voltadas à pessoa idosa."
          value={data.nivelPoliticasPublicas}
          onChange={(v) => set({ nivelPoliticasPublicas: v })}
          hasError={errors.nivelPoliticasPublicas}
        />
      </div>

      {/* Principais demandas */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold text-text-primary" htmlFor="demandas">
          Principais demandas dos idosos no município
          <span className="font-normal text-text-secondary ml-1">(opcional)</span>
        </label>
        <textarea
          id="demandas"
          rows={3}
          value={data.principaisDemandas}
          onChange={(e) => set({ principaisDemandas: e.target.value })}
          placeholder="Descreva brevemente as necessidades mais urgentes identificadas..."
          className={`${inputBase} resize-none`}
        />
      </div>
    </div>
  );
}
