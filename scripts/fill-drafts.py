# Fills the DRAFT guides with conservative text based on widely published public guidance.
# They stay status: draft + needsReview: true (visible only in Developer mode). Professional review and real sources are still required.
import re, glob, json
SRC = {'en': 'To verify: WHO / Red Cross / civil-defense guidance (source not yet registered)',
       'pt': 'A verificar: OMS / Cruz Vermelha / Defesa Civil (fonte ainda não registrada)'}
G = {}
def g(id, en, pt): G[id] = {'en': en, 'pt': pt}
def d(summary, warning, now, mistakes, understand, rel=()): return dict(summary=summary, warning=warning, now=now, mistakes=mistakes, understand=understand, related=list(rel))

g('firstaid.cpr',
 d('Hands-only CPR for an adult who is unresponsive and not breathing normally.', 'Call emergency services first. Do not stop until help or an AED takes over.',
   ['Check the area is safe. Tap shoulders and shout.', 'Call emergency services or tell someone to call.', 'Place hands in the center of the chest.', 'Push hard and fast: 100 to 120 per minute.', 'Push about 5 cm deep. Let the chest rise fully.', 'Keep going. Use an AED if one arrives.'],
   ['Stopping to check too often.', 'Pushing too softly or too slowly.', 'Leaning on the chest between pushes.'],
   ['Hands-only CPR is a common recommendation for untrained people.', 'Children and babies need different technique: follow local training.', 'Switching rescuers every 2 minutes reduces fatigue.'], ['firstaid.choking']),
 d('RCP só com as mãos em adulto sem resposta e sem respirar normalmente.', 'Ligue primeiro para a emergência. Só pare quando a ajuda ou um DEA assumir.',
   ['Veja se o local é seguro. Toque os ombros e chame.', 'Ligue para a emergência ou peça que alguém ligue.', 'Apoie as mãos no centro do peito.', 'Empurre forte e rápido: 100 a 120 por minuto.', 'Afunde cerca de 5 cm. Deixe o peito voltar.', 'Continue. Use um DEA se chegar.'],
   ['Parar muitas vezes para checar.', 'Apertar fraco ou devagar demais.', 'Apoiar o peso no peito entre as compressões.'],
   ['A RCP só com as mãos é uma recomendação comum para leigos.', 'Crianças e bebês exigem técnica diferente: siga treinamento local.', 'Trocar de socorrista a cada 2 minutos reduz o cansaço.'], ['firstaid.choking']))

g('firstaid.choking',
 d('Adult who is awake but cannot cough, speak or breathe.', 'If the person becomes unresponsive, call emergency services and start CPR.',
   ['Ask: "Are you choking?" Encourage strong coughing.', 'If they cannot breathe or speak, call for help.', 'Give 5 firm back blows between the shoulder blades.', 'Then give 5 abdominal thrusts above the navel.', 'Alternate 5 and 5 until it clears or they collapse.'],
   ['Hitting the back of someone who is coughing well.', 'Putting fingers blindly in the mouth.', 'Giving water to a choking person.'],
   ['Babies, pregnant people and very large people need different hand positions: follow local training.', 'Seek medical care afterwards even if the object came out.'], ['firstaid.cpr']),
 d('Adulto consciente que não consegue tossir, falar ou respirar.', 'Se a pessoa ficar inconsciente, ligue para a emergência e inicie a RCP.',
   ['Pergunte: "Você está engasgado?" Incentive tossir forte.', 'Se não respira nem fala, peça ajuda.', 'Dê 5 tapas firmes nas costas, entre as escápulas.', 'Depois faça 5 compressões abdominais acima do umbigo.', 'Alterne 5 e 5 até sair ou a pessoa desmaiar.'],
   ['Bater nas costas de quem tosse bem.', 'Enfiar os dedos às cegas na boca.', 'Dar água a quem está engasgado.'],
   ['Bebês, gestantes e pessoas muito grandes exigem outra posição das mãos: siga treinamento local.', 'Procure atendimento médico depois, mesmo que o objeto tenha saído.'], ['firstaid.cpr']))

