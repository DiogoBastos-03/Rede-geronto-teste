import type {
  DiagnosticoFormData,
  DimensionScores,
  StatusType,
} from './types';

const toScore = (nota: number) => (nota / 5) * 100;

export function calcDimensionScores(data: DiagnosticoFormData): DimensionScores {
  const { phase2, phase3, phase4 } = data;

  const capInst =
    (toScore(phase2.estruturaAdministrativa) +
      toScore(phase2.recursosHumanos) +
      toScore(phase2.conhecimentoLegislacao) +
      toScore(phase2.experienciaFundos) +
      toScore(phase2.articulacaoSociedade)) /
    5;

  const apoioPolitico =
    (toScore(phase4.apoioPrefeitura) +
      toScore(phase4.disposicaoCamara) +
      toScore(phase4.engajamentoSociedadeCivil) +
      toScore(phase4.historicoPoliticasSociais)) /
    4;

  return {
    capacidadeInstitucional: capInst,
    apoioPolitico,
    conhecimentoLegal: toScore(phase2.conhecimentoLegislacao),
    engajamentoSocial: toScore(phase4.engajamentoSociedadeCivil),
    contextoLocal: toScore(phase3.nivelPoliticasPublicas),
    recursosHumanos: toScore(phase2.recursosHumanos),
  };
}

export function calcScore(dims: DimensionScores): number {
  return Math.round(
    dims.capacidadeInstitucional * 0.25 +
      dims.apoioPolitico * 0.2 +
      dims.conhecimentoLegal * 0.15 +
      dims.engajamentoSocial * 0.15 +
      dims.contextoLocal * 0.15 +
      dims.recursosHumanos * 0.1,
  );
}

export function getStatus(score: number): StatusType {
  if (score <= 40) return 'Inicial';
  if (score <= 60) return 'Em Desenvolvimento';
  if (score <= 80) return 'Avançado';
  return 'Pronto';
}

export function getPackageKey(
  score: number,
): 'implementacao-completa' | 'diagnostico-planejamento' | 'gestao-continua' {
  if (score <= 40) return 'implementacao-completa';
  if (score <= 70) return 'diagnostico-planejamento';
  return 'gestao-continua';
}

// Helper to get raw 1–5 dimension averages for the "X/5" bar display
export function rawDimensions(data: DiagnosticoFormData) {
  const { phase2, phase3, phase4 } = data;

  const capInstRaw =
    (phase2.estruturaAdministrativa +
      phase2.recursosHumanos +
      phase2.conhecimentoLegislacao +
      phase2.experienciaFundos +
      phase2.articulacaoSociedade) /
    5;

  const apoioPoliticoRaw =
    (phase4.apoioPrefeitura +
      phase4.disposicaoCamara +
      phase4.engajamentoSociedadeCivil +
      phase4.historicoPoliticasSociais) /
    4;

  return {
    capacidadeInstitucional: capInstRaw,
    recursosHumanos: phase2.recursosHumanos,
    conhecimentoLegal: phase2.conhecimentoLegislacao,
    apoioPolitico: apoioPoliticoRaw,
    engajamentoSocial: phase4.engajamentoSociedadeCivil,
    contextoLocal: phase3.nivelPoliticasPublicas,
  };
}
