// --> cd /backend --> node quizSeeder.js
// Couvre 8 langues × niveaux A1→C2, 2 questions par niveau minimum

require('dotenv').config()
const mongoose = require('mongoose')
const Quiz = require('../models/Quiz')

const questions = [

    // ════════════════════════════
    // ANGLAIS
    // ════════════════════════════
    { langue: 'Anglais', niveau: 'A1', question: 'What is the correct translation of "bonjour" ?', options: ['Goodbye', 'Hello', 'Thank you', 'Please'], reponseCorrecte: 1 },
    { langue: 'Anglais', niveau: 'A1', question: 'Complete : "I ___ a student."', options: ['are', 'is', 'am', 'be'], reponseCorrecte: 2 },
    { langue: 'Anglais', niveau: 'A2', question: 'Complete : "She ___ to school every day."', options: ['go', 'goes', 'going', 'went'], reponseCorrecte: 1 },
    { langue: 'Anglais', niveau: 'A2', question: 'What is the past tense of "eat" ?', options: ['eated', 'eaten', 'ate', 'aten'], reponseCorrecte: 2 },
    { langue: 'Anglais', niveau: 'B1', question: 'Complete : "If I ___ rich, I would travel the world."', options: ['am', 'was', 'were', 'be'], reponseCorrecte: 2 },
    { langue: 'Anglais', niveau: 'B1', question: 'What does "Nevertheless" mean ?', options: ['Therefore', 'However', 'Moreover', 'Although'], reponseCorrecte: 1 },
    { langue: 'Anglais', niveau: 'B2', question: 'Complete : "The report ___ by the manager before the meeting."', options: ['had reviewed', 'was reviewed', 'has been reviewing', 'reviewed'], reponseCorrecte: 1 },
    { langue: 'Anglais', niveau: 'B2', question: 'What is the meaning of "ubiquitous" ?', options: ['Rare', 'Present everywhere', 'Dangerous', 'Beautiful'], reponseCorrecte: 1 },
    { langue: 'Anglais', niveau: 'C1', question: 'Choose the correct form: "Had she known, she ___ differently."', options: ['would act', 'would have acted', 'will act', 'had acted'], reponseCorrecte: 1 },
    { langue: 'Anglais', niveau: 'C1', question: 'What does "equivocate" mean ?', options: ['To speak clearly', 'To use vague language to mislead', 'To agree', 'To repeat'], reponseCorrecte: 1 },
    { langue: 'Anglais', niveau: 'C2', question: 'Which sentence uses the subjunctive correctly ?', options: ['I suggest that he goes home.', 'I suggest that he go home.', 'I suggest that he would go home.', 'I suggest that he going home.'], reponseCorrecte: 1 },
    { langue: 'Anglais', niveau: 'C2', question: 'What does "sesquipedalian" mean ?', options: ['Very short words', 'Long words', 'Foreign words', 'Ancient words'], reponseCorrecte: 1 },

    // ════════════════════════════
    // ESPAGNOL
    // ════════════════════════════
    { langue: 'Espagnol', niveau: 'A1', question: '¿Cómo se dice "merci" en español ?', options: ['Por favor', 'Gracias', 'Hola', 'Adiós'], reponseCorrecte: 1 },
    { langue: 'Espagnol', niveau: 'A1', question: 'Completa : "Yo ___ estudiante."', options: ['eres', 'soy', 'es', 'somos'], reponseCorrecte: 1 },
    { langue: 'Espagnol', niveau: 'A2', question: 'Completa : "Ella ___ al mercado ayer."', options: ['va', 'fue', 'iba', 'irá'], reponseCorrecte: 1 },
    { langue: 'Espagnol', niveau: 'A2', question: '¿Cuál es el plural de "el libro" ?', options: ['los libros', 'las libros', 'el libros', 'los libro'], reponseCorrecte: 0 },
    { langue: 'Espagnol', niveau: 'B1', question: 'Completa : "Si tuviera dinero, ___ un viaje."', options: ['haré', 'haría', 'hice', 'haga'], reponseCorrecte: 1 },
    { langue: 'Espagnol', niveau: 'B1', question: '¿Qué significa "sin embargo" ?', options: ['Por lo tanto', 'Sin duda', 'No obstante', 'Además'], reponseCorrecte: 2 },
    { langue: 'Espagnol', niveau: 'B2', question: 'Elige la forma correcta : "Espero que él ___ pronto."', options: ['viene', 'vendrá', 'venga', 'vino'], reponseCorrecte: 2 },
    { langue: 'Espagnol', niveau: 'B2', question: '¿Qué significa "efímero" ?', options: ['Eterno', 'Pasajero', 'Importante', 'Brillante'], reponseCorrecte: 1 },
    { langue: 'Espagnol', niveau: 'C1', question: '¿Cuál es el significado de "circunloquio" ?', options: ['Hablar directamente', 'Rodeo de palabras', 'Un tipo de poema', 'Una repetición'], reponseCorrecte: 1 },
    { langue: 'Espagnol', niveau: 'C1', question: 'Completa : "Ojalá ___ mañana."', options: ['llueve', 'lloverá', 'llueva', 'lloviera'], reponseCorrecte: 2 },
    { langue: 'Espagnol', niveau: 'C2', question: 'Completa : "De haber sabido, no ___ esa decisión."', options: ['habría tomado', 'tomaría', 'tomara', 'hubiera tomado'], reponseCorrecte: 0 },
    { langue: 'Espagnol', niveau: 'C2', question: '¿Qué es un "oxímoron" ?', options: ['Repetición de sonidos', 'Combinación de términos contradictorios', 'Exageración literaria', 'Comparación implícita'], reponseCorrecte: 1 },

    // ════════════════════════════
    // FRANÇAIS
    // ════════════════════════════
    { langue: 'Français', niveau: 'A1', question: 'Quelle est la traduction de "hello" ?', options: ['Au revoir', 'Bonjour', 'Merci', "S'il vous plaît"], reponseCorrecte: 1 },
    { langue: 'Français', niveau: 'A1', question: 'Complète : "Je ___ un café."', options: ['veux', 'veut', 'voulons', 'voulez'], reponseCorrecte: 0 },
    { langue: 'Français', niveau: 'A2', question: 'Complète : "Hier, nous ___ au cinéma."', options: ['allons', 'sommes allés', 'irons', 'allions'], reponseCorrecte: 1 },
    { langue: 'Français', niveau: 'A2', question: 'Quel est le féminin de "beau" ?', options: ['beau', 'beaux', 'belle', 'belles'], reponseCorrecte: 2 },
    { langue: 'Français', niveau: 'B1', question: "Complète : \"Si j'avais le temps, je ___ voyager.\"", options: ['voudrais', 'veux', 'voulais', 'voudrai'], reponseCorrecte: 0 },
    { langue: 'Français', niveau: 'B1', question: 'Que signifie "néanmoins" ?', options: ['De plus', 'Cependant', 'Donc', 'Ainsi'], reponseCorrecte: 1 },
    { langue: 'Français', niveau: 'B2', question: "Quelle phrase est correcte au subjonctif ?", options: ["Il faut que tu vas.", "Il faut que tu ailles.", "Il faut que tu irais.", "Il faut que tu allais."], reponseCorrecte: 1 },
    { langue: 'Français', niveau: 'B2', question: 'Que signifie "véhément" ?', options: ['Calme', 'Passionné et intense', 'Discret', 'Hésitant'], reponseCorrecte: 1 },
    { langue: 'Français', niveau: 'C1', question: 'Que signifie "circonlocution" ?', options: ['Expression directe', 'Manière indirecte de parler', 'Métaphore', 'Répétition'], reponseCorrecte: 1 },
    { langue: 'Français', niveau: 'C1', question: 'Complète : "Bien qu\'il ___ malade, il est venu."', options: ['est', 'était', 'soit', 'serait'], reponseCorrecte: 2 },
    { langue: 'Français', niveau: 'C2', question: "Qu'est-ce qu'une \"antiphrase\" ?", options: ['Une répétition', 'Dire le contraire de ce qu\'on pense', 'Une question rhétorique', 'Une métaphore filée'], reponseCorrecte: 1 },
    { langue: 'Français', niveau: 'C2', question: 'Complète : "___ qu\'il eût voulu partir, il resta."', options: ['Bien', 'Quoique', 'Encore', 'Quand bien même'], reponseCorrecte: 3 },

    // ════════════════════════════
    // ALLEMAND
    // ════════════════════════════
    { langue: 'Allemand', niveau: 'A1', question: 'Wie sagt man "bonjour" auf Deutsch ?', options: ['Tschüss', 'Guten Tag', 'Danke', 'Bitte'], reponseCorrecte: 1 },
    { langue: 'Allemand', niveau: 'A1', question: 'Ergänze : "Ich ___ Student."', options: ['bist', 'bin', 'ist', 'sind'], reponseCorrecte: 1 },
    { langue: 'Allemand', niveau: 'A2', question: 'Welcher Artikel gehört zu "Buch" ?', options: ['der', 'die', 'das', 'den'], reponseCorrecte: 2 },
    { langue: 'Allemand', niveau: 'A2', question: 'Ergänze : "Gestern ___ ich ins Kino gegangen."', options: ['habe', 'bin', 'hatte', 'war'], reponseCorrecte: 1 },
    { langue: 'Allemand', niveau: 'B1', question: 'Ergänze : "Wenn ich Zeit ___, würde ich reisen."', options: ['habe', 'hatte', 'hätte', 'haben'], reponseCorrecte: 2 },
    { langue: 'Allemand', niveau: 'B1', question: 'Was bedeutet "dennoch" ?', options: ['also', 'trotzdem', 'außerdem', 'deshalb'], reponseCorrecte: 1 },
    { langue: 'Allemand', niveau: 'B2', question: 'Ergänze : "Der Bericht ___ vom Manager überprüft."', options: ['hat', 'wurde', 'ist', 'war'], reponseCorrecte: 1 },
    { langue: 'Allemand', niveau: 'B2', question: 'Was bedeutet "unerschütterlich" ?', options: ['schwach', 'unbeweglich/fest', 'unsicher', 'laut'], reponseCorrecte: 1 },
    { langue: 'Allemand', niveau: 'C1', question: 'Ergänze : "Hätte sie es gewusst, ___ sie anders gehandelt."', options: ['wird', 'würde', 'hätte', 'wäre'], reponseCorrecte: 2 },
    { langue: 'Allemand', niveau: 'C1', question: 'Was ist ein "Pleonasmus" ?', options: ['Ein Widerspruch', 'Eine sinnlose Wortwiederholung', 'Eine Übertreibung', 'Ein Vergleich'], reponseCorrecte: 1 },
    { langue: 'Allemand', niveau: 'C2', question: 'Was bedeutet "Weltanschauung" ?', options: ['Weltreise', 'Philosophische Lebensansicht', 'Internationale Politik', 'Globale Wirtschaft'], reponseCorrecte: 1 },
    { langue: 'Allemand', niveau: 'C2', question: 'Welche Form ist korrekt im Konjunktiv II ?', options: ['Er sagte, er geht.', 'Er sagte, er gehe.', 'Er sagte, er würde gehen.', 'Er sagte, er gegangen ist.'], reponseCorrecte: 2 },

    // ════════════════════════════
    // CORÉEN
    // ════════════════════════════
    { langue: 'Coréen', niveau: 'A1', question: '"안녕하세요" (Annyeonghaseyo) signifie :', options: ['Au revoir', 'Merci', 'Bonjour', 'Excuse-moi'], reponseCorrecte: 2 },
    { langue: 'Coréen', niveau: 'A1', question: 'Comment dit-on "eau" en coréen ?', options: ['불 (bul)', '물 (mul)', '밥 (bap)', '집 (jip)'], reponseCorrecte: 1 },
    { langue: 'Coréen', niveau: 'A2', question: 'Complète : "저는 학생_____." (Je suis étudiant)', options: ['이에요', '있어요', '해요', '가요'], reponseCorrecte: 0 },
    { langue: 'Coréen', niveau: 'A2', question: 'Que signifie "주세요" (juseyo) ?', options: ['Je pars', 'S\'il vous plaît / donnez-moi', 'Je comprends', 'Je ne sais pas'], reponseCorrecte: 1 },
    { langue: 'Coréen', niveau: 'B1', question: 'Quelle particule indique le sujet dans une phrase coréenne ?', options: ['을/를', '이/가', '은/는', '에서'], reponseCorrecte: 1 },
    { langue: 'Coréen', niveau: 'B1', question: '"어제 학교에 ___." (Hier, je suis allé à l\'école)', options: ['가요', '갔어요', '가겠어요', '가고 있어요'], reponseCorrecte: 1 },
    { langue: 'Coréen', niveau: 'B2', question: 'Que signifie la terminaison "-(으)면" ?', options: ['Parce que', 'Si / Quand (condition)', 'Mais', 'Donc'], reponseCorrecte: 1 },
    { langue: 'Coréen', niveau: 'B2', question: 'Comment exprimer une supposition polie en coréen ?', options: ['-아/어요', '-겠어요', '-았/었어요', '-고 있어요'], reponseCorrecte: 1 },
    { langue: 'Coréen', niveau: 'C1', question: 'Quelle est la différence entre 은/는 et 이/가 ?', options: ['Aucune différence', '은/는 = thème, 이/가 = sujet grammatical', '이/가 = objet, 은/는 = sujet', '은/는 = pluriel, 이/가 = singulier'], reponseCorrecte: 1 },
    { langue: 'Coréen', niveau: 'C1', question: 'Que signifie "-(으)ㄹ 뻔했다" ?', options: ['J\'ai réussi', 'J\'ai failli faire quelque chose', 'Je veux faire', 'Je dois faire'], reponseCorrecte: 1 },
    { langue: 'Coréen', niveau: 'C2', question: 'Quel registre de langue utilise-t-on avec "하오체" ?', options: ['Familier entre amis', 'Formel semi-archaïque', 'Informel entre jeunes', 'Écrit officiel moderne'], reponseCorrecte: 1 },
    { langue: 'Coréen', niveau: 'C2', question: 'Que signifie "눈치가 빠르다" ?', options: ['Courir vite', 'Lire rapidement', 'Percevoir les situations sociales rapidement', 'Apprendre vite'], reponseCorrecte: 2 },

    // ════════════════════════════
    // JAPONAIS
    // ════════════════════════════
    { langue: 'Japonais', niveau: 'A1', question: '"ありがとう" (Arigatou) signifie :', options: ['Bonjour', 'Au revoir', 'Merci', 'Excusez-moi'], reponseCorrecte: 2 },
    { langue: 'Japonais', niveau: 'A1', question: 'Comment dit-on "eau" en japonais ?', options: ['みず (mizu)', 'ひ (hi)', 'かぜ (kaze)', 'つち (tsuchi)'], reponseCorrecte: 0 },
    { langue: 'Japonais', niveau: 'A2', question: 'Complète : "わたしは がくせい ___。" (Je suis étudiant)', options: ['です', 'ます', 'でした', 'ません'], reponseCorrecte: 0 },
    { langue: 'Japonais', niveau: 'A2', question: 'Quelle particule indique la destination ?', options: ['は', 'が', 'に', 'を'], reponseCorrecte: 2 },
    { langue: 'Japonais', niveau: 'B1', question: 'Comment forme-t-on le passé poli d\'un verbe ?', options: ['-ます', '-ました', '-ません', '-たい'], reponseCorrecte: 1 },
    { langue: 'Japonais', niveau: 'B1', question: 'Que signifie "〜てもいいですか" ?', options: ['Je dois faire', 'Puis-je faire... ? (permission)', 'Je veux faire', 'Je ne peux pas faire'], reponseCorrecte: 1 },
    { langue: 'Japonais', niveau: 'B2', question: 'Que signifie la forme "〜ば" ?', options: ['Parce que', 'Si (condition)', 'Bien que', 'Après avoir fait'], reponseCorrecte: 1 },
    { langue: 'Japonais', niveau: 'B2', question: 'Quelle est la différence entre は (wa) et が (ga) ?', options: ['Aucune', 'は = thème, が = sujet avec emphase', 'が = objet, は = sujet', 'は = pluriel, が = singulier'], reponseCorrecte: 1 },
    { langue: 'Japonais', niveau: 'C1', question: 'Que signifie "〜にもかかわらず" ?', options: ['Grâce à', 'Malgré', 'À cause de', 'Selon'], reponseCorrecte: 1 },
    { langue: 'Japonais', niveau: 'C1', question: 'Quel registre est "〜でございます" ?', options: ['Familier', 'Neutre', 'Honorifique humble (keigo)', 'Informel écrit'], reponseCorrecte: 2 },
    { langue: 'Japonais', niveau: 'C2', question: 'Que signifie "木漏れ日" (komorebi) ?', options: ['Coucher de soleil', 'Lumière qui filtre à travers les feuilles', 'Reflet dans l\'eau', 'Ombre d\'un arbre'], reponseCorrecte: 1 },
    { langue: 'Japonais', niveau: 'C2', question: 'Que signifie "〜ずにはいられない" ?', options: ['Je ne peux pas faire', 'Je ne peux pas m\'empêcher de faire', 'Je dois absolument faire', 'Je fais sans raison'], reponseCorrecte: 1 },

    // ════════════════════════════
    // CHINOIS (MANDARIN)
    // ════════════════════════════
    { langue: 'Chinois', niveau: 'A1', question: '"你好" (Nǐ hǎo) signifie :', options: ['Au revoir', 'Merci', 'Bonjour', 'Excusez-moi'], reponseCorrecte: 2 },
    { langue: 'Chinois', niveau: 'A1', question: 'Comment dit-on "eau" en mandarin ?', options: ['火 (huǒ)', '水 (shuǐ)', '风 (fēng)', '土 (tǔ)'], reponseCorrecte: 1 },
    { langue: 'Chinois', niveau: 'A2', question: 'Complète : "我 ___ 学生。" (Je suis étudiant)', options: ['有', '是', '在', '去'], reponseCorrecte: 1 },
    { langue: 'Chinois', niveau: 'A2', question: 'Quel mot indique le passé récent en chinois ?', options: ['会', '在', '了', '过'], reponseCorrecte: 2 },
    { langue: 'Chinois', niveau: 'B1', question: 'Que signifie "虽然...但是..." ?', options: ['Si...alors...', 'Bien que...mais...', 'Plus...plus...', 'D\'abord...ensuite...'], reponseCorrecte: 1 },
    { langue: 'Chinois', niveau: 'B1', question: 'Comment dit-on "je suis en train de manger" ?', options: ['我吃了', '我吃过', '我在吃', '我要吃'], reponseCorrecte: 2 },
    { langue: 'Chinois', niveau: 'B2', question: 'Que signifie la particule "过" (guò) après un verbe ?', options: ['Action en cours', 'Action future', 'Expérience passée', 'Action habituelle'], reponseCorrecte: 2 },
    { langue: 'Chinois', niveau: 'B2', question: 'Comment exprimer une comparaison en chinois ?', options: ['用"和"', '用"比"', '用"对"', '用"跟"'], reponseCorrecte: 1 },
    { langue: 'Chinois', niveau: 'C1', question: 'Que signifie "不得不" ?', options: ['Ne pas vouloir', 'Ne pas pouvoir s\'empêcher / être obligé', 'Ne pas savoir', 'Ne pas oser'], reponseCorrecte: 1 },
    { langue: 'Chinois', niveau: 'C1', question: 'Que signifie le chéngyǔ "半途而废" ?', options: ['Travailler dur', 'Abandonner à mi-chemin', 'Réussir facilement', 'Agir prudemment'], reponseCorrecte: 1 },
    { langue: 'Chinois', niveau: 'C2', question: 'Que signifie "望洋兴叹" ?', options: ['Admirer l\'océan', 'Se sentir impuissant face à quelque chose de trop grand', 'Voyager loin', 'Être ambitieux'], reponseCorrecte: 1 },
    { langue: 'Chinois', niveau: 'C2', question: 'Quelle est la différence entre 的, 地 et 得 ?', options: ['Aucune différence', '的 = nom, 地 = adverbe, 得 = complément de résultat', '都表示所有格', '只有书面语使用'], reponseCorrecte: 1 },

    // ════════════════════════════
    // ARABE
    // ════════════════════════════
    { langue: 'Arabe', niveau: 'A1', question: '"مرحبا" (Marhaba) signifie :', options: ['Au revoir', 'Merci', 'Bonjour', 'S\'il vous plaît'], reponseCorrecte: 2 },
    { langue: 'Arabe', niveau: 'A1', question: 'Comment dit-on "eau" en arabe ?', options: ['نار (nār)', 'ماء (māʾ)', 'هواء (hawāʾ)', 'تراب (turāb)'], reponseCorrecte: 1 },
    { langue: 'Arabe', niveau: 'A2', question: 'Complète : "أنا ___ طالب" (Je suis étudiant)', options: ['كان', 'هو', 'لست', 'لا شيء — la phrase est déjà correcte'], reponseCorrecte: 3 },
    { langue: 'Arabe', niveau: 'A2', question: 'Quel est le pluriel de "كتاب" (kitāb - livre) ?', options: ['كتابات', 'كتب', 'كتابين', 'كتابون'], reponseCorrecte: 1 },
    { langue: 'Arabe', niveau: 'B1', question: 'Que signifie "رغم أن..." ?', options: ['Parce que', 'Bien que / Malgré que', 'Si', 'Donc'], reponseCorrecte: 1 },
    { langue: 'Arabe', niveau: 'B1', question: 'Comment forme-t-on le futur en arabe standard ?', options: ['Avec كان', 'Avec le préfixe سـ ou سوف', 'Avec قد', 'Avec لن'], reponseCorrecte: 1 },
    { langue: 'Arabe', niveau: 'B2', question: 'Que signifie le schème "فَعَّلَ" (faʿʿala) ?', options: ['Action simple', 'Action intensive ou causative', 'Action passive', 'Action réciproque'], reponseCorrecte: 1 },
    { langue: 'Arabe', niveau: 'B2', question: 'Quelle est la différence entre الفصحى et العامية ?', options: ['Aucune', 'الفصحى = arabe standard, العامية = dialecte parlé', 'الفصحى = dialecte, العامية = standard', 'Ce sont deux langues différentes'], reponseCorrecte: 1 },
    { langue: 'Arabe', niveau: 'C1', question: 'Que signifie "الإعراب" en grammaire arabe ?', options: ['La conjugaison', 'Les désinences casuelles des mots', 'Le système des racines', "L'ordre des mots"], reponseCorrecte: 1 },
    { langue: 'Arabe', niveau: 'C1', question: 'Complète : "___ تجتهد تنجح" (Si tu travailles dur, tu réussiras)', options: ['لو', 'إن', 'كلما', 'لأن'], reponseCorrecte: 1 },
    { langue: 'Arabe', niveau: 'C2', question: 'Quel est le sens de la racine "ك-ت-ب" ?', options: ['Lire', 'Écrire', 'Parler', 'Étudier'], reponseCorrecte: 1 },
    { langue: 'Arabe', niveau: 'C2', question: 'Qu\'est-ce que "المثنى" en arabe ?', options: ['Le singulier', 'Le duel (forme pour deux)', 'Le pluriel', 'Le féminin'], reponseCorrecte: 1 },
]

const seed = async () =>
{
    try
    {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('MongoDB connecté ✅')
        await Quiz.deleteMany({})
        console.log('Collection Quiz vidée ✅')
        await Quiz.insertMany(questions)
        console.log(`${questions.length} questions insérées ✅`)
        // Résumé par langue
        const langues = [...new Set(questions.map(q => q.langue))]
        langues.forEach(l =>
        {
            const count = questions.filter(q => q.langue === l).length
            console.log(`  → ${l} : ${count} questions`)
        })
        process.exit(0)
    } catch (err)
    {
        console.error('Erreur seeder :', err.message)
        process.exit(1)
    }
}

seed()