import type { DiagnosticoFormData, SWOTData, SWOTItem } from './types';

const i = (text: string): SWOTItem => ({ text });

// ── Texto mapeado por critério ─────────────────────────────────────────────────

type CriterionKey =
  | 'estruturaAdministrativa'
  | 'recursosHumanos'
  | 'conhecimentoLegislacao'
  | 'experienciaFundos'
  | 'articulacaoSociedade'
  | 'apoioPrefeitura'
  | 'disposicaoCamara'
  | 'engajamentoSociedadeCivil'
  | 'historicoPoliticasSociais';

const FORCAS: Record<CriterionKey, SWOTItem> = {
  estruturaAdministrativa:   i('Estrutura administrativa consolidada para gestão de fundos públicos'),
  recursosHumanos:           i('Equipe técnica qualificada e disponível para a implementação'),
  conhecimentoLegislacao:    i('Domínio da legislação federal do idoso e seus mecanismos de captação'),
  experienciaFundos:         i('Experiência prévia comprovada com gestão de fundos especiais'),
  articulacaoSociedade:      i('Forte articulação com sociedade civil e organizações locais'),
  apoioPrefeitura:           i('Apoio institucional sólido da Prefeitura e das Secretarias competentes'),
  disposicaoCamara:          i('Câmara Municipal favorável à aprovação de nova legislação social'),
  engajamentoSociedadeCivil: i('Sociedade civil engajada e mobilizada em torno da causa do idoso'),
  historicoPoliticasSociais: i('Histórico positivo de políticas sociais estruturadas no município'),
};

const FRAQUEZAS: Record<CriterionKey, SWOTItem> = {
  estruturaAdministrativa:   i('Estrutura administrativa insuficiente para a gestão de fundos'),
  recursosHumanos:           i('Limitação de recursos humanos para conduzir a implementação'),
  conhecimentoLegislacao:    i('Conhecimento incipiente sobre a legislação federal do idoso'),
  experienciaFundos:         i('Ausência de experiência prévia com gestão de fundos especiais'),
  articulacaoSociedade:      i('Fraca articulação com organizações da sociedade civil local'),
  apoioPrefeitura:           i('Apoio institucional limitado por parte da gestão municipal'),
  disposicaoCamara:          i('Câmara Municipal pouco receptiva a novas legislações sociais'),
  engajamentoSociedadeCivil: i('Baixo engajamento da sociedade civil no tema do idoso'),
  historicoPoliticasSociais: i('Histórico fraco de políticas sociais estruturadas'),
};

const AMEACAS: Record<CriterionKey, SWOTItem> = {
  estruturaAdministrativa:   i('Risco de má gestão dos recursos captados por fragilidade estrutural'),
  recursosHumanos:           i('Sobrecarga da equipe pode levar ao abandono do processo de implementação'),
  conhecimentoLegislacao:    i('Erros procedimentais por desconhecimento legal podem inviabilizar captações'),
  experienciaFundos:         i('Curva de aprendizagem lenta pode atrasar a obtenção de resultados'),
  articulacaoSociedade:      i('Falta de engajamento civil pode comprometer a legitimidade do fundo'),
  apoioPrefeitura:           i('Instabilidade política pode paralisar o processo de criação do fundo'),
  disposicaoCamara:          i('Dificuldade legislativa pode bloquear ou atrasar a criação do fundo'),
  engajamentoSociedadeCivil: i('Ausência de controle social compromete transparência e eficácia'),
  historicoPoliticasSociais: i('Falta de cultura institucional pode impedir a sustentação de políticas sociais'),
};

const OPORTUNIDADES_POTENCIAL: Record<CriterionKey, SWOTItem> = {
  estruturaAdministrativa:   i('Estrutura administrativa com potencial de desenvolvimento com capacitação dirigida'),
  recursosHumanos:           i('Capacidade técnica passível de qualificação mediante treinamento específico'),
  conhecimentoLegislacao:    i('Base de conhecimento que pode ser rapidamente aprimorada com apoio técnico'),
  experienciaFundos:         i('Abertura para adquirir experiência em fundos especiais com suporte de consultoria'),
  articulacaoSociedade:      i('Redes de colaboração existentes a serem fortalecidas e ampliadas'),
  apoioPrefeitura:           i('Disposição moderada da gestão que pode ser convertida em apoio pleno com sensibilização'),
  disposicaoCamara:          i('Câmara com potencial de sensibilização por meio de audiências e formação'),
  engajamentoSociedadeCivil: i('Sociedade civil com potencial de mobilização a ser explorado estrategicamente'),
  historicoPoliticasSociais: i('Oportunidade de inaugurar uma nova era de políticas sociais municipais'),
};

// ── Fallbacks (usados se um quadrante ficar com < 2 itens) ────────────────────

const FALLBACK_FORCAS: SWOTItem[] = [
  i('Iniciativa de realizar o diagnóstico demonstra comprometimento com a causa'),
  i('Potencial de captação de recursos do IRPF ainda não explorado'),
];

