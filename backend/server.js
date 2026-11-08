const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
    console.error('❌ JWT_SECRET est requis et doit contenir au moins 32 caractères. Configurez-le dans backend/.env.');
    process.exit(1);
}

let bcrypt;
try {
    bcrypt = require('bcryptjs');
} catch (e1) {
    try {
        bcrypt = require('bcrypt');
    } catch (e2) {
        console.warn('⚠️ Aucun package de hachage trouvé (bcrypt ou bcryptjs). Exécutez npm install.');
    }
}

// Connexion modulaire à la base de données MySQL
const db = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

const rolePermissions = {
    admin: {
        equipements: ['view', 'create', 'edit', 'delete'],
        utilisateurs: ['view', 'create', 'edit', 'delete'],
        maintenance: ['view', 'create', 'edit', 'delete'],
        rapports: ['view', 'create', 'edit', 'delete'],
        dashboard: ['view'],
        notifications: ['view', 'edit']
    },
    ingenieur: {
        equipements: ['view', 'create', 'edit'],
        utilisateurs: [],
        maintenance: ['view', 'create', 'edit'],
        rapports: ['view', 'create', 'edit'],
        dashboard: ['view'],
        notifications: ['view', 'edit']
    },
    technicien: {
        equipements: ['view'],
        utilisateurs: [],
        maintenance: ['view', 'edit'],
        rapports: ['view', 'create'],
        dashboard: [],
        notifications: ['view', 'edit']
    }
};

function authenticate(req, res, next) {
    const authorization = req.get('authorization') || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';

    if (!token) {
        return res.status(401).json({ error: 'Session absente ou expirée. Veuillez vous reconnecter.' });
    }

    try {
        const user = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
        if (typeof user !== 'object' || !Number.isInteger(user.id) || !rolePermissions[user.role]) {
            return res.status(401).json({ error: 'Jeton invalide. Veuillez vous reconnecter.' });
        }
        req.user = user;
    } catch (error) {
        return res.status(401).json({ error: 'Session absente ou expirée. Veuillez vous reconnecter.' });
    }
    next();
}

function authorize(module) {
    return (req, res, next) => {
        const actionByMethod = { GET: 'view', POST: 'create', PUT: 'edit', PATCH: 'edit', DELETE: 'delete' };
        const action = actionByMethod[req.method];
        const allowed = rolePermissions[req.user.role]?.[module]?.includes(action);
        if (!allowed) return res.status(403).json({ error: 'Accès refusé pour cette action.' });
        next();
    };
}

// Route d'authentification (publique)
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis.' });

    db.query('SELECT id, nom, prenom, email, password, role, status FROM users WHERE email = ?', [email], (err, users) => {
        if (err) return res.status(500).json({ error: 'Erreur serveur.' });
        if (!users.length) return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });

        const user = users[0];
        if ((user.status || 'Actif').toLowerCase() !== 'actif') {
            return res.status(403).json({ error: 'Compte désactivé. Contactez l’administrateur.' });
        }
        if (!rolePermissions[user.role]) return res.status(403).json({ error: 'Rôle utilisateur non autorisé.' });

        if (!bcrypt) {
            return res.status(500).json({ error: 'Module de mot de passe indisponible côté serveur.' });
        }

        bcrypt.compare(password, user.password, (compareError, isMatch) => {
            if (compareError) return res.status(500).json({ error: 'Erreur serveur.' });
            if (!isMatch) return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });

            const profile = { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role };
            const token = jwt.sign(profile, jwtSecret, { algorithm: 'HS256', expiresIn: '8h' });
            res.json({ ...profile, token });
        });
    });
});

// Middleware d'authentification pour les routes protégées
app.use(authenticate);

app.post('/logout', (req, res) => {
    res.json({ message: 'Déconnexion réussie. Supprimez le jeton côté client.' });
});

