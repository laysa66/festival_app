# Festival App - Backend

Backend API pour l'application Festival App, développé avec Node.js, TypeScript, Express et PostgreSQL.

## 🚀 Démarrage rapide

### Prérequis
- Node.js (v18 ou supérieur)
- PostgreSQL (v14 ou supérieur)
- npm ou yarn

### Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer les variables d'environnement :
```bash
cp .env.example .env
```

3. Éditer le fichier `.env` avec vos configurations :
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=festival_app
DB_USER=postgres
DB_PASSWORD=your_password
FRONTEND_URL=http://localhost:4200
```

4. Créer la base de données PostgreSQL :
```bash
psql -U postgres
CREATE DATABASE festival_app;
```

### Lancement du serveur

```bash
# Mode développement (avec rechargement automatique)
npm run dev

# Build TypeScript
npm run build

# Mode production
npm start
```

Le serveur démarre sur `http://localhost:3000`

## 📁 Structure du projet

```
backend/
├── src/
│   ├── config/         # Configuration (database, etc.)
│   ├── controllers/    # Contrôleurs
│   ├── models/         # Modèles de données
│   ├── routes/         # Routes API
│   ├── middlewares/    # Middlewares personnalisés
│   ├── app.ts          # Configuration Express
│   └── index.ts        # Point d'entrée
├── dist/               # Build TypeScript (généré)
├── .env.example        # Exemple de variables d'environnement
├── .gitignore
├── tsconfig.json       # Configuration TypeScript
└── package.json
```

## 🛠 Technologies utilisées

- **TypeScript** 5.7 - Typage statique
- **Express** - Framework web
- **PostgreSQL** - Base de données
- **pg** - Client PostgreSQL pour Node.js
- **dotenv** - Gestion des variables d'environnement
- **cors** - Gestion CORS
- **helmet** - Sécurité HTTP
- **morgan** - Logger HTTP
- **nodemon** - Rechargement automatique en dev
- **ts-node** - Exécution TypeScript en dev

## 🔗 Endpoints disponibles

- `GET /health` - Health check de l'API
- `GET /api` - Information sur l'API

## 📝 Licence

ISC