g('firstaid.bleeding',
 d('Stop heavy bleeding with firm direct pressure.', 'Call emergency services for heavy bleeding. Wear gloves or a barrier if you can.',
   ['Call emergency services or send someone to call.', 'Press hard directly on the wound with clean cloth.', 'Do not lift the cloth. Add more on top.', 'Keep pressing without a break until help arrives.', 'Lay the person down and keep them warm.'],
   ['Removing the cloth to look.', 'Pressing too lightly.', 'Using a tourniquet without training on a minor wound.'],
   ['A tourniquet may be needed for life-threatening limb bleeding that pressure cannot stop. It requires training.', 'Do not remove objects stuck in a wound.'], ['firstaid.shock']),
 d('Estanque sangramento intenso com pressão direta firme.', 'Ligue para a emergência em sangramento intenso. Use luvas ou barreira se puder.',
   ['Ligue para a emergência ou peça que alguém ligue.', 'Pressione forte o ferimento com pano limpo.', 'Não levante o pano. Coloque mais por cima.', 'Continue pressionando sem parar até a ajuda chegar.', 'Deite a pessoa e mantenha-a aquecida.'],
   ['Tirar o pano para olhar.', 'Pressionar de leve.', 'Usar torniquete sem treino em ferimento pequeno.'],
   ['O torniquete pode ser necessário em sangramento de membro com risco de vida que a pressão não controla. Exige treinamento.', 'Não retire objetos presos no ferimento.'], ['firstaid.shock']))

g('firstaid.burns',
 d('Cool the burn and protect it.', 'Large burns, burns on face, hands, genitals, or from chemicals or electricity need urgent medical care.',
   ['Move away from the heat source safely.', 'Cool the burn under cool running water for 20 minutes.', 'Remove rings and loose clothing. Leave stuck cloth.', 'Cover loosely with a clean, non-stick covering.', 'Seek medical care if large, deep or in a risky area.'],
   ['Using ice, butter or toothpaste.', 'Popping blisters.', 'Pulling off clothing stuck to the skin.'],
   ['Keep the rest of the body warm while cooling a large burn.'], ['firstaid.shock']),
 d('Resfrie a queimadura e proteja.', 'Queimaduras grandes, no rosto, mãos, genitais, químicas ou elétricas exigem atendimento urgente.',
   ['Afaste-se da fonte de calor com segurança.', 'Resfrie com água corrente fria por 20 minutos.', 'Tire anéis e roupas soltas. Deixe o que grudou.', 'Cubra sem apertar com curativo limpo não aderente.', 'Procure atendimento se for grande, funda ou em área de risco.'],
   ['Usar gelo, manteiga ou pasta de dente.', 'Estourar bolhas.', 'Arrancar roupa grudada na pele.'],
   ['Mantenha o resto do corpo aquecido ao resfriar uma queimadura grande.'], ['firstaid.shock']))

g('firstaid.fracture',
 d('Keep a suspected broken bone still until help is available.', 'Do not try to straighten the bone. Call emergency services for the neck, back, head or a bone through the skin.',
   ['Keep the person still. Do not move neck or back.', 'Control any bleeding with gentle pressure around the wound.', 'Support the limb in the position found.', 'Splint with firm material, padded, above and below.', 'Check feeling and color beyond the splint. Seek care.'],
   ['Straightening the limb.', 'Tying the splint too tight.', 'Letting the person walk on it.'],
   ['Ice wrapped in cloth may reduce pain and swelling.'], ['firstaid.bleeding']),
 d('Mantenha imóvel um osso suspeito de fratura até chegar ajuda.', 'Não tente endireitar o osso. Ligue para a emergência em caso de pescoço, coluna, cabeça ou osso exposto.',
   ['Mantenha a pessoa imóvel. Não mexa pescoço nem costas.', 'Controle sangramento com pressão suave ao redor.', 'Apoie o membro na posição em que está.', 'Imobilize com material firme, acolchoado, acima e abaixo.', 'Confira sensibilidade e cor além da tala. Procure atendimento.'],
   ['Endireitar o membro.', 'Amarrar a tala apertada demais.', 'Deixar a pessoa andar sobre ele.'],
   ['Gelo envolto em pano pode reduzir dor e inchaço.'], ['firstaid.bleeding']))

