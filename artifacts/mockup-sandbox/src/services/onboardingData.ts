export interface TeamMember {
  name: string;
  role: string;
  image_url: string;
}

export interface TimelineItem {
  title: string;
  description: string;
  image_url?: string;
}

export interface SpinItem {
  letter: string;
  title: string;
  description: string;
}

export interface CareerTier {
  name: string;
  percentage: string;
  rule: string;
}

export interface Slide {
  id: string;
  template: 
    | "cover" 
    | "welcome" 
    | "bullets" 
    | "grid" 
    | "split-metrics" 
    | "map" 
    | "team-grid" 
    | "timeline" 
    | "campaign" 
    | "meritocracia" 
    | "spin" 
    | "career" 
    | "benefits" 
    | "creci" 
    | "dress-code" 
    | "tools" 
    | "marketing";
  title: string;
  subtitle?: string;
  body?: string;
  year?: string;
  unitLabel?: string;
  image_url?: string;
  bullets?: Array<{
    title: string;
    subtexts?: string[];
  }>;
  cards?: Array<{
    title: string;
    content: string;
    bullets?: string[];
    variant?: "primary" | "secondary" | "accent";
  }>;
  metrics?: Array<{
    value: string;
    label: string;
  }>;
  mapData?: {
    regionCount: string;
    centerHighlight: string;
  };
  teamMembers?: TeamMember[];
  timelineItems?: TimelineItem[];
  spinData?: SpinItem[];
  careerTiers?: CareerTier[];
  images?: string[];
  ativo: boolean;
  ordem: number;
}

