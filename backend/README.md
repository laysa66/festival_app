# Festival App - Backend

Backend API pour l'application Festival App, développé avec Node.js, TypeScript, Fastify, Prisma et PostgreSQL.

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
```
demande moi
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
