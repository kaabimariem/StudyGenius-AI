# Plateforme Pédagogique - Angular & NestJS

Application complète de gestion pédagogique avec authentification, gestion des cours, documents, examens et analyse IA.

## 🏗️ Architecture

- **Frontend**: Angular 18 avec SSR/SSG
- **Backend**: NestJS avec TypeORM (PostgreSQL)
- **Authentification**: JWT avec guards par rôle
- **Base de données**: PostgreSQL

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- PostgreSQL 12+ (installé et en cours d'exécution)

## 🚀 Installation et Démarrage

### Backend

1. Créer un fichier `.env` dans le dossier `backend` :
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

2. Créer la base de données PostgreSQL :
```sql
CREATE DATABASE "StudyGenius";
```

3. Installer les dépendances et démarrer :
```bash
cd backend
npm install
npm run start:dev
```

Le backend sera accessible sur `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
npm start
```

Le frontend sera accessible sur `http://localhost:4200`

## 👥 Rôles et Fonctionnalités

### Étudiant
- Consulter les cours disponibles
- Voir les détails d'un cours
- Télécharger les documents
- Passer des examens en ligne
- Utiliser l'analyse IA de texte

### Enseignant
- Créer et gérer des cours
- Importer des documents (PDF, DOCX)
- Créer des examens avec questions (QCM, Vrai/Faux, Réponses courtes)
- Consulter les résultats des examens

### Administrateur
- Superviser tous les cours
- Gérer tous les examens
- Accéder aux statistiques globales
- Gérer les utilisateurs

## 🔐 Authentification

L'application utilise JWT pour l'authentification. Les tokens sont stockés dans le localStorage côté frontend.

### Créer un compte
1. Aller sur `/register`
2. Remplir le formulaire
3. Choisir un rôle (Étudiant, Enseignant, Administrateur)

### Se connecter
1. Aller sur `/login`
2. Entrer email et mot de passe

## 📁 Structure du Projet

```
projet/
├── backend/
│   ├── src/
│   │   ├── auth/          # Module d'authentification
│   │   ├── users/          # Module utilisateurs
│   │   ├── courses/        # Module cours
│   │   ├── documents/      # Module documents
│   │   ├── exams/          # Module examens
│   │   ├── ai/             # Module analyse IA
│   │   └── entities/       # Entités TypeORM
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Composants Angular
│   │   │   ├── services/      # Services Angular
│   │   │   ├── guards/        # Guards de route
│   │   │   ├── interceptors/  # Intercepteurs HTTP
│   │   │   └── models/        # Modèles TypeScript
│   │   └── ...
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Backend

Les variables d'environnement doivent être configurées dans un fichier `.env` à la racine du dossier `backend`:

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

**Important** : Assurez-vous que PostgreSQL est installé et que la base de données `StudyGenius` existe avant de démarrer l'application.

### Frontend

L'URL de l'API est configurée dans les services (`http://localhost:3000` par défaut).

## 📝 API Endpoints

### Authentification
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion

### Cours
- `GET /courses` - Liste des cours
- `GET /courses/:id` - Détails d'un cours
- `POST /courses` - Créer un cours (Teacher/Admin)
- `PATCH /courses/:id` - Modifier un cours (Teacher/Admin)
- `DELETE /courses/:id` - Supprimer un cours (Teacher/Admin)

### Documents
- `GET /documents?courseId=:id` - Liste des documents
- `GET /documents/:id` - Télécharger un document
- `POST /documents` - Upload un document (Teacher/Admin)
- `DELETE /documents/:id` - Supprimer un document (Teacher/Admin)

### Examens
- `GET /exams` - Liste des examens
- `GET /exams/:id` - Détails d'un examen
- `POST /exams` - Créer un examen (Teacher/Admin)
- `POST /exams/:id/start` - Démarrer un examen (Student)
- `POST /exams/:id/submit` - Soumettre un examen (Student)
- `GET /exams/:id/results` - Résultats d'un examen (Teacher/Admin)
- `GET /exams/:id/my-result` - Mon résultat (Student)

### Analyse IA
- `POST /ai/analyze-text` - Analyser un texte
- `POST /ai/analyze-document` - Analyser un document

## 🛡️ Sécurité

- Authentification JWT obligatoire pour toutes les routes protégées
- Guards par rôle (Student, Teacher, Admin)
- Validation des données avec class-validator
- Hashage des mots de passe avec bcrypt
- CORS configuré pour le frontend Angular

## 📦 Dépendances Principales

### Backend
- @nestjs/core, @nestjs/common
- @nestjs/jwt, @nestjs/passport
- @nestjs/typeorm, typeorm
- class-validator, class-transformer
- bcrypt
- pg (driver PostgreSQL)

### Frontend
- @angular/core, @angular/common
- @angular/router, @angular/forms
- @angular/common/http
- rxjs

## 🚧 Améliorations Futures

- [ ] Intégration d'une vraie API IA (OpenAI, Claude)
- [ ] Extraction de texte depuis PDF/DOCX
- [ ] Notifications en temps réel
- [ ] Chat entre étudiants et enseignants
- [ ] Système de notes et bulletins
- [ ] Export des résultats en PDF
- [x] Migration vers PostgreSQL

## 📄 Licence

Ce projet est un exemple éducatif.

