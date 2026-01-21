# Festival App

Une application web moderne et complète pour la gestion de festivals de jeux de société.

---

## Description

Ce projet permet aux organisateurs de gérer tous les aspects d'un festival de jeux :
*   Planification des événements et gestion des **Festivals**.
*   Gestion des **Jeux** et des **Éditeurs**.
*   Suivi des **Réservations** d'espaces et de tables.
*   Administration des **Zones Tarifaires** et du plan des salles.
*   Gestion des **Utilisateurs** avec différents rôles (Admin, Organisateur, Bénévole ...).


---

## Installation et Démarrage


### Base de données (PostgreSQL)
Démarrez le conteneur Docker pour la base de données :

```bash
docker-compose up -d
```
*Cela lance PostgreSQL et Adminer.*

### 3. Backend
Dans un terminal, naviguez vers le dossier backend :

```bash
cd backend

# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
# Copiez .env.example vers .env et ajustez si nécessaire
cp .env.example .env

# 3. Initialiser la base de données (Migrations & Seed)
npx prisma migrate dev
npm run prisma:seed  # Pour ajouter les données initiales (Admin, Jeux, etc.)

# 4. Lancer le serveur
npm run dev
```
L'API sera accessible sur : `http://localhost:3000`  
Documentation Swagger : `http://localhost:3000/documentation`

### Frontend (Application)
Dans un **nouveau** terminal, naviguez vers le dossier front :

```bash
cd front

# 1. Installer les dépendances
npm install

# 2. Lancer l'application
npm start
```
L'application sera accessible sur : `http://localhost:4200`

### Connexion
Pour se connecter avec le compte administrateur :

- **Nom d'utilisateur :** `admin@festival.com`
- **Mot de passe :** `Admin123!`

## Commandes Utiles

**Docker**
```bash
docker-compose down       # Arrêter les services
docker-compose restart db # Redémarrer la BDD
```

**Backend**
```bash
npm run import:csv        # Importer des données CSV
npx prisma studio         # Ouvrir l'interface Prisma Studio
```
