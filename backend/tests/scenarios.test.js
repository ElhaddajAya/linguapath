// Tests automatisés pour les routes des scénarios :
//   GET /api/scenarios?langue=X&niveau=Y  → liste filtrée
//   GET /api/scenarios/:id               → un seul scénario

require('./setup')

const request  = require('supertest')
const app      = require('../app')
const Scenario = require('../models/Scenario')

// ── Helper : crée un utilisateur et retourne son token ──
// On réutilise cette fonction dans plusieurs tests
const getToken = async (email = 'aya@test.com') => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ nom: 'Aya', email, password: 'password123' })
  return res.body.token
}

// ── Helper : crée un scénario directement en BDD ──
// Plus rapide que passer par l'API pour préparer les données de test
const creerScenario = async (overrides = {}) => {
  return await Scenario.create({
    titre:        'Consulter un médecin',
    theme:        'Santé',
    description:  'Tu ne te sens pas bien.',
    langue:       'Anglais',
    niveauMin:    'A2',
    niveauMax:    'B2',
    emoji:        '🏥',
    systemPrompt: 'You are Dr. Roberts...',
    ...overrides, // ← permet de surcharger n'importe quel champ
  })
}

// ════════════════════════════════════════════════════════
// GROUPE : GET /api/scenarios
// ════════════════════════════════════════════════════════
describe('GET /api/scenarios', () => {

  // ── Test 1 : liste filtrée selon langue et niveau ─────
  it('devrait retourner les scénarios pour Anglais niveau B1', async () => {
    const token = await getToken()

    // On crée 2 scénarios en BDD — un qui correspond, un qui ne correspond pas
    await creerScenario({ langue: 'Anglais', niveauMin: 'A2', niveauMax: 'B2' })
    await creerScenario({ langue: 'Espagnol', niveauMin: 'A1', niveauMax: 'B1' })

    const res = await request(app)
      .get('/api/scenarios?langue=Anglais&niveau=B1')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)

    // Seul le scénario Anglais doit être retourné
    expect(res.body.scenarios).toHaveLength(1)
    expect(res.body.scenarios[0].langue).toBe('Anglais')
  })

  // ── Test 2 : aucun scénario si niveau hors plage ──────
  it('devrait retourner 0 scénario si le niveau ne correspond pas', async () => {
    const token = await getToken()

    // Ce scénario est pour B1 à C2 — un A1 ne devrait pas le voir
    await creerScenario({ niveauMin: 'B1', niveauMax: 'C2' })

    const res = await request(app)
      .get('/api/scenarios?langue=Anglais&niveau=A1')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.scenarios).toHaveLength(0)
  })

  // ── Test 3 : paramètres manquants ────────────────────
  it('devrait retourner 400 si langue ou niveau manquent', async () => {
    const token = await getToken()

    // Niveau manquant
    const res = await request(app)
      .get('/api/scenarios?langue=Anglais')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(400)
  })

  // ── Test 4 : sans token ───────────────────────────────
  it('devrait retourner 401 sans token', async () => {
    const res = await request(app)
      .get('/api/scenarios?langue=Anglais&niveau=A1')

    expect(res.status).toBe(401)
  })
})

// ════════════════════════════════════════════════════════
// GROUPE : GET /api/scenarios/:id
// ════════════════════════════════════════════════════════
describe('GET /api/scenarios/:id', () => {

  // ── Test 5 : scénario existant ────────────────────────
  it('devrait retourner un scénario par son ID', async () => {
    const token    = await getToken()
    const scenario = await creerScenario()

    const res = await request(app)
      .get(`/api/scenarios/${scenario._id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.scenario.titre).toBe('Consulter un médecin')
    expect(res.body.scenario._id).toBe(scenario._id.toString())
  })

  // ── Test 6 : ID inexistant ────────────────────────────
  it('devrait retourner 404 si l\'ID n\'existe pas', async () => {
    const token = await getToken()

    // Un ObjectId MongoDB valide mais qui n'existe pas en BDD
    const fakeId = '507f1f77bcf86cd799439011'

    const res = await request(app)
      .get(`/api/scenarios/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })
})
