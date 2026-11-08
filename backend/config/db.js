const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'medequi',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Création du pool de connexions MySQL pour une gestion robuste et résiliente
const pool = mysql.createPool(dbConfig);

// Fonction d'initialisation des tables et vérification du schéma
function initializeDatabase() {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('\n❌ [MySQL] Erreur de connexion à la base de données :');
            console.error(`   Hôte : ${dbConfig.host} | Port : ${dbConfig.port} | Base : ${dbConfig.database} | Utilisateur : ${dbConfig.user}`);
            console.error(`   Message : ${err.message}`);
            console.error('\n💡 Conseil :');
            console.error('   1. Vérifiez que votre serveur MySQL (WampServer, XAMPP ou MySQL service) est démarré.');
            console.error('   2. Vérifiez le port dans le fichier .env (3306 ou 3307).');
            console.error('   3. Assurez-vous d\'avoir importé database/database.sql dans phpMyAdmin ou MySQL Workbench.\n');
            return;
        }

        console.log(`✅ [MySQL] Connecté avec succès à la base "${dbConfig.database}" sur ${dbConfig.host}:${dbConfig.port}`);
        connection.release();

        // 1. Table maintenance_orders
        pool.query(`CREATE TABLE IF NOT EXISTS maintenance_orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            equipment_id INT NULL,
            assigned_to_user_id INT NULL,
            maintenance_type VARCHAR(60) NOT NULL,
            priority VARCHAR(30) NOT NULL DEFAULT 'Normale',
            status VARCHAR(30) NOT NULL DEFAULT 'Planifiée',
            assigned_to VARCHAR(255) NULL,
            due_date DATE NOT NULL,
            notes TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`, (tableError) => {
            if (tableError) console.error('Erreur de création de la table maintenance_orders:', tableError);
        });

        // 2. Table intervention_reports
        pool.query(`CREATE TABLE IF NOT EXISTS intervention_reports (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nom VARCHAR(255) NOT NULL,
            adresse VARCHAR(255) NOT NULL,
            telephone VARCHAR(80) NOT NULL,
            email VARCHAR(255) NOT NULL,
            type VARCHAR(80) NOT NULL,
            contrat VARCHAR(100) NOT NULL,
            date_demande DATE NOT NULL,
            date_debut DATE NULL,
            date_fin DATE NULL,
            marque VARCHAR(160) NOT NULL,
            modele VARCHAR(160) NOT NULL,
            type_equipement VARCHAR(160) NOT NULL,
            service VARCHAR(160) NOT NULL,
            garantie VARCHAR(10) NOT NULL,
            description_demande TEXT NOT NULL,
            intervenant VARCHAR(255) NOT NULL,
            diagnostic TEXT NOT NULL,
            actions_realisees TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`, (reportError) => {
            if (reportError) console.error('Erreur de création de la table intervention_reports:', reportError);
        });

        // 3. Table notifications
        pool.query(`CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            message VARCHAR(500) NOT NULL,
            link VARCHAR(255) NOT NULL DEFAULT '/maintenance',
            read_at TIMESTAMP NULL DEFAULT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_notifications_user_unread (user_id, read_at, created_at)
        )`, (notifError) => {
            if (notifError) console.error('Erreur de création de la table notifications:', notifError);
        });

        // 4. Colonnes additionnelles sur users et maintenance_orders
        const ensureUserColumn = (column, definition) => {
            pool.query(`SHOW COLUMNS FROM users LIKE '${column}'`, (columnError, columns) => {
                if (columnError || !columns.length) {
                    if (!columnError) {
                        pool.query(`ALTER TABLE users ADD COLUMN ${column} ${definition}`, (alterError) => {
                            if (alterError) console.error(`Erreur d’ajout de users.${column}:`, alterError);
                        });
                    }
                }
            });
        };
        ensureUserColumn('status', "VARCHAR(30) NOT NULL DEFAULT 'Actif'");
        ensureUserColumn('created_at', 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');

        pool.query("SHOW COLUMNS FROM maintenance_orders LIKE 'assigned_to_user_id'", (columnError, columns) => {
            if (!columnError && columns && !columns.length) {
                pool.query('ALTER TABLE maintenance_orders ADD COLUMN assigned_to_user_id INT NULL AFTER equipment_id', (alterError) => {
                    if (alterError) console.error('Erreur d’ajout du responsable maintenance:', alterError);
                });
            }
        });
    });
}

// Lancer la vérification à l'import
initializeDatabase();

// Mode test direct (node config/db.js)
if (require.main === module) {
    console.log('🔍 Test de la connexion MySQL...');
    pool.query('SELECT 1 + 1 AS solution', (err, rows) => {
        if (err) {
            console.error('❌ Échec du test :', err.message);
            process.exit(1);
        } else {
            console.log('✅ Test réussi : liaison opérationnelle avec MySQL ! (1+1 =', rows[0].solution + ')');
            process.exit(0);
        }
    });
}

module.exports = pool;
