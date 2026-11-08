<div align="center">

# 🩺 MedEqui

### La GMAO pensée pour les équipements médicaux.

Suivez, planifiez et documentez la maintenance de vos équipements biomédicaux, avec des accès adaptés à chaque métier : **Administrateur · Ingénieur · Technicien**.

![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-Bearer_Token-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
[Pourquoi MedEqui](#-pourquoi-medequi) · [Aperçu](#-aperçu) · [Fonctionnalités](#-fonctionnalités) · [Rôles](#-rôles-et-permissions) .

</div>

---

##  Pourquoi MedEqui ?

Dans une clinique, un hôpital ou un laboratoire, un équipement médical en panne ou non entretenu, c'est du temps perdu, des coûts imprévus et parfois un risque pour le patient.

**MedEqui** est une application de **GMAO** (Gestion de Maintenance Assistée par Ordinateur) qui rassemble au même endroit :

| Besoin | Réponse de MedEqui |
|---|---|
| Savoir quels équipements on possède et dans quel état | Gestion centralisée du parc d'équipements médicaux |
| Ne plus oublier une maintenance | Planification et suivi des ordres de maintenance |
| Garder une trace de chaque intervention | Rapports d'intervention technique |
| Être prévenu à temps | Notifications intégrées à la barre de navigation |
| Piloter l'activité d'un coup d'œil | Tableau de bord avec statistiques |
| Contrôler qui peut faire quoi | Accès par rôle et routes protégées |

---

##  Aperçu

> Ajoutez vos captures d'écran dans `docs/screenshots/` puis décommentez les lignes ci-dessous.

<!--
| Connexion | Tableau de bord |
|---|---|
| ![Connexion](docs/screenshots/login.png) | ![Dashboard](docs/screenshots/dashboard.png) |

| Équipements | Maintenance |
|---|---|
| ![Équipements](docs/screenshots/equipements.png) | ![Maintenance](docs/screenshots/maintenance.png) |

| Rapports d'intervention | Utilisateurs |
|---|---|
| ![Rapports](docs/screenshots/rapports.png) | ![Utilisateurs](docs/screenshots/utilisateurs.png) |
-->

---

##  Fonctionnalités

### 📊 Tableau de bord
Une vue d'ensemble de l'activité de maintenance avec des statistiques clés, pour décider vite et bien dès l'ouverture de l'application.

### 🏥 Gestion des équipements
Le catalogue du parc d'équipements médicaux : consultation, ajout et mise à jour des fiches, selon les droits du rôle.

### 🛠️ Ordres de maintenance
Planification et suivi des interventions. Les techniciens mettent à jour l'avancement des ordres qui leur concernent, les ingénieurs et administrateurs pilotent l'ensemble.

### 📝 Rapports d'intervention
Après chaque intervention, le technicien rédige un rapport technique. L'historique des interventions reste ainsi consultable et traçable.

### 🔔 Notifications
Une barre de navigation avec notifications intégrées pour que chaque utilisateur soit informé des événements qui le concernent.

### 👥 Gestion des utilisateurs
L'administrateur gère les comptes des ingénieurs et des techniciens.

### 🔐 Sécurité et contrôle d'accès
- Authentification par **JWT Bearer** signé en HS256, valable 8 heures
- Mots de passe **hachés avec bcrypt**
- **Routes protégées** côté interface selon le rôle
- Page **403 « Accès refusé »** lorsqu'un utilisateur tente d'accéder à une section interdite
- Clé de signature JWT configurée dans `backend/.env` (jamais dans le code source)

---

## 👥 Rôles et permissions

| Fonctionnalité |  Administrateur |  Ingénieur |  Technicien |
|---|:---:|:---:|:---:|
| Tableau de bord | ✅ | ✅ | — |
| Utilisateurs | ✅ | — | — |
| Équipements | ✅ Gestion | ✅ Gestion | 👁️ Consultation |
| Ordres de maintenance | ✅ | ✅ | ✏️ Mise à jour des statuts |
| Rapports d'intervention | ✅ | ✅ | ✅ Création |

---


### Structure du projet

```text
MedEqui/
├── backend/        # API REST (Node.js / Express) + base MySQL
│   ├── config/     # Connexion MySQL
│   ├── database/   # Schéma SQL
│   └── server.js   # API et routes métier
└── frontend/       # Application web (React 19)
    └── src/        # Pages, authentification, routes protégées, services API
```

---

##  Stack technique

| Couche | Technologies |
|---|---|
| Frontend | React 19, CSS |
| Backend | Node.js, Express |
| UI | React Icons + FontAwesome |
| Base de données | MySQL (`mysql2`) |
| Sécurité | bcryptjs, JWT Bearer (HS256), CORS, variables d'environnement (`dotenv`) |

---

##  Démarrage

L'application se lance en deux parties : l'API (`backend/`) puis l'interface (`frontend/`). La configuration détaillée se trouve dans les fichiers `.env.example` de chaque dossier.

### Configuration du JWT

Dans `backend/.env`, ajoutez une clé secrète privée d'au moins 32 caractères. Générez-en une avec Node.js :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copiez le résultat dans `backend/.env` sous la forme `JWT_SECRET=<votre-cle>`. Ne partagez pas cette clé et ne la commitez pas.

Après connexion, l'API renvoie un JWT valable 8 heures. Le frontend l'envoie aux routes protégées dans l'en-tête `Authorization: Bearer <jeton>`. La déconnexion supprime le jeton du navigateur ; comme les JWT sont sans état, un jeton déjà émis reste utilisable jusqu'à son expiration.

---



<div align="center">

**⭐ Si MedEqui vous plaît, laissez une étoile sur le dépôt !**

</div>