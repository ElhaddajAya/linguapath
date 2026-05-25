// Tests automatisés pour les routes d'authentification :
//   POST /api/auth/register → créer un compte
//   POST /api/auth/login    → se connecter

require('./setup') // ← charge la BDD en mémoire avant les tests

const request = require('supertest') // simule des vraies requêtes HTTP
const app = require('../app')    // notre app Express (sans démarrer le serveur)

// ════════════════════════════════════════════════════════
// GROUPE : Register — POST /api/auth/register
// ════════════════════════════════════════════════════════
describe('POST /api/auth/register', () =>
{

  // ── Test 1 : inscription valide ──────────────────────
  it('devrait créer un compte et retourner 201 + token', async () =>
  {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nom: 'Aya Test',
        email: 'aya@test.com',
        password: 'password123',
      })

    // Vérifier le code HTTP
    expect(res.status).toBe(201)

    // Vérifier que la réponse contient un token JWT
    expect(res.body.token).toBeDefined()

    // Vérifier que les infos du user sont correctes
    expect(res.body.user.nom).toBe('Aya Test')
    expect(res.body.user.email).toBe('aya@test.com')

    // Le mot de passe ne doit JAMAIS être renvoyé
    expect(res.body.user.password).toBeUndefined()

    // Le rôle par défaut doit être "user" (apprenant)
    expect(res.body.user.role).toBe('user')
  })

  // ── Test 2 : champs manquants ────────────────────────
  it('devrait retourner 400 si le nom est manquant', async () =>
  {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'aya@test.com', password: 'password123' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBeDefined()
  })

  // ── Test 3 : email déjà utilisé ──────────────────────
  it('devrait retourner 400 si l\'email est déjà utilisé', async () =>
  {
    // On crée un premier compte
    await request(app)
      .post('/api/auth/register')
      .send({ nom: 'Aya', email: 'aya@test.com', password: 'password123' })

    // On essaie d'en créer un second avec le même email
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nom: 'Malak', email: 'aya@test.com', password: 'autrepassword' })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/déjà utilisé/i)
  })

  // ── Test 4 : email et password manquants ─────────────
  it('devrait retourner 400 si tous les champs sont vides', async () =>
  {
    const res = await request(app)
      .post('/api/auth/register')
      .send({})

    expect(res.status).toBe(400)
  })
})

// ════════════════════════════════════════════════════════
// GROUPE : Login — POST /api/auth/login
// ════════════════════════════════════════════════════════
describe('POST /api/auth/login', () =>
{

  // Avant chaque test de ce groupe, on crée un utilisateur de base
  beforeEach(async () =>
  {
    await request(app)
      .post('/api/auth/register')
      .send({ nom: 'Aya Test', email: 'aya@test.com', password: 'password123' })
  })

  // ── Test 5 : connexion valide ────────────────────────
  it('devrait connecter l\'utilisateur et retourner 200 + token', async () =>
  {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'aya@test.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.email).toBe('aya@test.com')
    expect(res.body.message).toMatch(/connexion réussie/i)
  })

  // ── Test 6 : mauvais mot de passe ────────────────────
  it('devrait retourner 401 avec un mauvais mot de passe', async () =>
  {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'aya@test.com', password: 'mauvaismdp' })

    expect(res.status).toBe(401)
    expect(res.body.message).toMatch(/incorrect/i)
  })

  // ── Test 7 : email inexistant ─────────────────────────
  it('devrait retourner 401 avec un email inexistant', async () =>
  {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inconnu@test.com', password: 'password123' })

    expect(res.status).toBe(401)
  })

  // ── Test 8 : champs manquants ─────────────────────────
  it('devrait retourner 400 si le mot de passe est manquant', async () =>
  {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'aya@test.com' })

    expect(res.status).toBe(400)
  })
})

// ════════════════════════════════════════════════════════
// GROUPE : Protection des routes
// ════════════════════════════════════════════════════════
describe('Protection des routes (token JWT)', () =>
{

  // ── Test 9 : accès sans token refusé ─────────────────
  it('devrait retourner 401 sans token sur une route protégée', async () =>
  {
    const res = await request(app)
      .get('/api/scenarios?langue=Anglais&niveau=A1')
    // Pas de header Authorization → doit être refusé

    expect(res.status).toBe(401)
  })

  // ── Test 10 : accès avec token valide autorisé ────────
  it('devrait autoriser l\'accès avec un token valide', async () =>
  {
    // 1. Créer un compte et récupérer le token
    const register = await request(app)
      .post('/api/auth/register')
      .send({ nom: 'Aya', email: 'aya@test.com', password: 'password123' })

    const token = register.body.token

    // 2. Appeler une route protégée avec ce token
    const res = await request(app)
      .get('/api/scenarios?langue=Anglais&niveau=A1')
      .set('Authorization', `Bearer ${token}`)

    // La route répond 200 (même si aucun scénario en BDD de test)
    expect(res.status).toBe(200)
  })
})