app.use('/equipements', authorize('equipements'));
app.use('/users', authorize('utilisateurs'));
app.use('/maintenance', authorize('maintenance'));
app.use('/api/rapport', authorize('rapports'));
app.use('/notifications', (req, res, next) => {
    const action = req.method === 'GET' ? 'view' : req.method === 'PATCH' ? 'edit' : null;
    if (!action || !rolePermissions[req.user.role]?.notifications?.includes(action)) {
        return res.status(403).json({ error: 'Accès refusé aux notifications.' });
    }
    next();
});

// --- NOTIFICATIONS ---
app.get('/notifications', (req, res) => {
    db.query('SELECT id, title, message, link, read_at, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30', [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.patch('/notifications/:id/read', (req, res) => {
    db.query('UPDATE notifications SET read_at = COALESCE(read_at, CURRENT_TIMESTAMP) WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!result.affectedRows) return res.status(404).json({ error: 'Notification introuvable.' });
        res.json({ id: Number(req.params.id), read: true });
    });
});

// --- ROUTES ÉQUIPEMENTS ---
// Ajouter un équipement
app.post('/equipements', (req, res) => {
    const { designation, numero_de_serie, marque, service, modele, date, status, contrat } = req.body;

    if (!designation || !numero_de_serie || !marque || !modele || !date || !status || !contrat) {
        return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    const q = "INSERT INTO equipements (designation, numero_de_serie, marque, service, modele, date, status, contrat) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(q, [designation, numero_de_serie, marque, service, modele, date, status, contrat], (err, result) => {
        if (err) {
            console.error("Erreur lors de l'ajout de l'équipement :", err);
            return res.status(500).json({ error: "Erreur interne du serveur" });
        }
        return res.status(201).json({ id: result.insertId, designation, numero_de_serie, marque, service, modele, date, status, contrat });
    });
});

// Modifier un équipement
app.put('/equipements/:id', (req, res) => {
    const equipementId = req.params.id;
    const { designation, numero_de_serie, marque, service, modele, date, status, contrat } = req.body;

    const q = "UPDATE equipements SET designation=?, numero_de_serie=?, marque=?, service=?, modele=?, date=?, status=?, contrat=? WHERE id=?";
    db.query(q, [designation, numero_de_serie, marque, service, modele, date, status, contrat, equipementId], (err, result) => {
        if (err) return res.status(500).json({ error: "Erreur lors de la mise à jour" });
        return res.json({ message: "Équipement mis à jour avec succès" });
    });
});

// Supprimer un équipement
app.delete('/equipements/:id', (req, res) => {
    const q = "DELETE FROM equipements WHERE id=?";
    db.query(q, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: "Erreur lors de la suppression" });
        return res.json({ message: "Équipement supprimé avec succès" });
    });
});

// Récupérer tous les équipements
app.get('/equipements', (req, res) => {
    db.query("SELECT * FROM equipements", (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json(data);
    });
});