const FALLBACK_FRAQUEZAS: SWOTItem[] = [
  i('Município ainda sem diagnóstico formal das necessidades específicas dos idosos'),
  i('Lacunas de planejamento estratégico para políticas de envelhecimento ativo'),
];

const FALLBACK_OPORTUNIDADES: SWOTItem[] = [
  i('Legislação federal favorável (Lei nº 12.213/2010) facilita a criação do fundo'),
  i('Crescimento da população idosa amplia a relevância e urgência do tema localmente'),
];

const FALLBACK_AMEACAS: SWOTItem[] = [
  i('Concorrência com municípios mais estruturados na captação de recursos do IRPF'),
  i('Descontinuidade política pode comprometer iniciativas de longo prazo'),
];

// ── Geração ───────────────────────────────────────────────────────────────────

export function generateSWOT(data: DiagnosticoFormData): SWOTData {
  const { phase1, phase2, phase3, phase4 } = data;

  const forcas: SWOTItem[] = [];
  const fraquezas: SWOTItem[] = [];
  const oportunidades: SWOTItem[] = [];
  const ameacas: SWOTItem[] = [];

  const criteria: Array<{ key: CriterionKey; value: number }> = [
    { key: 'estruturaAdministrativa',   value: phase2.estruturaAdministrativa },
    { key: 'recursosHumanos',           value: phase2.recursosHumanos },
    { key: 'conhecimentoLegislacao',    value: phase2.conhecimentoLegislacao },
    { key: 'experienciaFundos',         value: phase2.experienciaFundos },
    { key: 'articulacaoSociedade',      value: phase2.articulacaoSociedade },
    { key: 'apoioPrefeitura',           value: phase4.apoioPrefeitura },
    { key: 'disposicaoCamara',          value: phase4.disposicaoCamara },
    { key: 'engajamentoSociedadeCivil', value: phase4.engajamentoSociedadeCivil },
    { key: 'historicoPoliticasSociais', value: phase4.historicoPoliticasSociais },
  ];

  for (const { key, value } of criteria) {
    if (value >= 4) forcas.push(FORCAS[key]);
    if (value <= 2) {
      fraquezas.push(FRAQUEZAS[key]);
      ameacas.push(AMEACAS[key]);
    }
    if (value === 3) oportunidades.push(OPORTUNIDADES_POTENCIAL[key]);
  }

  // ── Toggles fase 1 ──────────────────────────────────────────────────────────
  if (phase1.possuiConselhoIdoso) {
    forcas.push(i('Conselho Municipal do Idoso já constituído e ativo'));
  } else {
    fraquezas.push(i('Ausência de Conselho Municipal do Idoso'));
    ameacas.push(i('Sem conselho ativo não há instância de controle e deliberação do fundo'));
  }

  if (phase1.possuiFundoIdoso) {
    forcas.push(i('Fundo Municipal do Idoso já estabelecido e operacional'));
  } else {
    fraquezas.push(i('Fundo Municipal do Idoso ainda não criado'));
    oportunidades.push(i('Fundo Municipal do Idoso a ser criado para captar recursos do IRPF'));
  }

  // ── Contexto fase 3 ─────────────────────────────────────────────────────────
  if (phase3.hasIES) {
    oportunidades.push(
      i('Presença de Instituição de Ensino Superior viabiliza parcerias técnicas e pesquisas aplicadas'),
    );
  }

  const numEnt = parseInt(phase3.numEntidadesCivis || '0', 10);
  if (numEnt > 0) {
    oportunidades.push(
      i(`${numEnt} entidade${numEnt > 1 ? 's' : ''} civil${numEnt > 1 ? 's' : ''} ativa${numEnt > 1 ? 's' : ''} disponíve${numEnt > 1 ? 'is' : 'l'} para mobilização e controle social`),
    );
  }

  const numEmp = parseInt(phase3.numEmpresasInteressadas || '0', 10);
  if (numEmp > 0) {
    oportunidades.push(
      i(`${numEmp} empresa${numEmp > 1 ? 's' : ''} local${numEmp > 1 ? 'is' : ''} potencialmente interessada${numEmp > 1 ? 's' : ''} em destinar IRPF ao fundo`),
    );
  }

  // ── Garantir mín 2 / máx 4 ──────────────────────────────────────────────────
  const clamp = (arr: SWOTItem[], fallback: SWOTItem[]) => {
    const result = arr.slice(0, 4);
    let fi = 0;
    while (result.length < 2 && fi < fallback.length) {
      result.push(fallback[fi++]);
    }
    return result;
  };

  return {
    forcas:       clamp(forcas, FALLBACK_FORCAS),
    fraquezas:    clamp(fraquezas, FALLBACK_FRAQUEZAS),
    oportunidades: clamp(oportunidades, FALLBACK_OPORTUNIDADES),
    ameacas:      clamp(ameacas, FALLBACK_AMEACAS),
  };
}
