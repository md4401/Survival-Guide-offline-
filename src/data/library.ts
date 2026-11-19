import type { L } from '../lib/l10n';
// DRAFT library content taken from the content map (Enciclopédia da Sobrevivência, §6–§8). Every item needs a source check before release.
const l = (en: string, pt: string): L => ({ en, pt });

export type Verdict = 'false' | 'misleading' | 'true' | 'modern' | 'depends' | 'partial' | 'myth' | 'dangerous';
const M: Array<[string, Verdict, string, string, string, string]> = [
  ['urine', 'false', 'Drinking urine hydrates you in an emergency', 'Beber urina hidrata em emergências', 'It overloads the body with salts and worsens dehydration.', 'Sobrecarrega o corpo de sais e piora a desidratação.'],
  ['moss', 'false', 'Moss only grows on the north side of trees', 'Musgo só cresce no lado norte das árvores', 'It grows where there is moisture and shade; it is not a compass.', 'Cresce onde há umidade e sombra; não serve de bússola.'],
  ['snow', 'misleading', 'Eating snow quenches thirst', 'Comer neve mata a sede', 'It cools the body and costs energy. Melt it first whenever you can.', 'Esfria o corpo e gasta energia. Derreta antes, sempre que puder.'],
  ['alcohol', 'false', 'Alcohol warms you up in the cold', 'Álcool aquece no frio', 'It feels warm but increases heat loss from the body.', 'Dá sensação de calor, mas aumenta a perda de calor do corpo.'],
  ['venom', 'dangerous', 'Sucking out snake venom works', 'Chupar o veneno de cobra funciona', 'It does not remove venom and makes things worse. Immobilise and get medical care.', 'Não retira o veneno e piora o quadro. Imobilize e procure atendimento.'],
  ['lightning', 'false', 'Lightning never strikes the same place twice', 'Raio nunca cai duas vezes no mesmo lugar', 'It can, and it tends to hit tall, isolated points.', 'Pode cair, e costuma cair em pontos altos e isolados.'],
  ['car', 'true', 'A car is a relatively safe shelter in lightning', 'O carro é um abrigo relativamente seguro em raios', 'The metal body carries current around you; do not touch metal parts.', 'A estrutura metálica conduz a corrente ao redor; não encoste nas partes metálicas.'],
  ['seawater', 'false', 'A little sea water helps', 'Beber água do mar em pequena quantidade ajuda', 'Salt pulls water out of the body and speeds up dehydration.', 'O sal puxa água do corpo e acelera a desidratação.'],
  ['animals', 'false', 'If an animal eats it, humans can too', 'Se um bicho come, o humano também pode', 'Many foods and plants are safe for animals and toxic to us.', 'Muitos alimentos e plantas são seguros para animais e tóxicos para nós.'],
  ['cactus', 'false', 'Every cactus holds drinkable water', 'Todo cacto tem água potável', 'Most have bitter, irritating liquid, or very little.', 'A maioria tem líquido amargo, irritante ou em pouca quantidade.'],
  ['head', 'false', 'We lose half our heat through the head', 'Perdemos metade do calor pela cabeça', 'Loss is proportional to exposed area, about 7 to 10%.', 'Perde-se proporcionalmente à área exposta, cerca de 7 a 10%.'],
  ['frostbite', 'false', 'Rubbing snow on frozen skin helps', 'Esfregar neve em partes congeladas ajuda', 'It damages tissue. Warm gradually, in a safe place.', 'Danifica o tecido. Aqueça aos poucos, em local seguro.'],
  ['rubbing', 'false', 'Rub someone with hypothermia vigorously', 'Esfregar vigorosamente quem está com hipotermia', 'Handle gently, remove wet clothes and warm the trunk.', 'Manuseie com delicadeza, retire roupa molhada e aqueça o tronco.'],
  ['doorway', 'modern', 'In an earthquake the doorway is the safest place', 'Em terremoto, o vão da porta é o lugar mais seguro', 'Drop, cover your head and hold on to something firm.', 'A orientação é abaixar, proteger a cabeça e segurar em algo firme.'],
  ['river', 'depends', 'Following a river always leads to civilisation', 'Seguir um rio leva sempre à civilização', 'It often helps, but can lead to waterfalls, swamps and rough terrain.', 'Costuma ajudar, mas pode levar a cachoeiras, pântanos e terrenos difíceis.'],
  ['tourniquet', 'myth', 'A tourniquet always costs you the limb', 'Torniquete sempre faz perder o membro', 'In life-threatening bleeding it saves lives; the risk is low in short use.', 'Em hemorragia grave que ameaça a vida, ele salva; o risco é baixo em uso curto.'],
  ['fire', 'partial', 'Fire keeps all animals away', 'O fogo afasta todos os animais', 'It helps with some but does not protect from all; store food away.', 'Ajuda com alguns, mas não protege de todos; guarde a comida.'],
];
export const MYTHS = M.map(([id, verdict, ce, cp, we, wp]) => ({ id, verdict, claim: l(ce, cp), why: l(we, wp) }));

