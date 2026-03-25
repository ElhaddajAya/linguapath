# LinguaPath

## Description

LinguaPath est une application d'apprentissage de langues intelligente.

## Démarrage

### Prérequis

- Node.js
- MongoDB

### Backend

1. Aller dans le dossier backend :
   ```
   cd backend
   ```
2. Installer les dépendances :
   ```
   npm install
   ```
3. Configurer le fichier .env :
   - Copier le fichier `.env.example` vers `.env`
   - Modifier les valeurs selon votre configuration :
     - `PORT=5000`
     - `MONGO_URI=mongodb://localhost:27017/your-database-name`
     - `JWT_SECRET=your_jwt_secret_key`
4. Démarrer le serveur :
   ```
   npm start
   ```

### Frontend

1. Aller dans le dossier frontend :
   ```
   cd frontend
   ```
2. Installer les dépendances :
   ```
   npm install
   ```
3. Démarrer l'application :
   ```
   npm run dev
   ```

L'application frontend sera accessible sur `http://localhost:5173` (par défaut pour Vite).