g('firstaid.shock',
 d('Signs: pale, cold, clammy skin, fast weak pulse, confusion.', 'Shock can be life-threatening. Call emergency services.',
   ['Call emergency services.', 'Lay the person down. Treat any bleeding.', 'Keep them warm with a coat or blanket.', 'Give nothing to eat or drink.', 'Stay with them and watch breathing.'],
   ['Giving food or drink.', 'Moving the person unnecessarily.', 'Leaving them alone.'],
   ['Raising the legs is sometimes advised if there is no injury to legs, head, neck or back: follow local training.'], ['firstaid.bleeding']),
 d('Sinais: pele pálida, fria e úmida, pulso fraco e rápido, confusão.', 'O choque pode ameaçar a vida. Ligue para a emergência.',
   ['Ligue para a emergência.', 'Deite a pessoa. Trate qualquer sangramento.', 'Mantenha-a aquecida com casaco ou cobertor.', 'Não dê comida nem bebida.', 'Fique com ela e observe a respiração.'],
   ['Dar comida ou bebida.', 'Mover a pessoa sem necessidade.', 'Deixá-la sozinha.'],
   ['Elevar as pernas às vezes é indicado se não houver lesão em pernas, cabeça, pescoço ou coluna: siga treinamento local.'], ['firstaid.bleeding']))

g('firstaid.hypothermia',
 d('Body temperature dropping from cold: shivering, confusion, slurred speech.', 'Severe cases (no shivering, drowsy, unresponsive) need emergency services. Handle gently.',
   ['Get the person out of wind and rain.', 'Remove wet clothes. Dry them gently.', 'Insulate from the ground. Wrap in blankets.', 'Cover the head and neck.', 'If awake, give warm sweet drinks. Call for help.'],
   ['Rubbing the skin.', 'Giving alcohol.', 'Using very hot water or direct heat.'],
   ['Warm the trunk first. Move the person gently.'], ['firstaid.heat']),
 d('Temperatura do corpo caindo por frio: tremores, confusão, fala arrastada.', 'Casos graves (sem tremores, sonolento, sem resposta) exigem emergência. Manuseie com cuidado.',
   ['Tire a pessoa do vento e da chuva.', 'Retire roupas molhadas. Seque com cuidado.', 'Isole do chão. Envolva em cobertores.', 'Cubra cabeça e pescoço.', 'Se acordada, dê bebida morna e doce. Peça ajuda.'],
   ['Esfregar a pele.', 'Dar álcool.', 'Usar água muito quente ou calor direto.'],
   ['Aqueça primeiro o tronco. Mova a pessoa com delicadeza.'], ['firstaid.heat']))

g('firstaid.heat',
 d('Heat exhaustion and heat stroke.', 'Confusion, fainting, or hot dry skin may be heat stroke: call emergency services at once.',
   ['Move the person to shade or a cool place.', 'Remove extra clothing.', 'Cool the skin with water and fanning.', 'If awake, give small sips of cool water.', 'Call emergency services if confused or not improving.'],
   ['Giving drinks to someone not fully awake.', 'Leaving the person in the heat.', 'Using ice-cold baths without guidance.'],
   ['Children and older adults overheat faster.'], ['firstaid.hypothermia']),
 d('Exaustão pelo calor e insolação.', 'Confusão, desmaio ou pele quente e seca podem ser insolação: ligue já para a emergência.',
   ['Leve a pessoa para a sombra ou lugar fresco.', 'Tire o excesso de roupa.', 'Resfrie a pele com água e abanando.', 'Se acordada, dê goles pequenos de água fresca.', 'Ligue para a emergência se confusa ou sem melhora.'],
   ['Dar líquido a quem não está bem acordado.', 'Deixar a pessoa no calor.', 'Usar banho gelado sem orientação.'],
   ['Crianças e idosos esquentam mais rápido.'], ['firstaid.hypothermia']))

