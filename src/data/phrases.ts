// DRAFT machine-assisted emergency phrases (needs native-speaker review before release).
// [id, en, pt, es, fr, ar, hi, zh, arabic translit, hindi translit, pinyin]
type P = [string, string, string, string, string, string, string, string, string, string, string];
const P: P[] = [
  ['help', 'I need help', 'Preciso de ajuda', 'Necesito ayuda', "J'ai besoin d'aide", 'أحتاج إلى مساعدة', 'मुझे मदद चाहिए', '我需要帮助', "ahtaj ila musa'ada", 'mujhe madad chahiye', 'wǒ xūyào bāngzhù'],
  ['doctor', 'Call a doctor', 'Chame um médico', 'Llame a un médico', 'Appelez un médecin', 'اتصل بطبيب', 'डॉक्टर को बुलाइए', '请叫医生', 'ittasil bi-tabib', 'doctor ko bulaiye', 'qǐng jiào yīshēng'],
  ['police', 'Call the police', 'Chame a polícia', 'Llame a la policía', 'Appelez la police', 'اتصل بالشرطة', 'पुलिस को बुलाइए', '请报警', 'ittasil bi-shurta', 'police ko bulaiye', 'qǐng bàojǐng'],
  ['fire', 'Fire!', 'Fogo!', '¡Fuego!', 'Au feu !', 'حريق!', 'आग!', '着火了！', 'harīq', 'aag', 'zháohuǒ le'],
  ['lost', 'I am lost', 'Estou perdido', 'Estoy perdido', 'Je suis perdu', 'أنا تائه', 'मैं खो गया हूँ', '我迷路了', "ana ta'ih", 'main kho gaya hoon', 'wǒ mílù le'],
  ['hospital', 'Where is the hospital?', 'Onde fica o hospital?', '¿Dónde está el hospital?', "Où est l'hôpital ?", 'أين المستشفى؟', 'अस्पताल कहाँ है?', '医院在哪里？', 'ayna al-mustashfa', 'aspataal kahaan hai', 'yīyuàn zài nǎlǐ'],
  ['allergic', 'I am allergic to…', 'Sou alérgico a…', 'Soy alérgico a…', 'Je suis allergique à…', 'لدي حساسية من…', 'मुझे … से एलर्जी है', '我对…过敏', 'ladayya hasasiya min', 'mujhe … se allergy hai', 'wǒ duì … guòmǐn'],
  ['injured', 'I am injured', 'Estou ferido', 'Estoy herido', 'Je suis blessé', 'أنا مصاب', 'मैं घायल हूँ', '我受伤了', 'ana musab', 'main ghayal hoon', 'wǒ shòushāng le'],
  ['breathe', "I can't breathe", 'Não consigo respirar', 'No puedo respirar', "Je n'arrive pas à respirer", 'لا أستطيع التنفس', 'मुझे सांस नहीं आ रही', '我无法呼吸', 'la astatii at-tanaffus', 'mujhe saans nahin aa rahi', 'wǒ wúfǎ hūxī'],
  ['potable', 'Drinking water', 'Água potável', 'Agua potable', 'Eau potable', 'ماء صالح للشرب', 'पीने का पानी', '饮用水', "ma' salih lil-shurb", 'peene ka paani', 'yǐnyòngshuǐ'],
  ['needwater', 'I need water', 'Preciso de água', 'Necesito agua', "J'ai besoin d'eau", 'أحتاج إلى ماء', 'मुझे पानी चाहिए', '我需要水', "ahtaj ila ma'", 'mujhe paani chahiye', 'wǒ xūyào shuǐ'],
  ['hungry', 'I am hungry', 'Estou com fome', 'Tengo hambre', "J'ai faim", 'أنا جائع', 'मुझे भूख लगी है', '我饿了', "ana ja'i", 'mujhe bhookh lagi hai', 'wǒ è le'],
  ['power', 'Is there electricity?', 'Tem eletricidade?', '¿Hay electricidad?', "Y a-t-il de l'électricité ?", 'هل توجد كهرباء؟', 'बिजली है क्या?', '有电吗？', "hal tujad kahraba'", 'bijli hai kya', 'yǒu diàn ma'],
  ['safe', 'Is it safe here?', 'É seguro aqui?', '¿Es seguro aquí?', "C'est sûr ici ?", 'هل هذا آمن؟', 'क्या यहाँ सुरक्षित है?', '这里安全吗？', 'hal hadha amin', 'kya yahaan surakshit hai', 'zhèlǐ ānquán ma'],
  ['shelter', 'I need a shelter', 'Preciso de abrigo', 'Necesito refugio', "J'ai besoin d'un abri", 'أحتاج إلى مأوى', 'मुझे आश्रय चाहिए', '我需要避难所', "ahtaj ila ma'wa", 'mujhe aashray chahiye', 'wǒ xūyào bìnànsuǒ'],
  ['cold', 'I am cold', 'Estou com frio', 'Tengo frío', "J'ai froid", 'أشعر بالبرد', 'मुझे ठंड लग रही है', '我很冷', "ash'ur bil-bard", 'mujhe thand lag rahi hai', 'wǒ hěn lěng'],
  ['charge', 'I need to charge my phone', 'Preciso carregar meu celular', 'Necesito cargar mi teléfono', "J'ai besoin de recharger mon téléphone", 'أحتاج إلى شحن هاتفي', 'मुझे फ़ोन चार्ज करना है', '我需要给手机充电', 'ahtaj ila shahn hatifi', 'mujhe phone charge karna hai', 'wǒ xūyào gěi shǒujī chōngdiàn'],
  ['slow', 'Please speak slowly', 'Fale devagar, por favor', 'Hable despacio, por favor', "Parlez lentement, s'il vous plaît", 'تكلم ببطء من فضلك', 'कृपया धीरे बोलिए', '请说慢一点', "takallam bi-bu' min fadlik", 'kripya dheere boliye', 'qǐng shuō màn yīdiǎn'],
  ['english', 'Do you speak English?', 'Você fala inglês?', '¿Habla inglés?', 'Parlez-vous anglais ?', 'هل تتكلم الإنجليزية؟', 'क्या आप अंग्रेज़ी बोलते हैं?', '你会说英语吗？', 'hal tatakallam al-inglizia', 'kya aap angrezi bolte hain', 'nǐ huì shuō yīngyǔ ma'],
  ['medical', 'I have a medical condition', 'Tenho uma condição médica', 'Tengo una condición médica', "J'ai un problème médical", 'لدي حالة طبية', 'मुझे एक चिकित्सीय समस्या है', '我有健康问题', 'ladayya hala tibbiya', 'mujhe ek chikitsiya samasya hai', 'wǒ yǒu jiànkāng wèntí'],
  ['exit', 'Where is the exit?', 'Onde é a saída?', '¿Dónde está la salida?', 'Où est la sortie ?', 'أين المخرج؟', 'निकास कहाँ है?', '出口在哪里？', 'ayna al-makhraj', 'nikaas kahaan hai', 'chūkǒu zài nǎlǐ'],
  ['child', 'I am with a child', 'Estou com uma criança', 'Estoy con un niño', 'Je suis avec un enfant', 'معي طفل', 'मेरे साथ एक बच्चा है', '我带着一个孩子', "ma'i tifl", 'mere saath ek bachcha hai', 'wǒ dàizhe yí gè háizi'],
  ['thanks', 'Thank you', 'Obrigado', 'Gracias', 'Merci', 'شكرا', 'धन्यवाद', '谢谢', 'shukran', 'dhanyavaad', 'xièxie'],
  ['please', 'Please', 'Por favor', 'Por favor', "S'il vous plaît", 'من فضلك', 'कृपया', '请', 'min fadlik', 'kripya', 'qǐng'],
];
export interface Phrase { id: string; text: Record<string, string>; translit: Partial<Record<'ar' | 'hi' | 'zh', string>> }
export const PHRASES: Phrase[] = P.map(([id, en, pt, es, fr, ar, hi, zh, arT, hiT, zhT]) => ({ id, text: { en, pt, es, fr, ar, hi, zh }, translit: { ar: arT, hi: hiT, zh: zhT } }));
