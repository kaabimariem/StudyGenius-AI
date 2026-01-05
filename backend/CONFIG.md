# Configuration PostgreSQL

## Variables d'environnement

Créez un fichier `.env` à la racine du dossier `backend` avec le contenu suivant :

```env
# Configuration de la base de données PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=maryouma123
DB_DATABASE=StudyGenius

# Configuration JWT
JWT_SECRET=your-secret-key-change-in-production

# Port du serveur
PORT=3000

# Environnement
NODE_ENV=development
```

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. S'assurer que PostgreSQL est installé et en cours d'exécution

3. Créer la base de données :
```sql
CREATE DATABASE "StudyGenius";
```

4. Démarrer l'application :
```bash
npm run start:dev
```

La base de données sera créée automatiquement avec toutes les tables grâce à `synchronize: true` en mode développement.