g('firstaid.bites',
 d('Animal, snake and insect bites or stings.', 'Trouble breathing, swelling of face or throat, or a venomous snake bite is an emergency: call at once.',
   ['Move away from the animal or insect.', 'Stay calm. Keep the bitten limb still.', 'Remove rings and tight items near the bite.', 'Wash minor wounds with soap and clean water.', 'Seek medical care. Call emergency services if severe.'],
   ['Cutting the bite or sucking venom.', 'Applying a tight tourniquet.', 'Trying to catch the animal.'],
   ['Note the time and what the animal looked like if it is safe.'], ['firstaid.shock']),
 d('Mordidas e picadas de animais, cobras e insetos.', 'Falta de ar, inchaço no rosto ou garganta ou picada de cobra venenosa é emergência: ligue já.',
   ['Afaste-se do animal ou inseto.', 'Fique calmo. Mantenha o membro imóvel.', 'Retire anéis e itens apertados perto da picada.', 'Lave ferimentos leves com sabão e água limpa.', 'Procure atendimento. Ligue para a emergência se grave.'],
   ['Cortar a picada ou sugar o veneno.', 'Fazer torniquete apertado.', 'Tentar capturar o animal.'],
   ['Anote o horário e o aspecto do animal, se for seguro.'], ['firstaid.shock']))

g('water.find',
 d('Where water may be found when the tap is off.', 'Any water found outdoors may carry germs or chemicals. Treat it before drinking. Sea water is not drinkable.',
   ['Check the water heater tank and the toilet cistern tank.', 'Collect rain with clean sheets and containers.', 'Look for running streams, springs or wells.', 'Avoid water with fuel smell, foam or dead animals.', 'Filter, then disinfect all found water.'],
   ['Drinking clear water without treating it.', 'Drinking sea water.', 'Using water near sewage or farm runoff.'],
   ['Flowing water is usually safer than still water, but still needs treatment.'], ['water.disinfect', 'water.diy-filter']),
 d('Onde achar água quando a torneira seca.', 'Qualquer água achada ao ar livre pode ter germes ou químicos. Trate antes de beber. Água do mar não é potável.',
   ['Verifique o reservatório do aquecedor e a caixa acoplada do vaso.', 'Colete chuva com lonas e recipientes limpos.', 'Procure riachos correntes, nascentes ou poços.', 'Evite água com cheiro de combustível, espuma ou animais mortos.', 'Filtre e depois desinfete toda água achada.'],
   ['Beber água clara sem tratar.', 'Beber água do mar.', 'Usar água perto de esgoto ou de lavoura.'],
   ['Água corrente costuma ser mais segura que parada, mas também precisa de tratamento.'], ['water.disinfect', 'water.diy-filter']))