const F: Array<[string, string, string, string]> = [
  ['valdivia', 'quake', 'The largest earthquake ever measured was in Valdivia, Chile, in 1960, magnitude 9.5.', 'O maior terremoto já medido foi o de Valdivia, no Chile, em 1960, com magnitude 9,5.'],
  ['krakatoa', 'volcano', 'The 1883 Krakatoa eruption was heard almost 5,000 km away.', 'O som da erupção do Krakatoa, em 1883, foi ouvido a quase 5.000 km de distância.'],
  ['tambora', 'climate', 'The 1815 Tambora eruption contributed to the "year without a summer" in 1816.', 'A erupção do Tambora, em 1815, contribuiu para o chamado "ano sem verão", em 1816.'],
  ['cold', 'climate', 'The lowest temperature recorded on Earth was -89.2 °C, at Vostok, Antarctica, in 1983.', 'A menor temperatura registrada na Terra foi de -89,2 °C, em Vostok, na Antártida, em 1983.'],
  ['hot', 'climate', 'The highest air temperature recorded was 56.7 °C, in Death Valley (USA), in 1913.', 'A maior temperatura do ar registrada foi de 56,7 °C, no Vale da Morte (EUA), em 1913.'],
  ['sunlight', 'astro', 'Sunlight takes about 8 minutes and 20 seconds to reach Earth.', 'A luz do Sol leva cerca de 8 minutos e 20 segundos para chegar à Terra.'],
  ['water', 'planet', 'About 71% of the Earth\'s surface is covered by water, almost all of it salty.', 'Cerca de 71% da superfície da Terra é coberta por água, e quase toda é salgada.'],
  ['moon', 'astro', 'The Moon moves away from Earth about 3.8 cm per year.', 'A Lua se afasta da Terra cerca de 3,8 cm por ano.'],
  ['boil', 'physics', 'Water boils at lower temperatures at higher altitudes, which changes cooking time.', 'A água ferve a temperaturas menores em altitudes maiores, o que muda o tempo de cozimento.'],
  ['degree', 'geo', 'One degree of latitude is about 111 km.', 'Um grau de latitude equivale a cerca de 111 km.'],
  ['cross', 'nav', 'The Southern Cross points south: extend its long axis about 4.5 times.', 'O Cruzeiro do Sul aponta o sul: prolongue o braço maior cerca de 4,5 vezes.'],
  ['zones', 'geo', 'Brazil has 4 official time zones, and Acre is 2 hours behind Brasília.', 'O Brasil tem 4 fusos horários oficiais, e o Acre fica 2 horas atrás de Brasília.'],
];
export const FACTS = F.map(([id, topic, en, pt]) => ({ id, topic, text: l(en, pt) }));

