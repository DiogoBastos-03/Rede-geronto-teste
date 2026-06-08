import type { Phase1Data } from '../../diagnostico/types';
import { UF_LIST } from '../../diagnostico/types';
import ToggleField from './ToggleField';

interface Props {
  data: Phase1Data;
  onChange: (d: Phase1Data) => void;
  errors: Record<string, boolean>;
}

const inputBase =
  'w-full px-4 py-3 rounded-[12px] text-[14px] bg-[#F7F9FC] border transition-colors outline-none focus:border-[#0C4A8C] focus:bg-white focus:ring-2 focus:ring-[rgba(12,74,140,0.12)]';

const inputStyle = (hasError?: boolean) => ({
  borderColor: hasError ? '#EF4444' : '#DDE5EE',
});

export default function Phase1Form({ data, onChange, errors }: Props) {
  const set = (partial: Partial<Phase1Data>) => onChange({ ...data, ...partial });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[22px] font-semibold text-text-primary mb-1">
          Dados Básicos
        </h2>
        <p className="text-[14px] text-text-secondary">
          Informações gerais sobre o município e o responsável pelo diagnóstico.
          Campos com <span style={{ color: '#EF4444' }}>*</span> são obrigatórios.
        </p>
      </div>

      {/* Município + UF */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-text-primary" htmlFor="municipio">
            Nome do Município <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            id="municipio"
            type="text"
            value={data.municipio}
            onChange={(e) => set({ municipio: e.target.value })}
            placeholder="Ex.: Belo Horizonte"
            className={inputBase}
            style={inputStyle(errors.municipio)}
            aria-required="true"
            aria-invalid={errors.municipio}
          />
          {errors.municipio && (
            <p className="text-[12px]" style={{ color: '#EF4444' }}>Campo obrigatório</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-text-primary" htmlFor="uf">
            Estado <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <select
            id="uf"
            value={data.uf}
            onChange={(e) => set({ uf: e.target.value })}
            className={inputBase}
            style={inputStyle(errors.uf)}
            aria-required="true"
            aria-invalid={errors.uf}
          >
            <option value="">UF</option>
            {UF_LIST.map((uf) => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
          {errors.uf && (
            <p className="text-[12px]" style={{ color: '#EF4444' }}>Obrigatório</p>
          )}
        </div>
      </div>

      {/* Populações */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-text-primary" htmlFor="popTotal">
            População Total
          </label>
          <input
            id="popTotal"
            type="number"
            min="0"
            value={data.populacaoTotal}
            onChange={(e) => set({ populacaoTotal: e.target.value })}
            placeholder="Ex.: 45000"
            className={inputBase}
            style={inputStyle()}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-text-primary" htmlFor="popIdosa">
            População Idosa (60+)
          </label>
          <input
            id="popIdosa"
            type="number"
            min="0"
            value={data.populacaoIdosa}
            onChange={(e) => set({ populacaoIdosa: e.target.value })}
            placeholder="Ex.: 6500"
            className={inputBase}
            style={inputStyle()}
          />
        </div>
      </div>

      {/* Dados do gestor */}
      <div
        className="rounded-[14px] p-5 flex flex-col gap-4"
        style={{
          backgroundColor: '#F0F6FF',
          border: '1px solid #DBEAFE',
        }}
      >
        <p className="text-[13px] font-semibold text-text-primary">
          Dados do Gestor Responsável{' '}
          <span className="font-normal text-text-secondary">(opcional)</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-secondary" htmlFor="nomeGestor">
              Nome
            </label>
            <input
              id="nomeGestor"
              type="text"
              value={data.nomeGestor}
              onChange={(e) => set({ nomeGestor: e.target.value })}
              placeholder="Nome completo"
              className={inputBase}
              style={inputStyle()}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-secondary" htmlFor="cargo">
              Cargo
            </label>
            <input
              id="cargo"
              type="text"
              value={data.cargo}
              onChange={(e) => set({ cargo: e.target.value })}
              placeholder="Ex.: Secretário Municipal"
              className={inputBase}
              style={inputStyle()}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-secondary" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => set({ email: e.target.value })}
              placeholder="email@municipio.gov.br"
              className={inputBase}
              style={inputStyle()}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-secondary" htmlFor="telefone">
              Telefone
            </label>
            <input
              id="telefone"
              type="tel"
              value={data.telefone}
              onChange={(e) => set({ telefone: e.target.value })}
              placeholder="(00) 90000-0000"
              className={inputBase}
              style={inputStyle()}
            />
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div
        className="rounded-[14px] p-5 flex flex-col divide-y divide-[#F3F4F6]"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #DDE5EE',
        }}
      >
        <ToggleField
          id="conselho"
          label="Possui Conselho do Idoso?"
          description="Conselho Municipal dos Direitos da Pessoa Idosa constituído e ativo."
          checked={data.possuiConselhoIdoso}
          onChange={(v) => set({ possuiConselhoIdoso: v })}
        />
        <ToggleField
          id="fundo"
          label="Possui Fundo do Idoso?"
          description="Fundo Municipal criado por lei e com conta específica."
          checked={data.possuiFundoIdoso}
          onChange={(v) => set({ possuiFundoIdoso: v })}
        />
      </div>
    </div>
  );
}