g('water.disinfect',
 d('Make found or filtered water safer to drink.', 'Does not remove chemicals or fuel. If the water smells of chemicals, find another source.',
   ['Filter cloudy water first.', 'Boil at a rolling boil for 1 minute.', 'Above 2,000 m, boil for 3 minutes.', 'Or add chlorine as directed. Wait 30 minutes.', 'Or fill clear PET bottles and leave in sun.'],
   ['Skipping disinfection after filtering.', 'Using scented or additive bleach.', 'Not waiting the full contact time.'],
   ['Solar disinfection (SODIS): clear PET bottle in strong sun for about 6 hours, or 2 days if cloudy.', 'Use the chlorine calculator under Prepare and the product label.'], ['water.diy-filter', 'water.store']),
 d('Torne água achada ou filtrada mais segura para beber.', 'Não remove químicos nem combustível. Se a água cheirar a químico, procure outra fonte.',
   ['Filtre antes a água turva.', 'Ferva em fervura forte por 1 minuto.', 'Acima de 2.000 m, ferva por 3 minutos.', 'Ou adicione cloro conforme a instrução. Espere 30 minutos.', 'Ou encha garrafas PET claras e deixe ao sol.'],
   ['Pular a desinfecção depois de filtrar.', 'Usar água sanitária perfumada ou com aditivos.', 'Não esperar o tempo de contato completo.'],
   ['Desinfecção solar (SODIS): garrafa PET transparente ao sol forte por cerca de 6 horas, ou 2 dias se nublado.', 'Use a calculadora de cloro em Preparar e o rótulo do produto.'], ['water.diy-filter', 'water.store']))

g('water.store',
 d('Keep treated water safe to drink later.', 'Never store water in containers that held chemicals, fuel or pesticides.',
   ['Use clean, food-grade containers with tight lids.', 'Fill with treated water. Close tightly.', 'Label with the date.', 'Store in a cool, dark place away from fuel.', 'Replace stored water regularly.'],
   ['Reusing containers that held chemicals.', 'Leaving containers open.', 'Storing near fuel or in sunlight.'],
   ['Wash containers with soap and rinse well before filling.'], ['water.disinfect']),
 d('Guarde água tratada com segurança para beber depois.', 'Nunca guarde água em recipientes que tiveram químicos, combustível ou agrotóxicos.',
   ['Use recipientes limpos, próprios para alimentos, com tampa firme.', 'Encha com água tratada. Feche bem.', 'Etiquete com a data.', 'Guarde em local fresco e escuro, longe de combustível.', 'Troque a água guardada com regularidade.'],
   ['Reaproveitar recipientes que tiveram químicos.', 'Deixar recipientes abertos.', 'Guardar perto de combustível ou ao sol.'],
   ['Lave os recipientes com sabão e enxágue bem antes de encher.'], ['water.disinfect']))

g('scenario.blackout',
 d('Power is out. Stay safe, save battery and keep food and water in order.', 'Never run a generator, grill or camp stove indoors: carbon monoxide can kill.',
   ['Check if only your home is without power.', 'Use flashlights, not candles.', 'Unplug sensitive appliances.', 'Keep fridge and freezer doors closed.', 'Save phone battery: lower brightness, close apps.'],
   ['Using candles unattended.', 'Cooking or heating indoors with fuel burners.', 'Opening the fridge repeatedly.'],
   ['Check on neighbors who are older or ill.', 'Keep a battery or crank radio for news.'], ['water.find', 'water.store', 'firstaid.hypothermia']),
 d('Sem energia. Fique seguro, poupe bateria e cuide de comida e água.', 'Nunca use gerador, churrasqueira ou fogareiro dentro de casa: o monóxido de carbono pode matar.',
   ['Veja se só a sua casa está sem energia.', 'Use lanternas, não velas.', 'Desligue aparelhos sensíveis da tomada.', 'Mantenha geladeira e freezer fechados.', 'Poupe a bateria do celular: menos brilho, feche apps.'],
   ['Deixar velas sem vigilância.', 'Cozinhar ou aquecer dentro de casa com queimadores.', 'Abrir a geladeira várias vezes.'],
   ['Veja como estão vizinhos idosos ou doentes.', 'Tenha um rádio de pilha ou manivela para notícias.'], ['water.find', 'water.store', 'firstaid.hypothermia']))

