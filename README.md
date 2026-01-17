#  Festival App
###  Lancer la base de données

```bash
# Démarrer PostgreSQL et Adminer
docker-compose up -d

# Vérifier que les conteneurs sont lancés
docker-compose ps
```
- for PostgreSQL credentials: check the .env file in the backend folder

- **Adminer** : http://localhost:8080

### Lancer le backend

```bash
cd backend
npm install
npm run dev
```
avec prisma 
```
npx prisma migrate dev
npm run import:csv
npm run prisma:seed
```


** remarque :faut ajouter et modifier le .env en s'inspirant de .env.example **
Le backend démarre sur http://localhost:3000

###  Lancer le frontend

```bash
cd front
npm install
npm start
```

Le frontend démarre sur http://localhost:4200

## 🛠️ Commandes utiles

### Docker
```bash
# Démarrer les services
docker-compose up -d

# Arrêter les services
docker-compose down

# Voir les logs
docker-compose logs -f

# Redémarrer la base de données
docker-compose restart db

```

### Backend
```bash
cd backend
npm run dev    # Mode développement
npm run build  # Build TypeScript
npm start      # Mode production
```

### Frontend
```bash
cd front
npm start      # Mode développement
npm run build  # Build production
```

## backend : NodeJs + Express + TypeScript + PostgreSQL
# Installer les dépendances
npm install

# Mode développement (avec hot reload)
npm run dev

# Build TypeScript vers JavaScript
npm run build

# Mode production (après build)
npm start

# Watch mode (recompilation auto)
npm run watch


## to check if the server is running 
Navigate to http://localhost:3000/health 

## the url to the SWAGGER API 
navigate to http://localhost:3000/documentation