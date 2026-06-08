const STEPS = [
  {
    num: 1,
    title: 'Consolidação da Base Legal',
    prazo: '1–3 meses',
    color: '#0C4A8C',
    bg: '#EBF4FF',
    tasks: [
      'Revisar a legislação federal (Lei nº 10.741/2003 e Lei nº 12.213/2010)',
      'Elaborar ou adequar o projeto de lei de criação do Fundo Municipal',
      'Regularizar pendências do Conselho Municipal do Idoso',
      'Atualizar regimento interno do Conselho',
    ],
  },
  {
    num: 2,
    title: 'Fortalecimento do Conselho',
    prazo: '3–6 meses',
    color: '#7C3AED',
    bg: '#F5F3FF',
    tasks: [
      'Capacitar conselheiros em legislação, orçamento e controle social',
      'Definir comissões temáticas e distribuição de tarefas',
      'Estabelecer rotinas de reuniões e publicações',
      'Firmar parcerias com IES e entidades da sociedade civil',
    ],
  },
  {
    num: 3,
    title: 'Captação de Recursos',
    prazo: '6–12 meses',
    color: '#28A87A',
    bg: '#ECFDF5',
    tasks: [
      'Cadastrar o Fundo no sistema de IRPF (Receita Federal)',
      'Lançar campanha de doações para pessoas físicas e jurídicas',
      'Prospectar e firmar parcerias com empresas locais',
      'Elaborar material de comunicação e divulgação',
    ],
  },
  {
    num: 4,
    title: 'Implementação de Programas',
    prazo: '12–18 meses',
    color: '#D97706',
    bg: '#FFFBEB',
    tasks: [
      'Definir prioridades programáticas junto ao Conselho',
      'Publicar editais para seleção de projetos e entidades',
      'Monitorar execução e realizar prestação de contas',
      'Avaliar resultados e planejar o próximo ciclo',
    ],
  },
];

export default function RoadmapSteps() {
  return (
    <div className="flex flex-col gap-5">
      {STEPS.map((step, idx) => (
        <div key={step.num} className="flex gap-4">
          {/* Timeline column */}
          <div className="flex flex-col items-center gap-0 shrink-0">
            {/* Circle */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-bold text-white shrink-0"
              style={{ backgroundColor: step.color }}
            >
              {step.num}
            </div>
            {/* Line */}
            {idx < STEPS.length - 1 && (
              <div
                className="flex-1 w-0.5 my-1"
                style={{ backgroundColor: '#E5E7EB', minHeight: '24px' }}
              />
            )}
          </div>

          {/* Content card */}
          <div
            className="flex-1 rounded-[14px] p-4 mb-3"
            style={{ backgroundColor: step.bg, border: `1px solid ${step.color}30` }}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3
                className="text-[15px] font-bold"
                style={{ color: step.color }}
              >
                {step.title}
              </h3>
              <span
                className="shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
                style={{ backgroundColor: step.color + '20', color: step.color }}
              >
                {step.prazo}
              </span>
            </div>

            <ul className="flex flex-col gap-1.5">
              {step.tasks.map((task) => (
                <li key={task} className="flex items-start gap-2 text-[13px] text-text-secondary">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                    className="shrink-0 mt-0.5"
                  >
                    <circle cx="7" cy="7" r="6" fill={step.color} fillOpacity="0.15" />
                    <path
                      d="M4.5 7l2 2 3-3"
                      stroke={step.color}
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {task}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
