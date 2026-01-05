# Guide de Démarrage Rapide

## 🚀 Démarrage en 3 étapes

### 1. Installer les dépendances

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Démarrer le backend

```bash
cd backend
npm run start:dev
```

Le backend sera accessible sur `http://localhost:3000`

### 3. Démarrer le frontend

Dans un nouveau terminal:

```bash
cd frontend
npm start
```

Le frontend sera accessible sur `http://localhost:4200`

## 🎯 Première utilisation

1. Ouvrir `http://localhost:4200` dans votre navigateur
2. Cliquer sur "S'inscrire"
3. Créer un compte avec le rôle souhaité:
   - **Étudiant**: Pour consulter les cours et passer des examens
   - **Enseignant**: Pour créer des cours et examens
   - **Administrateur**: Pour superviser tout

4. Se connecter avec vos identifiants

## 📝 Test rapide

### En tant qu'Enseignant:
1. Créer un cours
2. Ajouter un document au cours
3. Créer un examen avec des questions

### En tant qu'Étudiant:
1. Consulter les cours disponibles
2. Télécharger les documents
3. Passer un examen
4. Utiliser l'analyse IA de texte

## ⚠️ Notes importantes

- La base de données SQLite est créée automatiquement au premier démarrage
- Le dossier `uploads/` est créé automatiquement pour stocker les documents
- Le secret JWT par défaut est `your-secret-key-change-in-production` (à changer en production)
- CORS est configuré pour accepter les requêtes depuis `http://localhost:4200`

## 🐛 Dépannage

**Erreur de port déjà utilisé:**
- Backend: Changer le port dans `backend/src/main.ts` ou via variable d'environnement `PORT`
- Frontend: Utiliser `ng serve --port 4201`

**Erreur de connexion au backend:**
- Vérifier que le backend est bien démarré sur le port 3000
- Vérifier l'URL de l'API dans les services Angular (`frontend/src/app/services/*.service.ts`)

**Erreur de base de données:**
- Supprimer `backend/database.sqlite` et redémarrer le backend
- La base sera recréée automatiquement