g('scenario.storm',
 d('Strong wind, rain and lightning.', 'If outdoors, never shelter under an isolated tree. Stay away from water and metal during lightning.',
   ['Go indoors. Stay away from windows.', 'Unplug electronics. Avoid using plumbing.', 'Secure or bring in loose objects if safe.', 'Count seconds from flash to thunder.', 'Under 30 seconds: take shelter. Wait 30 minutes after.'],
   ['Standing under an isolated tree.', 'Staying on open ground or water.', 'Driving through flooded roads.'],
   ['A closed car is a relatively safe shelter: avoid touching metal parts.'], ['scenario.flood', 'scenario.blackout']),
 d('Vento forte, chuva e raios.', 'Ao ar livre, nunca se abrigue sob árvore isolada. Fique longe de água e metal durante raios.',
   ['Entre em casa. Fique longe das janelas.', 'Desligue eletrônicos. Evite usar a tubulação.', 'Prenda ou recolha objetos soltos se for seguro.', 'Conte os segundos do relâmpago ao trovão.', 'Menos de 30 segundos: abrigue-se. Espere 30 minutos depois.'],
   ['Ficar sob árvore isolada.', 'Ficar em campo aberto ou na água.', 'Dirigir por vias alagadas.'],
   ['Um carro fechado é abrigo relativamente seguro: evite tocar nas partes metálicas.'], ['scenario.flood', 'scenario.blackout']))

g('scenario.flood',
 d('Rising water. Move early; do not wait for it to reach you.', 'Never walk or drive through floodwater. Keep away from fallen power lines.',
   ['Move to higher ground now. Follow official orders.', 'Do not walk or drive through floodwater.', 'If safe and dry, switch off power at the main.', 'Take documents, medicines, phone and water.', 'Call emergency services if trapped. Go to the highest level.'],
   ['Driving into flooded roads.', 'Touching electrical items while wet.', 'Waiting to see if the water rises.'],
   ['Floodwater can carry sewage and chemicals. Wash well and do not drink it.'], ['water.disinfect', 'scenario.storm']),
 d('Água subindo. Saia cedo; não espere ela chegar até você.', 'Nunca caminhe nem dirija na água da enchente. Fique longe de fios caídos.',
   ['Vá agora para um local alto. Siga as ordens oficiais.', 'Não caminhe nem dirija pela água da enchente.', 'Se seguro e seco, desligue a energia no quadro geral.', 'Leve documentos, remédios, celular e água.', 'Se ficar preso, ligue para a emergência. Suba ao ponto mais alto.'],
   ['Dirigir em vias alagadas.', 'Mexer em itens elétricos molhado.', 'Esperar para ver se a água sobe.'],
   ['A água da enchente pode ter esgoto e químicos. Lave-se bem e não beba.'], ['water.disinfect', 'scenario.storm']))

g('scenario.house-fire',
 d('Fire in the home. Getting out alive is the only goal.', 'Do not go back inside for belongings, pets or anything else.',
   ['Shout to alert everyone. Get out immediately.', 'Stay low under smoke. Close doors behind you.', 'Do not use elevators.', 'Call emergency services from outside.', 'If clothes catch fire: stop, drop, cover face, roll.'],
   ['Going back inside.', 'Hiding in a closet or under a bed.', 'Opening a hot door.'],
   ['Test a door with the back of your hand before opening.', 'Agree a family meeting point outside.'], ['firstaid.burns']),
 d('Incêndio em casa. Sair vivo é o único objetivo.', 'Não volte para dentro buscando pertences, animais ou qualquer coisa.',
   ['Grite para avisar todos. Saia imediatamente.', 'Fique abaixado sob a fumaça. Feche as portas ao passar.', 'Não use elevadores.', 'Ligue para a emergência de fora.', 'Se a roupa pegar fogo: pare, deite, cubra o rosto, role.'],
   ['Voltar para dentro.', 'Se esconder em armário ou embaixo da cama.', 'Abrir uma porta quente.'],
   ['Teste a porta com as costas da mão antes de abrir.', 'Combine um ponto de encontro da família do lado de fora.'], ['firstaid.burns']))

