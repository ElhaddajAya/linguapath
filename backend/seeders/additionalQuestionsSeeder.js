// additionalQuestionsSeeder.js — VERSION 2 (extension du pool)
// Ajoute 2 questions supplémentaires par niveau par langue = 96 nouvelles questions
// À lancer UNE SEULE FOIS, APRÈS quizSeeder.js
// Commande : node backend/seeders/additionalQuestionsSeeder.js

require('dotenv').config()
const mongoose = require('mongoose')
const Quiz = require('../models/Quiz')

// ─────────────────────────────────────────────────────────────────────────────
// 96 questions supplémentaires (2 par niveau × 6 niveaux × 8 langues)
// Ces questions élargissent le pool pour activer la vraie randomisation $sample
// Pool total après ajout : 6 questions par niveau → 15 combinaisons possibles
// ─────────────────────────────────────────────────────────────────────────────
const questionsSupplementaires = [

    // ════════════════════════════════════════════════════
    // ANGLAIS (+12)
    // ════════════════════════════════════════════════════

    {
        langue: 'Anglais', niveau: 'A1',
        question: "Que signifie 'hungry' ?",
        options: ['avoir soif', 'être fatigué', 'avoir faim', 'avoir froid'],
        reponseCorrecte: 2
    },

    {
        langue: 'Anglais', niveau: 'A1',
        question: "Complète : 'She ___ to school every day.'",
        options: ['go', 'goes', 'going', 'gone'],
        reponseCorrecte: 1
    },

    {
        langue: 'Anglais', niveau: 'A2',
        question: "Que signifie 'How long have you lived here?' ?",
        options: ['Depuis quand habitez-vous ici ?', 'Combien de temps allez-vous rester ?', 'Pourquoi habitez-vous ici ?', 'Avez-vous toujours habité ici ?'],
        reponseCorrecte: 0
    },

    {
        langue: 'Anglais', niveau: 'A2',
        question: "Laquelle est correcte pour exprimer l'accord ?",
        options: ['I am agree with you.', 'I agree with you.', 'I am agreed with you.', 'I agreeing with you.'],
        reponseCorrecte: 1
    },

    {
        langue: 'Anglais', niveau: 'B1',
        question: "Que signifie 'I\'d rather' dans 'I\'d rather stay home' ?",
        options: ['Je dois', 'Je devrais', 'Je préférerais', 'Je pourrais'],
        reponseCorrecte: 2
    },

    {
        langue: 'Anglais', niveau: 'B1',
        question: "Quelle phrase utilise correctement un modal au passé ?",
        options: ['He must go yesterday.', 'She could swam when young.', 'They should have called first.', 'I can go there last week.'],
        reponseCorrecte: 2
    },

    {
        langue: 'Anglais', niveau: 'B2',
        question: "Que signifie l'expression 'to put something off' ?",
        options: ['Mettre en avant', 'Remettre à plus tard', 'Annuler définitivement', 'Commencer quelque chose'],
        reponseCorrecte: 1
    },

    {
        langue: 'Anglais', niveau: 'B2',
        question: "Laquelle utilise correctement 'not only... but also' ?",
        options: ['Not only she sings, but also she dances.', 'Not only does she sing, but she also dances.', 'Not only she does sing, but also dances.', 'Not only does she sing, but also she do dance.'],
        reponseCorrecte: 1
    },

    {
        langue: 'Anglais', niveau: 'C1',
        question: "Que signifie 'to hedge one\'s bets' ?",
        options: ['Miser sur plusieurs options pour réduire le risque', 'Prendre des risques inconsidérés', 'Placer toute sa confiance dans une seule option', "Refuser de s'engager"],
        reponseCorrecte: 0
    },

    {
        langue: 'Anglais', niveau: 'C1',
        question: "Laquelle illustre un 'dangling modifier' (erreur grammaticale courante) ?",
        options: ["Walking down the street, a dog barked at me.", 'Running to the bus, I dropped my keys.', 'Having studied hard, she passed the exam.', 'Exhausted from work, he fell asleep.'],
        reponseCorrecte: 0
    },

    {
        langue: 'Anglais', niveau: 'C2',
        question: "Que désigne un 'zeugma' en rhétorique ?",
        options: ['Une figure de répétition', "Une construction où un verbe gouverne deux compléments de nature différente (ex: 'She lost her keys and her temper')", 'Une métaphore filée sur plusieurs vers', 'Une inversion de termes dans une phrase'],
        reponseCorrecte: 1
    },

    {
        langue: 'Anglais', niveau: 'C2',
        question: "Que signifie la 'prolepsis' comme figure rhétorique ?",
        options: ["L'anticipation d'une objection pour mieux la réfuter", 'La répétition en fin de phrase', 'Le détournement vers le sens figuré', 'La progression par degrés croissants'],
        reponseCorrecte: 0
    },

    // ════════════════════════════════════════════════════
    // ESPAGNOL (+12)
    // ════════════════════════════════════════════════════

    {
        langue: 'Espagnol', niveau: 'A1',
        question: "Que signifie '¿Cuántos años tienes?' ?",
        options: ['Combien coûte cela ?', 'Quel âge as-tu ?', "Comment tu t'appelles ?", 'Où habites-tu ?'],
        reponseCorrecte: 1
    },

    {
        langue: 'Espagnol', niveau: 'A1',
        question: "Quel est le pluriel de 'el libro' ?",
        options: ['las libro', 'los libros', 'el libros', 'los libro'],
        reponseCorrecte: 1
    },

    {
        langue: 'Espagnol', niveau: 'A2',
        question: "Complète : 'Ayer ___ (hacer) mucho frío.'",
        options: ['hacía', 'hizo', 'hace', 'había hecho'],
        reponseCorrecte: 1
    },

    {
        langue: 'Espagnol', niveau: 'A2',
        question: "Que signifie 'tener que + infinitif' ?",
        options: ['Vouloir faire', 'Pouvoir faire', 'Devoir faire', 'Aimer faire'],
        reponseCorrecte: 2
    },

    {
        langue: 'Espagnol', niveau: 'B1',
        question: "Quelle phrase exprime le passé récent avec 'acabar de' ?",
        options: ['Acabé de comer hace una hora.', 'Acabo de comer.', 'He acabado de comer.', 'Acabaré de comer pronto.'],
        reponseCorrecte: 1
    },

    {
        langue: 'Espagnol', niveau: 'B1',
        question: "Que signifie 'ponerse + adjectif' ?",
        options: ["Rester dans un état stable", 'Devenir (changement temporaire et involontaire)', 'Sembler, paraître', 'Être en permanence'],
        reponseCorrecte: 1
    },

    {
        langue: 'Espagnol', niveau: 'B2',
        question: "Dans 'Para cuando llegues, ya habremos comido', quel temps est utilisé pour 'habremos comido' ?",
        options: ['Futur simple', 'Futur antérieur (futuro perfecto)', 'Conditionnel passé', 'Subjonctif passé'],
        reponseCorrecte: 1
    },

    {
        langue: 'Espagnol', niveau: 'B2',
        question: "Que signifie 'a pesar de que' suivi d'un verbe conjugué ?",
        options: ["Grâce au fait que", 'En raison de', 'Malgré le fait que (concession)', 'Au lieu de'],
        reponseCorrecte: 2
    },

    {
        langue: 'Espagnol', niveau: 'C1',
        question: "Que signifie l'expression 'andarse por las ramas' ?",
        options: ['Aller droit au but', 'Tourner autour du pot (éviter le sujet)', 'Se perdre dans la forêt', 'Exagérer les détails'],
        reponseCorrecte: 1
    },

    {
        langue: 'Espagnol', niveau: 'C1',
        question: "Laquelle utilise 'quisiera' comme conditionnel de politesse (subjonctif imparfait) ?",
        options: ['Quisiera pedirte un favor.', 'Quería pedirte un favor.', 'Quiero pedirte un favor.', 'Querré pedirte un favor.'],
        reponseCorrecte: 0
    },

    {
        langue: 'Espagnol', niveau: 'C2',
        question: "Que désigne 'el voseo' dans certaines variantes hispanoaméricaines ?",
        options: ["L'utilisation de 'vos' à la place de 'tú' avec sa propre conjugaison", "Le tutoiement excessif en espagnol européen", "L'emploi de 'usted' dans un registre familier", "Une forme archaïque réservée à la poésie"],
        reponseCorrecte: 0
    },

    {
        langue: 'Espagnol', niveau: 'C2',
        question: "Que signifie l'épithète dans la tradition rhétorique espagnole ('la verde hierba') ?",
        options: ['Un titre honorifique devant un nom', "Un adjectif qui souligne une qualité inhérente au nom sans apporter d'info nouvelle", 'Une figure de répétition sonore', 'Un jeu de mots phonétique'],
        reponseCorrecte: 1
    },

    // ════════════════════════════════════════════════════
    // FRANÇAIS (+12)
    // ════════════════════════════════════════════════════

    {
        langue: 'Français', niveau: 'A1',
        question: "Que signifie 'bibliothèque' en anglais ?",
        options: ['bookshop', 'library', 'book', 'reading room'],
        reponseCorrecte: 1
    },

    {
        langue: 'Français', niveau: 'A1',
        question: "Complète : 'Elle ___ des pommes tous les jours.'",
        options: ['mange', 'mangeons', 'manges', 'mangez'],
        reponseCorrecte: 0
    },

    {
        langue: 'Français', niveau: 'A2',
        question: "Quelle est la négation correcte de 'je comprends' ?",
        options: ['je ne comprend pas', 'je ne comprends pas', 'je comprends pas', 'je ne pas comprends'],
        reponseCorrecte: 1
    },

    {
        langue: 'Français', niveau: 'A2',
        question: "Quelle phrase utilise le futur simple ?",
        options: ['Je mange demain.', 'Je vais manger demain.', 'Je mangerai demain.', 'Je mangeais demain.'],
        reponseCorrecte: 2
    },

    {
        langue: 'Français', niveau: 'B1',
        question: "Quelle est la règle d'accord du participe passé avec l'auxiliaire 'avoir' ?",
        options: ["Il s'accorde toujours avec le sujet", "Il ne s'accorde jamais", "Il s'accorde avec le COD placé AVANT le verbe", "Il s'accorde avec le COD placé après le verbe"],
        reponseCorrecte: 2
    },

    {
        langue: 'Français', niveau: 'B1',
        question: "Que signifie 'bien que' dans une proposition ?",
        options: ['Parce que (cause)', 'Pour que (but)', 'Bien que = malgré le fait que (concession)', 'Depuis que (temps)'],
        reponseCorrecte: 2
    },

    {
        langue: 'Français', niveau: 'B2',
        question: "Quelle phrase utilise correctement le plus-que-parfait ?",
        options: ['Quand il arrive, elle était partie.', 'Quand il est arrivé, elle était déjà partie.', 'Quand il arrivera, elle partira.', 'Quand il arrivait, elle partirait.'],
        reponseCorrecte: 1
    },

    {
        langue: 'Français', niveau: 'B2',
        question: "Que signifie 'péremptoire' ?",
        options: ['Hésitant et indécis', 'Doux et conciliant', 'Qui ne tolère pas la contradiction, catégorique et définitif', 'Rare et exceptionnel'],
        reponseCorrecte: 2
    },

    {
        langue: 'Français', niveau: 'C1',
        question: "Qu'est-ce qu'une 'syllepse' en rhétorique française ?",
        options: ['Une répétition de mots en fin de vers', "Une figure qui prend un mot à la fois au sens littéral et figuré", 'Un emprunt à une langue étrangère', 'Une inversion sujet-verbe stylistique'],
        reponseCorrecte: 1
    },

    {
        langue: 'Français', niveau: 'C1',
        question: "Quelle phrase illustre une inversion stylistique correcte ?",
        options: ['Il faut encore le prouver.', 'Encore il faut le prouver.', 'Encore faut-il le prouver.', 'Il encore faut le prouver.'],
        reponseCorrecte: 2
    },

    {
        langue: 'Français', niveau: 'C2',
        question: "Qu'est-ce que la 'parataxe' dans la stylistique ?",
        options: ['La disposition des mots selon leur classe grammaticale', 'La juxtaposition de propositions sans mot de liaison explicite', 'La répétition emphatique du même mot', "L'accumulation excessive de subordonnées"],
        reponseCorrecte: 1
    },

    {
        langue: 'Français', niveau: 'C2',
        question: "Dans 'Allons, enfants de la Patrie' (Rouget de Lisle), quelle figure rhétorique domine ?",
        options: ['Métaphore filée sur la guerre', "Apostrophe rhétorique — le locuteur s'adresse directement à un groupe collectif", 'Hyperbole patriotique', 'Litote euphémisante'],
        reponseCorrecte: 1
    },

    // ════════════════════════════════════════════════════
    // ALLEMAND (+12)
    // ════════════════════════════════════════════════════

    {
        langue: 'Allemand', niveau: 'A1',
        question: "Que signifie 'Entschuldigung' ?",
        options: ['Merci', 'Je vous en prie', 'Excusez-moi / Pardon', 'De rien'],
        reponseCorrecte: 2
    },

    {
        langue: 'Allemand', niveau: 'A1',
        question: "Quel est le pluriel de 'Buch' (livre) ?",
        options: ['Buchs', 'Buche', 'Bücher', 'Buchen'],
        reponseCorrecte: 2
    },

    {
        langue: 'Allemand', niveau: 'A2',
        question: "Quelle préposition exige toujours l'accusatif ?",
        options: ['mit', 'bei', 'durch', 'nach'],
        reponseCorrecte: 2
    },

    {
        langue: 'Allemand', niveau: 'A2',
        question: "Comment dit-on correctement 'Il fait beau aujourd'hui' en allemand ?",
        options: ['Heute ist schön Wetter.', 'Heute es schönt.', 'Heute ist das Wetter schön.', 'Heute schön ist es.'],
        reponseCorrecte: 2
    },

    {
        langue: 'Allemand', niveau: 'B1',
        question: "Dans 'Er hat das Buch gelesen', quel auxiliaire est utilisé et pourquoi ?",
        options: ["'sein' — verbe de mouvement", "'haben' — verbe transitif avec objet direct", "'werden' — forme passive", "'lassen' — causatif"],
        reponseCorrecte: 1
    },

    {
        langue: 'Allemand', niveau: 'B1',
        question: "Que signifie 'obwohl' dans une proposition subordonnée ?",
        options: ['Parce que', 'Afin que', 'Bien que / Quoique (concession)', 'Depuis que'],
        reponseCorrecte: 2
    },

    {
        langue: 'Allemand', niveau: 'B2',
        question: "Que signifie le mot 'Weltschmerz' ?",
        options: ['Douleur physique intense', 'Joie profonde face à la beauté du monde', "Mélancolie et douleur morale face à l'état du monde", "Nostalgie d'une époque révolue"],
        reponseCorrecte: 2
    },

    {
        langue: 'Allemand', niveau: 'B2',
        question: "Dans 'Das Buch, dessen Autor ich kenne...', quelle est la fonction de 'dessen' ?",
        options: ['Pronom relatif nominatif masculin', 'Pronom relatif génitif masculin/neutre', "Pronom relatif à l'accusatif", 'Pronom relatif au datif'],
        reponseCorrecte: 1
    },

    {
        langue: 'Allemand', niveau: 'C1',
        question: "Que signifie 'Fernweh' (contraire de 'Heimweh') ?",
        options: ["Nostalgie intense du foyer", "L'envie irrésistible de voyager et de découvrir le monde", 'La peur des voyages en avion', "L'attachement culturel à sa région natale"],
        reponseCorrecte: 1
    },

    {
        langue: 'Allemand', niveau: 'C1',
        question: "Dans 'Je mehr er lernt, desto besser wird er', quelle structure est utilisée ?",
        options: ["Konjunktiv II hypothétique", "Double comparatif corrélé ('plus...plus')", "Passif d'état", "Inversion temporelle avec 'kaum...'"],
        reponseCorrecte: 1
    },

    {
        langue: 'Allemand', niveau: 'C2',
        question: "Que signifie 'Gemütlichkeit' dans la culture germanique ?",
        options: ['Tristesse profonde et mélancolie collective', 'Sentiment de confort, de chaleur et de convivialité propre à la culture germanique', 'Anxiété sociale face au regard des autres', 'Rigueur et discipline dans le travail'],
        reponseCorrecte: 1
    },

    {
        langue: 'Allemand', niveau: 'C2',
        question: "Que désigne 'das Ding an sich' dans la philosophie de Kant ?",
        options: ["La chose telle qu'elle nous apparaît dans l'expérience sensible", "La chose en soi, indépendante de toute perception — réalité inaccessible à notre connaissance", 'Le concept pur de la raison pratique', 'Le sujet pensant lui-même'],
        reponseCorrecte: 1
    },

    // ════════════════════════════════════════════════════
    // CORÉEN (+12)
    // ════════════════════════════════════════════════════

    {
        langue: 'Coréen', niveau: 'A1',
        question: "Que signifie '감사합니다' (gamsahamnida) ?",
        options: ['Bonjour (formel)', 'Au revoir', 'Merci beaucoup (formel)', 'Excusez-moi'],
        reponseCorrecte: 2
    },

    {
        langue: 'Coréen', niveau: 'A1',
        question: "Quelle particule marque le lieu où se déroule une action ?",
        options: ['이/가', '을/를', '에서', '의'],
        reponseCorrecte: 2
    },

    {
        langue: 'Coréen', niveau: 'A2',
        question: "Que signifie '없어요' (eopseoyo) ?",
        options: ["Il y a / j'ai (existence)", "Je ne sais pas", "Il n'y a pas / je n'ai pas (négation d'existence)", "Ce n'est pas ça"],
        reponseCorrecte: 2
    },

    {
        langue: 'Coréen', niveau: 'A2',
        question: "Comment dit-on 'Un café, s'il vous plaît' en coréen (forme polie) ?",
        options: ['커피 있어요.', '커피 주세요.', '커피 해요.', '커피 와요.'],
        reponseCorrecte: 1
    },

    {
        langue: 'Coréen', niveau: 'B1',
        question: "Que signifie '-(으)러 가다' attaché à un verbe ?",
        options: ["Aller à cause de quelque chose", 'Aller pour faire quelque chose (but du déplacement)', 'Aller sans but précis', 'Revenir après avoir fait quelque chose'],
        reponseCorrecte: 1
    },

    {
        langue: 'Coréen', niveau: 'B1',
        question: "Quelle est la différence entre '좋다' et '좋아하다' ?",
        options: ["Aucune différence.", "'좋다' est l'adjectif (être bon/bien) ; '좋아하다' est le verbe d'action (aimer, apprécier)", "'좋다' est formel ; '좋아하다' est familier", "'좋아하다' exprime un état permanent ; '좋다' un sentiment temporaire"],
        reponseCorrecte: 1
    },

    {
        langue: 'Coréen', niveau: 'B2',
        question: "Que signifie '-(으)ㄹ수록' dans '공부할수록 더 어렵다' ?",
        options: ["Jusqu'à ce que / en attendant", 'Bien que / même si', 'Plus on étudie, plus c\'est difficile (proportionnalité)', 'Après avoir étudié'],
        reponseCorrecte: 2
    },

    {
        langue: 'Coréen', niveau: 'B2',
        question: "Que signifie '이심전심 (以心傳心)' ?",
        options: ['Communication verbale directe et franche', "Se comprendre sans paroles, transmission de cœur à cœur", 'Malentendu entre deux personnes proches', 'Mensonge bien intentionné'],
        reponseCorrecte: 1
    },

    {
        langue: 'Coréen', niveau: 'C1',
        question: "Que signifie '공감 (共感, gonggam)' dans le contexte culturel coréen ?",
        options: ['Rivalité entre pairs du même niveau', 'Empathie profonde et partage émotionnel sincère', 'Politesse sociale de façade sans sentiment réel', 'Sentiment de fierté nationale collective'],
        reponseCorrecte: 1
    },

    {
        langue: 'Coréen', niveau: 'C1',
        question: "Quelle est la différence entre '하다 동사' et '이다' en coréen ?",
        options: ["Aucune différence fonctionnelle.", "'하다' forme des verbes d'action à partir de noms ; '이다' est le verbe copule (être)", "'이다' s'utilise uniquement au passé ; '하다' au présent", "'하다' est formel ; '이다' est familier"],
        reponseCorrecte: 1
    },

    {
        langue: 'Coréen', niveau: 'C2',
        question: "Que signifie le proverbe '호랑이도 제 말 하면 온다' ?",
        options: ["Il ne faut jamais parler des absents", "Quand on parle du loup, on en voit la queue", "Les paroles ont plus de pouvoir que les actions", "Le silence vaut mieux que les rumeurs"],
        reponseCorrecte: 1
    },

    {
        langue: 'Coréen', niveau: 'C2',
        question: "Quel est le sens profond du concept '한 (han)' dans la culture coréenne ?",
        options: ['La joie collective lors des fêtes nationales', "Douleur, souffrance et ressentiment accumulés historiquement — émotion culturelle complexe propre à la culture coréenne", 'La fierté nationale et le patriotisme', 'Le respect strict de la hiérarchie familiale confucéenne'],
        reponseCorrecte: 1
    },

    // ════════════════════════════════════════════════════
    // JAPONAIS (+12)
    // ════════════════════════════════════════════════════

    {
        langue: 'Japonais', niveau: 'A1',
        question: "Que signifie '何歳ですか' (nansai desu ka) ?",
        options: ['Comment vous appelez-vous ?', 'D\'où venez-vous ?', 'Quel âge avez-vous ?', 'Comment allez-vous ?'],
        reponseCorrecte: 2
    },

    {
        langue: 'Japonais', niveau: 'A1',
        question: "Que signifie 'わかりません' (wakarimasen) ?",
        options: ["Je ne suis pas disponible.", "Je ne comprends pas / Je ne sais pas.", "Ce n'est pas moi.", "Je ne veux pas."],
        reponseCorrecte: 1
    },

    {
        langue: 'Japonais', niveau: 'A2',
        question: "Comment dit-on 'Il fait chaud aujourd'hui' en japonais ?",
        options: ['今日は寒いです。(Il fait froid)', '今日は暑いです。(Il fait chaud)', '今日は涼しいです。(Il fait frais)', '今日は温かいです。(Il fait doux)'],
        reponseCorrecte: 1
    },

    {
        langue: 'Japonais', niveau: 'A2',
        question: "Quelle particule japonaise indique la direction d'un mouvement (vers, à) ?",
        options: ['は (wa)', 'が (ga)', 'を (wo)', 'に (ni)'],
        reponseCorrecte: 3
    },

    {
        langue: 'Japonais', niveau: 'B1',
        question: "Que signifie '〜ながら' attaché à un verbe ?",
        options: ["Après avoir fait quelque chose", 'Faire deux choses simultanément / pendant que', 'Avant de faire quelque chose', 'À cause de quelque chose'],
        reponseCorrecte: 1
    },

    {
        langue: 'Japonais', niveau: 'B1',
        question: "Comment exprime-t-on une interdiction en japonais ?",
        options: ['〜てもいいです (c\'est permis)', '〜てはいけません (c\'est interdit)', '〜なければなりません (c\'est obligatoire)', '〜てほしいです (je veux que tu fasses)'],
        reponseCorrecte: 1
    },

    {
        langue: 'Japonais', niveau: 'B2',
        question: "Que signifie '〜によって' dans '人によって意見が異なります' ?",
        options: ['Grâce à', 'En dépit de', 'Selon / en fonction de (varie selon les personnes)', 'À cause de'],
        reponseCorrecte: 2
    },

    {
        langue: 'Japonais', niveau: 'B2',
        question: "Que signifie le concept '間 (ma)' dans l'esthétique japonaise ?",
        options: ['La rapidité et la fluidité du mouvement', "L'espace vide ou la pause entre deux éléments — notion fondamentale dans les arts japonais", 'La force brute et l\'intensité', 'La répétition rythmique dans la musique'],
        reponseCorrecte: 1
    },

    {
        langue: 'Japonais', niveau: 'C1',
        question: "Que signifie '空気を読む (kuuki wo yomu)' dans la culture japonaise ?",
        options: ["Prévoir la météo grâce à l'observation", "Lire l'atmosphère sociale et comprendre implicitement ce qui est attendu sans qu'on le dise", 'Parler à voix basse dans un espace public', 'Écouter attentivement sans interrompre'],
        reponseCorrecte: 1
    },

    {
        langue: 'Japonais', niveau: 'C1',
        question: "Quelle est la forme humble (謙譲語) du verbe 'aller' (行く) en keigo ?",
        options: ['いらっしゃる (irassharu) — forme honorifique', 'おいでになる (oide ni naru) — forme honorifique', '参る (mairu) — forme humble', '行かれる (ikareru) — forme passive'],
        reponseCorrecte: 2
    },

    {
        langue: 'Japonais', niveau: 'C2',
        question: "Que signifie '侘び寂び (wabi-sabi)' dans l'esthétique japonaise ?",
        options: ['La perfection et la symétrie absolues dans la création artistique', "La beauté dans l'impermanence, l'imperfection et la simplicité — esthétique de la nature éphémère", 'La richesse visuelle, la complexité décorative et le faste', "La grandeur et l'immensité des paysages naturels"],
        reponseCorrecte: 1
    },

    {
        langue: 'Japonais', niveau: 'C2',
        question: "Que désigne le 'kigo' (季語) dans la poésie haïku traditionnelle ?",
        options: ['Le nombre de syllabes (5-7-5) obligatoire', 'La référence à une saison — élément obligatoire dans le haïku traditionnel', 'Le thème philosophique central du poème', 'La rime ou l\'écho sonore en fin de vers'],
        reponseCorrecte: 1
    },

    // ════════════════════════════════════════════════════
    // CHINOIS (+12)
    // ════════════════════════════════════════════════════

    {
        langue: 'Chinois', niveau: 'A1',
        question: "Que signifie '再见' (zàijiàn) ?",
        options: ['Bonjour', 'Merci', 'Au revoir', 'S\'il vous plaît'],
        reponseCorrecte: 2
    },

    {
        langue: 'Chinois', niveau: 'A1',
        question: "Comment dit-on 'J'ai soif' en mandarin ?",
        options: ['我饿了 (wǒ è le) — j\'ai faim', '我累了 (wǒ lèi le) — je suis fatigué', '我渴了 (wǒ kě le) — j\'ai soif', '我冷了 (wǒ lěng le) — j\'ai froid'],
        reponseCorrecte: 2
    },

    {
        langue: 'Chinois', niveau: 'A2',
        question: "Quelle est la différence entre '能 (néng)' et '可以 (kěyǐ)' ?",
        options: ["Ils sont toujours interchangeables.", "'能' exprime la capacité physique/compétence ; '可以' exprime la permission ou la possibilité générale", "'可以' est formel ; '能' est familier", "'能' est pour le futur ; '可以' pour le présent"],
        reponseCorrecte: 1
    },

    {
        langue: 'Chinois', niveau: 'A2',
        question: "Comment dit-on 'je ne sais pas' en mandarin ?",
        options: ['我不是 (wǒ bú shì) — je ne suis pas', '我没有 (wǒ méiyǒu) — je n\'ai pas', '我不知道 (wǒ bù zhīdào) — je ne sais pas', '我不要 (wǒ bú yào) — je ne veux pas'],
        reponseCorrecte: 2
    },

    {
        langue: 'Chinois', niveau: 'B1',
        question: "Que signifie '越来越 (yuèláiyuè)' suivi d'un adjectif ?",
        options: ['De moins en moins', 'De plus en plus [adjectif]', 'Exactement autant qu\'avant', 'Parfois / de temps en temps'],
        reponseCorrecte: 1
    },

    {
        langue: 'Chinois', niveau: 'B1',
        question: "Que signifie la structure '一边...一边...' ?",
        options: ["D'un côté...de l'autre (opposition de points de vue)", 'Faire deux choses simultanément', 'Premièrement...deuxièmement (structure additive)', 'Ni...ni... (négation double)'],
        reponseCorrecte: 1
    },

    {
        langue: 'Chinois', niveau: 'B2',
        question: "Quelle est la différence cruciale entre '以为 (yǐwéi)' et '认为 (rènwéi)' ?",
        options: ["Aucune différence en pratique.", "'以为' exprime une croyance qui s'avère fausse ; '认为' exprime une opinion ou un jugement neutre", "'认为' est formel ; '以为' est familier et oral", "'以为' est pour les faits ; '认为' pour les opinions politiques"],
        reponseCorrecte: 1
    },

    {
        langue: 'Chinois', niveau: 'B2',
        question: "Que signifie le chéngyǔ '一石二鸟 (yī shí èr niǎo)' ?",
        options: ["Ne pas atteindre son objectif par manque de précision", 'Faire d\'une pierre deux coups', 'Viser trop haut et tout rater simultanément', 'Agir avec prudence et beaucoup de précision'],
        reponseCorrecte: 1
    },

    {
        langue: 'Chinois', niveau: 'C1',
        question: "Que signifie '知己知彼，百战不殆' (Sunzi, L'Art de la Guerre) ?",
        options: ['La force physique prime toujours sur la stratégie', "Connais-toi toi-même et connais ton ennemi : tu ne perdras aucune bataille", 'La patience est la plus grande vertu du guerrier', 'Mieux vaut éviter le conflit que de le remporter'],
        reponseCorrecte: 1
    },

    {
        langue: 'Chinois', niveau: 'C1',
        question: "Que signifie '道可道，非常道' (Laozi, Tao Te Ching) ?",
        options: ['Le chemin droit et vertueux est toujours le meilleur', "Le Tao qu'on peut nommer n'est pas le Tao éternel — la réalité ultime dépasse les mots", 'La voie de la sagesse passe nécessairement par l\'action', 'Qui connaît vraiment le Dao connaît toutes choses'],
        reponseCorrecte: 1
    },

    {
        langue: 'Chinois', niveau: 'C2',
        question: "Que signifie le concept confucéen '仁 (rén)' ?",
        options: ['La rigueur et la discipline guerrière', "La bienveillance et l'humanité — vertu cardinale du confucianisme fondée sur l'amour d'autrui", 'Le respect strict et absolu de la hiérarchie sociale', 'La recherche de la sagesse dans la solitude et le retrait'],
        reponseCorrecte: 1
    },

    {
        langue: 'Chinois', niveau: 'C2',
        question: "Dans la poésie Tang, que désigne '意象 (yìxiàng)' ?",
        options: ['Le rythme et la métrique tonale obligatoire du poème', "L'image poétique chargée d'émotion et de signification culturelle — symbole évocateur", 'La rime finale strictement obligatoire', 'Le titre du poème et son contexte historique'],
        reponseCorrecte: 1
    },

    // ════════════════════════════════════════════════════
    // ARABE (+12)
    // ════════════════════════════════════════════════════

    {
        langue: 'Arabe', niveau: 'A1',
        question: "Que signifie 'يوم جيد' (yawm jayyid) ?",
        options: ['Bonne nuit', 'Bonne journée', 'Bonne semaine', 'Bon voyage'],
        reponseCorrecte: 1
    },

    {
        langue: 'Arabe', niveau: 'A1',
        question: "Comment dit-on 'au revoir' en arabe standard ?",
        options: ['مرحباً (marhaban) — bonjour', 'شكراً (shukran) — merci', 'مع السلامة (maʿa as-salāma) — au revoir', 'أهلاً (ahlan) — bienvenue'],
        reponseCorrecte: 2
    },

    {
        langue: 'Arabe', niveau: 'A2',
        question: "Que signifie 'بكم هذا؟' (bikam hādhā) ?",
        options: ["Où est-ce ?", "C'est quoi ?", "Combien ça coûte ?", "C'est à qui ?"],
        reponseCorrecte: 2
    },

    {
        langue: 'Arabe', niveau: 'A2',
        question: "Comment dit-on 'je ne comprends pas' en arabe standard ?",
        options: ['لا أعرف (lā aʿrif) — je ne sais pas', 'لا أفهم (lā afham) — je ne comprends pas', 'لا أريد (lā urīd) — je ne veux pas', 'لا أعلم (lā aʿlam) — je ne connais pas'],
        reponseCorrecte: 1
    },

    {
        langue: 'Arabe', niveau: 'B1',
        question: "Que désigne 'المصدر' (al-maṣdar) en grammaire arabe ?",
        options: ['Le nom propre', 'La forme nominale verbale dérivée d\'un verbe (nom d\'action)', "L'adjectif qualificatif", 'Le pronom personnel sujet'],
        reponseCorrecte: 1
    },

    {
        langue: 'Arabe', niveau: 'B1',
        question: "Que signifie 'على الرغم من' (ʿalā ar-raghm min) ?",
        options: ["Grâce à / en raison de (cause positive)", 'En raison de (cause neutre)', 'Malgré / en dépit de (concession)', 'À condition de'],
        reponseCorrecte: 2
    },

    {
        langue: 'Arabe', niveau: 'B2',
        question: "Que signifie l'expression 'ضرب عصفورين بحجر واحد' ?",
        options: ["Rater deux cibles avec un seul tir", "Faire d'une pierre deux coups", "Attaquer sans réfléchir aux conséquences", "Résoudre un problème progressivement"],
        reponseCorrecte: 1
    },

    {
        langue: 'Arabe', niveau: 'B2',
        question: "Que désigne 'التصغير' (at-taṣghīr) en morphologie arabe ?",
        options: ['Le pluriel brisé d\'abondance', "La forme diminutive d'un nom — indique la petitesse ou l'affection (ex: كُتَيِّب = petit livre)", 'Le comparatif de supériorité', 'La forme passive du verbe'],
        reponseCorrecte: 1
    },

    {
        langue: 'Arabe', niveau: 'C1',
        question: "Que signifie 'الإيجاز' (al-ījāz) dans la rhétorique arabe classique ?",
        options: ["L'amplification et le développement verbeux", "La concision — vertu stylistique d'exprimer beaucoup en peu de mots", 'La répétition emphatique pour insister', "L'ornement phonétique et le jeu de sons"],
        reponseCorrecte: 1
    },

    {
        langue: 'Arabe', niveau: 'C1',
        question: "En morphologie arabe, que désigne le schème 'فَعَّلَ (faʿʿala)' (2e forme verbale) ?",
        options: ['Le schème de base des verbes simples (1re forme)', "Le schème intensif ou causatif (2e forme) — exprime une action répétée, intense ou causative", 'La forme passive du verbe', 'Le schème pour les verbes dénotant une couleur'],
        reponseCorrecte: 1
    },

    {
        langue: 'Arabe', niveau: 'C2',
        question: "Que désigne 'الأدب الجاهلي' (al-adab al-jāhilī) ?",
        options: ["La littérature islamique classique du VIIIe siècle", "La littérature préislamique de l'ère de l'ignorance — poésie et prose antérieures à l'Islam", 'Les écrits juridiques et théologiques médiévaux', 'La poésie mystique soufie des XIIe-XIVe siècles'],
        reponseCorrecte: 1
    },

    {
        langue: 'Arabe', niveau: 'C2',
        question: "Que signifie le concept soufi 'الفناء (al-fanāʾ)' ?",
        options: ["La mort physique du corps comme chemin vers Dieu", "L'annihilation du soi dans l'union mystique avec Dieu — état spirituel suprême dans le soufisme", 'La pénitence et l\'expiation stricte des péchés', 'La méditation silencieuse et l\'ascèse du corps'],
        reponseCorrecte: 1
    },

]