export const DEFAULT_SLIDES: Slide[] = [
  {
    id: "slide-1",
    template: "cover",
    title: "CULTURA\nLOPES {unidade}",
    subtitle: "Guia de Onboarding e Integração Comercial",
    year: "2026",
    unitLabel: "LOPES {unidade}",
    image_url: "/cultura/FOTOS/LOJA AP.jpg",
    ativo: true,
    ordem: 1
  },
  {
    id: "slide-2",
    template: "split-metrics",
    title: "OVERVIEW\nDA EMPRESA",
    body: "A rede LOPES foi fundada em 1935 por Francisco Lopes na cidade de São Paulo. Atualmente com 90 anos de experiência consolidada no mercado, somos a maior imobiliária da América Latina e a terceira maior do mundo.",
    metrics: [
      { value: "90 anos", label: "De história no mercado" },
      { value: "+ 178", label: "Lojas próprias e franquias" },
      { value: "+ 8 mil", label: "Corretores associados na rede" }
    ],
    image_url: "/cultura/FOTOS/LOJA AP.jpg",
    ativo: true,
    ordem: 2
  },
  {
    id: "slide-3",
    template: "welcome",
    title: "ESTAMOS FELIZES\nEM TER VOCÊS\nAQUI CONOSCO",
    subtitle: "OLÁ CORRETORES,",
    body: "Minha Trajetória na Lopes:\n\nEm 2022, iniciei minha jornada na Lopes movida pelo desejo de aprender, crescer e construir uma carreira sólida. Ao longo dessa caminhada, tive a oportunidade de desenvolver novas competências e enfrentar grandes desafios. Hoje atuo como Coordenadora de RH. Minha história demonstra que, na Lopes, o crescimento profissional é uma realidade concreta!",
    image_url: "/cultura/CORPO ADMINISTRATIVO/ERILENE AP.jpg",
    ativo: true,
    ordem: 3
  },
  {
    id: "slide-4",
    template: "team-grid",
    title: "CORPO ADMINISTRATIVO",
    subtitle: "NOSSA EQUIPE DE SUPORTE OPERACIONAL",
    teamMembers: [
      { name: "Leidiane", role: "Gerente Adm", image_url: "/cultura/CORPO ADMINISTRATIVO/LEIDE AP.jpg" },
      { name: "Gabrielly", role: "Gerente SecVendas", image_url: "/cultura/CORPO ADMINISTRATIVO/GABY AP.jpg" },
      { name: "Luana", role: "Analista Financeiro", image_url: "/cultura/CORPO ADMINISTRATIVO/LUANA IA AP.jpg" },
      { name: "Rafaela", role: "Assis. SecVenda", image_url: "/cultura/CORPO ADMINISTRATIVO/SEC AP.jpg" },
      { name: "Aline", role: "Analista Adm", image_url: "/cultura/CORPO ADMINISTRATIVO/SARA AP.jpg" },
      { name: "Edna", role: "Copeira", image_url: "/cultura/CORPO ADMINISTRATIVO/TIA EDNA AP.jpg" }
    ],
    ativo: true,
    ordem: 4
  },
  {
    id: "slide-5",
    template: "welcome",
    title: "HISTÓRIA DA\nLOPES GOIÂNIA",
    subtitle: "FUNDAÇÃO E EXPANSÃO",
    body: "A Lopes Goiânia foi fundada em 05 de dezembro de 2019 por Murilo Feitosa e Sereno Leão, nossos Sócio-Diretores. Com o crescimento exponencial da marca na região, em parceria com o novo sócio de negócio, Rafael Badra, inauguramos nossa segunda unidade em 08 de abril de 2021. Já em 10 de fevereiro de 2022, lançamos a operação focada 100% em vendas digitais no Jardim Goiás, garantindo um atendimento especializado e de alta performance.",
    image_url: "/cultura/FOTOS/FOTOS AP.jpg",
    ativo: true,
    ordem: 5
  },
  {
    id: "slide-6",
    template: "bullets",
    title: "ATITUDES\nINADMISSÍVEIS",
    subtitle: "CULTURA DA EMPRESA",
    bullets: [
      {
        title: "Comportamentos que enfraquecem o grupo:",
        subtexts: [
          "Reclamação vazia sem propor solução",
          "Fofocas ou boatos que minam o clima de união",
          "Vitimismo diante dos desafios comerciais",
          "Mediocridade ou falta de compromisso com a excelência",
          "Indisciplina na rotina de plantões e normas da casa",
          "Desunião ou atitudes individualistas que prejudicam os colegas"
        ]
      }
    ],
    ativo: true,
    ordem: 6
  },
  {
    id: "slide-7",
    template: "timeline",
    title: "EVENTOS DA EMPRESA",
    subtitle: "RECONHECIMENTO, METAS E PREMIAÇÕES",
    timelineItems: [
      { 
        title: "Lopes Supera", 
        description: "Um dos maiores eventos internos da Lopes, focado em premiações, reconhecimento de metas superadas, apresentação do pipeline anual e comemoração em equipe.", 
        image_url: "/cultura/FOTOS/EVENTOS/SUPERA.jpg" 
      },
      { 
        title: "Club 512", 
        description: "Imersão de alta performance com treinamento intensivo de 8 horas sobre técnicas de vendas, negociação e aceleração de resultados.", 
        image_url: "/cultura/FOTOS/EVENTOS/CLUB512.jpg" 
      },
      { 
        title: "Vendeu, Ganhou Mobi 0km", 
        description: "O primeiro corretor da unidade a atingir R$ 30 milhões em VGV no período da campanha é premiado com um carro Fiat Mobi 0km." 
      },
      { 
        title: "Meta Geral da Unidade", 
        description: "Quando a loja/unidade bate 100% da meta global estipulada para a campanha de performance anual, toda a equipe participa da premiação do carro." 
      },
      { 
        title: "Viagens por Performance", 
        description: "Viagens inesquecíveis para corretores e superintendentes de destaque, entregues oficialmente no Lopes Supera (com regras de parcerias e destratos)." 
      }
    ],
    ativo: true,
    ordem: 7
  },
  {
    id: "slide-8",
    template: "campaign",
    title: "CARRO POR PERFORMANCE",
    subtitle: "CAMPANHA DE ALTO RENDIMENTO",
    body: "Regras da Campanha de Performance para corretores ativos da unidade:",
    bullets: [
      {
        title: "Carro Fiat Mobi 0km na Garagem",
        subtexts: [
          "1º corretor a atingir R$ 30 milhões de VGV ganha 1 carro Fiat Mobi 0km.",
          "Novo carro é liberado a cada R$ 5 milhões adicionais alcançados pela unidade (35M, 40M, etc.).",
          "Campanha por unidade de negócio independente."
        ]
      }
    ],
    image_url: "/cultura/FOTOS/FOTOS 2/campanha carro por perfomance.png",
    ativo: true,
    ordem: 8
  },
  {
    id: "slide-9",
    template: "campaign",
    title: "PROGRAMA INDIQUE E GANHE",
    subtitle: "CAMPANHA INDIQUE E CRESÇA",
    body: "Multiplique seu VGV histórico indicando novos talentos para a Lopes Goiânia:",
    bullets: [
      {
        title: "Regras de Bonificação por Indicação",
        subtexts: [
          "Ao indicar um profissional que venha a se associar, o indicador ganha o VGV das vendas dele para efeito de plano de carreira.",
          "Período de apuração da bonificação: 90 dias após a entrada do indicado.",
          "Exemplo prático: O indicado vende R$ 1 milhão. Você ganha +R$ 1 milhão somado no seu VGV histórico!"
        ]
      }
    ],
    image_url: "/cultura/FOTOS/FOTOS 2/indique e ganhe.png",
    ativo: true,
    ordem: 9
  },
  {
    id: "slide-10",
    template: "meritocracia",
    title: "CULTURA DE MERITOCRACIA",
    subtitle: "MANIFESTO DE RESULTADOS",
    body: "Na Lopes Goiânia, o crescimento não é promessa — é consequência. Nossa cultura é pautada estritamente no acompanhamento de resultados, dedicação e ética profissional.",
    metrics: [
      { value: "MENSURÁVEL", label: "A Performance é medida diariamente" },
      { value: "ACOMPANHADO", label: "O Resultado é acompanhado de perto" },
      { value: "RECONHECIDA", label: "A Entrega de excelência é sempre reconhecida" }
    ],
    image_url: "/cultura/FOTOS/FOTOS 2/meritocracia.png",
    ativo: true,
    ordem: 10
  },
  {
    id: "slide-11",
    template: "bullets",
    title: "NORMAS DA CASA E CONVIVÊNCIA",
    subtitle: "REGRAS E CULTURA DO PLANTÃO",
    bullets: [
      {
        title: "Funcionamento e Cozinha",
        subtexts: [
          "Imobiliária aberta de segunda a sexta, a partir das 07:30h.",
          "Café fresco feito diariamente acompanhado de pão e rosquinhas Mabel."
        ]
      },
      {
        title: "Regras do Plantão de Vendas",
        subtexts: [
          "Plantões oficiais da loja ocorrem nos horários: 08:00h, 12:55h e 19:00h.",
          "Tolerância rígida de 10 minutos para apresentação do corretor."
        ]
      },
      {
        title: "Crachás de Identificação",
        subtexts: [
          "Uso do crachá é obrigatório em todas as dependências.",
          "Sem CRECI ativo: utiliza o crachá de Treinamento.",
          "CRECI estagiário: crachá personalizado com foto."
        ]
      }
    ],
    ativo: true,
    ordem: 11
  },
  {
    id: "slide-12",
    template: "bullets",
    title: "CRM 100BUG - TUDO EM UM SÓ LUGAR",
    subtitle: "TECNOLOGIA E VENDAS",
    bullets: [
      {
        title: "Funcionalidades Principais do CRM",
        subtexts: [
          "Dashboard com gráficos de performance e vendas em tempo real",
          "Gestão integrada de clientes e controle do funil de negócios",
          "Gestão e busca de imóveis do portfólio",
          "Integração nativa com os principais portais imobiliários",
          "Fila inteligente de distribuição e timeline detalhada de leads",
          "Ferramentas de Inteligência Artificial integradas diretamente ao WhatsApp"
        ]
      }
    ],
    image_url: "/cultura/FOTOS/FOTOS 2/cultura comercial lopes 1.png",
    ativo: true,
    ordem: 12
  },
  {
    id: "slide-13",
    template: "spin",
    title: "CULTURA COMERCIAL",
    subtitle: "METODOLOGIA SPIN SELLING",
    body: "Não vendemos imóveis. Diagnosticamos necessidades e construímos soluções. O SPIN é a metodologia oficial de vendas e atendimento do Grupo Lopes.",
    spinData: [
      { letter: "S", title: "Situação", description: "Perguntas para entender o contexto do cliente." },
      { letter: "P", title: "Problema", description: "Perguntas para descobrir as dores e insatisfações." },
      { letter: "I", title: "Implicação", description: "Perguntas para levantar as consequências se nada for feito." },
      { letter: "N", title: "Necessidade", description: "Perguntas para conduzir à solução e fechamento do negócio." }
    ],
    ativo: true,
    ordem: 13
  },
  {
    id: "slide-14",
    template: "career",
    title: "PLANO DE CARREIRA DO CORRETOR",
    subtitle: "TABELA DE COMISSIONAMENTO",
    body: "Na Lopes, seu esforço é acumulado de forma permanente. O seu plano de carreira nunca retroage!",
    careerTiers: [
      { name: "Extraordinário", percentage: "2,5%", rule: "Aplicável em lançamentos exclusivos." },
      { name: "Visionário", percentage: "2,3%", rule: "Atingindo R$ 30M vendidos nos últimos 5 anos (dentro ou fora da Lopes)." },
      { name: "Especialista", percentage: "2,2%", rule: "Atingindo R$ 20M vendidos nos últimos 5 anos (dentro ou fora da Lopes)." },
      { name: "Legado", percentage: "2,0%", rule: "Atingindo R$ 2M vendidos nos últimos 5 anos (dentro ou fora da Lopes)." },
      { name: "Entusiasta", percentage: "1,9%", rule: "Início da jornada do corretor associado." }
    ],
    ativo: true,
    ordem: 14
  },
  {
    id: "slide-15",
    template: "benefits",
    title: "CLUBE DE BENEFÍCIOS LOPES",
    subtitle: "PARCERIAS E VANTAGENS EXCLUSIVAS",
    images: [
      "/cultura/FOTOS/BENEFICIOS/Imagem21 copiar.png",
      "/cultura/FOTOS/BENEFICIOS/Imagem22 copiar.png"
    ],
    ativo: true,
    ordem: 15
  },
  {
    id: "slide-16",
    template: "creci",
    title: "CRECI E ÉTICA PROFISSIONAL",
    subtitle: "REGULAMENTAÇÃO PROFISSIONAL",
    bullets: [
      {
        title: "Inscrição Obrigatória",
        subtexts: [
          "O CRECI (Conselho Regional de Corretores de Imóveis) é o registro profissional obrigatório por lei, assegurando a legalidade do exercício da profissão de corretor."
        ]
      },
      {
        title: "Segurança e Conformidade",
        subtexts: [
          "Trabalhar devidamente regularizado com o CRECI evita passivos jurídicos e sanções financeiras pesadas para o corretor e para a empresa."
        ]
      },
      {
        title: "Acesso a Benefícios e Prêmios",
        subtexts: [
          "O registro regularizado possibilita a participação em cursos de capacitação profissional, inclusão oficial nas escrituras de vendas e concorrência a prêmios da imobiliária e incorporadoras."
        ]
      }
    ],
    ativo: true,
    ordem: 16
  },
  {
    id: "slide-17",
    template: "dress-code",
    title: "VESTIMENTA E APARÊNCIA MASCULINA",
    subtitle: "IMAGEM PROFISSIONAL - DRESS CODE",
    body: "Uma aparência cuidadosa reduz ruídos na comunicação. A vestimenta social masculina demonstra maturidade, capacidade de adaptação e entendimento do perfil corporativo médio e alto padrão da Lopes.",
    images: [
      "/cultura/FOTOS/VESTIMENTA MASCULINO/Imagem16.jpg",
      "/cultura/FOTOS/VESTIMENTA MASCULINO/Imagem17.jpg",
      "/cultura/FOTOS/VESTIMENTA MASCULINO/Imagem18.jpg",
      "/cultura/FOTOS/VESTIMENTA MASCULINO/Imagem19.jpg",
      "/cultura/FOTOS/VESTIMENTA MASCULINO/Imagem20.jpg"
    ],
    ativo: true,
    ordem: 17
  },
  {
    id: "slide-18",
    template: "tools",
    title: "G-MAIL E GOOGLE CALENDAR",
    subtitle: "ORGANIZAÇÃO E GESTÃO DE TEMPO",
    cards: [
      {
        title: "E-mail Corporativo",
        content: "Fundamental para centralizar contratos, propostas e negociações com segurança e organização.",
        variant: "primary"
      },
      {
        title: "Agendamento Eficiente",
        content: "Com a integração do Gmail e Calendar, agende visitas com clientes e reuniões internas em poucos cliques.",
        variant: "accent"
      },
      {
        title: "Gestão do Tempo",
        content: "Controle visual de seus horários de atendimento, rotinas de plantão e compromissos pessoais.",
        variant: "secondary"
      }
    ],
    ativo: true,
    ordem: 18
  },
  {
    id: "slide-19",
    template: "marketing",
    title: "MARKETING PESSOAL",
    subtitle: "FERRAMENTAS DE ATRAÇÃO DE LEADS",
    cards: [
      {
        title: "Instagram Profissional",
        content: "Vitrine para construção de sua marca pessoal, divulgação de imóveis com fotos/vídeos atraentes e engajamento.",
        variant: "accent"
      },
      {
        title: "WhatsApp Business",
        content: "Sua foto de perfil, nome e descrição são o seu cartão de visitas digital. Mantenha-os altamente alinhados e profissionais.",
        variant: "primary"
      },
      {
        title: "Etiquetas Adesivas",
        content: "Personalize materiais físicos (panfletos, folders) com seu nome, celular e número do CRECI, conferindo total credibilidade.",
        variant: "secondary"
      }
    ],
    ativo: true,
    ordem: 19
  },
  {
    id: "slide-20",
    template: "dress-code",
    title: "VESTIMENTA E APARÊNCIA FEMININA",
    subtitle: "IMAGEM PROFISSIONAL - DRESS CODE",
    body: "A imagem profissional transmite profissionalismo e seriedade, impactando positivamente a percepção dos clientes sobre a sua competência. Vista-se de forma elegante e sintonizada com o perfil Lopes.",
    images: [
      "/cultura/FOTOS/VESTIMENTA FEMININO/Imagem11.jpg",
      "/cultura/FOTOS/VESTIMENTA FEMININO/Imagem12.jpg",
      "/cultura/FOTOS/VESTIMENTA FEMININO/Imagem13.jpg",
      "/cultura/FOTOS/VESTIMENTA FEMININO/Imagem14.jpg",
      "/cultura/FOTOS/VESTIMENTA FEMININO/Imagem15.jpg"
    ],
    ativo: true,
    ordem: 20
  }
];
