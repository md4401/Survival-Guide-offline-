import type { Question } from '../lib/quiz';
// DRAFT quiz content derived from the draft guides: needs professional review before release.
export const QUIZ: Question[] = [
 {
  "id": "boil",
  "guide": "water.disinfect",
  "q": {
   "en": "For how long should you boil water at a rolling boil to disinfect it (below 2,000 m)?",
   "pt": "Por quanto tempo ferver a água em fervura forte para desinfetá-la (abaixo de 2.000 m)?"
  },
  "options": [
   {
    "en": "30 seconds",
    "pt": "30 segundos"
   },
   {
    "en": "1 minute",
    "pt": "1 minuto"
   },
   {
    "en": "10 minutes",
    "pt": "10 minutos"
   }
  ],
  "answer": 1,
  "explain": {
   "en": "1 minute. Above 2,000 m, boil for 3 minutes.",
   "pt": "1 minuto. Acima de 2.000 m, ferva por 3 minutos."
  }
 },
 {
  "id": "boil-alt",
  "guide": "water.disinfect",
  "q": {
   "en": "Above 2,000 m of altitude, how long should you boil water?",
   "pt": "Acima de 2.000 m de altitude, por quanto tempo ferver a água?"
  },
  "options": [
   {
    "en": "1 minute",
    "pt": "1 minuto"
   },
   {
    "en": "3 minutes",
    "pt": "3 minutos"
   },
   {
    "en": "20 minutes",
    "pt": "20 minutos"
   }
  ],
  "answer": 1,
  "explain": {
   "en": "3 minutes above 2,000 m.",
   "pt": "3 minutos acima de 2.000 m."
  }
 },
 {
  "id": "cl-wait",
  "guide": "water.disinfect",
  "q": {
   "en": "After adding chlorine to water, you should wait at least:",
   "pt": "Depois de pôr cloro na água, espere pelo menos:"
  },
  "options": [
   {
    "en": "30 seconds",
    "pt": "30 segundos"
   },
   {
    "en": "5 minutes",
    "pt": "5 minutos"
   },
   {
    "en": "30 minutes",
    "pt": "30 minutos"
   }
  ],
  "answer": 2,
  "explain": {
   "en": "Always wait 30 minutes before drinking.",
   "pt": "Sempre espere 30 minutos antes de beber."
  }
 },
 {
  "id": "filter-why",
  "guide": "water.diy-filter",
  "q": {
   "en": "Why must water still be disinfected after a homemade filter?",
   "pt": "Por que a água ainda precisa ser desinfetada depois de um filtro caseiro?"
  },
  "options": [
   {
    "en": "Filters remove every germ",
    "pt": "Filtros removem todos os germes"
   },
   {
    "en": "A homemade filter does not guarantee removing bacteria, viruses or chemicals",
    "pt": "O filtro caseiro não garante remover bactérias, vírus ou químicos"
   },
   {
    "en": "It only improves taste",
    "pt": "Só melhora o gosto"
   }
  ],
  "answer": 1,
  "explain": {
   "en": "Filtering is not enough: disinfection is a mandatory step.",
   "pt": "Filtrar não basta: a desinfecção é uma etapa obrigatória."
  }
 },
 {
  "id": "sea",
  "guide": "water.find",
  "q": {
   "en": "Sea water is:",
   "pt": "A água do mar é:"
  },
  "options": [
   {
    "en": "Fine in small amounts",
    "pt": "Boa em pequenas quantidades"
   },
   {
    "en": "Not drinkable",
    "pt": "Não potável"
   },
   {
    "en": "Safe once boiled",
    "pt": "Segura depois de fervida"
   }
  ],
  "answer": 1,
  "explain": {
   "en": "Salt pulls water out of the body and speeds up dehydration; boiling does not remove it.",
   "pt": "O sal puxa água do corpo e acelera a desidratação; ferver não o remove."
  }
 },
 {
  "id": "light",
  "guide": "scenario.storm",
  "q": {
   "en": "If thunder follows lightning in less than how many seconds, you should take shelter?",
   "pt": "Se o trovão vier menos de quantos segundos após o relâmpago, você deve se abrigar?"
  },
  "options": [
   {
    "en": "5",
    "pt": "5"
   },
   {
    "en": "30",
    "pt": "30"
   },
   {
    "en": "120",
    "pt": "120"
   }
  ],
  "answer": 1,
  "explain": {
   "en": "Under 30 seconds: take shelter and wait 30 minutes after the last thunder.",
   "pt": "Menos de 30 segundos: abrigue-se e espere 30 minutos após o último trovão."
  }
 },
 {
  "id": "quake",
  "guide": "scenario.earthquake",
  "q": {
   "en": "During an earthquake the recommended action is:",
   "pt": "Durante um terremoto, a ação recomendada é:"
  },
  "options": [
   {
    "en": "Run outside",
    "pt": "Correr para fora"
   },
   {
    "en": "Drop, cover and hold on",
    "pt": "Abaixar, proteger-se e segurar"
   },
   {
    "en": "Stand in a doorway",
    "pt": "Ficar no vão da porta"
   }
  ],
  "answer": 1,
  "explain": {
   "en": "Drop, cover your head and neck, and hold on until it stops.",
   "pt": "Abaixe, proteja cabeça e pescoço e segure-se até parar."
  }
 },
 {
  "id": "cpr",
  "guide": "firstaid.cpr",
  "q": {
   "en": "Hands-only CPR is done at about how many pushes per minute?",
   "pt": "A RCP só com as mãos é feita com cerca de quantas compressões por minuto?"
  },
  "options": [
   {
    "en": "60 to 80",
    "pt": "60 a 80"
   },
   {
    "en": "100 to 120",
    "pt": "100 a 120"
   },
   {
    "en": "150 to 180",
    "pt": "150 a 180"
   }
  ],
  "answer": 1,
  "explain": {
   "en": "100 to 120 per minute, about 5 cm deep.",
   "pt": "100 a 120 por minuto, cerca de 5 cm de profundidade."
  }
 },
 {
  "id": "bleed",
  "guide": "firstaid.bleeding",
  "q": {
   "en": "For severe bleeding you should:",
   "pt": "Em sangramento grave, você deve:"
  },
  "options": [
   {
    "en": "Lift the cloth to look",
    "pt": "Levantar o pano para olhar"
   },
   {
    "en": "Press firmly and add more cloth on top",
    "pt": "Pressionar firme e pôr mais pano por cima"
   },
   {
    "en": "Only apply ice",
    "pt": "Só aplicar gelo"
   }
  ],
  "answer": 1,
  "explain": {
   "en": "Do not lift the cloth; keep pressing without a break.",
   "pt": "Não levante o pano; continue pressionando sem parar."
  }
 },
 {
  "id": "choke",
  "guide": "firstaid.choking",
  "q": {
   "en": "An adult who cannot cough, speak or breathe is choking. A first step is:",
   "pt": "Um adulto que não consegue tossir, falar nem respirar está engasgado. Um primeiro passo é:"
  },
  "options": [
   {
    "en": "5 back blows and 5 abdominal thrusts, alternating",
    "pt": "5 tapas nas costas e 5 compressões abdominais, alternando"
   },
   {
    "en": "Give water",
    "pt": "Dar água"
   },
   {
    "en": "Lay them down and wait",
    "pt": "Deitar e esperar"
   }
  ],
  "answer": 0,
  "explain": {
   "en": "Alternate 5 and 5 until it clears or they collapse, then start CPR.",
   "pt": "Alterne 5 e 5 até sair ou a pessoa desmaiar; então inicie a RCP."
  }
 },
 {
  "id": "stop",
  "guide": "scenario.lost",
  "q": {
   "en": "In the STOP rule, S-T-O-P stands for:",
   "pt": "Na regra STOP, S-T-O-P significa:"
  },
  "options": [
   {
    "en": "Stop, Think, Observe, Plan",
    "pt": "Parar, Pensar, Observar, Planejar"
   },
   {
    "en": "Search, Track, Orient, Proceed",
    "pt": "Procurar, Rastrear, Orientar, Prosseguir"
   },
   {
    "en": "Sit, Talk, Observe, Pray",
    "pt": "Sentar, Falar, Observar, Rezar"
   }
  ],
  "answer": 0,
  "explain": {
   "en": "Do not keep walking in panic.",
   "pt": "Não continue andando em pânico."
  }
 },
 {
  "id": "fire",
  "guide": "scenario.house-fire",
  "q": {
   "en": "In a house fire the priority is:",
   "pt": "Em um incêndio em casa, a prioridade é:"
  },
  "options": [
   {
    "en": "Go back for belongings",
    "pt": "Voltar para buscar pertences"
   },
   {
    "en": "Get out, stay low, call from outside",
    "pt": "Sair, ficar abaixado, ligar de fora"
   },
   {
    "en": "Open hot doors to check",
    "pt": "Abrir portas quentes para ver"
   }
  ],
  "answer": 1,
  "explain": {
   "en": "Getting out alive is the only goal; never go back in.",
   "pt": "Sair vivo é o único objetivo; nunca volte para dentro."
  }
 },
 {
  "id": "flood",
  "guide": "scenario.flood",
  "q": {
   "en": "During a flood you should never:",
   "pt": "Durante uma enchente, você nunca deve:"
  },
  "options": [
   {
    "en": "Move to higher ground",
    "pt": "Ir para um local alto"
   },
   {
    "en": "Walk or drive through floodwater",
    "pt": "Caminhar ou dirigir pela água"
   },
   {
    "en": "Follow official orders",
    "pt": "Seguir as ordens oficiais"
   }
  ],
  "answer": 1,
  "explain": {
   "en": "Floodwater hides hazards and can sweep people and cars away.",
   "pt": "A água esconde perigos e pode arrastar pessoas e carros."
  }
 },
 {
  "id": "co",
  "guide": "scenario.blackout",
  "q": {
   "en": "Why must generators and grills never be used indoors?",
   "pt": "Por que geradores e churrasqueiras nunca devem ser usados em ambientes fechados?"
  },
  "options": [
   {
    "en": "They are noisy",
    "pt": "São barulhentos"
   },
   {
    "en": "Carbon monoxide can kill",
    "pt": "O monóxido de carbono pode matar"
   },
   {
    "en": "They only waste fuel",
    "pt": "Só desperdiçam combustível"
   }
  ],
  "answer": 1,
  "explain": {
   "en": "Carbon monoxide is odourless and deadly.",
   "pt": "O monóxido de carbono não tem cheiro e é mortal."
  }
 },
 {
  "id": "hypo",
  "guide": "firstaid.hypothermia",
  "q": {
   "en": "For hypothermia you should NOT:",
   "pt": "Em hipotermia, você NÃO deve:"
  },
  "options": [
   {
    "en": "Remove wet clothes",
    "pt": "Tirar roupas molhadas"
   },
   {
    "en": "Rub the skin or give alcohol",
    "pt": "Esfregar a pele ou dar álcool"
   },
   {
    "en": "Insulate from the ground",
    "pt": "Isolar do chão"
   }
  ],
  "answer": 1,
  "explain": {
   "en": "Rubbing and alcohol make things worse; warm the trunk first, gently.",
   "pt": "Esfregar e dar álcool pioram; aqueça primeiro o tronco, com delicadeza."
  }
 },
 {
  "id": "heat",
  "guide": "firstaid.heat",
  "q": {
   "en": "Which sign suggests heat stroke and needs emergency help?",
   "pt": "Qual sinal sugere insolação e exige socorro de emergência?"
  },
  "options": [
   {
    "en": "Mild thirst",
    "pt": "Sede leve"
   },
   {
    "en": "Confusion or hot, dry skin",
    "pt": "Confusão ou pele quente e seca"
   },
   {
    "en": "Light sweating",
    "pt": "Suor leve"
   }
  ],
  "answer": 1,
  "explain": {
   "en": "Call emergency services at once.",
   "pt": "Ligue já para a emergência."
  }
 },
 {
  "id": "burn",
  "guide": "firstaid.burns",
  "q": {
   "en": "First aid for a burn: cool it with cool running water for about:",
   "pt": "Primeiros socorros em queimadura: resfrie com água corrente fresca por cerca de:"
  },
  "options": [
   {
    "en": "20 seconds",
    "pt": "20 segundos"
   },
   {
    "en": "20 minutes",
    "pt": "20 minutos"
   },
   {
    "en": "2 hours",
    "pt": "2 horas"
   }
  ],
  "answer": 1,
  "explain": {
   "en": "20 minutes; never use ice, butter or toothpaste.",
   "pt": "20 minutos; nunca use gelo, manteiga ou pasta de dente."
  }
 },
 {
  "id": "whistle",
  "guide": "scenario.lost",
  "q": {
   "en": "Three whistle blasts usually mean:",
   "pt": "Três apitos geralmente significam:"
  },
  "options": [
   {
    "en": "Time to eat",
    "pt": "Hora de comer"
   },
   {
    "en": "A call for help",
    "pt": "Um pedido de socorro"
   },
   {
    "en": "North",
    "pt": "Norte"
   }
  ],
  "answer": 1,
  "explain": {
   "en": "Three of anything is a widely used call for help.",
   "pt": "Três de qualquer coisa é um pedido de socorro muito usado."
  }
 },
 {
  "id": "camp",
  "guide": "shelter.camp-setup",
  "q": {
   "en": "A campsite should be about how far from rivers and lakes?",
   "pt": "A que distância de rios e lagos deve ficar um acampamento?"
  },
  "options": [
   {
    "en": "At the water edge",
    "pt": "Na beira da água"
   },
   {
    "en": "About 60 metres",
    "pt": "Cerca de 60 metros"
   },
   {
    "en": "In a dry riverbed",
    "pt": "No leito de um rio seco"
   }
  ],
  "answer": 1,
  "explain": {
   "en": "Close enough to fetch water, far enough to avoid flash floods and cold air.",
   "pt": "Perto para buscar água, longe para evitar enchentes repentinas e ar frio."
  }
 },
 {
  "id": "tq",
  "guide": "firstaid.bleeding",
  "q": {
   "en": "A tourniquet:",
   "pt": "Um torniquete:"
  },
  "options": [
   {
    "en": "Is needed for any cut",
    "pt": "É necessário em qualquer corte"
   },
   {
    "en": "May be needed for life-threatening limb bleeding and requires training",
    "pt": "Pode ser necessário em sangramento de membro com risco de vida e exige treinamento"
   },
   {
    "en": "Should always be used first",
    "pt": "Deve sempre ser o primeiro recurso"
   }
  ],
  "answer": 1,
  "explain": {
   "en": "Direct pressure comes first.",
   "pt": "A pressão direta vem primeiro."
  }
 }
];