// --- ORDRES DE MAINTENANCE ---
app.get('/maintenance/assignees', (req, res) => {
    db.query(
        `SELECT id, nom, prenom, email, role
        FROM users
        WHERE status = 'Actif' AND role IN ('ingenieur', 'technicien')
        ORDER BY role, nom, prenom`,
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

app.get('/maintenance', (req, res) => {
    const sql = `SELECT m.id, m.title, m.equipment_id, m.maintenance_type AS type,
        m.priority, m.status, m.assigned_to, m.due_date, m.notes, m.created_at,
        e.designation AS equipment_name
        FROM maintenance_orders m
        LEFT JOIN equipements e ON e.id = m.equipment_id
        ORDER BY m.due_date ASC, m.id DESC`;
    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/maintenance', (req, res) => {
    const { title, equipment_id, assigned_to_user_id, assigned_to, type, priority, status, due_date, notes } = req.body;
    if (!title || !type || !due_date) return res.status(400).json({ error: 'Le titre, le type et l’échéance sont obligatoires.' });

    const createOrder = assignee => {
        const sql = `INSERT INTO maintenance_orders
            (title, equipment_id, assigned_to_user_id, maintenance_type, priority, status, assigned_to, due_date, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.query(sql, [title, equipment_id || null, assignee?.id || null, type, priority || 'Normale', status || 'Planifiée', assignee ? `${assignee.prenom} ${assignee.nom}` : assigned_to || null, due_date, notes || null], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            const returnOrder = () => db.query(`SELECT m.id, m.title, m.equipment_id, m.assigned_to_user_id,
                m.maintenance_type AS type, m.priority, m.status, m.assigned_to, m.due_date, m.notes, m.created_at,
                e.designation AS equipment_name
                FROM maintenance_orders m LEFT JOIN equipements e ON e.id = m.equipment_id WHERE m.id = ?`,
            [result.insertId], (selectError, rows) => {
                if (selectError) return res.status(500).json({ error: selectError.message });
                res.status(201).json(rows[0]);
            });

            if (!assignee) return returnOrder();
            db.query('INSERT INTO notifications (user_id, title, message, link) VALUES (?, ?, ?, ?)',
                [assignee.id, 'Nouvelle intervention assignée', `${title} vous a été assignée. Échéance : ${due_date}.`, '/maintenance'],
                notificationError => {
                    if (notificationError) {
                        console.error('Erreur de création de notification:', notificationError);
                        return res.status(500).json({ error: 'L’intervention a été créée, mais sa notification n’a pas pu être enregistrée.' });
                    }
                    returnOrder();
                }
            );
        });
    };

    if (!assigned_to_user_id) return createOrder(null);
    db.query("SELECT id, nom, prenom FROM users WHERE id = ? AND status = 'Actif' AND role IN ('ingenieur', 'technicien')", [assigned_to_user_id], (assigneeError, assignees) => {
        if (assigneeError) return res.status(500).json({ error: assigneeError.message });
        if (!assignees.length) return res.status(400).json({ error: 'Responsable actif introuvable.' });
        createOrder(assignees[0]);
    });
});

app.put('/maintenance/:id', (req, res) => {
    const { title, equipment_id, type, priority, status, assigned_to, due_date, notes } = req.body;

    if (req.user.role === 'technicien') {
        const allowedStatuses = ['Planifiée', 'En cours', 'Terminée', 'Annulée'];
        if (!allowedStatuses.includes(status)) return res.status(400).json({ error: 'Statut de maintenance invalide.' });
        return db.query('UPDATE maintenance_orders SET status = ? WHERE id = ?', [status, req.params.id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!result.affectedRows) return res.status(404).json({ error: 'Intervention introuvable.' });
            db.query(`SELECT m.id, m.title, m.equipment_id, m.maintenance_type AS type,
                m.priority, m.status, m.assigned_to, m.due_date, m.notes, m.created_at,
                e.designation AS equipment_name
                FROM maintenance_orders m LEFT JOIN equipements e ON e.id = m.equipment_id WHERE m.id = ?`,
            [req.params.id], (selectError, rows) => {
                if (selectError) return res.status(500).json({ error: selectError.message });
                res.json(rows[0]);
            });
        });
    }

    if (!title || !type || !due_date) return res.status(400).json({ error: 'Le titre, le type et l’échéance sont obligatoires.' });

    const sql = `UPDATE maintenance_orders SET title = ?, equipment_id = ?, maintenance_type = ?,
        priority = ?, status = ?, assigned_to = ?, due_date = ?, notes = ? WHERE id = ?`;
    db.query(sql, [title, equipment_id || null, type, priority || 'Normale', status || 'Planifiée', assigned_to || null, due_date, notes || null, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        db.query(`SELECT m.id, m.title, m.equipment_id, m.maintenance_type AS type,
            m.priority, m.status, m.assigned_to, m.due_date, m.notes, m.created_at,
            e.designation AS equipment_name
            FROM maintenance_orders m LEFT JOIN equipements e ON e.id = m.equipment_id WHERE m.id = ?`,
        [req.params.id], (selectError, rows) => {
            if (selectError) return res.status(500).json({ error: selectError.message });
            if (!rows.length) return res.status(404).json({ error: 'Intervention introuvable.' });
            res.json(rows[0]);
        });
    });
});

app.delete('/maintenance/:id', (req, res) => {
    db.query('DELETE FROM maintenance_orders WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!result.affectedRows) return res.status(404).json({ error: 'Intervention introuvable.' });
        res.json({ message: 'Intervention supprimée.' });
    });
});

// --- RAPPORTS D’INTERVENTION ---
app.get('/api/rapport', (req, res) => {
    db.query('SELECT * FROM intervention_reports ORDER BY created_at DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/rapport', (req, res) => {
    const fields = [
        'nom', 'adresse', 'telephone', 'email', 'type', 'contrat', 'date_demande',
        'date_debut', 'date_fin', 'marque', 'modele', 'type_equipement', 'service',
        'garantie', 'description_demande', 'intervenant', 'diagnostic', 'actions_realisees'
    ];
    const required = fields.filter(field => !['date_debut', 'date_fin'].includes(field));
    if (required.some(field => !req.body[field])) return res.status(400).json({ error: 'Veuillez renseigner les champs obligatoires du rapport.' });

    const sql = `INSERT INTO intervention_reports (${fields.map(field => `\`${field}\``).join(', ')})
        VALUES (${fields.map(() => '?').join(', ')})`;
    const values = fields.map(field => req.body[field] || null);
    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        db.query('SELECT * FROM intervention_reports WHERE id = ?', [result.insertId], (selectError, rows) => {
            if (selectError) return res.status(500).json({ error: selectError.message });
            res.status(201).json(rows[0]);
        });
    });
});

// --- ROUTES UTILISATEURS ---
// Récupérer tous les utilisateurs
app.get('/users', (req, res) => {
    db.query("SELECT * FROM users", (err, results) => {
        if (err) return res.status(500).json({ error: 'Erreur serveur' });
        res.json(results);
    });
});

// Ajouter un utilisateur
app.post('/users', async (req, res) => {
    const { nom, prenom, email, password, role, status } = req.body;

    if (!nom || !prenom || !email || !password || !role) {
        return res.status(400).json({ error: 'Champs manquants' });
    }

    const validRoles = ['admin', 'ingenieur', 'technicien'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Rôle invalide' });
    }

    db.query("SELECT id FROM users WHERE email = ?", [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Erreur serveur' });
        if (results.length > 0) return res.status(409).json({ error: 'Email déjà utilisé' });

        if (!bcrypt) {
            return res.status(500).json({ error: 'Module de mot de passe indisponible côté serveur.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        db.query(
            "INSERT INTO users (nom, prenom, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)",
            [nom, prenom, email, hashedPassword, role, status || 'Actif'],
            (err, result) => {
                if (err) return res.status(500).json({ error: 'Erreur serveur' });
                res.status(201).json({
                    id: result.insertId, nom, prenom, email, role,
                    status: status || 'Actif', created_at: new Date()
                });
            }
        );
    });
});

// Modifier un utilisateur
app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { nom, prenom, email, password, role, status } = req.body;
    if (!nom || !prenom || !email || !role) return res.status(400).json({ error: 'Champs manquants' });

    let hashedPassword = null;
    if (password) {
        if (!bcrypt) return res.status(500).json({ error: 'Module de mot de passe indisponible côté serveur.' });
        hashedPassword = await bcrypt.hash(password, 10);
    }

    const q = "UPDATE users SET nom=?, prenom=?, email=?, password=COALESCE(?, password), role=?, status=? WHERE id=?";
    db.query(q, [nom, prenom, email, hashedPassword, role, status || 'Actif', id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erreur serveur' });
        res.json({ message: 'Utilisateur modifié avec succès' });
    });
});

// Supprimer un utilisateur
app.delete('/users/:id', (req, res) => {
    db.query("DELETE FROM users WHERE id=?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erreur serveur' });
        res.json({ message: 'Utilisateur supprimé avec succès' });
    });
});

// --- DÉMARRER LE SERVEUR ---
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`🚀 Serveur backend MedEqui en écoute sur le port ${PORT}`));