// ─────────────────────────────────────────────────────────────────────────────
// SEED — connexion + insertion sécurisée (vérifie avant d'insérer)
// ─────────────────────────────────────────────────────────────────────────────
const seed = async () =>
{
    try
    {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('MongoDB connecté ✅')

        let insérées = 0
        let ignorées = 0

        for (const q of questionsSupplementaires)
        {
            // On vérifie si cette question existe déjà (par texte + langue)
            // pour éviter les doublons en cas de double exécution du script
            const existante = await Quiz.findOne({ question: q.question, langue: q.langue })

            if (existante)
            {
                ignorées++
                continue
            }

            await Quiz.create(q)
            insérées++
        }

        console.log(`\n${insérées} nouvelles questions insérées ✅`)
        if (ignorées > 0) console.log(`${ignorées} questions déjà existantes ignorées (évitement doublons)`)

        // Résumé par langue
        const langues = [...new Set(questionsSupplementaires.map(q => q.langue))]
        console.log('\n📊 Pool total après mise à jour :')

        for (const langue of langues)
        {
            const niveaux = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
            const total = await Quiz.countDocuments({ langue })
            console.log(`\n  ${langue} : ${total} questions total`)

            for (const niveau of niveaux)
            {
                const count = await Quiz.countDocuments({ langue, niveau })
                const combinations = count >= 2 ? `C(${count},2)=${Math.round(count * (count - 1) / 2)} combos` : '⚠️  pool insuffisant'
                console.log(`       ${niveau} : ${count} questions — ${combinations}`)
            }
        }

        process.exit(0)
    } catch (err)
    {
        console.error('Erreur seeder :', err.message)
        process.exit(1)
    }
}

seed()