// quizSeeder.js — VERSION 2
// Questions en français, contenu dans la langue cible
// Pool de 4 questions par niveau → sélection aléatoire de 2 par session
// Commande : node backend/seeders/quizSeeder.js

require('dotenv').config()
const mongoose = require('mongoose')
const Quiz = require('../models/Quiz')

const questions = [

    // ════════════════════════════════════════════════════
    // ANGLAIS
    // ════════════════════════════════════════════════════

    // ── A1 ──
    {
        langue: 'Anglais', niveau: 'A1',
        question: 'Que signifie "Good morning" ?',
        options: ['Bonne nuit', 'Bonjour (matin)', 'Bonsoir', 'Au revoir'],
        reponseCorrecte: 1
    },
    {
        langue: 'Anglais', niveau: 'A1',
        question: 'Quelle phrase veut dire "Je m\'appelle Sara" en anglais ?',
        options: ['I am Sara', 'My name is Sara', 'She is Sara', 'You call Sara'],
        reponseCorrecte: 1
    },
    {
        langue: 'Anglais', niveau: 'A1',
        question: 'Complète : "There ___ a cat on the table."',
        options: ['are', 'am', 'is', 'be'],
        reponseCorrecte: 2
    },
    {
        langue: 'Anglais', niveau: 'A1',
        question: 'Que signifie "How much does it cost ?" ?',
        options: ['Où est-ce ?', 'C\'est quoi ?', 'C\'est combien ?', 'Tu veux quoi ?'],
        reponseCorrecte: 2
    },

    // ── A2 ──
    {
        langue: 'Anglais', niveau: 'A2',
        question: 'Laquelle de ces phrases est correcte au passé simple ?',
        options: ['She go to school yesterday.', 'She went to school yesterday.', 'She goed to school yesterday.', 'She goes to school yesterday.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Anglais', niveau: 'A2',
        question: 'Que signifie "Can you help me, please ?" ?',
        options: ['Est-ce que tu me connais ?', 'Est-ce que tu peux m\'aider ?', 'Où est l\'aide ?', 'Je ne peux pas t\'aider.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Anglais', niveau: 'A2',
        question: 'Complète : "She ___ watching TV when I called."',
        options: ['is', 'was', 'were', 'be'],
        reponseCorrecte: 1
    },
    {
        langue: 'Anglais', niveau: 'A2',
        question: 'Quelle phrase exprime un futur proche en anglais ?',
        options: ['I went to the store.', 'I am going to the store tomorrow.', 'I go to the store every day.', 'I was at the store.'],
        reponseCorrecte: 1
    },

    // ── B1 ──
    {
        langue: 'Anglais', niveau: 'B1',
        question: 'Quelle phrase exprime une hypothèse au présent en anglais ?',
        options: ['If I was rich, I travel the world.', 'If I were rich, I would travel the world.', 'If I am rich, I traveled the world.', 'If I be rich, I will travel the world.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Anglais', niveau: 'B1',
        question: 'Que signifie le mot "nevertheless" dans ce contexte : "It was raining; nevertheless, we went out." ?',
        options: ['donc', 'malgré tout', 'parce que', 'si bien que'],
        reponseCorrecte: 1
    },
    {
        langue: 'Anglais', niveau: 'B1',
        question: 'Laquelle de ces phrases utilise correctement le present perfect ?',
        options: ['I have seen this film yesterday.', 'I saw this film since 2020.', 'I have seen this film three times.', 'I am seeing this film already.'],
        reponseCorrecte: 2
    },
    {
        langue: 'Anglais', niveau: 'B1',
        question: 'Que signifie "I\'d rather stay home tonight" ?',
        options: ['Je dois rester à la maison.', 'Je préfèrerais rester à la maison.', 'Je ne peux pas sortir ce soir.', 'Je suis obligé de rester.'],
        reponseCorrecte: 1
    },

    // ── B2 ──
    {
        langue: 'Anglais', niveau: 'B2',
        question: 'Laquelle de ces phrases utilise correctement la voix passive ?',
        options: ['The report has reviewed by the manager.', 'The report was reviewed by the manager.', 'The report reviewed by the manager.', 'The report is reviewing by the manager.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Anglais', niveau: 'B2',
        question: 'Que signifie "ubiquitous" ?',
        options: ['Rare et précieux', 'Présent partout', 'Difficile à comprendre', 'Très ancien'],
        reponseCorrecte: 1
    },
    {
        langue: 'Anglais', niveau: 'B2',
        question: 'Quelle phrase exprime un regret sur une action passée ?',
        options: ['I wish I go to the party.', 'I wish I went to the party.', 'I wish I had gone to the party.', 'I wish I would go to the party.'],
        reponseCorrecte: 2
    },
    {
        langue: 'Anglais', niveau: 'B2',
        question: 'Que signifie "I can\'t help but feel responsible" ?',
        options: ['Je ne suis pas responsable.', 'Je ne peux pas m\'empêcher de me sentir responsable.', 'Je refuse d\'être responsable.', 'Je ne sais pas si je suis responsable.'],
        reponseCorrecte: 1
    },

    // ── C1 ──
    {
        langue: 'Anglais', niveau: 'C1',
        question: 'Quelle phrase utilise correctement le subjonctif anglais ?',
        options: ['I suggest that he goes home early.', 'I suggest that he go home early.', 'I suggest that he would go home early.', 'I suggest that he is going home early.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Anglais', niveau: 'C1',
        question: 'Que signifie "to equivocate" ?',
        options: ['S\'exprimer avec clarté', 'Utiliser un langage ambigu pour tromper', 'Répéter sans cesse', 'Parler trop rapidement'],
        reponseCorrecte: 1
    },
    {
        langue: 'Anglais', niveau: 'C1',
        question: 'Laquelle de ces phrases contient une inversion stylistique formelle ?',
        options: ['She rarely speaks in public.', 'Rarely does she speak in public.', 'She does rarely speak in public.', 'Rarely she speaks in public.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Anglais', niveau: 'C1',
        question: 'Que signifie "the bill was tabled" dans le contexte parlementaire américain ?',
        options: ['Le projet de loi a été discuté.', 'Le projet de loi a été voté.', 'Le projet de loi a été mis de côté.', 'Le projet de loi a été présenté.'],
        reponseCorrecte: 2
    },

    // ── C2 ──
    {
        langue: 'Anglais', niveau: 'C2',
        question: 'Que signifie "sesquipedalian" ?',
        options: ['Relatif aux mots courts', 'Caractérisé par l\'usage de mots très longs', 'Appartenant à un registre familier', 'Propre à la langue archaïque'],
        reponseCorrecte: 1
    },
    {
        langue: 'Anglais', niveau: 'C2',
        question: 'Laquelle de ces phrases illustre un "mixed conditional" ?',
        options: ['If it rains, I stay home.', 'If I had studied, I would have passed.', 'If I had studied harder, I would be a doctor now.', 'If I study, I will pass.'],
        reponseCorrecte: 2
    },
    {
        langue: 'Anglais', niveau: 'C2',
        question: 'Que signifie "to beg the question" dans son sens rhétorique originel ?',
        options: ['Poser une question embarrassante', 'Supposer comme vraie la conclusion qu\'on veut démontrer', 'Éviter de répondre à une question', 'Poser une question de manière indirecte'],
        reponseCorrecte: 1
    },
    {
        langue: 'Anglais', niveau: 'C2',
        question: 'Dans la phrase "Not only did he fail, but he also refused to apologize", quel procédé stylistique est utilisé ?',
        options: ['Métaphore', 'Inversion emphatique', 'Litote', 'Anaphore'],
        reponseCorrecte: 1
    },

    // ════════════════════════════════════════════════════
    // ESPAGNOL
    // ════════════════════════════════════════════════════

    // ── A1 ──
    {
        langue: 'Espagnol', niveau: 'A1',
        question: 'Que signifie "¿Cómo te llamas?" ?',
        options: ['Comment tu vas ?', 'Comment tu t\'appelles ?', 'D\'où tu viens ?', 'Quel âge as-tu ?'],
        reponseCorrecte: 1
    },
    {
        langue: 'Espagnol', niveau: 'A1',
        question: 'Laquelle de ces phrases est correcte pour dire "J\'ai 20 ans" en espagnol ?',
        options: ['Soy 20 años.', 'Tengo 20 años.', 'Hay 20 años.', 'Estoy 20 años.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Espagnol', niveau: 'A1',
        question: 'Que signifie "por favor" ?',
        options: ['Merci', 'Pardon', 'S\'il vous plaît', 'De rien'],
        reponseCorrecte: 2
    },
    {
        langue: 'Espagnol', niveau: 'A1',
        question: 'Comment dit-on "J\'habite à Madrid" en espagnol ?',
        options: ['Soy en Madrid.', 'Vivo en Madrid.', 'Estoy de Madrid.', 'Tengo Madrid.'],
        reponseCorrecte: 1
    },

    // ── A2 ──
    {
        langue: 'Espagnol', niveau: 'A2',
        question: 'Laquelle de ces phrases est correcte au passé (pretérito indefinido) ?',
        options: ['Ayer yo voy al mercado.', 'Ayer yo iba al mercado.', 'Ayer yo fui al mercado.', 'Ayer yo vaya al mercado.'],
        reponseCorrecte: 2
    },
    {
        langue: 'Espagnol', niveau: 'A2',
        question: 'Que signifie "¿Dónde está el baño?" ?',
        options: ['Où est la sortie ?', 'Où sont les toilettes ?', 'Où est la chambre ?', 'Comment va la salle de bain ?'],
        reponseCorrecte: 1
    },
    {
        langue: 'Espagnol', niveau: 'A2',
        question: 'Complète correctement : "Ella ___ médica." (Elle est médecin — profession stable)',
        options: ['está', 'hay', 'es', 'tiene'],
        reponseCorrecte: 2
    },
    {
        langue: 'Espagnol', niveau: 'A2',
        question: 'Quelle est la différence entre "ser" et "estar" dans ces phrases : "Estoy cansado" vs "Soy cansado" ?',
        options: ['"Estoy cansado" = je suis toujours fatigué ; "Soy cansado" = je suis fatigué en ce moment', '"Estoy cansado" = je suis fatigué en ce moment ; "Soy cansado" = je suis quelqu\'un de fatigant (caractère)', 'Les deux phrases sont identiques.', '"Soy cansado" est incorrect en espagnol.'],
        reponseCorrecte: 1
    },

    // ── B1 ──
    {
        langue: 'Espagnol', niveau: 'B1',
        question: 'Quelle phrase exprime une hypothèse irréelle au présent ?',
        options: ['Si tengo dinero, viajo.', 'Si tuviera dinero, viajaría.', 'Si tendré dinero, viaje.', 'Si tuve dinero, viajé.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Espagnol', niveau: 'B1',
        question: 'Que signifie "sin embargo" dans ce contexte : "Estudié mucho; sin embargo, no aprobé." ?',
        options: ['donc', 'par conséquent', 'cependant', 'de plus'],
        reponseCorrecte: 2
    },
    {
        langue: 'Espagnol', niveau: 'B1',
        question: 'Quelle phrase utilise correctement le subjonctif ?',
        options: ['Espero que él viene pronto.', 'Espero que él venga pronto.', 'Espero que él vendrá pronto.', 'Espero que él vino pronto.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Espagnol', niveau: 'B1',
        question: 'Que signifie "me cae bien" ?',
        options: ['Il est tombé sur moi', 'Je l\'aime bien (quelqu\'un)', 'Il m\'a appelé', 'Je suis bien tombé'],
        reponseCorrecte: 1
    },

    // ── B2 ──
    {
        langue: 'Espagnol', niveau: 'B2',
        question: 'Laquelle de ces phrases utilise correctement le subjonctif imparfait ?',
        options: ['Quería que vengas.', 'Quería que vinieras.', 'Quería que vendrías.', 'Quería que veniste.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Espagnol', niveau: 'B2',
        question: 'Que signifie l\'expression "no hay mal que por bien no venga" ?',
        options: ['Il n\'y a pas de bien sans effort.', 'À quelque chose malheur est bon.', 'Le mal vient toujours du bien.', 'Il n\'y a que du mal dans ce monde.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Espagnol', niveau: 'B2',
        question: 'Dans quelle phrase le "se" est-il utilisé pour exprimer un sens passif impersonnel ?',
        options: ['Se peinó el cabello.', 'Se venden pisos aquí.', 'Se cayó al suelo.', 'Se fue sin decir nada.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Espagnol', niveau: 'B2',
        question: 'Que signifie "efímero" ?',
        options: ['Éternel', 'Éphémère, qui ne dure pas', 'Brillant', 'Profond'],
        reponseCorrecte: 1
    },

    // ── C1 ──
    {
        langue: 'Espagnol', niveau: 'C1',
        question: 'Laquelle de ces phrases utilise correctement le subjonctif passé (pretérito perfecto de subjuntivo) ?',
        options: ['Ojalá que viene mañana.', 'Ojalá que venga mañana.', 'Ojalá que haya llegado ya.', 'Ojalá que llega pronto.'],
        reponseCorrecte: 2
    },
    {
        langue: 'Espagnol', niveau: 'C1',
        question: 'Que signifie "circunloquio" ?',
        options: ['Une répétition de la même idée', 'Une façon indirecte de dire quelque chose', 'Un discours très court', 'Une contradiction dans les termes'],
        reponseCorrecte: 1
    },
    {
        langue: 'Espagnol', niveau: 'C1',
        question: 'Dans la phrase "No bien salió, empezó a llover", que signifie "no bien" ?',
        options: ['Pas correctement', 'À peine... que', 'Jamais', 'Bien que'],
        reponseCorrecte: 1
    },
    {
        langue: 'Espagnol', niveau: 'C1',
        question: 'Que signifie l\'expression "ponerse las pilas" ?',
        options: ['Recharger ses batteries (au sens littéral)', 'Se mettre au travail sérieusement', 'S\'énerver', 'Tomber malade'],
        reponseCorrecte: 1
    },

    // ── C2 ──
    {
        langue: 'Espagnol', niveau: 'C2',
        question: 'Laquelle de ces phrases utilise le "futuro de subjuntivo", une forme presque disparue en espagnol moderne ?',
        options: ['Si quieres, ven.', 'Quien lo hiciere será castigado.', 'Aunque llueva, saldremos.', 'Para que vengas, llámame.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Espagnol', niveau: 'C2',
        question: 'Quel procédé rhétorique utilise la phrase "Llegó, vio, venció" ("Llegué, vi, vencí") ?',
        options: ['Métaphore', 'Antithèse', 'Asyndète tricolon', 'Hyperbole'],
        reponseCorrecte: 2
    },
    {
        langue: 'Espagnol', niveau: 'C2',
        question: 'Que signifie "las paredes oyen" ?',
        options: ['Les murs sont solides.', 'Les murs ont des oreilles.', 'Le bruit porte loin.', 'Il ne faut pas parler fort.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Espagnol', niveau: 'C2',
        question: 'Dans la construction "De haberlo sabido, no habría venido", quel temps verbal est utilisé ?',
        options: ['Conditionnel passé simple', 'Infinitif passé composé de l\'hypothèse irréelle', 'Subjonctif imparfait', 'Gérondif passé'],
        reponseCorrecte: 1
    },

    // ════════════════════════════════════════════════════
    // CORÉEN
    // ════════════════════════════════════════════════════

    // ── A1 ──
    {
        langue: 'Coréen', niveau: 'A1',
        question: 'Que signifie "안녕하세요" (annyeonghaseyo) ?',
        options: ['Au revoir', 'Merci', 'Bonjour (formel)', 'Excusez-moi'],
        reponseCorrecte: 2
    },
    {
        langue: 'Coréen', niveau: 'A1',
        question: 'Comment dit-on "Je m\'appelle Aya" en coréen (forme polie) ?',
        options: ['저는 아야입니다.', '나는 아야있어요.', '저는 아야가요.', '아야는 저예요.'],
        reponseCorrecte: 0
    },
    {
        langue: 'Coréen', niveau: 'A1',
        question: 'Que signifie "주세요" (juseyo) placé après un nom ?',
        options: ['C\'est quoi ?', 'Donnez-moi / S\'il vous plaît', 'Je voudrais savoir', 'C\'est ici'],
        reponseCorrecte: 1
    },
    {
        langue: 'Coréen', niveau: 'A1',
        question: 'Que signifie "얼마예요?" (eolmayeyo) ?',
        options: ['Où est-ce ?', 'C\'est quoi ?', 'C\'est combien ?', 'Quand est-ce ?'],
        reponseCorrecte: 2
    },

    // ── A2 ──
    {
        langue: 'Coréen', niveau: 'A2',
        question: 'Quelle est la différence entre 이/가 et 은/는 en coréen ?',
        options: ['이/가 et 은/는 sont identiques.', '이/가 marque le sujet grammatical ; 은/는 marque le thème (ce dont on parle).', '이/가 marque l\'objet ; 은/는 marque le sujet.', '이/가 est pour le passé ; 은/는 est pour le présent.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Coréen', niveau: 'A2',
        question: 'Comment dit-on "Hier, je suis allé à l\'école" en coréen ?',
        options: ['어제 학교에 가요.', '어제 학교에 갔어요.', '어제 학교에 가겠어요.', '어제 학교에 가고 있어요.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Coréen', niveau: 'A2',
        question: 'Quelle particule indique la destination d\'un mouvement (aller à, venir à) ?',
        options: ['에서', '을/를', '에', '이/가'],
        reponseCorrecte: 2
    },
    {
        langue: 'Coréen', niveau: 'A2',
        question: 'Que signifie "배고파요" (baegopayo) ?',
        options: ['J\'ai soif.', 'Je suis fatigué.', 'J\'ai faim.', 'J\'ai froid.'],
        reponseCorrecte: 2
    },

    // ── B1 ──
    {
        langue: 'Coréen', niveau: 'B1',
        question: 'Quelle terminaison exprime la condition ("si...") en coréen ?',
        options: ['-(으)면', '-아/어서', '-(으)ㄴ데', '-지만'],
        reponseCorrecte: 0
    },
    {
        langue: 'Coréen', niveau: 'B1',
        question: 'Que signifie la forme "-고 싶어요" attachée à un verbe ?',
        options: ['Je dois faire...', 'Je suis en train de faire...', 'Je veux faire...', 'Je vais faire...'],
        reponseCorrecte: 2
    },
    {
        langue: 'Coréen', niveau: 'B1',
        question: 'Quelle est la différence entre "에서" et "에" avec un verbe de localisation ?',
        options: ['"에서" indique où une action se déroule ; "에" indique une position statique ou une destination.', '"에서" et "에" sont toujours interchangeables.', '"에" indique l\'action ; "에서" indique l\'état.', '"에서" est utilisé avec les verbes de mouvement uniquement.'],
        reponseCorrecte: 0
    },
    {
        langue: 'Coréen', niveau: 'B1',
        question: 'Comment exprimer une requête polie avec la forme "-(으)ㄹ 수 있어요?" ?',
        options: ['Est-ce que vous faites... ?', 'Pouvez-vous... ? / Est-il possible de... ?', 'Voulez-vous... ?', 'Devez-vous... ?'],
        reponseCorrecte: 1
    },

    // ── B2 ──
    {
        langue: 'Coréen', niveau: 'B2',
        question: 'Que signifie la terminaison "-(으)ㄹ 뻔했다" ?',
        options: ['J\'ai réussi à faire...', 'J\'ai failli faire... (mais ne l\'ai pas fait)', 'Je veux faire...', 'Je devais faire...'],
        reponseCorrecte: 1
    },
    {
        langue: 'Coréen', niveau: 'B2',
        question: 'Quelle est la nuance entre "-아/어서" et "-(으)니까" pour exprimer la cause ?',
        options: ['Ils sont identiques.', '"-아/어서" ne peut pas s\'utiliser avec les impératifs ou les propositions ; "-(으)니까" le peut.', '"-(으)니까" est plus formel que "-아/어서".', '"-아/어서" exprime une cause future ; "-(으)니까" une cause passée.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Coréen', niveau: 'B2',
        question: 'Que signifie "눈치가 빠르다" ?',
        options: ['Voir très vite', 'Lire beaucoup', 'Percevoir rapidement les situations sociales et les non-dits', 'Apprendre vite'],
        reponseCorrecte: 2
    },
    {
        langue: 'Coréen', niveau: 'B2',
        question: 'Quelle forme exprime une supposition polie sur une action future : "Il va probablement pleuvoir" ?',
        options: ['비가 와요.', '비가 왔어요.', '비가 올 것 같아요.', '비가 오고 있어요.'],
        reponseCorrecte: 2
    },

    // ── C1 ──
    {
        langue: 'Coréen', niveau: 'C1',
        question: 'Quelle est la différence entre le registre "해요체" et "합쇼체" ?',
        options: ['Aucune différence en pratique.', '"해요체" est poli informel (conversations) ; "합쇼체" est formel (présentations, administration).', '"해요체" est formel ; "합쇼체" est familier.', '"합쇼체" est réservé aux femmes.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Coréen', niveau: 'C1',
        question: 'Que signifie la structure "V-는 척하다" ?',
        options: ['Commencer à faire quelque chose', 'Faire semblant de faire quelque chose', 'Avoir l\'habitude de faire quelque chose', 'Arrêter de faire quelque chose'],
        reponseCorrecte: 1
    },
    {
        langue: 'Coréen', niveau: 'C1',
        question: 'Que signifie l\'expression idiomatique "발이 넓다" (pali neolda — avoir les pieds larges) ?',
        options: ['Être lent à marcher', 'Avoir beaucoup de relations sociales / un grand réseau', 'Être maladroit', 'Voyager beaucoup'],
        reponseCorrecte: 1
    },
    {
        langue: 'Coréen', niveau: 'C1',
        question: 'Quelle forme verbale est utilisée pour exprimer une action qui continue jusqu\'au moment présent avec un résultat visible ?',
        options: ['-고 있다', '-아/어 있다', '-았/었다', '-(으)ㄹ 것이다'],
        reponseCorrecte: 1
    },

    // ── C2 ──
    {
        langue: 'Coréen', niveau: 'C2',
        question: 'Dans quel registre littéraire ou formel trouve-t-on la terminaison "-(으)리라" ?',
        options: ['Langage familier entre amis', 'Discours écrit formel, poésie, textes littéraires', 'Langage enfantin', 'Dialecte de Busan'],
        reponseCorrecte: 1
    },
    {
        langue: 'Coréen', niveau: 'C2',
        question: 'Que signifie le proverbe coréen "가는 말이 고와야 오는 말이 곱다" ?',
        options: ['On récolte ce qu\'on sème.', 'Si tu parles bien aux autres, ils te parleront bien en retour.', 'Les bonnes paroles viennent de loin.', 'Le silence est d\'or.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Coréen', niveau: 'C2',
        question: 'Que signifie la structure avancée "V-건대" dans un discours formel ?',
        options: ['Même si...', 'En ce qui me concerne / à mon avis (forme soutenue)', 'Avant de faire...', 'Après avoir fait...'],
        reponseCorrecte: 1
    },
    {
        langue: 'Coréen', niveau: 'C2',
        question: 'Quel est le sens du concept culturel "정 (jeong)" en coréen ?',
        options: ['La politesse formelle', 'Un lien affectif profond et durable qui se développe entre personnes', 'La hiérarchie sociale', 'La fierté nationale'],
        reponseCorrecte: 1
    },

    // ════════════════════════════════════════════════════
    // JAPONAIS
    // ════════════════════════════════════════════════════

    // ── A1 ──
    {
        langue: 'Japonais', niveau: 'A1',
        question: 'Que signifie "ありがとうございます" (arigatou gozaimasu) ?',
        options: ['Bonjour', 'Au revoir', 'Merci beaucoup (formel)', 'Excusez-moi'],
        reponseCorrecte: 2
    },
    {
        langue: 'Japonais', niveau: 'A1',
        question: 'Comment dit-on "Je suis étudiant" en japonais (forme polie) ?',
        options: ['わたしは がくせい ます。', 'わたしは がくせい です。', 'わたしは がくせい いる。', 'わたしは がくせい ある。'],
        reponseCorrecte: 1
    },
    {
        langue: 'Japonais', niveau: 'A1',
        question: 'Quelle particule indique que le mot qui précède est l\'objet direct du verbe ?',
        options: ['は (wa)', 'が (ga)', 'を (wo)', 'に (ni)'],
        reponseCorrecte: 2
    },
    {
        langue: 'Japonais', niveau: 'A1',
        question: 'Que signifie "すみません" (sumimasen) ?',
        options: ['Merci', 'Excusez-moi / Pardon', 'Bonjour', 'Au revoir'],
        reponseCorrecte: 1
    },

    // ── A2 ──
    {
        langue: 'Japonais', niveau: 'A2',
        question: 'Comment forme-t-on le passé poli d\'un verbe en japonais ?',
        options: ['On remplace -ます par -ません.', 'On remplace -ます par -ました.', 'On remplace -ます par -たい.', 'On remplace -ます par -ましょう.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Japonais', niveau: 'A2',
        question: 'Que signifie la forme "〜てもいいですか" ?',
        options: ['Je dois faire...', 'Je ne peux pas faire...', 'Puis-je faire... ? (demande de permission)', 'Je vais faire...'],
        reponseCorrecte: 2
    },
    {
        langue: 'Japonais', niveau: 'A2',
        question: 'Quelle est la différence entre "あります" et "います" ?',
        options: ['Ils sont identiques.', '"あります" s\'utilise pour les objets inanimés ; "います" pour les êtres vivants.', '"あります" est pour le passé ; "います" pour le présent.', '"います" est formel ; "あります" est familier.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Japonais', niveau: 'A2',
        question: 'Comment dit-on "Je vais à Tokyo" en japonais ?',
        options: ['とうきょうで いきます。', 'とうきょうに いきます。', 'とうきょうを いきます。', 'とうきょうが いきます。'],
        reponseCorrecte: 1
    },

    // ── B1 ──
    {
        langue: 'Japonais', niveau: 'B1',
        question: 'Que signifie la forme "〜ば" attachée à un verbe ?',
        options: ['Parce que...', 'Bien que...', 'Si... (condition)', 'Après avoir fait...'],
        reponseCorrecte: 2
    },
    {
        langue: 'Japonais', niveau: 'B1',
        question: 'Quelle est la nuance de "〜てしまう" dans "財布を忘れてしまった" (j\'ai oublié mon portefeuille) ?',
        options: ['Action intentionnelle et positive', 'Regret ou résultat indésirable / action accomplie définitivement', 'Action en cours', 'Action future certaine'],
        reponseCorrecte: 1
    },
    {
        langue: 'Japonais', niveau: 'B1',
        question: 'Que signifie "〜たことがあります" ?',
        options: ['Je suis en train de faire...', 'J\'ai l\'habitude de faire...', 'J\'ai (déjà) fait... (expérience passée)', 'Je viens de faire...'],
        reponseCorrecte: 2
    },
    {
        langue: 'Japonais', niveau: 'B1',
        question: 'Comment exprime-t-on une obligation en japonais ("il faut que je...") ?',
        options: ['〜てもいいです', '〜なければなりません', '〜てはいけません', '〜てほしいです'],
        reponseCorrecte: 1
    },

    // ── B2 ──
    {
        langue: 'Japonais', niveau: 'B2',
        question: 'Quelle est la différence entre は (wa) et が (ga) en tant que marqueurs du sujet ?',
        options: ['Ils sont toujours interchangeables.', 'は marque le thème / la continuité ; が marque le sujet avec focalisation ou nouvelle information.', 'は est formel ; が est familier.', 'が est pour les questions seulement.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Japonais', niveau: 'B2',
        question: 'Que signifie "〜にもかかわらず" ?',
        options: ['Grâce à...', 'En raison de...', 'Malgré... / En dépit de...', 'Selon...'],
        reponseCorrecte: 2
    },
    {
        langue: 'Japonais', niveau: 'B2',
        question: 'Que signifie l\'expression "猫の手も借りたい" (neko no te mo karitai — vouloir emprunter même les pattes d\'un chat) ?',
        options: ['Aimer les animaux', 'Être tellement occupé qu\'on accepterait n\'importe quelle aide', 'Être très paresseux', 'Avoir peur des chats'],
        reponseCorrecte: 1
    },
    {
        langue: 'Japonais', niveau: 'B2',
        question: 'Dans quel registre utilise-t-on "〜でございます" ?',
        options: ['Langue familière entre amis', 'Keigo (langue honorifique humble)', 'Langue enfantine', 'Langue littéraire archaïque'],
        reponseCorrecte: 1
    },

    // ── C1 ──
    {
        langue: 'Japonais', niveau: 'C1',
        question: 'Quelle est la différence entre "謙譲語" (kenjougo) et "尊敬語" (sonkeigo) dans le système keigo ?',
        options: ['Ce sont les mêmes.', '"謙譲語" abaisse le locuteur pour élever l\'interlocuteur ; "尊敬語" élève directement l\'interlocuteur.', '"謙譲語" est pour parler de soi ; "尊敬語" est neutre.', '"尊敬語" est plus formel que "謙譲語".'],
        reponseCorrecte: 1
    },
    {
        langue: 'Japonais', niveau: 'C1',
        question: 'Que signifie "〜ずにはいられない" ?',
        options: ['Il est impossible de faire...', 'Je ne peux pas m\'empêcher de faire...', 'Je ne veux pas faire...', 'Il faut absolument faire...'],
        reponseCorrecte: 1
    },
    {
        langue: 'Japonais', niveau: 'C1',
        question: 'Que signifie le concept japonais "木漏れ日" (komorebi) ?',
        options: ['La lumière du coucher de soleil sur l\'eau', 'La lumière du soleil qui filtre à travers les feuilles des arbres', 'L\'ombre portée d\'une forêt', 'Le reflet de la lune sur les feuilles'],
        reponseCorrecte: 1
    },
    {
        langue: 'Japonais', niveau: 'C1',
        question: 'Quelle structure exprime une concession formelle : "Même s\'il pleut, nous partirons" ?',
        options: ['雨なら、出発します。', '雨が降っても、出発します。', '雨が降るから、出発します。', '雨が降れば、出発します。'],
        reponseCorrecte: 1
    },

    // ── C2 ──
    {
        langue: 'Japonais', niveau: 'C2',
        question: 'Que signifie l\'expression littéraire "花鳥風月" (kachōfūgetsu) ?',
        options: ['Les quatre saisons du Japon', 'La beauté de la nature telle qu\'exprimée dans la poésie et les arts traditionnels', 'Les quatre éléments naturels', 'Un style pictural traditionnel'],
        reponseCorrecte: 1
    },
    {
        langue: 'Japonais', niveau: 'C2',
        question: 'Dans la phrase classique "春はあけぼの" (Makura no Soshi), quel procédé stylistique est utilisé ?',
        options: ['Hyperbole', 'Phrase nominale elliptique évocatrice (style "mono no aware")', 'Métaphore directe', 'Comparaison explicite'],
        reponseCorrecte: 1
    },
    {
        langue: 'Japonais', niveau: 'C2',
        question: 'Que signifie "七転び八起き" (nana korobi ya oki) ?',
        options: ['Tomber sept fois et ne jamais se relever', 'Tomber sept fois et se relever huit — la résilience', 'Faire huit tentatives pour réussir', 'Ne jamais abandonner dès la première chute'],
        reponseCorrecte: 1
    },
    {
        langue: 'Japonais', niveau: 'C2',
        question: 'Que signifie le terme littéraire "物の哀れ" (mono no aware) ?',
        options: ['La beauté éternelle des choses', 'La tristesse de l\'existence', 'La sensibilité émue face à la nature éphémère des choses', 'La nostalgie du passé'],
        reponseCorrecte: 2
    },

    // ════════════════════════════════════════════════════
    // ALLEMAND
    // ════════════════════════════════════════════════════

    // ── A1 ──
    {
        langue: 'Allemand', niveau: 'A1',
        question: 'Que signifie "Guten Morgen" ?',
        options: ['Bonne nuit', 'Bonjour (matin)', 'Bonsoir', 'Au revoir'],
        reponseCorrecte: 1
    },
    {
        langue: 'Allemand', niveau: 'A1',
        question: 'Quelle est la conjugaison correcte du verbe "sein" (être) pour "ich" (je) ?',
        options: ['ich bist', 'ich bin', 'ich ist', 'ich sind'],
        reponseCorrecte: 1
    },
    {
        langue: 'Allemand', niveau: 'A1',
        question: 'Quel article défini va avec "Buch" (livre) en allemand ?',
        options: ['der', 'die', 'das', 'den'],
        reponseCorrecte: 2
    },
    {
        langue: 'Allemand', niveau: 'A1',
        question: 'Que signifie "Wo ist die Toilette, bitte?" ?',
        options: ['Quand est la réunion ?', 'Où sont les toilettes, s\'il vous plaît ?', 'Comment aller à la gare ?', 'Quel est le prix ?'],
        reponseCorrecte: 1
    },

    // ── A2 ──
    {
        langue: 'Allemand', niveau: 'A2',
        question: 'Laquelle de ces phrases est correcte au passé composé (Perfekt) ?',
        options: ['Ich habe gestern ins Kino gegangen.', 'Ich bin gestern ins Kino gegangen.', 'Ich war gestern ins Kino gegangen.', 'Ich habe gestern im Kino gewesen.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Allemand', niveau: 'A2',
        question: 'Quelle est la règle de la déclinaison de l\'article défini à l\'accusatif masculin ?',
        options: ['Il reste "der".', 'Il devient "dem".', 'Il devient "den".', 'Il devient "des".'],
        reponseCorrecte: 2
    },
    {
        langue: 'Allemand', niveau: 'A2',
        question: 'Comment dit-on "Je peux parler allemand" en allemand ?',
        options: ['Ich will Deutsch sprechen.', 'Ich kann Deutsch sprechen.', 'Ich muss Deutsch sprechen.', 'Ich soll Deutsch sprechen.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Allemand', niveau: 'A2',
        question: 'Dans la phrase "Ich gehe in die Schule", pourquoi utilise-t-on "die" et non "der" ?',
        options: ['Schule est féminin donc "die" à tous les cas.', 'Le verbe "gehen" exige toujours l\'accusatif, et "die Schule" est féminin accusatif.', '"Die" est utilisé uniquement au pluriel.', 'C\'est une exception grammaticale.'],
        reponseCorrecte: 1
    },

    // ── B1 ──
    {
        langue: 'Allemand', niveau: 'B1',
        question: 'Quelle phrase exprime une hypothèse irréelle au présent (Konjunktiv II) ?',
        options: ['Wenn ich Zeit habe, reise ich.', 'Wenn ich Zeit hätte, würde ich reisen.', 'Wenn ich Zeit hatte, reiste ich.', 'Wenn ich Zeit haben werde, werde ich reisen.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Allemand', niveau: 'B1',
        question: 'Que signifie "dennoch" dans ce contexte : "Es regnete; dennoch gingen wir spazieren." ?',
        options: ['donc', 'parce que', 'malgré tout / cependant', 'de plus'],
        reponseCorrecte: 2
    },
    {
        langue: 'Allemand', niveau: 'B1',
        question: 'Quelle préposition exige toujours le datif ?',
        options: ['durch', 'für', 'mit', 'gegen'],
        reponseCorrecte: 2
    },
    {
        langue: 'Allemand', niveau: 'B1',
        question: 'Comment forme-t-on le passif présent de "Man baut das Haus" ?',
        options: ['Das Haus wird gebaut.', 'Das Haus ist gebaut.', 'Das Haus wurde gebaut.', 'Das Haus hat gebaut.'],
        reponseCorrecte: 0
    },

    // ── B2 ──
    {
        langue: 'Allemand', niveau: 'B2',
        question: 'Que signifie l\'expression idiomatique "Da liegt der Hund begraben" ?',
        options: ['Il y a un chien enterré là.', 'Voilà le nœud du problème / c\'est là que ça coince.', 'C\'est une situation sans issue.', 'Il faut creuser plus profond.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Allemand', niveau: 'B2',
        question: 'Dans quelle phrase le Konjunktiv I est-il utilisé correctement pour le discours indirect ?',
        options: ['Er sagte, er ist krank.', 'Er sagte, er war krank.', 'Er sagte, er sei krank.', 'Er sagte, er wäre krank.'],
        reponseCorrecte: 2
    },
    {
        langue: 'Allemand', niveau: 'B2',
        question: 'Que signifie "unerschütterlich" ?',
        options: ['Fragile', 'Inébranlable, imperturbable', 'Incompréhensible', 'Indestructible physiquement'],
        reponseCorrecte: 1
    },
    {
        langue: 'Allemand', niveau: 'B2',
        question: 'Quelle est la nuance entre "wegen" + génitif et "aufgrund" + génitif ?',
        options: ['Aucune différence.', '"wegen" est oral/courant ; "aufgrund" est plus formel et écrit.', '"aufgrund" est familier ; "wegen" est formel.', '"wegen" exprime la cause ; "aufgrund" exprime la conséquence.'],
        reponseCorrecte: 1
    },

    // ── C1 ──
    {
        langue: 'Allemand', niveau: 'C1',
        question: 'Quelle structure utilise correctement le Konjunktiv II passé ?',
        options: ['Hätte sie es gewusst, handelt sie anders.', 'Hätte sie es gewusst, hätte sie anders gehandelt.', 'Wenn sie es gewusst hat, würde sie anders handeln.', 'Sie hätte es gewusst, sie handelt anders.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Allemand', niveau: 'C1',
        question: 'Que signifie "Weltanschauung" ?',
        options: ['Voyage autour du monde', 'Vision du monde / conception philosophique de l\'existence', 'Politique internationale', 'Culture mondiale'],
        reponseCorrecte: 1
    },
    {
        langue: 'Allemand', niveau: 'C1',
        question: 'Quel est le sens du mot "Verschlimmbessern" ?',
        options: ['Améliorer quelque chose progressivement', 'Aggraver une situation en voulant l\'améliorer', 'Compliquer une explication', 'Résoudre un problème de manière inattendue'],
        reponseCorrecte: 1
    },
    {
        langue: 'Allemand', niveau: 'C1',
        question: 'Que signifie l\'expression "Eulen nach Athen tragen" ?',
        options: ['Exporter des produits rares', 'Porter des chouettes à Athènes = apporter quelque chose là où il y en a déjà en abondance (enfoncer une porte ouverte)', 'Voyager inutilement', 'Répéter les mêmes erreurs'],
        reponseCorrecte: 1
    },

    // ── C2 ──
    {
        langue: 'Allemand', niveau: 'C2',
        question: 'Que signifie "Fingerspitzengefühl" ?',
        options: ['Sensibilité du bout des doigts (littéral)', 'Tact, sensibilité fine dans la gestion des situations délicates', 'Habileté manuelle', 'Intuition artistique'],
        reponseCorrecte: 1
    },
    {
        langue: 'Allemand', niveau: 'C2',
        question: 'Dans la phrase "Kaum hatte er das Haus verlassen, als es zu regnen begann", quel procédé est utilisé ?',
        options: ['Konjunktiv II', 'Inversion temporelle avec "kaum...als" (à peine...que)', 'Passif d\'état', 'Discours indirect libre'],
        reponseCorrecte: 1
    },
    {
        langue: 'Allemand', niveau: 'C2',
        question: 'Que signifie "Torschlusspanik" ?',
        options: ['La panique à la fermeture des portes (littéral)', 'L\'angoisse de rater sa chance avant qu\'il ne soit trop tard', 'La peur des espaces fermés', 'L\'urgence d\'une décision professionnelle'],
        reponseCorrecte: 1
    },
    {
        langue: 'Allemand', niveau: 'C2',
        question: 'Quel philosophe allemand a introduit le concept de "Dasein" dans la philosophie existentielle ?',
        options: ['Kant', 'Nietzsche', 'Heidegger', 'Hegel'],
        reponseCorrecte: 2
    },

    // ════════════════════════════════════════════════════
    // CHINOIS (MANDARIN)
    // ════════════════════════════════════════════════════

    // ── A1 ──
    {
        langue: 'Chinois', niveau: 'A1',
        question: 'Que signifie "你好" (nǐ hǎo) ?',
        options: ['Au revoir', 'Merci', 'Bonjour / Salut', 'Excusez-moi'],
        reponseCorrecte: 2
    },
    {
        langue: 'Chinois', niveau: 'A1',
        question: 'Comment dit-on "Je m\'appelle Li Ming" en mandarin ?',
        options: ['我是叫李明。', '我叫李明。', '我有李明。', '我在李明。'],
        reponseCorrecte: 1
    },
    {
        langue: 'Chinois', niveau: 'A1',
        question: 'Que signifie "多少钱?" (duōshao qián) ?',
        options: ['C\'est où ?', 'C\'est quoi ?', 'C\'est combien ?', 'C\'est quand ?'],
        reponseCorrecte: 2
    },
    {
        langue: 'Chinois', niveau: 'A1',
        question: 'Quel est le rôle du mot "不" (bù) en mandarin ?',
        options: ['Il marque la question.', 'Il exprime la négation.', 'Il indique le passé.', 'Il marque le pluriel.'],
        reponseCorrecte: 1
    },

    // ── A2 ──
    {
        langue: 'Chinois', niveau: 'A2',
        question: 'Comment exprime-t-on une action passée accomplie en mandarin ?',
        options: ['En ajoutant 要 après le verbe.', 'En ajoutant 了 après le verbe ou en fin de phrase.', 'En ajoutant 在 avant le verbe.', 'En ajoutant 过 avant le verbe.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Chinois', niveau: 'A2',
        question: 'Que signifie la structure "A 比 B + adjectif" ?',
        options: ['A est semblable à B.', 'A est plus [adjectif] que B.', 'A et B sont identiques.', 'A est moins [adjectif] que B.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Chinois', niveau: 'A2',
        question: 'Quelle est la différence entre "是...的" et "了" pour exprimer le passé ?',
        options: ['Ils sont identiques.', '"是...的" met l\'accent sur les circonstances d\'une action passée (quand, où, comment) ; "了" indique qu\'une action est accomplie.', '"是...的" est pour le futur ; "了" pour le passé.', '"是...的" est formel ; "了" est familier.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Chinois', niveau: 'A2',
        question: 'Comment dit-on "Je suis en train de manger" en mandarin ?',
        options: ['我吃了。', '我吃过。', '我在吃。', '我要吃。'],
        reponseCorrecte: 2
    },

    // ── B1 ──
    {
        langue: 'Chinois', niveau: 'B1',
        question: 'Que signifie la structure "虽然...但是..." ?',
        options: ['Si... alors...', 'Plus... plus...', 'Bien que... mais...', 'D\'abord... ensuite...'],
        reponseCorrecte: 2
    },
    {
        langue: 'Chinois', niveau: 'B1',
        question: 'Quelle est la différence entre "过" (guò) et "了" en tant que marqueurs d\'aspect ?',
        options: ['"过" indique une action accomplie récemment ; "了" indique une expérience de vie.', '"过" indique une expérience passée (avoir déjà fait) ; "了" indique qu\'une action est accomplie.', 'Ils sont toujours interchangeables.', '"过" est formel ; "了" est familier.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Chinois', niveau: 'B1',
        question: 'Que signifie "随便" (suíbiàn) dans un contexte informel ?',
        options: ['Jamais', 'Comme tu veux / peu importe', 'Toujours', 'Obligatoirement'],
        reponseCorrecte: 1
    },
    {
        langue: 'Chinois', niveau: 'B1',
        question: 'Comment utilise-t-on correctement "把" (bǎ) dans une phrase ?',
        options: ['"把" vient après le verbe.', '"把" introduit l\'objet direct avant le verbe pour insister sur l\'action effectuée sur cet objet.', '"把" est utilisé uniquement au passé.', '"把" remplace le sujet de la phrase.'],
        reponseCorrecte: 1
    },

    // ── B2 ──
    {
        langue: 'Chinois', niveau: 'B2',
        question: 'Que signifie "不得不" (bù dé bù) ?',
        options: ['Ne pas vouloir', 'Ne pas pouvoir', 'Être obligé de / ne pas pouvoir éviter de', 'Ne pas savoir comment'],
        reponseCorrecte: 2
    },
    {
        langue: 'Chinois', niveau: 'B2',
        question: 'Quelle est la différence entre 的 (de), 地 (de) et 得 (de) ?',
        options: ['Ils sont tous interchangeables.', '的 suit un adjectif/nom qualifiant un nom ; 地 suit un adjectif pour qualifier un verbe ; 得 suit un verbe pour introduire le complément de résultat.', '的 est pour les noms ; 地 pour les verbes ; 得 pour les adjectifs.', 'Ce sont trois prononciations différentes du même caractère.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Chinois', niveau: 'B2',
        question: 'Que signifie le chéngyǔ (proverbe à 4 caractères) "半途而废" (bàntú ér fèi) ?',
        options: ['Travailler sans relâche', 'Abandonner à mi-chemin', 'Réussir facilement', 'Recommencer depuis le début'],
        reponseCorrecte: 1
    },
    {
        langue: 'Chinois', niveau: 'B2',
        question: 'Comment exprime-t-on le passif en mandarin moderne ?',
        options: ['En ajoutant 是 avant le verbe.', 'En utilisant la structure "被 + agent + verbe".', 'En utilisant "让" avant le sujet.', 'Le mandarin n\'a pas de forme passive.'],
        reponseCorrecte: 1
    },

    // ── C1 ──
    {
        langue: 'Chinois', niveau: 'C1',
        question: 'Que signifie le chéngyǔ "望洋兴叹" (wàngyáng xīng tàn) ?',
        options: ['Admirer l\'immensité de l\'océan', 'Se sentir impuissant face à quelque chose de trop grand pour soi', 'Avoir de grandes ambitions', 'Voyager au bout du monde'],
        reponseCorrecte: 1
    },
    {
        langue: 'Chinois', niveau: 'C1',
        question: 'Quelle est la nuance stylistique du registre "文言文" (wényánwén) par rapport au "白话文" (báihuàwén) ?',
        options: ['Aucune différence.', '"文言文" est le chinois classique littéraire (avant le 20e s.) ; "白话文" est le chinois vernaculaire moderne.', '"文言文" est plus simple ; "白话文" est plus complexe.', '"文言文" est oral ; "白话文" est écrit.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Chinois', niveau: 'C1',
        question: 'Que signifie l\'expression "打草惊蛇" (dǎ cǎo jīng shé — frapper l\'herbe pour effrayer le serpent) ?',
        options: ['Agir avec prudence', 'Alerter l\'ennemi par inadvertance / éventer son propre plan', 'Attaquer directement', 'Se préparer à toutes éventualités'],
        reponseCorrecte: 1
    },
    {
        langue: 'Chinois', niveau: 'C1',
        question: 'Dans la grammaire classique, que signifie la particule "之" (zhī) ?',
        options: ['Une particule de négation', 'Une particule possessive ou de subordination (équivalent de 的 en classique)', 'Un marqueur de futur', 'Un marqueur de pluriel'],
        reponseCorrecte: 1
    },

    // ── C2 ──
    {
        langue: 'Chinois', niveau: 'C2',
        question: 'Que signifie le chéngyǔ "塞翁失马，焉知非福" (sài wēng shī mǎ, yān zhī fēi fú) ?',
        options: ['La chance vient toujours récompenser le travail.', 'À quelque chose malheur est bon — on ne sait pas ce qui est vraiment bien ou mal.', 'Les erreurs du passé enseignent pour l\'avenir.', 'La chance tourne toujours en faveur des sages.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Chinois', niveau: 'C2',
        question: 'Dans la poésie Tang, que représente le procédé "以景喻情" (yǐ jǐng yù qíng) ?',
        options: ['Décrire un paysage pour lui-même', 'Exprimer les émotions intérieures à travers la description de la nature', 'Comparer deux paysages', 'Décrire une scène historique'],
        reponseCorrecte: 1
    },
    {
        langue: 'Chinois', niveau: 'C2',
        question: 'Que signifie le concept philosophique taoïste "无为" (wúwéi) ?',
        options: ['Le néant absolu', 'L\'action sans effort / laisser les choses suivre leur cours naturel', 'L\'inaction totale et le refus d\'agir', 'La méditation silencieuse'],
        reponseCorrecte: 1
    },
    {
        langue: 'Chinois', niveau: 'C2',
        question: 'Quelle figure de style est utilisée dans ce vers de Du Fu : "烽火连三月，家书抵万金" ?',
        options: ['Métaphore simple', 'Hyperbole contrastive (la lettre familiale vaut dix mille pièces d\'or)', 'Comparaison directe', 'Répétition emphatique'],
        reponseCorrecte: 1
    },

    // ════════════════════════════════════════════════════
    // ARABE
    // ════════════════════════════════════════════════════

    // ── A1 ──
    {
        langue: 'Arabe', niveau: 'A1',
        question: 'Que signifie "مرحباً" (marhaban) ?',
        options: ['Au revoir', 'Merci', 'Bonjour / Bienvenue', 'S\'il vous plaît'],
        reponseCorrecte: 2
    },
    {
        langue: 'Arabe', niveau: 'A1',
        question: 'Comment dit-on "Je m\'appelle Ahmed" en arabe ?',
        options: ['أنا أحمد اسم.', 'اسمي أحمد.', 'أحمد هو اسم.', 'أنا في أحمد.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Arabe', niveau: 'A1',
        question: 'Que signifie "كم الثمن؟" (kam ath-thaman) ?',
        options: ['Où est-ce ?', 'C\'est quoi ?', 'C\'est combien ?', 'Quand est-ce ?'],
        reponseCorrecte: 2
    },
    {
        langue: 'Arabe', niveau: 'A1',
        question: 'En arabe, comment distingue-t-on le masculin du féminin pour les noms ?',
        options: ['Il n\'y a pas de distinction.', 'Le féminin se forme généralement en ajoutant "ة" (tā\' marbūṭa) à la fin du nom.', 'Le masculin ajoute "و".', 'Le féminin ajoute "ي".'],
        reponseCorrecte: 1
    },

    // ── A2 ──
    {
        langue: 'Arabe', niveau: 'A2',
        question: 'Comment forme-t-on le futur proche en arabe standard ?',
        options: ['Avec le préfixe كان (kāna)', 'Avec le préfixe سـ (sa-) ou سوف (sawfa) + le verbe au présent', 'Avec le mot قد (qad) + présent', 'En ajoutant ت à la fin du verbe'],
        reponseCorrecte: 1
    },
    {
        langue: 'Arabe', niveau: 'A2',
        question: 'Quel est le pluriel de "كتاب" (kitāb — livre) en arabe ?',
        options: ['كتابات', 'كتب', 'كتابون', 'كتابين'],
        reponseCorrecte: 1
    },
    {
        langue: 'Arabe', niveau: 'A2',
        question: 'Que signifie la structure "هناك + nom" en arabe ?',
        options: ['Le nom est le sujet.', 'Il y a + nom (existence)', 'Le nom est l\'objet.', 'Le nom est qualifié.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Arabe', niveau: 'A2',
        question: 'Comment dit-on "J\'aime le café" en arabe standard ?',
        options: ['أنا القهوة.', 'أنا أحب القهوة.', 'القهوة أنا.', 'أنا مع القهوة.'],
        reponseCorrecte: 1
    },

    // ── B1 ──
    {
        langue: 'Arabe', niveau: 'B1',
        question: 'Que signifie "رغم أن..." (raghma an) ?',
        options: ['Parce que...', 'Si...', 'Bien que... / Malgré le fait que...', 'Donc...'],
        reponseCorrecte: 2
    },
    {
        langue: 'Arabe', niveau: 'B1',
        question: 'Que signifie le schème morphologique "فَعَّلَ" (faʿʿala) comparé à "فَعَلَ" (faʿala) ?',
        options: ['Même sens, forme différente.', '"فَعَّلَ" exprime une action intensive, répétitive ou causative.', '"فَعَّلَ" exprime le passif.', '"فَعَّلَ" exprime une action accomplie.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Arabe', niveau: 'B1',
        question: 'Quelle est la différence entre "الفصحى" (al-fuṣḥā) et "العامية" (al-ʿāmmiyya) ?',
        options: ['Aucune différence.', '"الفصحى" est l\'arabe standard/littéraire ; "العامية" désigne les dialectes arabes parlés régionaux.', '"الفصحى" est le dialecte ; "العامية" est le standard.', 'Ce sont deux langues entièrement différentes sans lien.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Arabe', niveau: 'B1',
        question: 'Comment utilise-t-on "إن" (in) pour exprimer une condition en arabe ?',
        options: ['إن + passif', 'إن + présent du subjonctif + présent dans la principale', 'إن + futur + passé dans la principale', 'إن + verbe au passé + verbe au futur dans la principale'],
        reponseCorrecte: 3
    },

    // ── B2 ──
    {
        langue: 'Arabe', niveau: 'B2',
        question: 'Que signifie "الإعراب" (al-iʿrāb) en grammaire arabe ?',
        options: ['Le système des racines triconsonantiques', 'La déclinaison des noms selon leur fonction (cas : nominatif, accusatif, génitif)', 'L\'ordre des mots dans la phrase', 'La conjugaison des verbes'],
        reponseCorrecte: 1
    },
    {
        langue: 'Arabe', niveau: 'B2',
        question: 'Que signifie "المثنى" (al-muthanná) en arabe ?',
        options: ['Le singulier', 'Le duel — forme spéciale pour désigner exactement deux éléments', 'Le pluriel', 'Le genre féminin'],
        reponseCorrecte: 1
    },
    {
        langue: 'Arabe', niveau: 'B2',
        question: 'Que signifie l\'expression "على رأسي وعيني" (ʿalā rāsī wa-ʿaynī — sur ma tête et mon œil) ?',
        options: ['Je suis blessé.', 'Avec grand plaisir / Bien volontiers (expression de consentement enthousiaste)', 'Je ne comprends pas.', 'C\'est ma responsabilité.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Arabe', niveau: 'B2',
        question: 'Quelle est la forme correcte du pluriel irrégulier "pluriel brisé" de "رجل" (rajul — homme) ?',
        options: ['رجلون', 'رجلات', 'رجال', 'رجلين'],
        reponseCorrecte: 2
    },

    // ── C1 ──
    {
        langue: 'Arabe', niveau: 'C1',
        question: 'Qu\'est-ce que "جذر" (jidhr — racine) en morphologie arabe ?',
        options: ['Un préfixe grammatical', 'La séquence de 3 (parfois 4) consonnes porteuses du sens de base d\'un mot', 'Une terminaison verbale', 'Un schème vocalique'],
        reponseCorrecte: 1
    },
    {
        langue: 'Arabe', niveau: 'C1',
        question: 'Que signifie "الجناس" (al-jinās) dans la rhétorique arabe classique ?',
        options: ['La métaphore', 'La paronomase — jeu de mots entre des mots de sonorité similaire mais de sens différents', 'L\'hyperbole', 'La répétition emphatique'],
        reponseCorrecte: 1
    },
    {
        langue: 'Arabe', niveau: 'C1',
        question: 'Dans le Coran, que désigne "الإعجاز البياني" (al-iʿjāz al-bayānī) ?',
        options: ['La longueur des sourates', 'L\'inimitabilité stylistique et rhétorique du texte coranique', 'La musicalité des récitations', 'La complexité grammaticale'],
        reponseCorrecte: 1
    },
    {
        langue: 'Arabe', niveau: 'C1',
        question: 'Que signifie l\'expression littéraire "لا حول ولا قوة إلا بالله" dans son usage quotidien ?',
        options: ['Expression de joie', 'Expression de résignation ou d\'impuissance face à une situation difficile', 'Formule de salutation formelle', 'Expression de colère'],
        reponseCorrecte: 1
    },

    // ── C2 ──
    {
        langue: 'Arabe', niveau: 'C2',
        question: 'Que signifie "الطباق" (aṭ-ṭibāq) dans la rhétorique arabe classique ?',
        options: ['La répétition d\'un même mot', 'L\'antithèse — rapprochement de deux termes contraires pour créer un effet stylistique', 'La métonymie', 'L\'allitération'],
        reponseCorrecte: 1
    },
    {
        langue: 'Arabe', niveau: 'C2',
        question: 'Dans la poésie arabe préislamique (الشعر الجاهلي), que désigne "المعلقات" (al-muʿallaqāt) ?',
        options: ['Des poèmes religieux', 'Un recueil de lois tribales', 'Les sept (ou dix) grandes odes suspendues, chef-d\'œuvres de la poésie arabe ancienne', 'Des écrits philosophiques'],
        reponseCorrecte: 2
    },
    {
        langue: 'Arabe', niveau: 'C2',
        question: 'Que signifie le concept philosophique arabe "العقل" (al-ʿaql) dans la tradition de la falsafa (philosophie arabe médiévale) ?',
        options: ['La foi religieuse', 'La raison / l\'intellect — faculté de connaître et de distinguer le vrai du faux', 'L\'intuition mystique', 'La mémoire collective'],
        reponseCorrecte: 1
    },
    {
        langue: 'Arabe', niveau: 'C2',
        question: 'Dans la grammaire arabe classique, que désigne "الحال" (al-ḥāl) ?',
        options: ['Le temps verbal', 'Le complément circonstanciel d\'état — décrit l\'état du sujet ou de l\'objet au moment de l\'action', 'Le complément d\'objet direct', 'Le sujet grammatical'],
        reponseCorrecte: 1
    },

    // ════════════════════════════════════════════════════
    // FRANÇAIS
    // ════════════════════════════════════════════════════

    // ── A1 ──
    {
        langue: 'Français', niveau: 'A1',
        question: 'Que signifie "How are you?" en français ?',
        options: ['Comment tu t\'appelles ?', 'Comment vas-tu ?', 'D\'où viens-tu ?', 'Quel âge as-tu ?'],
        reponseCorrecte: 1
    },
    {
        langue: 'Français', niveau: 'A1',
        question: 'Laquelle de ces phrases est correcte pour dire "Je veux du café" ?',
        options: ['Je vouloir du café.', 'Je veux du café.', 'Je veut du café.', 'Je veux le café.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Français', niveau: 'A1',
        question: 'Que signifie "s\'il vous plaît" ?',
        options: ['Merci', 'Excusez-moi', 'Please / S\'il te plaît', 'De rien'],
        reponseCorrecte: 2
    },
    {
        langue: 'Français', niveau: 'A1',
        question: 'Comment dit-on "J\'habite à Paris" ?',
        options: ['J\'ai Paris.', 'Je suis à Paris.', 'J\'habite à Paris.', 'Je reste Paris.'],
        reponseCorrecte: 2
    },

    // ── A2 ──
    {
        langue: 'Français', niveau: 'A2',
        question: 'Laquelle de ces phrases est correcte au passé composé ?',
        options: ['Hier, je vas au cinéma.', 'Hier, je suis allé au cinéma.', 'Hier, j\'allais au cinéma.', 'Hier, j\'ai aller au cinéma.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Français', niveau: 'A2',
        question: 'Quelle est la différence entre "il est" et "il a" dans ces phrases : "Il est fatigué" / "Il a faim" ?',
        options: ['"Il est" s\'utilise avec les émotions ; "Il a" avec les états physiques.', '"Il est" + adjectif (état) ; "Il a" + nom (sensation ou possession).', 'Les deux sont identiques.', '"Il est" est formel ; "Il a" est familier.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Français', niveau: 'A2',
        question: 'Comment forme-t-on le féminin de "beau" ?',
        options: ['beaue', 'beaux', 'belle', 'belles'],
        reponseCorrecte: 2
    },
    {
        langue: 'Français', niveau: 'A2',
        question: 'Quelle phrase exprime un futur proche ?',
        options: ['Je mangerai demain.', 'Je vais manger demain.', 'Je mangeais demain.', 'Je mange demain.'],
        reponseCorrecte: 1
    },

    // ── B1 ──
    {
        langue: 'Français', niveau: 'B1',
        question: 'Laquelle de ces phrases est correcte au conditionnel présent ?',
        options: ['Si j\'avais le temps, je voyagerais.', 'Si j\'aurais le temps, je voyagerais.', 'Si j\'avais le temps, je voyagais.', 'Si j\'ai le temps, je voyagerais.'],
        reponseCorrecte: 0
    },
    {
        langue: 'Français', niveau: 'B1',
        question: 'Que signifie "néanmoins" dans : "C\'était difficile ; néanmoins, il a réussi." ?',
        options: ['donc', 'parce que', 'cependant / malgré tout', 'de plus'],
        reponseCorrecte: 2
    },
    {
        langue: 'Français', niveau: 'B1',
        question: 'Laquelle de ces phrases utilise correctement le subjonctif ?',
        options: ['Il faut que tu vas au bureau.', 'Il faut que tu ailles au bureau.', 'Il faut que tu irais au bureau.', 'Il faut que tu allais au bureau.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Français', niveau: 'B1',
        question: 'Quelle est la différence entre l\'imparfait et le passé composé ?',
        options: ['Aucune différence.', 'L\'imparfait décrit des actions habituelles ou des états dans le passé ; le passé composé exprime des actions ponctuelles et achevées.', 'L\'imparfait est pour le passé récent ; le passé composé pour le passé lointain.', 'L\'imparfait est littéraire ; le passé composé est oral.'],
        reponseCorrecte: 1
    },

    // ── B2 ──
    {
        langue: 'Français', niveau: 'B2',
        question: 'Laquelle de ces phrases utilise correctement le subjonctif passé ?',
        options: ['Bien qu\'il soit venu hier, je ne l\'ai pas vu.', 'Bien qu\'il venait hier, je ne l\'ai pas vu.', 'Bien qu\'il est venu hier, je ne l\'ai pas vu.', 'Bien qu\'il viendrait hier, je ne l\'ai pas vu.'],
        reponseCorrecte: 0
    },
    {
        langue: 'Français', niveau: 'B2',
        question: 'Que signifie "véhément" ?',
        options: ['Calme et posé', 'Passionné et d\'une grande intensité', 'Discret et réservé', 'Hésitant et timide'],
        reponseCorrecte: 1
    },
    {
        langue: 'Français', niveau: 'B2',
        question: 'Quelle phrase utilise correctement le gérondif ?',
        options: ['En chantant, la vaisselle a été faite.', 'En chantant, elle a fait la vaisselle.', 'La vaisselle faite en chantant.', 'Elle chantant a fait la vaisselle.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Français', niveau: 'B2',
        question: 'Que signifie l\'expression "il ne faut pas vendre la peau de l\'ours avant de l\'avoir tué" ?',
        options: ['Ne pas vendre ses animaux.', 'Il ne faut pas compter sur quelque chose qui n\'est pas encore acquis.', 'Il faut être prudent à la chasse.', 'Ne pas exagérer ses succès passés.'],
        reponseCorrecte: 1
    },

    // ── C1 ──
    {
        langue: 'Français', niveau: 'C1',
        question: 'Que signifie "circonlocution" ?',
        options: ['Une métaphore directe', 'Une façon indirecte et détournée d\'exprimer quelque chose', 'Une répétition emphatique', 'Une figure d\'opposition'],
        reponseCorrecte: 1
    },
    {
        langue: 'Français', niveau: 'C1',
        question: 'Quelle phrase utilise correctement le subjonctif imparfait (registre littéraire) ?',
        options: ['Bien qu\'il soit malade, il vint.', 'Bien qu\'il fût malade, il vint.', 'Bien qu\'il était malade, il vint.', 'Bien qu\'il serait malade, il vint.'],
        reponseCorrecte: 1
    },
    {
        langue: 'Français', niveau: 'C1',
        question: 'Que signifie le terme "oxymore" en rhétorique ?',
        options: ['Une répétition du même mot', 'L\'association de deux termes contradictoires ("obscure clarté")', 'Une exagération délibérée', 'Une comparaison implicite'],
        reponseCorrecte: 1
    },
    {
        langue: 'Français', niveau: 'C1',
        question: 'Que signifie l\'expression "avoir le cafard" ?',
        options: ['Avoir peur des insectes', 'Se sentir déprimé, mélancolique', 'Avoir une mauvaise conscience', 'Être de mauvaise humeur passagère'],
        reponseCorrecte: 1
    },

    // ── C2 ──
    {
        langue: 'Français', niveau: 'C2',
        question: 'Qu\'est-ce qu\'une "antiphrase" en rhétorique ?',
        options: ['Une phrase sans verbe', 'Dire le contraire de ce qu\'on pense (ex : ironie)', 'Une question rhétorique', 'Une phrase avec deux sujets'],
        reponseCorrecte: 1
    },
    {
        langue: 'Français', niveau: 'C2',
        question: 'Dans la phrase de Racine "Je t\'aimais inconstant, qu\'aurais-je fait fidèle ?", quel procédé rhétorique est utilisé ?',
        options: ['Métaphore', 'Hyperbole', 'Question rhétorique avec chiasme implicite', 'Litote'],
        reponseCorrecte: 2
    },
    {
        langue: 'Français', niveau: 'C2',
        question: 'Que signifie "pléonasme" et lequel de ces exemples en est un ?',
        options: ['"Un vieillard âgé" — pléonasme car âgé est implicite dans vieillard.', '"Une belle femme" — pléonasme.', '"Un homme courageux" — pléonasme.', '"Une décision rapide" — pléonasme.'],
        reponseCorrecte: 0
    },
    {
        langue: 'Français', niveau: 'C2',
        question: 'Que désigne le "style indirect libre" dans la narration littéraire ?',
        options: ['Un discours directement cité entre guillemets.', 'Une technique qui fond les paroles ou pensées d\'un personnage dans le récit sans les introduire formellement.', 'Un résumé des paroles d\'un personnage.', 'Un monologue intérieur en première personne.'],
        reponseCorrecte: 1
    },

]

// ────────────────────────────────────────
// SEED — connexion + insertion
// ────────────────────────────────────────
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

        // Résumé par langue et par niveau
        const langues = [...new Set(questions.map(q => q.langue))]
        langues.forEach(l =>
        {
            const niveaux = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
            const total = questions.filter(q => q.langue === l).length
            console.log(`\n  → ${l} : ${total} questions`)
            niveaux.forEach(n =>
            {
                const count = questions.filter(q => q.langue === l && q.niveau === n).length
                console.log(`       ${n} : ${count} questions`)
            })
        })

        process.exit(0)
    } catch (err)
    {
        console.error('Erreur seeder :', err.message)
        process.exit(1)
    }
}

seed()