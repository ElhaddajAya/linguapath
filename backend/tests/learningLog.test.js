// Tests automatisés pour les routes du Learning Log :
//   GET    /api/learning-log       → récupérer ses phrases
//   POST   /api/learning-log       → ajouter une phrase manuellement
//   DELETE /api/learning-log/:id   → supprimer une phrase

require('./setup')

const request       = require('supertest')
const app           = require('../app')
const LearningEntry = require('../models/LearningEntry')

// ── Helper : crée un utilisateur et retourne { token, userId } ──
const getUser = async (email = 'aya@test.com') => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ nom: 'Aya', email, password: 'password123' })
  return { token: res.body.token, userId: res.body.user.id }
}

// ── Helper : insère une phrase directement en BDD ──
const creerPhrase = async (userId, overrides = {}) => {
  return await LearningEntry.create({
    userId,
    phrase:     "I'm sorry to hear that.",
    traduction: "Je suis désolé d'entendre ça.",
    langue:     'Anglais',
    niveau:     'B1',
    theme:      'Santé',
    source:     'auto',
    pattern:    "I'm sorry to...",
    ...overrides,
  })
}

// ════════════════════════════════════════════════════════
// GROUPE : GET /api/learning-log
// ════════════════════════════════════════════════════════
describe('GET /api/learning-log', () => {

  // ── Test 1 : récupérer toutes ses phrases ─────────────
  it('devrait retourner toutes les phrases de l\'utilisateur', async () => {
    const { token, userId } = await getUser()

    // On insère 2 phrases pour cet utilisateur
    await creerPhrase(userId, { phrase: 'Phrase 1' })
    await creerPhrase(userId, { phrase: 'Phrase 2' })

    const res = await request(app)
      .get('/api/learning-log')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.entries).toHaveLength(2)
  })

  // ── Test 2 : filtre par langue ────────────────────────
  it('devrait filtrer par langue', async () => {
    const { token, userId } = await getUser()

    // Une phrase en Anglais, une en Espagnol
    await creerPhrase(userId, { langue: 'Anglais', phrase: 'I have a headache.' })
    await creerPhrase(userId, { langue: 'Espagnol', phrase: 'Me duele la cabeza.' })

    const res = await request(app)
      .get('/api/learning-log?langue=Anglais')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.entries).toHaveLength(1)
    expect(res.body.entries[0].langue).toBe('Anglais')
  })

  // ── Test 3 : un user ne voit pas les phrases d'un autre ──
  it('ne devrait pas retourner les phrases d\'un autre utilisateur', async () => {
    const { token: tokenAya, userId: idAya }     = await getUser('aya@test.com')
    const { token: tokenMalak, userId: idMalak } = await getUser('malak@test.com')

    // On insère une phrase pour Aya et une pour Malak
    await creerPhrase(idAya,   { phrase: 'Phrase de Aya' })
    await creerPhrase(idMalak, { phrase: 'Phrase de Malak' })

    // Aya fait la requête — elle ne doit voir QUE sa propre phrase
    const res = await request(app)
      .get('/api/learning-log')
      .set('Authorization', `Bearer ${tokenAya}`)

    expect(res.body.entries).toHaveLength(1)
    expect(res.body.entries[0].phrase).toBe('Phrase de Aya')
  })

  // ── Test 4 : retour vide si aucune phrase ─────────────
  it('devrait retourner un tableau vide si aucune phrase', async () => {
    const { token } = await getUser()

    const res = await request(app)
      .get('/api/learning-log')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.entries).toHaveLength(0)
  })
})

// ════════════════════════════════════════════════════════
// GROUPE : POST /api/learning-log  (ajout manuel)
// ════════════════════════════════════════════════════════
describe('POST /api/learning-log', () => {

  // ── Test 5 : ajout valide ─────────────────────────────
  it('devrait ajouter une phrase manuellement et retourner 201', async () => {
    const { token } = await getUser()

    const res = await request(app)
      .post('/api/learning-log')
      .set('Authorization', `Bearer ${token}`)
      .send({
        phrase:     'Can I get a referral?',
        traduction: 'Puis-je avoir une recommandation ?',
        langue:     'Anglais',
        theme:      'Santé',
      })

    expect(res.status).toBe(201)
    expect(res.body.entry.phrase).toBe('Can I get a referral?')
    expect(res.body.entry.source).toBe('manuel')   // ← source = manuel (pas auto)
  })

  // ── Test 6 : champs obligatoires manquants ────────────
  it('devrait retourner 400 si la phrase est manquante', async () => {
    const { token } = await getUser()

    const res = await request(app)
      .post('/api/learning-log')
      .set('Authorization', `Bearer ${token}`)
      .send({
        traduction: 'Une traduction sans phrase',
        langue:     'Anglais',
      })

    expect(res.status).toBe(400)
  })

  // ── Test 7 : langue manquante ─────────────────────────
  it('devrait retourner 400 si la langue est manquante', async () => {
    const { token } = await getUser()

    const res = await request(app)
      .post('/api/learning-log')
      .set('Authorization', `Bearer ${token}`)
      .send({ phrase: 'Hello', traduction: 'Bonjour' })
    // langue manquante

    expect(res.status).toBe(400)
  })
})

// ════════════════════════════════════════════════════════
// GROUPE : DELETE /api/learning-log/:id
// ════════════════════════════════════════════════════════
describe('DELETE /api/learning-log/:id', () => {

  // ── Test 8 : suppression réussie ─────────────────────
  it('devrait supprimer une phrase existante', async () => {
    const { token, userId } = await getUser()
    const entry = await creerPhrase(userId)

    const res = await request(app)
      .delete(`/api/learning-log/${entry._id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/supprimée/i)

    // Vérifier que la phrase n'existe plus en BDD
    const deleted = await LearningEntry.findById(entry._id)
    expect(deleted).toBeNull()
  })

  // ── Test 9 : impossible de supprimer la phrase d'un autre ──
  it('ne devrait pas permettre de supprimer la phrase d\'un autre utilisateur', async () => {
    const { userId: idAya }    = await getUser('aya@test.com')
    const { token: tokenMalak } = await getUser('malak@test.com')

    // La phrase appartient à Aya
    const entry = await creerPhrase(idAya)

    // Malak tente de la supprimer → doit être refusé
    const res = await request(app)
      .delete(`/api/learning-log/${entry._id}`)
      .set('Authorization', `Bearer ${tokenMalak}`)

    expect(res.status).toBe(404) // 404 car on cherche userId=Malak → introuvable

    // La phrase doit toujours exister en BDD
    const still = await LearningEntry.findById(entry._id)
    expect(still).not.toBeNull()
  })

  // ── Test 10 : ID inexistant ───────────────────────────
  it('devrait retourner 404 pour un ID inexistant', async () => {
    const { token } = await getUser()
    const fakeId    = '507f1f77bcf86cd799439011'

    const res = await request(app)
      .delete(`/api/learning-log/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })
})
