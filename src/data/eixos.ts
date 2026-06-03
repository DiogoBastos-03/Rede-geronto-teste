import {
  Building,
  Bus,
  Home,
  Users,
  Heart,
  Briefcase,
  MessageSquare,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react';

export interface Eixo {
  number: string;
  title: string;
  description: string;
  items: string[];
  Icon: LucideIcon;
}

export const EIXOS: Eixo[] = [
  {
    number: '01',
    title: 'Espaços Abertos e Prédios',
    description:
      'Calçadas acessíveis, rampas, parques seguros, banheiros públicos adaptados, iluminação adequada e proteção contra intempéries.',
    items: [
      'Rampas de acesso em todos os prédios públicos',
      'Calçadas niveladas e antiderrapantes',
      'Bancos em espaços públicos',
      'Banheiros públicos acessíveis',
    ],
    Icon: Building,
  },
  {
    number: '02',
    title: 'Transporte',
    description:
      'Transporte coletivo seguro, acessível e com assentos preferenciais. Rotas que atendam bairros com maior concentração de idosos.',
    items: [
      'Assentos preferenciais sinalizados',
      'Pontos de ônibus cobertos e com bancos',
      'Veículos com piso rebaixado',
      'Tarifas reduzidas para idosos',
    ],
    Icon: Bus,
  },
  {
    number: '03',
    title: 'Moradia',
    description:
      'Habitação segura, adaptada e próxima a serviços essenciais. Programas de reforma para acessibilidade e opções de moradia assistida.',
    items: [
      'Programas de adaptação domiciliar',
      'Moradia próxima a serviços de saúde',
      'Opções de moradia assistida',
      'Segurança residencial',
    ],
    Icon: Home,
  },
  {
    number: '04',
    title: 'Participação Social',
    description:
      'Atividades de lazer, cultura e educação acessíveis. Integração intergeracional e combate ao isolamento social.',
    items: [
      'Centros de convivência para idosos',
      'Atividades culturais e esportivas',
      'Programas intergeracionais',
      'Grupos de voluntariado',
    ],
    Icon: Users,
  },
  {
    number: '05',
    title: 'Respeito e Inclusão Social',
    description:
      'Atitudes respeitosas da comunidade, combate ao preconceito etário e valorização da experiência e sabedoria dos idosos.',
    items: [
      'Campanhas de conscientização',
      'Combate ao etarismo',
      'Valorização da experiência',
      'Representação na mídia',
    ],
    Icon: Heart,
  },
  {
    number: '06',
    title: 'Participação Cívica e Emprego',
    description:
      'Oportunidades de voluntariado, trabalho e representação política. Reconhecimento da contribuição dos idosos à sociedade.',
    items: [
      'Programas de emprego para maiores de 60',
      'Voluntariado organizado',
      'Conselhos municipais do idoso',
      'Representação política',
    ],
    Icon: Briefcase,
  },
  {
    number: '07',
    title: 'Comunicação e Informação',
    description:
      'Informações acessíveis em linguagem clara, tecnologia adaptada e múltiplos canais de comunicação para alcançar todos os idosos.',
    items: [
      'Linguagem simples e clara',
      'Fontes grandes em materiais impressos',
      'Canais de comunicação diversificados',
      'Capacitação digital',
    ],
    Icon: MessageSquare,
  },
  {
    number: '08',
    title: 'Apoio Comunitário e Serviços de Saúde',
    description:
      'Serviços de saúde acessíveis, cuidado domiciliar, suporte social e redes de apoio para idosos com diferentes necessidades.',
    items: [
      'UBS próximas e acessíveis',
      'Cuidado domiciliar',
      'Grupos de apoio',
      'Serviços de saúde mental',
    ],
    Icon: Stethoscope,
  },
];