g('scenario.heatwave',
 d('Several days of dangerous heat.', 'Never leave a person or pet in a parked car. Confusion or fainting needs emergency help.',
   ['Stay in the coolest part of the home.', 'Drink water regularly, even without thirst.', 'Wear light, loose clothing. Avoid midday effort.', 'Cool skin with damp cloths or a cool shower.', 'Check on older adults, children and the ill.'],
   ['Heavy exercise at midday.', 'Waiting until thirsty to drink.', 'Leaving anyone in a parked car.'],
   ['Close curtains on sunny windows. Ventilate at night.'], ['firstaid.heat', 'water.store']),
 d('Vários dias de calor perigoso.', 'Nunca deixe pessoa ou animal em carro parado. Confusão ou desmaio exige ajuda de emergência.',
   ['Fique na parte mais fresca da casa.', 'Beba água com frequência, mesmo sem sede.', 'Use roupa leve e solta. Evite esforço ao meio-dia.', 'Resfrie a pele com panos úmidos ou banho fresco.', 'Veja como estão idosos, crianças e doentes.'],
   ['Exercício pesado ao meio-dia.', 'Esperar ter sede para beber.', 'Deixar alguém em carro parado.'],
   ['Feche cortinas nas janelas com sol. Ventile à noite.'], ['firstaid.heat', 'water.store']))

g('scenario.coldwave',
 d('Several days of dangerous cold.', 'Never use a grill, stove or outdoor heater indoors: carbon monoxide can kill.',
   ['Stay indoors. Pick one room to keep warm.', 'Wear layers and a hat. Keep clothes dry.', 'Block drafts under doors and around windows.', 'Drink warm fluids and eat regularly.', 'Check on older adults, babies and the ill.'],
   ['Using fuel burners indoors without ventilation.', 'Wearing wet clothes.', 'Drinking alcohol to feel warm.'],
   ['Shivering, confusion or slurred speech can mean hypothermia.'], ['firstaid.hypothermia', 'scenario.blackout']),
 d('Vários dias de frio perigoso.', 'Nunca use churrasqueira, fogareiro ou aquecedor de área externa dentro de casa: o monóxido de carbono pode matar.',
   ['Fique em casa. Escolha um cômodo para manter aquecido.', 'Use camadas e touca. Mantenha a roupa seca.', 'Vede frestas de portas e janelas.', 'Beba líquidos mornos e coma com regularidade.', 'Veja como estão idosos, bebês e doentes.'],
   ['Usar queimadores sem ventilação dentro de casa.', 'Usar roupa molhada.', 'Beber álcool para sentir calor.'],
   ['Tremores, confusão ou fala arrastada podem indicar hipotermia.'], ['firstaid.hypothermia', 'scenario.blackout']))

g('scenario.earthquake',
 d('Shaking ground. Act during the shaking; plan before it.', 'Do not run outside during shaking. Leave at once if you smell gas.',
   ['Drop to hands and knees.', 'Cover your head and neck under a sturdy table.', 'Hold on until the shaking stops.', 'If outdoors, move to open space away from buildings.', 'Expect aftershocks. Check for injuries and gas leaks.'],
   ['Running outside during shaking.', 'Standing in a doorway.', 'Using elevators.'],
   ['If driving, stop in a clear area and stay inside.', 'Stay away from windows and heavy furniture.'], ['firstaid.bleeding', 'scenario.blackout']),
 d('Chão tremendo. Aja durante o tremor; planeje antes.', 'Não corra para fora durante o tremor. Saia na hora se sentir cheiro de gás.',
   ['Abaixe-se de joelhos e mãos.', 'Proteja cabeça e pescoço sob uma mesa firme.', 'Segure-se até o tremor parar.', 'Ao ar livre, vá para espaço aberto longe de prédios.', 'Espere réplicas. Verifique feridos e vazamentos de gás.'],
   ['Correr para fora durante o tremor.', 'Ficar no vão da porta.', 'Usar elevadores.'],
   ['Se estiver dirigindo, pare em local aberto e fique dentro do carro.', 'Fique longe de janelas e móveis pesados.'], ['firstaid.bleeding', 'scenario.blackout']))