const C: Array<[string, string, string, string, string]> = [
  ['apollo13', 'Apollo 13 (1970): the crew improvised an adapter for the CO2 filters', 'Apollo 13 (1970): a equipe improvisou um adaptador para os filtros de CO2', 'Improvisation guided by procedure, calm and teamwork', 'Improviso guiado por procedimento, calma e trabalho em equipe'],
  ['chile', 'Chilean miners (2010): 33 men trapped for 69 days', 'Mineiros do Chile (2010): 33 homens presos por 69 dias', 'Organisation, rationing, routine and group leadership', 'Organização, racionamento, rotina e liderança em grupo'],
  ['thamluang', 'Tham Luang, Thailand (2018): 12 boys and a coach trapped in a cave', 'Tham Luang, Tailândia (2018): 12 meninos e um treinador presos em caverna', 'Stay together, save energy and wait for rescue', 'Ficar juntos, economizar energia e esperar resgate'],
  ['poonlim', 'Poon Lim (1942–43): 133 days adrift on a raft in the Atlantic', 'Poon Lim (1942 e 1943): 133 dias à deriva numa balsa no Atlântico', 'Collect rain, fish, keep a routine and exercise', 'Captar chuva, pescar, manter rotina e exercício'],
  ['koepcke', 'Juliane Koepcke (Peru, 1971): survived a plane fall and walked through the jungle', 'Juliane Koepcke (Peru, 1971): sobreviveu à queda de avião e caminhou na selva', 'Follow a watercourse and stay calm', 'Seguir curso d\'água e manter-se calma'],
  ['kamaishi', 'Japan earthquake and tsunami (2011) and the "Miracle of Kamaishi"', 'Terremoto e tsunami no Japão (2011) e o "milagre de Kamaishi"', 'Evacuate immediately, without waiting for confirmation', 'Evacuar imediatamente, sem esperar confirmação'],
  ['katrina', 'Hurricane Katrina (2005)', 'Furacão Katrina (2005)', 'Early evacuation, family plan and pets', 'Evacuação antecipada, plano familiar e pets'],
  ['energy2001', 'Energy rationing in Brazil (2001–2002)', 'Racionamento de energia no Brasil (2001 e 2002)', 'Collective saving and adapting routines', 'Economia coletiva e adaptação de rotinas'],
  ['texas', 'Texas winter storm (2021)', 'Tempestade de inverno no Texas (2021)', 'Safe heating, carbon monoxide and water', 'Aquecimento seguro, monóxido de carbono e água'],
  ['iberia', 'Iberian Peninsula blackout (2025)', 'Apagão na Península Ibérica (2025)', 'Cash, radio and communication without a network', 'Dinheiro em espécie, rádio, comunicação sem rede'],
  ['rs2024', 'Floods in Rio Grande do Sul (2024)', 'Enchentes no Rio Grande do Sul (2024)', 'Evacuation, drinking water, communication and community help', 'Evacuação, água potável, comunicação e ajuda comunitária'],
  ['brumadinho', 'Brumadinho (2019)', 'Brumadinho (2019)', 'Sirens, escape routes and effective alerts', 'Sirenes, rotas de fuga e alerta eficaz'],
];
export const CASES = C.map(([id, te, tp, le, lp]) => ({ id, title: l(te, tp), lesson: l(le, lp) }));

export type Risk = 'low' | 'medium';
const D: Array<[string, number, Risk, string, string, string, string]> = [
  ['layers', 1, 'low', 'Layered water filter', 'Filtro de água em camadas', 'Always disinfect afterwards', 'Sempre desinfetar depois'],
  ['sodis', 1, 'low', 'Solar disinfection (SODIS)', 'Desinfecção solar (SODIS)', 'Clear PET bottle, sun for 6 hours (or 2 days if cloudy)', 'Garrafa PET transparente, sol por 6 horas (ou 2 dias nublados)'],
  ['still', 2, 'low', 'Solar still', 'Destilador solar', 'Yields little; useful in an emergency', 'Rende pouco; útil em emergência'],
  ['rain', 1, 'low', 'Rain and dew collector', 'Coletor de chuva e orvalho', 'Clean tarp, gutter and container', 'Lona, calha e recipiente limpos'],
  ['rocket', 2, 'medium', 'Tin-can rocket stove', 'Fogão rocket de lata', 'Heat and smoke; use outdoors', 'Calor e fumaça; usar ao ar livre'],
  ['tinstove', 2, 'medium', 'Tin and cardboard burner', 'Fogareiro de lata e papelão', 'Burn risk; use on a safe surface', 'Risco de queimadura; usar sobre superfície segura'],
  ['lamp', 1, 'medium', 'Tin lamp or candle', 'Lamparina ou vela de lata', 'Fire risk; never unattended', 'Risco de incêndio; nunca sem vigilância'],
  ['zeer', 2, 'low', 'Clay-pot cooler (zeer pot)', 'Geladeira de pote de barro (zeer pot)', 'Cools by evaporation; works best in dry climates', 'Esfria por evaporação; funciona melhor em clima seco'],
  ['net', 1, 'low', 'Improvised mosquito net', 'Mosquiteiro improvisado', 'Tulle or light fabric', 'Tule ou tecido leve'],
  ['window', 1, 'low', 'Window insulation with blanket or plastic', 'Isolamento de janela com cobertor ou plástico', 'Keeps heat in and cuts wind', 'Mantém calor e reduz vento'],
  ['stretcher', 2, 'low', 'Improvised stretcher and splint', 'Maca e tala improvisadas', 'Only when there is no immediate rescue', 'Só quando não houver socorro imediato'],
  ['rope', 2, 'low', 'Natural fibre rope', 'Corda de fibras naturais', 'Practice braiding', 'Treina trançado'],
  ['hook', 2, 'low', 'Improvised hook and line', 'Anzol e linha improvisados', 'Respect fishing laws', 'Respeitar as leis de pesca'],
  ['tippy', 1, 'low', 'Bottle hand-wash (tippy tap)', 'Lavatório com garrafa (tippy tap)', 'Hand hygiene with little water', 'Higiene das mãos com pouca água'],
  ['garden', 1, 'low', 'Pot and bottle garden', 'Horta em vasos e garrafas', 'Lettuce, herbs, sprouts', 'Alface, ervas, brotos'],
  ['greenhouse', 2, 'low', 'Mini greenhouse', 'Mini-estufa', 'Protects seedlings', 'Proteção de plântulas'],
  ['mirror', 1, 'low', 'Signalling mirror', 'Espelho de sinalização', 'CD, mirror or polished tin', 'CD, espelho ou lata polida'],
  ['crystal', 3, 'low', 'Crystal radio (educational)', 'Rádio de cristal (educativo)', 'For learning; does not replace a battery radio', 'Para aprender; não substitui rádio de pilha'],
  ['solar', 2, 'medium', 'Small solar panel for a phone', 'Painel solar pequeno para celular', 'Mind voltage and connectors', 'Atenção a voltagem e conectores'],
];
export const DIY = D.map(([id, level, risk, te, tp, ne, np]) => ({ id, level, risk, title: l(te, tp), note: l(ne, np) }));
export const DIY_OUT_OF_SCOPE = l('Out of scope for risk: explosives, weapons, poisons, dangerous chemicals, predatory hunting, fishing poisons, and anything that could hurt people or the environment.', 'Fora do escopo por risco: explosivos, armas, venenos, produtos químicos perigosos, caça predatória, venenos para pesca e qualquer projeto que possa ferir pessoas ou o meio ambiente.');

