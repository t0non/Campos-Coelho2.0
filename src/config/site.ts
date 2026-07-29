import { SiteConfig } from "@/types/site";

export const siteConfig: SiteConfig = {
  businessName: "Shaiff Cabeleireiros",
  alternateName: "Espaço Shaiff",
  description:
    "Salão de beleza e cabeleireiro no Condomínio Edifício Angelini Center, no bairro Santa Efigênia em Belo Horizonte - MG.",
  telephone: "(31) 3564-0123",
  telephoneHref: "tel:+553135640123",
  whatsappNumber: "(31) 3564-0123",
  whatsappHref: "https://wa.me/553135640123?text=Ol%C3%A1!%20Vim%20pelo%20site%20do%20Shaiff%20Cabeleireiros%20e%20gostaria%20de%20agendar%20um%20hor%C3%A1rio.",
  address: "R. Padre Rolim, 715",
  building: "Condomínio Edifício Angelini Center",
  neighborhood: "Santa Efigênia",
  city: "Belo Horizonte",
  state: "MG",
  postalCode: "30130-094",
  country: "Brasil",
  googleBusinessProfile: "https://share.google/PCwFoDgKFJGVZaKqy",
  googleMapsUrl: "https://share.google/PCwFoDgKFJGVZaKqy",
  instagramUrl: "",
  domain: "",
  email: "",
  openingHours: null,
  reviews: null,
  socialLinks: null,
  trackingIds: null,
  brand: {
    primaryColor: "#B85C28",
    secondaryColor: "#5C4E43",
    darkSurfaceColor: "#14110F",
  },
  images: {
    logoPlaceholder: "/images/placeholder-logo.svg",
    heroPlaceholder: "/images/placeholder-hero.jpg",
    salonPlaceholder: "/images/placeholder-salon.jpg",
  },
  services: [
    {
      id: "cortes-de-cabelo",
      name: "Cortes de cabelo",
      slug: "cortes-de-cabelo",
      shortDescription:
        "Cortes femininos personalizados de acordo com o seu estilo e caimento natural.",
      fullDescription:
        "Atendimento com foco na estrutura e saúde dos fios, garantindo um corte preciso e adequado ao seu tipo de cabelo.",
      introductoryText:
        "Cortes de cabelo femininos são um dos atendimentos oferecidos pelo Shaiff Cabeleireiros, localizado no Condomínio Edifício Angelini Center em Santa Efigênia, Belo Horizonte. O serviço é realizado mediante consulta de disponibilidade e considera o estilo e a rotina do cliente.",
      benefits: [
        "Renovação do visual com caimento natural",
        "Manutenção do comprimento e saúde dos fios",
        "Ajuste do formato de acordo com o formato do rosto",
        "Praticidade na rotina de cuidados diários",
        "Cuidado atento com o corte das pontas",
      ],
      howItWorks: [
        {
          step: "Passo 1",
          title: "Conte o que você procura",
          description:
            "Explique qual estilo, comprimento ou ajuste de formato você deseja realizar.",
        },
        {
          step: "Passo 2",
          title: "Consulte as possibilidades",
          description:
            "A equipe avalia as características do seu cabelo e orienta sobre o caimento.",
        },
        {
          step: "Passo 3",
          title: "Confirme seu horário",
          description:
            "Após a conversa inicial, o procedimento de corte é executado com atenção aos detalhes.",
        },
      ],
      suitableFor: [
        "Quem deseja renovar a estrutura e a leveza do cabelo",
        "Quem busca manter as pontas saudáveis e sem pontas duplas",
        "Quem procura praticidade ao pentear e arrumar os fios no dia a dia",
        "Quem deseja adaptar o formato do cabelo à sua rotina",
      ],
      considerations: [
        "O caimento final depende da textura natural, densidade e histórico de cortes do cabelo.",
        "Consulte a disponibilidade de horário com antecedência para garantir seu atendimento.",
        "Caso queira uma alteração radical de comprimento, converse com o profissional antes de iniciar.",
      ],
      frequentlyAskedQuestions: [
        {
          question: "Como solicitar um horário para corte?",
          answer:
            "Você pode ligar para o telefone (31) 3564-0123 ou enviar uma mensagem pela nossa página de contato para consultar a disponibilidade.",
        },
        {
          question: "Posso explicar o estilo de corte que procuro?",
          answer:
            "Sim. O atendimento começa ouvindo suas preferências, estilo e rotina para alinhar as expectativas do corte.",
        },
        {
          question: "O Shaiff realiza cortes de cabelo em Santa Efigênia?",
          answer:
            "Sim. Atendemos no Condomínio Edifício Angelini Center, situado na Rua Padre Rolim, 715, em Santa Efigênia.",
        },
        {
          question: "É necessário consultar a disponibilidade antes?",
          answer:
            "Sim, os atendimentos no salão são realizados mediante consulta prévia de horários vagos.",
        },
      ],
      image: "/images/shaiff/card_corte.png",
      imageAlt: "Corte de cabelo feminino profissional no Shaiff Cabeleireiros",
      icon: "Scissors",
      primaryKeyword: "cortes de cabelo em Santa Efigênia",
      secondaryKeywords: [
        "corte de cabelo em Belo Horizonte",
        "cabeleireiro em Santa Efigênia",
        "salão para corte de cabelo BH",
      ],
      metadataTitle: "Cortes de Cabelo em Santa Efigênia | Shaiff",
      metadataDescription:
        "Cortes de cabelo femininos no bairro Santa Efigênia em Belo Horizonte. Atendimento personalizado considerando o seu estilo e rotina no Shaiff Cabeleireiros.",
      relatedSlugs: ["escova", "nutricao-e-hidratacao-capilar", "mechas"],
      featured: true,
      active: true,
    },
    {
      id: "escova",
      name: "Escova",
      slug: "escova",
      shortDescription:
        "Modelagem e alinhamento dos fios com acabamento brilhante e duradouro.",
      fullDescription:
        "Procedimento de escovação com alinhamento térmico para modelar os cabelos com suavidade e brilho.",
      introductoryText:
        "A escova de cabelo é um serviço de alinhamento e finalização prestado pelo Shaiff Cabeleireiros no bairro Santa Efigênia, Belo Horizonte. O procedimento modela os fios para o dia a dia ou ocasiões especiais.",
      benefits: [
        "Fios alinhados e com acabamento cuidadoso",
        "Redução imediata do aspecto desalinhado",
        "Praticidade ao preparar os cabelos para compromissos",
        "Modelagem que valoriza a estrutura do corte",
        "Toque suave e aparência saudável aos fios",
      ],
      howItWorks: [
        {
          step: "Passo 1",
          title: "Conte o que você procura",
          description:
            "Informe se prefere uma escova lisa tradicional, modelada ou com movimento.",
        },
        {
          step: "Passo 2",
          title: "Consulte as possibilidades",
          description:
            "A equipe prepara o cabelo com a lavagem e secagem adequadas à fibra capilar.",
        },
        {
          step: "Passo 3",
          title: "Confirme seu horário",
          description:
            "A escovação é realizada com atenção ao caimento e brilho dos fios.",
        },
      ],
      suitableFor: [
        "Quem busca cabelos alinhados e prontos para eventos ou trabalho",
        "Quem deseja valorizar o caimento do corte de forma prática",
        "Quem procura um acabamento mais disciplinado para os fios",
      ],
      considerations: [
        "A durabilidade da escova varia de acordo com a umidade do ambiente, o tipo e a textura do cabelo.",
        "Para cabelos muito longos ou volumosos, consulte o tempo necessário ao agendar.",
        "A escova não é um tratamento químico e não altera a estrutura definitiva do fio.",
      ],
      frequentlyAskedQuestions: [
        {
          question: "Como agendar uma escova no Shaiff?",
          answer:
            "Entre em contato pelo telefone (31) 3564-0123 ou pela página de contato para consultar a disponibilidade do dia.",
        },
        {
          question: "O resultado da escova é igual em todos os cabelos?",
          answer:
            "Não. O acabamento depende da densidade, comprimento e textura natural de cada cabelo.",
        },
        {
          question: "Posso fazer escova para uma ocasião específica?",
          answer:
            "Sim. A escova é uma excelente opção para alinhar e preparar os fios para compromissos e eventos.",
        },
        {
          question: "Onde o atendimento é realizado?",
          answer:
            "O atendimento ocorre na Rua Padre Rolim, 715, Condomínio Edifício Angelini Center, em Santa Efigênia, BH.",
        },
      ],
      image: "/images/shaiff/card_escova.png",
      imageAlt: "Escova capilar modelada no Shaiff Cabeleireiros",
      icon: "Wind",
      primaryKeyword: "escova em Santa Efigênia",
      secondaryKeywords: [
        "escova de cabelo em Belo Horizonte",
        "salão para escova BH",
        "cabeleireiro para escova em Santa Efigênia",
      ],
      metadataTitle: "Escova em Santa Efigênia, BH | Shaiff Cabeleireiros",
      metadataDescription:
        "Modelagem e alinhamento com escova de cabelo em Santa Efigênia, Belo Horizonte. Fios alinhados e bem cuidados no Shaiff Cabeleireiros.",
      relatedSlugs: ["cortes-de-cabelo", "nutricao-e-hidratacao-capilar", "selagem-capilar"],
      featured: true,
      active: true,
    },
    {
      id: "nutricao-e-hidratacao-capilar",
      name: "Nutrição e hidratação capilar",
      slug: "nutricao-e-hidratacao-capilar",
      shortDescription:
        "Tratamentos profundos para repor a umidade e os nutrientes essenciais dos fios.",
      fullDescription:
        "Aplicação de produtos cosméticos para restaurar a maciez, a maleabilidade e o brilho saudável do cabelo.",
      introductoryText:
        "A nutrição e a hidratação capilar são procedimentos de cuidados cosméticos oferecidos pelo Shaiff Cabeleireiros no bairro Santa Efigênia em Belo Horizonte, focados em melhorar o toque e a aparência dos fios.",
      benefits: [
        "Melhora sensível na aparência e textura dos fios",
        "Aumento da maciez e facilidade ao pentear",
        "Brilho sutil e aspecto de cabelo bem cuidado",
        "Redução do aspecto ressecado nas pontas",
        "Cuidado periódico contra o desgaste diário",
      ],
      howItWorks: [
        {
          step: "Passo 1",
          title: "Conte o que você procura",
          description:
            "Relate quais necessidades você percebe no cabelo, como opacidade ou ressecamento.",
        },
        {
          step: "Passo 2",
          title: "Consulte as possibilidades",
          description:
            "A equipe indica os produtos cosméticos mais indicados para os seus fios.",
        },
        {
          step: "Passo 3",
          title: "Confirme seu horário",
          description:
            "A aplicação e a pausa dos produtos são realizadas com atenção técnica.",
        },
      ],
      suitableFor: [
        "Quem nota os fios ressecados por ação do sol, secador ou poluição",
        "Quem deseja manter o cabelo macio e fácil de desembaraçar",
        "Quem busca um cuidado cosmético periódico para manter o brilho",
      ],
      considerations: [
        "Os procedimentos têm caráter estético e cosmético de manutenção capilar.",
        "Fios com histórico recente de químicas intensas devem ser avaliados previamente.",
        "Recomenda-se manter a rotina de cuidados no dia a dia para prolongar a maciez.",
      ],
      frequentlyAskedQuestions: [
        {
          question: "Qual é a diferença entre nutrição e hidratação?",
          answer:
            "A hidratação foca na reposição de água e maciez dos fios, enquanto a nutrição repõe componentes lipídicos que auxiliam na retenção desse cuidado.",
        },
        {
          question: "Como saber qual cuidado procurar?",
          answer:
            "Ao conversar com a equipe no salão, avaliam-se o estado atual e as necessidades visíveis dos seus fios.",
        },
        {
          question: "O resultado pode variar?",
          answer:
            "Sim. A resposta depende da porosidade, do histórico e das agressões prévias que o cabelo possui.",
        },
        {
          question: "É necessário agendar previamente?",
          answer:
            "Sim, os atendimentos são realizados com horário agendado mediante consulta pelo telefone (31) 3564-0123.",
        },
      ],
      image: "/images/shaiff/card_hidratacao.png",
      imageAlt:
        "Tratamento de nutrição e hidratação capilar no Shaiff Cabeleireiros",
      icon: "Droplets",
      primaryKeyword: "hidratação capilar em Santa Efigênia",
      secondaryKeywords: [
        "nutrição capilar em Belo Horizonte",
        "tratamento capilar em Santa Efigênia",
        "hidratação de cabelo BH",
      ],
      metadataTitle: "Hidratação Capilar em Santa Efigênia | Shaiff",
      metadataDescription:
        "Tratamentos de nutrição e hidratação capilar no bairro Santa Efigênia, Belo Horizonte. Reposição de umidade e maciez no Shaiff Cabeleireiros.",
      relatedSlugs: ["escova", "selagem-capilar", "mechas"],
      featured: true,
      active: true,
    },
    {
      id: "selagem-capilar",
      name: "Selagem",
      slug: "selagem-capilar",
      shortDescription:
        "Alinhamento e celagem das cutículas capilares para redução do volume e do frizz.",
      fullDescription:
        "Tratamento que sela as cutículas do cabelo, proporcionando brilho e controle do frizz.",
      introductoryText:
        "A selagem capilar é um procedimento prestado pelo Shaiff Cabeleireiros no bairro Santa Efigênia, Belo Horizonte, com foco na disciplina, redução do frizz e selamento das cutículas dos fios.",
      benefits: [
        "Fios com aparência mais alinhada e disciplinada",
        "Redução do frizz e do volume desalinhado",
        "Brilho sutil decorrente da cutícula selada",
        "Maior facilidade ao pentear e secar o cabelo",
        "Acabamento uniforme em todo o comprimento",
      ],
      howItWorks: [
        {
          step: "Passo 1",
          title: "Conte o que você procura",
          description:
            "Fale sobre a rotina do seu cabelo e se possui químicas anteriores.",
        },
        {
          step: "Passo 2",
          title: "Consulte as possibilidades",
          description:
            "A equipe verifica a compatibilidade e orienta sobre o processo.",
        },
        {
          step: "Passo 3",
          title: "Confirme seu horário",
          description:
            "O procedimento é executado seguindo o passo a passo de aplicação e alinhamento.",
        },
      ],
      suitableFor: [
        "Quem busca um acabamento mais disciplinado e sem fios arrepiados",
        "Quem deseja reduzir a necessidade constante de escovação no dia a dia",
        "Quem procura praticidade para manter o cabelo alinhado",
      ],
      considerations: [
        "A selagem é um alinhamento capilar e não deve ser considerada um alisamento definitivo.",
        "Informar previamente à equipe qualquer procedimento químico realizado nos últimos meses.",
        "A durabilidade e a compatibilidade do resultado dependem do histórico individual de cada cabelo.",
      ],
      frequentlyAskedQuestions: [
        {
          question: "O que devo informar antes da selagem?",
          answer:
            "Informe qualquer química prévia, como colorações, mechas ou outros alinhamentos realizados nos últimos meses.",
        },
        {
          question: "A selagem alisa definitivamente?",
          answer:
            "Não. A selagem promove o alinhamento das cutículas e a redução do frizz, mantendo a estrutura gradualmente de acordo com as lavagens.",
        },
        {
          question: "Quem já realizou outros procedimentos deve avisar?",
          answer:
            "Sim. A transparência sobre o histórico capilar é fundamental para garantir a compatibilidade e a segurança dos fios.",
        },
        {
          question: "Como consultar disponibilidade?",
          answer:
            "Ligue para (31) 3564-0123 ou mande uma mensagem na nossa página de contato.",
        },
      ],
      image: "/images/shaiff/card_selagem.png",
      imageAlt: "Selagem capilar no Shaiff Cabeleireiros",
      icon: "ShieldCheck",
      primaryKeyword: "selagem capilar em Santa Efigênia",
      secondaryKeywords: [
        "selagem de cabelo em Belo Horizonte",
        "salão para selagem BH",
        "selagem capilar Santa Efigênia",
      ],
      metadataTitle: "Selagem Capilar em Santa Efigênia, BH | Shaiff",
      metadataDescription:
        "Alinhamento e selagem capilar em Santa Efigênia, Belo Horizonte. Controle do frizz e cutículas seladas no Shaiff Cabeleireiros.",
      relatedSlugs: ["nutricao-e-hidratacao-capilar", "escova", "cortes-de-cabelo"],
      featured: false,
      active: true,
    },
    {
      id: "mechas",
      name: "Mechas",
      slug: "mechas",
      shortDescription:
        "Técnicas de clareamento capilar com preservação da integridade da fibra.",
      fullDescription:
        "Iluminação e mechas com avaliação prévia dos fios para alcançar a tonalidade desejada.",
      introductoryText:
        "O serviço de mechas no Shaiff Cabeleireiros, em Santa Efigênia, Belo Horizonte, é voltado à criação de pontos de iluminação e contraste no cabelo, respeitando as condições da fibra capilar.",
      benefits: [
        "Iluminação e realce do visual",
        "Criação de novos tons e pontos de contraste",
        "Valorização das linhas e do movimento do corte",
        "Personalização das nuances desejadas",
        "Mudança gradual e elegante na cor dos fios",
      ],
      howItWorks: [
        {
          step: "Passo 1",
          title: "Conte o que você procura",
          description:
            "Apresente o tom ou estilo de iluminação que você gostaria de alcançar.",
        },
        {
          step: "Passo 2",
          title: "Consulte as possibilidades",
          description:
            "O profissional avalia a cor base e o histórico químico dos seus fios.",
        },
        {
          step: "Passo 3",
          title: "Confirme seu horário",
          description:
            "A aplicação das mechas é feita com acompanhamento do tempo de ação.",
        },
      ],
      suitableFor: [
        "Quem deseja iluminar os cabelos sem alterar a cor por completo",
        "Quem busca contrastar e dar dimensão ao formato do corte",
        "Quem quer renovar o visual de forma harmoniosa com o tom de pele",
      ],
      considerations: [
        "O histórico de processos químicos anteriores influencia diretamente o clareamento possível.",
        "Fotos de referência ajudam a alinhar o desejo, mas o resultado é único para cada cabelo.",
        "Cabelos descoloridos exigem cuidados reforçados de hidratação pós-procedimento.",
      ],
      frequentlyAskedQuestions: [
        {
          question: "O resultado das mechas pode variar?",
          answer:
            "Sim. O tom final alcançado depende da cor natural, da saúde da fibra e dos pigmentos residuais no cabelo.",
        },
        {
          question: "Preciso informar procedimentos químicos anteriores?",
          answer:
            "Sim. É essencial avisar sobre tinturas, alinhamentos ou descolorações prévias antes de iniciar o serviço.",
        },
        {
          question: "Posso usar uma foto como referência?",
          answer:
            "Sim. Fotos orientam sobre o tom e estilo desejados, servindo de base para o planejamento do seu atendimento.",
        },
        {
          question: "Como solicitar um horário?",
          answer:
            "Entre em contato por telefone no (31) 3564-0123 ou através do formulário na página de contato.",
        },
      ],
      image: "/images/shaiff/card_mechas.png",
      imageAlt: "Aplicação de mechas de cabelo no Shaiff Cabeleireiros",
      icon: "Sparkles",
      primaryKeyword: "mechas em Santa Efigênia",
      secondaryKeywords: [
        "mechas em Belo Horizonte",
        "salão para mechas BH",
        "cabeleireiro para mechas em Santa Efigênia",
      ],
      metadataTitle: "Mechas em Santa Efigênia, BH | Shaiff Cabeleireiros",
      metadataDescription:
        "Técnicas de iluminação e mechas de cabelo em Santa Efigênia, Belo Horizonte. Clareamento consciente no Shaiff Cabeleireiros.",
      relatedSlugs: ["nutricao-e-hidratacao-capilar", "cortes-de-cabelo", "escova"],
      featured: true,
      active: true,
    },
    {
      id: "depilacao-feminina",
      name: "Depilação feminina",
      slug: "depilacao-feminina",
      shortDescription:
        "Serviço de depilação em ambiente privativo e higienizado.",
      fullDescription:
        "Remoção de pelos com técnicas suaves e materiais adequados, priorizando o conforto e a higiene.",
      introductoryText:
        "A depilação feminina é um dos serviços de cuidado pessoal oferecidos pelo Shaiff Cabeleireiros no bairro Santa Efigênia, Belo Horizonte, garantindo privacidade e higiene.",
      benefits: [
        "Praticidade na rotina de cuidados corporais",
        "Atendimento em ambiente limpo e reservado",
        "Materiais de higiene com cuidado rigoroso",
        "Conveniência de realizar diferentes cuidados no mesmo local",
        "Agendamento rápido por telefone",
      ],
      howItWorks: [
        {
          step: "Passo 1",
          title: "Conte o que você procura",
          description:
            "Informe as áreas corporais ou faciais que deseja atender.",
        },
        {
          step: "Passo 2",
          title: "Consulte as possibilidades",
          description:
            "A equipe confirma os métodos e a disponibilidade da profissional.",
        },
        {
          step: "Passo 3",
          title: "Confirme seu horário",
          description:
            "O atendimento ocorre no horário reservado com total privacidade.",
        },
      ],
      suitableFor: [
        "Quem busca praticidade ao remover pelos indesejados",
        "Quem valoriza realizar cuidados de beleza e estética no mesmo salão",
        "Quem procura um espaço reservado e limpo em Santa Efigênia",
      ],
      considerations: [
        "Entre em contato com a equipe para consultar quais áreas específicas e métodos estão disponíveis.",
        "Recomenda-se evitar exposição solar intensa imediatamente antes e depois da depilação.",
        "Consulte a disponibilidade de horário com antecedência.",
      ],
      frequentlyAskedQuestions: [
        {
          question: "Quais áreas são atendidas?",
          answer:
            "Consulte a nossa equipe por telefone para verificar as regiões corporais e faciais atendidas no momento.",
        },
        {
          question: "Qual método de depilação é utilizado?",
          answer:
            "Entre em contato pelo telefone (31) 3564-0123 para consultar os detalhes sobre os materiais e técnicas disponíveis.",
        },
        {
          question: "Como consultar a disponibilidade de horários?",
          answer:
            "Ligue para a recepção do salão ou envie uma solicitação via página de contato.",
        },
        {
          question: "Onde fica o salão em BH?",
          answer:
            "Estamos localizados no Condomínio Edifício Angelini Center, na Rua Padre Rolim, 715, Santa Efigênia.",
        },
      ],
      image: "/images/shaiff/card_depilacao_feminina.png",
      imageAlt: "Serviço de depilação feminina no Shaiff Cabeleireiros",
      icon: "Heart",
      primaryKeyword: "depilação feminina em Santa Efigênia",
      secondaryKeywords: [
        "depilação em Belo Horizonte",
        "salão com depilação feminina BH",
        "depilação em Santa Efigênia",
      ],
      metadataTitle: "Depilação Feminina em Santa Efigênia | Shaiff",
      metadataDescription:
        "Serviço de depilação feminina no bairro Santa Efigênia, Belo Horizonte. Ambiente higienizado e atendimento reservado no Shaiff Cabeleireiros.",
      relatedSlugs: ["design-de-sobrancelha", "manicure-e-pedicure", "cortes-de-cabelo"],
      featured: false,
      active: true,
    },
    {
      id: "manicure-e-pedicure",
      name: "Manicure e pedicure",
      slug: "manicure-e-pedicure",
      shortDescription:
        "Cuidado completo para unhas das mãos e dos pés com higienização rigorosa.",
      fullDescription:
        "Corte, lixamento, cutilagem e esmaltação realizados com instrumentos esterilizados.",
      introductoryText:
        "Os serviços de manicure e pedicure no Shaiff Cabeleireiros, em Santa Efigênia, Belo Horizonte, oferecem corte, cutilagem e esmaltação para a manutenção da beleza das unhas.",
      benefits: [
        "Unhas limpas, bem alinhadas e cuidadas",
        "Esmaltação atenciosa com diversas opções de cores",
        "Instrumentos esterilizados para total segurança",
        "Praticidade de cuidar de mãos e pés no mesmo endereço",
        "Momento agradável de cuidado pessoal",
      ],
      howItWorks: [
        {
          step: "Passo 1",
          title: "Conte o que você procura",
          description:
            "Indique se deseja atendimento de manicure, pedicure ou ambos.",
        },
        {
          step: "Passo 2",
          title: "Consulte as possibilidades",
          description:
            "Escolha a cor de esmalte e os acabamentos desejados.",
        },
        {
          step: "Passo 3",
          title: "Confirme seu horário",
          description:
            "A profissional realiza o preparo, cutilagem e esmaltação das unhas.",
        },
      ],
      suitableFor: [
        "Quem gosta de manter as unhas das mãos e dos pés organizadas",
        "Quem precisa preparar as unhas para eventos, trabalho ou viagem",
        "Quem busca a praticidade de combinar cabelos e unhas no mesmo dia",
      ],
      considerations: [
        "Os procedimentos oferecidos são de caráter estético (corte, lixamento, cutilagem e esmaltação).",
        "Consulte a disponibilidade de horário caso queira realizar manicure e pedicure simultaneamente.",
        "Instrumentos perfurocortantes passam por esterilização rigorosa.",
      ],
      frequentlyAskedQuestions: [
        {
          question: "O Shaiff oferece manicure e pedicure?",
          answer:
            "Sim. O salão disponibiliza atendimento para cuidados e esmaltação das unhas das mãos e dos pés.",
        },
        {
          question: "Como consultar cores e opções disponíveis?",
          answer:
            "No momento do atendimento você poderá escolher as opções de esmaltes disponíveis na recepção.",
        },
        {
          question: "É necessário agendar previamente?",
          answer:
            "Sim, recomendamos consultar os horários vagos com antecedência pelo telefone (31) 3564-0123.",
        },
        {
          question: "Onde o atendimento é realizado?",
          answer:
            "No Shaiff Cabeleireiros, Rua Padre Rolim, 715, Condomínio Edifício Angelini Center, em Santa Efigênia, BH.",
        },
      ],
      image: "/images/shaiff/card_manicure_pedicure.png",
      imageAlt: "Serviço de manicure e pedicure no Shaiff Cabeleireiros",
      icon: "Gem",
      primaryKeyword: "manicure e pedicure em Santa Efigênia",
      secondaryKeywords: [
        "manicure em Belo Horizonte",
        "pedicure em Santa Efigênia",
        "salão com manicure BH",
      ],
      metadataTitle: "Manicure e Pedicure em Santa Efigênia | Shaiff",
      metadataDescription:
        "Cuidado completo para mãos e pés em Santa Efigênia, Belo Horizonte. Higienização e esmaltação cuidadosa no Shaiff Cabeleireiros.",
      relatedSlugs: ["design-de-sobrancelha", "depilacao-feminina", "escova"],
      featured: false,
      active: true,
    },
    {
      id: "design-de-sobrancelha",
      name: "Design de sobrancelha",
      slug: "design-de-sobrancelha",
      shortDescription:
        "Modelagem de sobrancelhas conforme o formato e simetria do rosto.",
      fullDescription:
        "Remoção e alinhamento dos fios da sobrancelha respeitando as proporções naturais do seu rosto.",
      introductoryText:
        "O design de sobrancelha no Shaiff Cabeleireiros, em Santa Efigênia, Belo Horizonte, consiste na remoção e alinhamento dos fios para destacar as proporções naturais do seu rosto.",
      benefits: [
        "Formato limpo e mais organizado para as sobrancelhas",
        "Valorização dos traços faciais e da expressão do olhar",
        "Cuidado preciso respeitando o crescimento natural dos fios",
        "Praticidade para manter o desenho no dia a dia",
        "Atendimento rápido e focado nas preferências da cliente",
      ],
      howItWorks: [
        {
          step: "Passo 1",
          title: "Conte o que você procura",
          description:
            "Explique como gosta do desenho das suas sobrancelhas (mais finas, naturais ou encorpadas).",
        },
        {
          step: "Passo 2",
          title: "Consulte as possibilidades",
          description:
            "A profissional mapeia as linhas naturais do seu rosto para alinhar a proposta.",
        },
        {
          step: "Passo 3",
          title: "Confirme seu horário",
          description:
            "A remoção dos fios excedentes é feita com higiene e atenção ao formato final.",
        },
      ],
      suitableFor: [
        "Quem deseja definir o desenho das sobrancelhas sem exageros",
        "Quem procura limpar os fios excedentes mantendo a naturalidade",
        "Quem busca a comodidade de fazer sobrancelhas e cabelo no mesmo salão",
      ],
      considerations: [
        "O design respeita a quantidade e a distribuição natural dos fios de cada pessoa.",
        "Consulte a equipe caso tenha interesse em serviços adicionais para as sobrancelhas.",
        "Realizar a manutenção periódica ajuda a preservar o alinhamento das linhas.",
      ],
      frequentlyAskedQuestions: [
        {
          question: "Como funciona o design de sobrancelha?",
          answer:
            "O procedimento analisa o formato do seu rosto e remove os fios excedentes para criar um desenho harmonioso.",
        },
        {
          question: "O formato considera os fios naturais?",
          answer:
            "Sim. O design busca valorizar a estrutura que você já possui, mantendo a proporção natural do olhar.",
        },
        {
          question: "O serviço inclui pigmentação ou henna?",
          answer:
            "Consulte previamente a recepção do salão sobre a disponibilidade de procedimentos adicionais ao design.",
        },
        {
          question: "Como solicitar um horário?",
          answer:
            "Você pode agendar pelo telefone (31) 3564-0123 ou enviando um formulário na página de contato.",
        },
      ],
      image: "/images/shaiff/card_design_sobrancelha.png",
      imageAlt: "Design de sobrancelha no Shaiff Cabeleireiros",
      icon: "Eye",
      primaryKeyword: "design de sobrancelha em Santa Efigênia",
      secondaryKeywords: [
        "design de sobrancelhas em Belo Horizonte",
        "sobrancelha em Santa Efigênia",
        "salão com design de sobrancelha BH",
      ],
      metadataTitle: "Design de Sobrancelha em Santa Efigênia | Shaiff",
      metadataDescription:
        "Design e alinhamento de sobrancelhas no bairro Santa Efigênia em Belo Horizonte. Valorização do seu olhar no Shaiff Cabeleireiros.",
      relatedSlugs: ["depilacao-feminina", "manicure-e-pedicure", "escova"],
      featured: false,
      active: true,
    },
  ],
};
