import type { Tree } from '../lib/tree';
// DRAFT decision trees: they only route to the reviewed guides; they need professional review before release.
export const TREES: Tree[] = [
 {
  "id": "collapse",
  "title": {
   "en": "Someone is hurt or collapsed",
   "pt": "Alguém está ferido ou desmaiou"
  },
  "start": "n0",
  "nodes": [
   {
    "id": "n0",
    "q": {
     "en": "What is the main problem?",
     "pt": "Qual é o problema principal?"
    },
    "options": [
     {
      "label": {
       "en": "Does not respond",
       "pt": "Não responde"
      },
      "next": "n1"
     },
     {
      "label": {
       "en": "Choking",
       "pt": "Engasgo"
      },
      "result": {
       "text": {
        "en": "Follow the choking guide now.",
        "pt": "Siga agora o guia de engasgo."
       },
       "guide": "firstaid.choking",
       "urgent": true
      }
     },
     {
      "label": {
       "en": "Heavy bleeding",
       "pt": "Sangramento intenso"
      },
      "result": {
       "text": {
        "en": "Press firmly on the wound and call emergency services.",
        "pt": "Pressione firme o ferimento e ligue para a emergência."
       },
       "guide": "firstaid.bleeding",
       "urgent": true
      }
     },
     {
      "label": {
       "en": "Burn",
       "pt": "Queimadura"
      },
      "result": {
       "text": {
        "en": "Cool the burn and cover it loosely.",
        "pt": "Resfrie a queimadura e cubra sem apertar."
       },
       "guide": "firstaid.burns"
      }
     }
    ]
   },
   {
    "id": "n1",
    "q": {
     "en": "Is the area safe for you?",
     "pt": "O local é seguro para você?"
    },
    "options": [
     {
      "label": {
       "en": "Yes",
       "pt": "Sim"
      },
      "next": "n2"
     },
     {
      "label": {
       "en": "No",
       "pt": "Não"
      },
      "result": {
       "text": {
        "en": "Do not put yourself in danger. Call emergency services and make the area safe first.",
        "pt": "Não se coloque em perigo. Ligue para a emergência e deixe o local seguro antes."
       },
       "urgent": true
      }
     }
    ]
   },
   {
    "id": "n2",
    "q": {
     "en": "Tap the shoulders and shout. Are they breathing normally?",
     "pt": "Toque os ombros e chame. Respira normalmente?"
    },
    "options": [
     {
      "label": {
       "en": "Yes, breathing",
       "pt": "Sim, respira"
      },
      "result": {
       "text": {
        "en": "Call emergency services, stay with them and watch their breathing.",
        "pt": "Ligue para a emergência, fique com a pessoa e observe a respiração."
       },
       "guide": "firstaid.shock",
       "urgent": true
      }
     },
     {
      "label": {
       "en": "No, not breathing normally",
       "pt": "Não respira normalmente"
      },
      "result": {
       "text": {
        "en": "Call emergency services and start CPR now.",
        "pt": "Ligue para a emergência e inicie a RCP agora."
       },
       "guide": "firstaid.cpr",
       "urgent": true
      }
     }
    ]
   }
  ]
 },
 {
  "id": "temperature",
  "title": {
   "en": "Too hot or too cold",
   "pt": "Calor ou frio demais"
  },
  "start": "t0",
  "nodes": [
   {
    "id": "t0",
    "q": {
     "en": "Is the person too hot or too cold?",
     "pt": "A pessoa está com calor ou frio demais?"
    },
    "options": [
     {
      "label": {
       "en": "Too hot",
       "pt": "Calor demais"
      },
      "next": "t1"
     },
     {
      "label": {
       "en": "Too cold",
       "pt": "Frio demais"
      },
      "next": "t2"
     }
    ]
   },
   {
    "id": "t1",
    "q": {
     "en": "Confused, fainting, or hot dry skin?",
     "pt": "Confusa, desmaiando ou pele quente e seca?"
    },
    "options": [
     {
      "label": {
       "en": "Yes",
       "pt": "Sim"
      },
      "result": {
       "text": {
        "en": "Possible heat stroke: call emergency services and cool them now.",
        "pt": "Possível insolação: ligue para a emergência e resfrie agora."
       },
       "guide": "firstaid.heat",
       "urgent": true
      }
     },
     {
      "label": {
       "en": "No",
       "pt": "Não"
      },
      "result": {
       "text": {
        "en": "Move to shade, cool the skin, give small sips of cool water.",
        "pt": "Leve à sombra, resfrie a pele, dê goles pequenos de água fresca."
       },
       "guide": "firstaid.heat"
      }
     }
    ]
   },
   {
    "id": "t2",
    "q": {
     "en": "Shivering has stopped, or they are confused or drowsy?",
     "pt": "Parou de tremer, ou está confusa ou sonolenta?"
    },
    "options": [
     {
      "label": {
       "en": "Yes",
       "pt": "Sim"
      },
      "result": {
       "text": {
        "en": "Severe hypothermia: call emergency services, handle gently, insulate.",
        "pt": "Hipotermia grave: ligue para a emergência, manuseie com cuidado, isole."
       },
       "guide": "firstaid.hypothermia",
       "urgent": true
      }
     },
     {
      "label": {
       "en": "No",
       "pt": "Não"
      },
      "result": {
       "text": {
        "en": "Shelter, remove wet clothes, insulate, warm sweet drinks if awake.",
        "pt": "Abrigue, tire roupas molhadas, isole, bebida morna e doce se acordada."
       },
       "guide": "firstaid.hypothermia"
      }
     }
    ]
   }
  ]
 },
 {
  "id": "water",
  "title": {
   "en": "Is this water safe to drink?",
   "pt": "Esta água é segura para beber?"
  },
  "start": "w0",
  "nodes": [
   {
    "id": "w0",
    "q": {
     "en": "Does it smell of fuel, sewage or chemicals, or come from near them?",
     "pt": "Tem cheiro de combustível, esgoto ou químicos, ou vem de perto deles?"
    },
    "options": [
     {
      "label": {
       "en": "Yes",
       "pt": "Sim"
      },
      "result": {
       "text": {
        "en": "Do not drink it. Find another source.",
        "pt": "Não beba. Procure outra fonte."
       },
       "guide": "water.find",
       "urgent": true
      }
     },
     {
      "label": {
       "en": "No",
       "pt": "Não"
      },
      "next": "w1"
     }
    ]
   },
   {
    "id": "w1",
    "q": {
     "en": "Is it cloudy?",
     "pt": "Está turva?"
    },
    "options": [
     {
      "label": {
       "en": "Yes",
       "pt": "Sim"
      },
      "result": {
       "text": {
        "en": "Filter it first, then disinfect it.",
        "pt": "Filtre antes e depois desinfete."
       },
       "guide": "water.diy-filter"
      }
     },
     {
      "label": {
       "en": "No",
       "pt": "Não"
      },
      "result": {
       "text": {
        "en": "Disinfect it: boil, chlorine or solar.",
        "pt": "Desinfete: ferver, cloro ou solar."
       },
       "guide": "water.disinfect"
      }
     }
    ]
   }
  ]
 }
];