const G: Array<[string, string, string, string, string]> = [
  ['firstaid', 'hemorrhage', 'hemorragia', 'Heavy loss of blood from a damaged blood vessel.', 'Perda intensa de sangue por um vaso sanguíneo lesionado.'],
  ['firstaid', 'tourniquet', 'torniquete', 'A band tightened on a limb above a wound to stop life-threatening bleeding. Needs training.', 'Faixa apertada no membro acima do ferimento para parar um sangramento que ameaça a vida. Exige treinamento.'],
  ['firstaid', 'shock', 'choque', 'A dangerous drop in blood flow to the organs: pale, cold, clammy skin and a weak, fast pulse.', 'Queda perigosa do fluxo de sangue para os órgãos: pele pálida, fria e úmida e pulso fraco e rápido.'],
  ['firstaid', 'hypothermia', 'hipotermia', 'Body temperature falling too low (below about 35 °C).', 'Temperatura do corpo caindo demais (abaixo de cerca de 35 °C).'],
  ['firstaid', 'anaphylaxis', 'anafilaxia', 'A severe, sudden allergic reaction that can close the airway. Needs emergency help.', 'Reação alérgica grave e súbita que pode fechar as vias aéreas. Exige socorro de emergência.'],
  ['firstaid', 'CPR', 'RCP', 'Chest compressions (and breaths) that keep blood moving when the heart has stopped.', 'Compressões no peito (e ventilações) que mantêm o sangue circulando quando o coração parou.'],
  ['firstaid', 'defibrillator', 'desfibrilador', 'A device that gives an electric shock to restore a normal heart rhythm. Public units talk you through it.', 'Aparelho que dá um choque elétrico para restabelecer o ritmo do coração. Os de uso público orientam por voz.'],
  ['water', 'potable water', 'água potável', 'Water that is safe to drink.', 'Água segura para beber.'],
  ['water', 'turbidity', 'turbidez', 'How cloudy water is because of suspended particles.', 'O quanto a água está turva por partículas em suspensão.'],
  ['water', 'coliforms', 'coliformes', 'Bacteria used as a sign of faecal contamination in water.', 'Bactérias usadas como sinal de contaminação fecal na água.'],
  ['water', 'disinfection', 'desinfecção', 'Killing or inactivating germs in water (boiling, chlorine, sunlight).', 'Matar ou inativar germes na água (fervura, cloro, luz solar).'],
  ['water', 'chlorination', 'cloração', 'Disinfecting water with chlorine; wait 30 minutes before drinking.', 'Desinfetar a água com cloro; espere 30 minutos antes de beber.'],
  ['water', 'SODIS', 'SODIS', 'Solar disinfection: clear PET bottles left in strong sun for about 6 hours.', 'Desinfecção solar: garrafas PET transparentes sob sol forte por cerca de 6 horas.'],
  ['water', 'pore size', 'poro de filtro', 'The size of the openings in a filter; smaller pores stop smaller germs.', 'Tamanho das aberturas de um filtro; poros menores retêm germes menores.'],
  ['nav', 'azimuth', 'azimute', 'An angle measured clockwise from north, from 0 to 360 degrees.', 'Ângulo medido no sentido horário a partir do norte, de 0 a 360 graus.'],
  ['nav', 'magnetic declination', 'declinação magnética', 'The angle between magnetic north and true north at your location.', 'Ângulo entre o norte magnético e o norte verdadeiro no seu local.'],
  ['nav', 'contour line', 'curva de nível', 'A map line joining points of equal height.', 'Linha do mapa que une pontos de mesma altitude.'],
  ['nav', 'latitude', 'latitude', 'Angular distance north or south of the equator.', 'Distância angular ao norte ou ao sul do equador.'],
  ['nav', 'longitude', 'longitude', 'Angular distance east or west of the prime meridian.', 'Distância angular a leste ou oeste do meridiano de Greenwich.'],
  ['nav', 'UTM', 'UTM', 'A grid coordinate system in metres, divided into 60 zones.', 'Sistema de coordenadas em grade, em metros, dividido em 60 zonas.'],
  ['nav', 'bearing', 'rumo', 'The direction you travel or point, as an angle from north.', 'Direção em que você segue ou aponta, como ângulo a partir do norte.'],
  ['climate', 'cold front', 'frente fria', 'The edge of a cold air mass pushing warm air; often brings rain and a temperature drop.', 'Borda de uma massa de ar frio que empurra o ar quente; costuma trazer chuva e queda de temperatura.'],
  ['climate', 'isobar', 'isóbara', 'A line on a weather map joining points of equal pressure.', 'Linha no mapa do tempo que une pontos de mesma pressão.'],
  ['climate', 'relative humidity', 'umidade relativa', 'How much water vapour the air holds compared with the most it could hold, in %.', 'Quanto vapor de água o ar tem em comparação com o máximo que poderia ter, em %.'],
  ['climate', 'wind chill', 'sensação térmica', 'How cold it feels on skin because of wind plus cold air.', 'O quanto o frio é sentido na pele por causa do vento somado ao ar frio.'],
  ['climate', 'monsoon', 'monção', 'A seasonal wind shift that brings a wet and a dry season.', 'Mudança sazonal dos ventos que traz uma estação chuvosa e outra seca.'],
  ['climate', 'El Niño', 'El Niño', 'A periodic warming of the Pacific that changes weather in many regions.', 'Aquecimento periódico do Pacífico que altera o tempo em várias regiões.'],
  ['nature', 'biome', 'bioma', 'A large natural region with similar climate, plants and animals.', 'Grande região natural com clima, plantas e animais semelhantes.'],
  ['nature', 'endemic', 'endêmico', 'Found naturally only in one place.', 'Que ocorre naturalmente apenas em um lugar.'],
  ['nature', 'venomous', 'peçonhento', 'Injects venom by a bite or sting. (Poisonous means harmful when eaten or touched.)', 'Injeta veneno por picada ou mordida. (Venenoso é o que faz mal ao ser comido ou tocado.)'],
  ['nature', 'vector', 'vetor', 'An animal, such as a mosquito, that carries a disease from one host to another.', 'Animal, como um mosquito, que leva uma doença de um hospedeiro a outro.'],
  ['nature', 'parasite', 'parasita', 'An organism that lives on or in another and harms it.', 'Organismo que vive sobre ou dentro de outro e o prejudica.'],
  ['gear', 'R-value', 'valor R', 'How well a sleeping pad resists heat loss; higher is warmer.', 'O quanto um isolante resiste à perda de calor; maior é mais quente.'],
  ['gear', 'denier', 'denier', 'A unit of fibre thickness; higher usually means a tougher fabric.', 'Unidade de espessura da fibra; maior costuma significar tecido mais resistente.'],
  ['gear', 'water column', 'coluna d\'água', 'How much water pressure a fabric resists before leaking, in mm.', 'Quanta pressão de água um tecido aguenta antes de vazar, em mm.'],
  ['gear', 'DWR', 'DWR', 'A water-repellent coating on outer fabric.', 'Revestimento que repele água na superfície do tecido.'],
  ['gear', 'ripstop', 'ripstop', 'A fabric woven so small tears do not spread.', 'Tecido tramado para que pequenos rasgos não se espalhem.'],
];
export const GLOSSARY = G.map(([group, en, pt, de, dp]) => ({ group, term: l(en, pt), def: l(de, dp) }));
