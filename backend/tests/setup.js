// Ce fichier est exécuté une seule fois avant TOUS les tests.
// Il configure une base de données MongoDB temporaire en mémoire
// pour que les tests n'affectent JAMAIS la vraie base de données.

// ── Variables d'environnement pour les tests ──
// On met de fausses valeurs — Groq ne sera jamais vraiment appelé dans ces tests
process.env.GROQ_API_KEY = 'test_fake_groq_key'
process.env.GEMINI_API_KEY = 'test_fake_gemini_key'
process.env.JWT_SECRET = 'test_secret_key_linguapath'

const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

// Variable qui stocke l'instance du serveur MongoDB en mémoire
let mongoServer

// ── beforeAll ── s'exécute UNE FOIS avant tous les tests
beforeAll(async () =>
{
  // 1. Démarrer un serveur MongoDB en mémoire (temporaire, isolé)
  mongoServer = await MongoMemoryServer.create()

  // 2. Récupérer l'URI de connexion (ex: mongodb://127.0.0.1:12345/test)
  const uri = mongoServer.getUri()

  // 3. Connecter Mongoose à cette base temporaire
  await mongoose.connect(uri)
})

// ── afterAll ── s'exécute UNE FOIS après tous les tests
afterAll(async () =>
{
  await mongoose.disconnect()
  await mongoServer.stop()
})

// ── afterEach ── vide toutes les collections après chaque test
// pour que chaque test parte d'une base propre
afterEach(async () =>
{
  const collections = mongoose.connection.collections
  for (const key in collections)
  {
    await collections[key].deleteMany({})
  }
})