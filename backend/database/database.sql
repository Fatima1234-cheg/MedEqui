-- =========================================================
-- BASE DE DONNÉES MEDEQUI — GMAO
-- =========================================================

CREATE DATABASE IF NOT EXISTS medequi
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_general_ci;

USE medequi;

-- =========================================================
-- TABLE : EQUIPEMENTS
-- =========================================================
CREATE TABLE IF NOT EXISTS equipements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    designation VARCHAR(255) NOT NULL,
    numero_de_serie VARCHAR(255) NOT NULL,
    marque VARCHAR(255) NOT NULL,
    service VARCHAR(255) NULL,
    modele VARCHAR(255) NOT NULL,
    `date` DATE NOT NULL,
    status VARCHAR(100) NOT NULL,
    contrat VARCHAR(255) NOT NULL,
    INDEX idx_equipements_service (service),
    INDEX idx_equipements_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- TABLE : USERS (contient TOUS les rôles : admin, ingenieur, technicien)
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'ingenieur', 'technicien') NOT NULL DEFAULT 'technicien',
    status VARCHAR(30) NOT NULL DEFAULT 'Actif',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_role (role),
    INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- TABLE : MAINTENANCE_ORDERS
-- =========================================================
CREATE TABLE IF NOT EXISTS maintenance_orders (
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
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_maintenance_due_date (due_date),
    INDEX idx_maintenance_status (status),
    CONSTRAINT fk_maintenance_equipment
        FOREIGN KEY (equipment_id) REFERENCES equipements(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_maintenance_assignee
        FOREIGN KEY (assigned_to_user_id) REFERENCES users(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- TABLE : NOTIFICATIONS
-- =========================================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message VARCHAR(500) NOT NULL,
    link VARCHAR(255) NOT NULL DEFAULT '/maintenance',
    read_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notifications_user_unread (user_id, read_at, created_at),
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- TABLE : INTERVENTION_REPORTS
-- =========================================================
CREATE TABLE IF NOT EXISTS intervention_reports (
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
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reports_date (date_demande)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- COMPTES DE TEST (mots de passe bcryptés, script réexécutable)
-- chegdanifatima82@gmail.com / Admin123!
-- ingenieur@medequi.com   / Ingenieur123!
-- technicien@medequi.com  / Technicien123!
-- =========================================================

-- Admin
INSERT INTO users (nom, prenom, email, password, role, status) VALUES
('Chegdani', 'Fatima', 'chegdanifatima82@gmail.com',
 '$2b$10$bymUeeUaObgT0qNb/SaFSO1zAR63kmi2PVFgS7swmm8sjOVyhydgW',
 'admin', 'Actif')
ON DUPLICATE KEY UPDATE 
    password = VALUES(password), 
    role = VALUES(role), 
    status = VALUES(status);

-- Ingénieur
INSERT INTO users (nom, prenom, email, password, role, status) VALUES
('Martin', 'Sophie', 'ingenieur@medequi.com',
 '$2b$10$adBF510I9F1LzU9g8bFcm.3zsYeDJFqy0RSGy.Xp6ojO9q3WTZfaO',
 'ingenieur', 'Actif')
ON DUPLICATE KEY UPDATE 
    password = VALUES(password), 
    role = VALUES(role), 
    status = VALUES(status);

-- Technicien
INSERT INTO users (nom, prenom, email, password, role, status) VALUES
('Benali', 'Karim', 'technicien@medequi.com',
 '$2b$10$CLdatoT16pLyvFx1bkemJeCHYiSeyZhxjk3VD8g2SgDdglXRspCOW',
 'technicien', 'Actif')
ON DUPLICATE KEY UPDATE 
    password = VALUES(password), 
    role = VALUES(role), 
    status = VALUES(status);