g('scenario.lost',
 d('Lost outdoors. Use the STOP rule: Stop, Think, Observe, Plan.', 'Do not keep walking in panic. If you told someone your route, staying put usually helps rescuers.',
   ['Stop. Sit down and breathe.', 'Think. Do not move in panic.', 'Observe: your surroundings, water, weather, light left.', 'Plan: usually stay put and make yourself visible.', 'Signal for help: three whistle blasts or bright items.'],
   ['Walking on without a plan.', 'Splitting up the group.', 'Leaving without telling anyone the route.'],
   ['Protect yourself from cold, heat and rain before dark.', 'Ration water. Do not drink untreated water if you can avoid it.'], ['shelter.camp-setup', 'water.disinfect', 'firstaid.hypothermia']),
 d('Perdido ao ar livre. Use a regra STOP: Pare, Pense, Observe, Planeje.', 'Não continue andando em pânico. Se avisou alguém do seu trajeto, ficar parado costuma ajudar o resgate.',
   ['Pare. Sente-se e respire.', 'Pense. Não se mova em pânico.', 'Observe: entorno, água, clima, luz restante.', 'Planeje: em geral, fique no lugar e seja visível.', 'Peça ajuda: três apitos ou itens de cor viva.'],
   ['Andar sem plano.', 'Separar o grupo.', 'Sair sem avisar ninguém do trajeto.'],
   ['Proteja-se de frio, calor e chuva antes de escurecer.', 'Racione a água. Evite beber água sem tratamento.'], ['shelter.camp-setup', 'water.disinfect', 'firstaid.hypothermia']))

g('prepare.kit72',
 d('Use the interactive checklist under Prepare.', '', [], [], ['Set people and days in the checklist; quantities are placeholders pending review.'], ['water.store']),
 d('Use o checklist interativo em Preparar.', '', [], [], ['Defina pessoas e dias no checklist; as quantidades são provisórias até a revisão.'], ['water.store']))
g('prepare.kit-car',
 d('Use the interactive checklist under Prepare.', '', [], [], ['Quantities are placeholders pending review.'], []),
 d('Use o checklist interativo em Preparar.', '', [], [], ['As quantidades são provisórias até a revisão.'], []))

def q(s): return json.dumps(s, ensure_ascii=False)
n = 0
for f in glob.glob('content/*/**/*.md', recursive=True):
    lang = f.split('/')[1]
    raw = open(f, encoding='utf8').read()
    m = re.search(r'^id: (\S+)$', raw, re.M)
    if not m or m.group(1) not in G or 'status: draft' not in raw: continue
    id = m.group(1); c = G[id][lang]
    fm = lambda k: re.search(rf'^{k}: (.*)$', raw, re.M).group(1)
    lst = lambda xs: '[]' if not xs else '\n' + '\n'.join(f'  - {q(x)}' for x in xs)
    body = ''.join(f'- {x}\n' for x in c['understand'])
    out = f"""---
id: {id}
kind: {fm('kind')}
category: {fm('category')}
plan: free
vital: {fm('vital')}
status: draft
needsReview: true
title: {fm('title')}
summary: {q(c['summary'])}
minutes: {0 if not c['now'] else 5}
{('warning: ' + q(c['warning'])) if c['warning'] else ''}
now: {lst(c['now'])}
materials: []
related: [{', '.join(c['related'])}]
mistakes: {lst(c['mistakes'])}
review:
  date: 2026-11-19
  level: draft
  source: {q(SRC[lang])}
tags: []
---
{body}"""
    out = re.sub(r'\n\n(?=now:)', '\n', out)
    open(f, 'w', encoding='utf8').write(out); n += 1
print('filled', n)
