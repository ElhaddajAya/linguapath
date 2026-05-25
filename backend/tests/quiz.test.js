// Tests automatisés pour les routes du Quiz :
//   GET  /api/quiz/:langue    → récupérer les questions
//   POST /api/quiz/result     → soumettre les réponses et calculer le niveau

require('./setup')

const request = require('supertest')
const app     = require('../app')
const Quiz    = require('../models/Quiz')

// ── Helper : crée un utilisateur et retourne { token, userId } ──
const getUser = async (email = 'aya@test.com') => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ nom: 'Aya', email, password: 'password123' })
  return { token: res.body.token, userId: res.body.user.id }
}

// ── Helper : insère des questions de quiz en BDD ──
// On crée 2 questions par niveau pour avoir assez de données
const insererQuestions = async (langue = 'Anglais') => {
  const questions = []
  const niveaux   = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

  for (const niveau of niveaux) {
    // 2 questions par niveau
    for (let i = 1; i <= 2; i++) {
      questions.push({
        langue,
        niveau,
        question:        `Question ${niveau} - ${i}`,
        options:         ['Option A', 'Option B', 'Option C', 'Option D'],
        reponseCorrecte: 0, // La bonne réponse est toujours 'Option A' (index 0)
      })
    }
  }

  return await Quiz.insertMany(questions)
}

// ════════════════════════════════════════════════════════
// GROUPE : GET /api/quiz/:langue
// ════════════════════════════════════════════════════════
describe('GET /api/quiz/:langue', () => {

  // ── Test 1 : retourner les questions pour une langue ──
  it('devrait retourner des questions pour la langue Anglais', async () => {
    const { token } = await getUser()
    await insererQuestions('Anglais')

    const res = await request(app)
      .get('/api/quiz/Anglais')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.langue).toBe('Anglais')

    // Il doit y avoir des questions
    expect(res.body.questions.length).toBeGreaterThan(0)
  })

  // ── Test 2 : les réponses correctes ne sont PAS envoyées ──
  it('ne devrait PAS exposer reponseCorrecte dans les questions', async () => {
    const { token } = await getUser()
    await insererQuestions('Anglais')

    const res = await request(app)
      .get('/api/quiz/Anglais')
      .set('Authorization', `Bearer ${token}`)

    // Chaque question doit avoir ses options mais PAS reponseCorrecte
    res.body.questions.forEach(q => {
      expect(q.reponseCorrecte).toBeUndefined() // SÉCURITÉ IMPORTANTE
      expect(q.options).toBeDefined()
      expect(q.options.length).toBe(4)
    })
  })

  // ── Test 3 : langue sans questions ────────────────────
  it('devrait retourner 404 si aucune question pour cette langue', async () => {
    const { token } = await getUser()

    // On ne seed pas de questions → la BDD est vide
    const res = await request(app)
      .get('/api/quiz/Swahili')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })
})

// ════════════════════════════════════════════════════════
// GROUPE : POST /api/quiz/result
// ════════════════════════════════════════════════════════
describe('POST /api/quiz/result', () => {

  // ── Test 4 : calculer le niveau et le sauvegarder ─────
  it('devrait calculer le niveau et le sauvegarder dans le profil', async () => {
    const { token } = await getUser()
    const questions = await insererQuestions('Anglais')

    // On répond correctement à TOUTES les questions (reponseCorrecte = 0)
    const reponses = questions.map(q => ({
      questionId:      q._id.toString(),
      reponseChoisie:  0, // La bonne réponse pour toutes
    }))

    const res = await request(app)
      .post('/api/quiz/result')
      .set('Authorization', `Bearer ${token}`)
      .send({ langue: 'Anglais', reponses })

    expect(res.status).toBe(200)
    expect(res.body.niveau).toBeDefined()

    // Le niveau doit être une valeur CECRL valide
    const niveauxValides = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    expect(niveauxValides).toContain(res.body.niveau)

    // La langue doit être ajoutée au profil de l'utilisateur
    const langueAjoutee = res.body.user.langues.find(l => l.langue === 'Anglais')
    expect(langueAjoutee).toBeDefined()
    expect(langueAjoutee.niveau).toBeDefined()
  })

  // ── Test 5 : niveau A1 si toutes les réponses sont fausses ──
  it('devrait retourner A1 si toutes les réponses sont fausses', async () => {
    const { token } = await getUser()
    const questions = await insererQuestions('Anglais')

    // On répond TOUJOURS faux (reponseCorrecte = 0, on répond 3)
    const reponses = questions.map(q => ({
      questionId:      q._id.toString(),
      reponseChoisie:  3, // Toujours la mauvaise réponse
    }))

    const res = await request(app)
      .post('/api/quiz/result')
      .set('Authorization', `Bearer ${token}`)
      .send({ langue: 'Anglais', reponses })

    expect(res.status).toBe(200)
    // Niveau minimum attendu car tout est faux
    expect(res.body.niveau).toBe('A1')
  })

  // ── Test 6 : champs manquants ─────────────────────────
  it('devrait retourner 400 si la langue est manquante', async () => {
    const { token } = await getUser()

    const res = await request(app)
      .post('/api/quiz/result')
      .set('Authorization', `Bearer ${token}`)
      .send({ reponses: [{ questionId: '123', reponseChoisie: 0 }] })
    // langue manquante

    expect(res.status).toBe(400)
  })
})
