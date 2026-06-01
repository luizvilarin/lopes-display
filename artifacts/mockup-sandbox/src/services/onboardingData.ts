export interface Slide {
  id: string;
  template: "cover" | "welcome" | "bullets" | "grid" | "split-metrics" | "map";
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
  ativo: boolean;
  ordem: number;
}

export const DEFAULT_SLIDES: Slide[] = [
  {
    id: "slide-1",
    template: "cover",
    title: "NOVOS\nCORRETORES\nONBOARDING",
    subtitle: "Guia para te auxiliar a ser um corretor de sucesso",
    year: "2026",
    unitLabel: "LOPES {unidade}",
    ativo: true,
    ordem: 1
  },
  {
    id: "slide-2",
    template: "welcome",
    title: "ESTAMOS FELIZES\nEM TER VOCÊS\nAQUI CONOSCO",
    subtitle: "OLÁ CORRETORES,",
    body: "A LOPES IMOBILIÁRIA valoriza a integração de novos corretores, promovendo um ambiente de aprendizado e desenvolvimento. Este processo abrange temas essenciais como PeopleFy, CRECI e estratégias de vendas, garantindo que cada corretor receba o suporte necessário para o sucesso profissional.",
    image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=350&h=350&fit=crop", // placeholder premium de diretor
    ativo: true,
    ordem: 2
  },
  {
    id: "slide-3",
    template: "bullets",
    title: "PAPEL\nESTRATÉGICO DO\nCORRETOR",
    subtitle: "OLÁ CORRETORES,",
    bullets: [
      {
        title: "O corretor está no centro das estratégias.",
        subtexts: [
          "É ele quem transforma as oportunidades em resultados.",
          "Na Lopes, o corretor é o dono do próprio sucesso.",
          "Assuma o protagonismo, construa sua marca e vá além."
        ]
      },
      {
        title: "Apoio constante nas suas conquistas:",
        subtexts: [
          "Conte com a ajuda direta de gestores, coordenadores e diretores.",
          "A equipe de RH e Gente está pronta para auxiliar no seu desenvolvimento."
        ]
      },
      {
        title: "Uma jornada compartilhada:",
        subtexts: [
          "Oferecemos treinamentos constantes, ferramentas digitais e mentoria.",
          "A Lopes oferece o caminho. Você escolhe até onde quer chegar."
        ]
      }
    ],
    ativo: true,
    ordem: 3
  },
  {
    id: "slide-4",
    template: "grid",
    title: "MVV",
    subtitle: "NOSSOS PILARES CORPORATIVOS",
    cards: [
      {
        title: "MISSÃO",
        content: "Realizar sonhos e conectar pessoas através da melhor experiência no mercado imobiliário.",
        variant: "primary"
      },
      {
        title: "VALORES",
        content: "Nossa essência no dia a dia do trabalho comercial:",
        bullets: [
          "Atitude de Dono",
          "Sangue no Olho",
          "União e Cooperação",
          "Foco em Resultado",
          "Melhora Contínua"
        ],
        variant: "accent"
      },
      {
        title: "VISÃO",
        content: "Tornar-se a imobiliária mais admirada do mercado, transformando negócios em grandes histórias de sucesso.",
        variant: "secondary"
      }
    ],
    ativo: true,
    ordem: 4
  },
  {
    id: "slide-5",
    template: "split-metrics",
    title: "OVERVIEW\nDA EMPRESA",
    body: "Fundada em 1935 por Francisco Lopes em São Paulo. Com mais de 90 anos de experiência consolidada, somos a maior imobiliária da América Latina e referência global absoluta no setor.",
    metrics: [
      { value: "+ 178", label: "Lojas próprias e franqueadas" },
      { value: "+ 8 mil", label: "Corretores associados na rede" },
      { value: "R$ 15Bi+", label: "Em volume geral de vendas anual" }
    ],
    image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&h=400&fit=crop",
    ativo: true,
    ordem: 5
  },
  {
    id: "slide-6",
    template: "map",
    title: "NOSSA FORÇA.",
    subtitle: "ALCANCE GEOGRÁFICO",
    body: "O alcance comercial de nossa rede integrada confere-nos posição de liderança estratégica. Unimos capilaridade geográfica nacional com inteligência e ferramentas tecnológicas de escala exclusiva.",
    mapData: {
      regionCount: "26 Estados + DF",
      centerHighlight: "Presença Forte no Centro-Oeste"
    },
    ativo: true,
    ordem: 6
  },
  {
    id: "slide-7",
    template: "bullets",
    title: "TREINAMENTOS\nE CAPACITAÇÃO",
    subtitle: "DESENVOLVIMENTO",
    bullets: [
      {
        title: "Lopes Academy e Formação de Talentos",
        subtexts: [
          "Aulas online e presenciais sobre negociação e documentação.",
          "Programa de aceleração para novos corretores cadastrados."
        ]
      },
      {
        title: "Atualizações Regulares de Mercado",
        subtexts: [
          "Workshops com economistas, construtoras e parceiros do setor.",
          "Treinamentos de técnicas de fechamento e contorno de objeções."
        ]
      }
    ],
    ativo: true,
    ordem: 7
  },
  {
    id: "slide-8",
    template: "grid",
    title: "FERRAMENTAS\nDO CORRETOR",
    subtitle: "TECNOLOGIA LOPES",
    cards: [
      {
        title: "PEOPLEFY CRM",
        content: "Gestão inteligente de contatos, funil de vendas integrado e cruzamento automático de perfis de compradores com imóveis da carteira.",
        variant: "primary"
      },
      {
        title: "PORTAL LOPES",
        content: "A maior vitrine imobiliária da internet. Milhares de acessos diários gerando leads qualificados diretamente para o seu painel.",
        variant: "accent"
      },
      {
        title: "APLICATIVO",
        content: "Leve o portfólio completo em seu celular. Compartilhe fichas de imóveis estilizadas em PDF e links personalizados via WhatsApp.",
        variant: "secondary"
      }
    ],
    ativo: true,
    ordem: 8
  },
  {
    id: "slide-9",
    template: "split-metrics",
    title: "SOLUÇÕES\nFINANCEIRAS",
    body: "Através da CrediPronto (parceria com o Itaú), oferecemos crédito rápido e assessoria jurídica completa para o cliente, garantindo aprovação em até 24 horas e fechamento rápido da comissão.",
    metrics: [
      { value: "24h", label: "Prazo para análise de crédito" },
      { value: "98%", label: "De taxa de aprovação de financiamento" },
      { value: "0 custo", label: "Para assessoria jurídica de fechamento" }
    ],
    image_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&h=400&fit=crop",
    ativo: true,
    ordem: 9
  },
  {
    id: "slide-10",
    template: "bullets",
    title: "JORNADA DO\nCLIENTE LOPES",
    subtitle: "EXCELÊNCIA EM SERVIÇO",
    bullets: [
      {
        title: "1. Primeiro Contato e Qualificação",
        subtexts: [
          "Entender a real dor e desejo do cliente antes de enviar opções.",
          "Cadastrar o perfil correto no CRM para acionar cruzamentos automáticos."
        ]
      },
      {
        title: "2. Visitas Encantadoras",
        subtexts: [
          "Planejar a rota de visitas de forma eficiente e pontual.",
          "Apresentar benefícios do bairro e características exclusivas do imóvel."
        ]
      },
      {
        title: "3. Proposta e Fechamento",
        subtexts: [
          "Intermediação ativa apoiada pelos gestores comerciais.",
          "Segurança documental tratada diretamente pelo time jurídico da Lopes."
        ]
      }
    ],
    ativo: true,
    ordem: 10
  },
  {
    id: "slide-11",
    template: "grid",
    title: "METAS E\nRECONHECIMENTO",
    subtitle: "PLACAR ENVOLVENTE",
    cards: [
      {
        title: "MENSAL",
        content: "Desafio focado nas metas mensais de lançamentos e prontos. Acompanhe a barra de meta enchendo ao longo do mês!",
        variant: "primary"
      },
      {
        title: "ANUAL",
        content: "A grande jornada anual de vendas acumuladas de toda a unidade. Consistência que leva ao topo do ranking geral da empresa.",
        variant: "accent"
      },
      {
        title: "PREMIAÇÕES",
        content: "Destaque e prestígio no pódio oficial. Viagens, troféus e comissões especiais para os campeões de vendas.",
        variant: "secondary"
      }
    ],
    ativo: true,
    ordem: 11
  },
  {
    id: "slide-12",
    template: "split-metrics",
    title: "PRIMEIRA VENDA\nDA SEMANA",
    body: "Um reconhecimento vibrante e sonoro exibido em todas as telas da TV da unidade! Sempre que você fecha um negócio, seu nome e foto aparecem em destaque para celebrar com toda a equipe.",
    metrics: [
      { value: "FOGUETE", label: "Na tela em tempo real" },
      { value: "SOM", label: "Alerta sonoro de fechamento" },
      { value: "PALMAS", label: "E comemoração de toda a loja" }
    ],
    image_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&h=400&fit=crop",
    ativo: true,
    ordem: 12
  },
  {
    id: "slide-13",
    template: "bullets",
    title: "OFERTÃO E\nLANÇAMENTOS",
    subtitle: "FOCO COMERCIAL",
    bullets: [
      {
        title: "Campanhas Especiais do Ofertão",
        subtexts: [
          "Finais de semana dedicados a produtos selecionados com superdescontos.",
          "Plantão ativo de corretores com alto volume de captação de leads."
        ]
      },
      {
        title: "Parceria Exclusiva Construtoras",
        subtexts: [
          "Acesso antecipado à tabela e memorial de lançamentos.",
          "Plantões de vendas estruturados e decorados exclusivos."
        ]
      }
    ],
    ativo: true,
    ordem: 13
  },
  {
    id: "slide-14",
    template: "grid",
    title: "NOSSO DNA",
    subtitle: "CULTURA EM AÇÃO",
    cards: [
      {
        title: "SANGUE NO OLHO",
        content: "Atitude agressiva no mercado, persistência nas negociações e paixão por fechar o melhor negócio para nossos clientes.",
        variant: "accent"
      },
      {
        title: "ATITUDE DE DONO",
        content: "Proatividade total. Cuidar de cada lead, de cada imóvel e de toda a infraestrutura física como se a Lopes fosse sua.",
        variant: "primary"
      },
      {
        title: "MELHORA CONTÍNUA",
        content: "Saber que o sucesso de ontem não garante o de amanhã. Buscar aprendizado constante e estar aberto a feedbacks.",
        variant: "secondary"
      }
    ],
    ativo: true,
    ordem: 14
  },
  {
    id: "slide-15",
    template: "bullets",
    title: "ÉTICA E\nPROFISSIONALISMO",
    subtitle: "CÓDIGO DE CONDUTA",
    bullets: [
      {
        title: "CRECI Ativo e Atualizado",
        subtexts: [
          "Garantia de segurança jurídica e responsabilidade legal nas transações.",
          "Uso obrigatório da credencial profissional em todas as divulgações."
        ]
      },
      {
        title: "Respeito ao Cliente e Colega",
        subtexts: [
          "Transparência em todas as informações de preços e condições do imóvel.",
          "Ética profissional nas parcerias de vendas entre corretores (repartição)."
        ]
      }
    ],
    ativo: true,
    ordem: 15
  },
  {
    id: "slide-16",
    template: "split-metrics",
    title: "ATENDIMENTO\nDE LEADS",
    body: "Lembre-se: no mercado digital imobiliário, velocidade é tudo! Leads respondidos nos primeiros 5 minutos têm uma taxa de conversão 10 vezes maior.",
    metrics: [
      { value: "< 5min", label: "Tempo de resposta ideal" },
      { value: "10x", label: "Mais conversões em vendas" },
      { value: "100%", label: "Dos contatos registrados no PeopleFy" }
    ],
    image_url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&h=400&fit=crop",
    ativo: true,
    ordem: 16
  },
  {
    id: "slide-17",
    template: "bullets",
    title: "PRODUÇÃO DE\nCONTEÚDO E FOTOS",
    subtitle: "DICA DE SUCESSO",
    bullets: [
      {
        title: "Fotos de Alto Impacto",
        subtexts: [
          "Fotografar com luz do dia, abrir cortinas e limpar ambientes.",
          "Aproveitar ângulos amplos (lentes grande-angulares do celular)."
        ]
      },
      {
        title: "Vídeos e Redes Sociais",
        subtexts: [
          "Fazer tours guiados de 1 minuto em formato Vertical (Reels/TikTok).",
          "Marcar o perfil da unidade para impulsionamento cruzado."
        ]
      }
    ],
    ativo: true,
    ordem: 17
  },
  {
    id: "slide-18",
    template: "grid",
    title: "EXCLUSIVIDADE\nE GANHOS",
    subtitle: "ALTA PERFORMANCE",
    cards: [
      {
        title: "CONTRATO EXCLUSIVO",
        content: "A maior garantia de venda rápida. O proprietário confia na força Lopes e você foca 100% dos esforços de marketing.",
        variant: "primary"
      },
      {
        title: "INVESTIMENTO",
        content: "A Lopes patrocina anúncios em portais e redes sociais para imóveis exclusivos, multiplicando a atração de leads.",
        variant: "accent"
      },
      {
        title: "COMISSÃO CHEIA",
        content: "Fidelidade e ganhos maximizados para o corretor captador e vendedor de produtos exclusivos da carteira.",
        variant: "secondary"
      }
    ],
    ativo: true,
    ordem: 18
  },
  {
    id: "slide-19",
    template: "bullets",
    title: "DICAS PARA\nO DIA A DIA",
    subtitle: "ROTINA DO CAMPEÃO",
    bullets: [
      {
        title: "Planeje o Dia na Noite Anterior",
        subtexts: [
          "Listar as 5 tarefas mais importantes para o dia seguinte.",
          "Revisar o PeopleFy logo de manhã para novos leads."
        ]
      },
      {
        title: "Crie Conexões Reais",
        subtexts: [
          "Não venda imóveis, venda lares e histórias de vida.",
          "O pós-venda atencioso garante indicações valiosas de novos clientes."
        ]
      }
    ],
    ativo: true,
    ordem: 19
  },
  {
    id: "slide-20",
    template: "cover",
    title: "CONSTRUA\nSEU IMPÉRIO\nNA LOPES",
    subtitle: "Seja muito bem-vindo e ótimas vendas!",
    year: "GO!",
    unitLabel: "LOPES {unidade}",
    ativo: true,
    ordem: 20
  }
];
