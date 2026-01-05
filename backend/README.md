# Backend - Plateforme Pédagogique

API REST développée avec NestJS pour la gestion pédagogique.

## Installation

```bash
npm install
```

## Démarrage

```bash
# Développement
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Base de données

L'application utilise PostgreSQL. Assurez-vous que PostgreSQL est installé et en cours d'exécution.

### Configuration

1. Créer un fichier `.env` à la racine du dossier `backend` :
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=maryouma123
DB_DATABASE=StudyGenius
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
NODE_ENV=development
```

2. Créer la base de données dans PostgreSQL :
```sql
CREATE DATABASE "StudyGenius";
```

3. Les tables seront créées automatiquement au premier démarrage grâce à `synchronize: true` en mode développement.

## Structure

- `src/auth/` - Authentification JWT
- `src/users/` - Gestion des utilisateurs
- `src/courses/` - Gestion des cours
- `src/documents/` - Gestion des documents (upload/download)
- `src/exams/` - Gestion des examens
- `src/ai/` - Analyse de texte IA
- `src/entities/` - Entités TypeORM

## Variables d'environnement

Créer un fichier `.env`:

```env
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
```
