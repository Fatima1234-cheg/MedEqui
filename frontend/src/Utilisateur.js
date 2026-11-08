import React, { useState, useEffect } from 'react';
import './Utilisateur.css';
import {
    FaEdit, FaTrashAlt, FaPlus, FaSearch, FaTimes,
    FaUserShield, FaUserCheck, FaUsers, FaSave, FaUserCog, FaWrench
} from 'react-icons/fa';
import { VscAccount } from 'react-icons/vsc';
import { apiFetch } from './api';

const Utilisateur = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [newUser, setNewUser] = useState({
        nom: '', prenom: '', email: '', password: '', role: 'technicien', status: 'Actif'
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('Tous les rôles');
    const [filterStatus, setFilterStatus] = useState('Tous les statuts');

    // ✅ Rôles disponibles
    const ROLES = [
        { value: 'admin', label: 'Administrateur', icon: '' },
        { value: 'ingenieur', label: 'Ingénieur biomédical', icon: '' },
        { value: 'technicien', label: 'Technicien', icon: '' }
    ];

    // ✅ Libellé du rôle pour l'affichage
    const roleLabel = (role) => {
        const r = ROLES.find(x => x.value === role?.toLowerCase());
        return r ? `${r.icon} ${r.label}` : role;
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await apiFetch('/users');
                if (!response.ok) throw new Error('Erreur lors de la récupération');
                const data = await response.json();
                setUsers(data);
                setFilteredUsers(data);
            } catch (error) {
                console.error('Erreur:', error);
                setErrorMessage(error.message);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        let temp = [...users];
        if (searchTerm.trim() !== '') {
            temp = temp.filter(user =>
                `${user.prenom} ${user.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (filterRole !== 'Tous les rôles') {
            temp = temp.filter(user => user.role.toLowerCase() === filterRole.toLowerCase());
        }
        if (filterStatus !== 'Tous les statuts') {
            temp = temp.filter(user => (user.status || 'Actif').toLowerCase() === filterStatus.toLowerCase());
        }
        setFilteredUsers(temp);
    }, [searchTerm, filterRole, filterStatus, users]);

    const handleEdit = (user) => {
        setSelectedUser({ ...user, password: '' });
        setShowEditPopup(true);
    };

    const handleUpdate = async () => {
        try {
            const response = await apiFetch(`/users/${selectedUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedUser),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de la modification');
            }
            setUsers(users.map(user =>
                user.id === selectedUser.id ? { ...user, ...selectedUser } : user
            ));
            setShowEditPopup(false);
        } catch (error) {
            alert('Erreur : ' + error.message);
        }
    };

    const handleAddUser = async () => {
        try {
            const response = await apiFetch('/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erreur lors de l'ajout");
            }
            const user = await response.json();
            setUsers([...users, user]);
            setShowAddPopup(false);
            setNewUser({ nom: '', prenom: '', email: '', password: '', role: 'technicien', status: 'Actif' });
        } catch (error) {
            alert('Erreur : ' + error.message);
        }
    };

    const confirmDelete = async () => {
        try {
            const response = await apiFetch(`/users/${userToDelete}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de la suppression');
            }
            setUsers(users.filter(user => user.id !== userToDelete));
            setShowDeletePopup(false);
            setUserToDelete(null);
        } catch (error) {
            alert('Erreur : ' + error.message);
        }
    };

    const askDelete = (id) => {
        setUserToDelete(id);
        setShowDeletePopup(true);
    };

    // ✅ Statistiques par rôle
    const totalUsers = users.length;
    const totalAdmins = users.filter(u => u.role?.toLowerCase() === 'admin').length;
    const totalIngenieurs = users.filter(u => u.role?.toLowerCase() === 'ingenieur').length;
    const totalTechniciens = users.filter(u => u.role?.toLowerCase() === 'technicien').length;
    const totalActifs = users.filter(u => (u.status || 'Actif').toLowerCase() === 'actif').length;

    return (
        <div className="utilisateur-container">
            {errorMessage && <div className="notice notice-error" role="alert">{errorMessage}</div>}

            {/* ===== HEADER ===== */}
            <div className="pageHeader">
                <div>
                    <h1 className="pageTitle">Gestion des Utilisateurs</h1>
                    <p className="pageSubtitle">Ajoutez, modifiez et supprimez les comptes utilisateurs</p>
                </div>
                <button className="addUserBtn" onClick={() => setShowAddPopup(true)}>
                    <FaPlus /> Ajouter un utilisateur
                </button>
            </div>

            {/* ===== STATS ===== */}
            <div className="statsBar">
                <div className="statCard">
                    <div className="statIcon statIconTotal"><FaUsers /></div>
                    <div>
                        <div className="statValue">{totalUsers}</div>
                        <div className="statLabel">Total utilisateurs</div>
                    </div>
                </div>
                <div className="statCard">
                    <div className="statIcon statIconAdmin"><FaUserShield /></div>
                    <div>
                        <div className="statValue">{totalAdmins}</div>
                        <div className="statLabel">Administrateurs</div>
                    </div>
                </div>
                <div className="statCard">
                    <div className="statIcon statIconIngenieur"><FaUserCog /></div>
                    <div>
                        <div className="statValue">{totalIngenieurs}</div>
                        <div className="statLabel">Ingénieurs</div>
                    </div>
                </div>
                <div className="statCard">
                    <div className="statIcon statIconTechnicien"><FaWrench /></div>
                    <div>
                        <div className="statValue">{totalTechniciens}</div>
                        <div className="statLabel">Techniciens</div>
                    </div>
                </div>
                
            </div>

            {/* ===== FILTRES ===== */}
            <div className="toolbar">
                <div className="searchWrapper">
                    <FaSearch className="searchIcon" />
                    <input
                        type="text"
                        className="searchInput"
                        placeholder="Rechercher par nom, prénom ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filters">
                    <select
                        className="filterSelect"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        aria-label="Filtrer par rôle"
                    >
                        <option>Tous les rôles</option>
                        <option value="admin">Admin</option>
                        <option value="ingenieur">Ingenieur</option>
                        <option value="technicien">Technicien</option>
                    </select>
                    <select
                        className="filterSelect"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        aria-label="Filtrer par statut"
                    >
                        <option>Tous les statuts</option>
                        <option>Actif</option>
                        <option>Inactif</option>
                    </select>
                </div>
            </div>

            {/* ===== TABLEAU ===== */}
            <div className="tableWrapper">
                <table className="userTable">
                    <thead>
                        <tr>
                            <th>Utilisateur</th>
                            <th>Email</th>
                            <th>Rôle</th>
                            <th>Statut</th>
                            <th>Créé le</th>
                            <th className="actionsCol">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="userRow">
                                <td>
                                    <div className="userCell">
                                        <div className="userAvatar">
                                            <VscAccount />
                                        </div>
                                        <div>
                                            <div className="userFullName">
                                                {user.prenom} {user.nom}
                                            </div>
                                            <div className="userId">ID #{user.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="userEmail">{user.email}</td>
                                <td>
                                    <span className={`badge badge-${user.role?.toLowerCase()}`}>
                                        {roleLabel(user.role)}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge badge-${(user.status || 'Actif').toLowerCase()}`}>
                                        {user.status || 'Actif'}
                                    </span>
                                </td>
                                <td className="userDate">
                                    {new Date(user.created_at || user.createdAt || Date.now())
                                        .toLocaleDateString('fr-FR')}
                                </td>
                                <td className="actionsCol">
                                    <div className="actions">
                                        <button
                                            className="iconBtn iconBtnEdit"
                                            onClick={() => handleEdit(user)}
                                            title="Modifier"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="iconBtn iconBtnDelete"
                                            onClick={() => askDelete(user.id)}
                                            title="Supprimer"
                                        >
                                            <FaTrashAlt />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan="6" className="emptyRow">
                                    Aucun utilisateur trouvé
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ===== MODAL AJOUT ===== */}
            {showAddPopup && (
                <div className="modalOverlay" onClick={() => setShowAddPopup(false)}>
                    <div className="modalBox" onClick={(e) => e.stopPropagation()}>
                        <div className="modalHeader">
                            <h2>Ajouter un utilisateur</h2>
                            <FaTimes className="closeIcon" onClick={() => setShowAddPopup(false)} />
                        </div>
                        <div className="modalBody">
                            <div className="formRow">
                                <div className="formGroup">
                                    <label>Nom</label>
                                    <input
                                        type="text"
                                        value={newUser.nom}
                                        onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
                                        placeholder="Dupont"
                                    />
                                </div>
                                <div className="formGroup">
                                    <label>Prénom</label>
                                    <input
                                        type="text"
                                        value={newUser.prenom}
                                        onChange={(e) => setNewUser({ ...newUser, prenom: e.target.value })}
                                        placeholder="Jean"
                                    />
                                </div>
                            </div>
                            <div className="formGroup">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    placeholder="jean.dupont@exemple.com"
                                />
                            </div>
                            <div className="formGroup">
                                <label>Mot de passe</label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="formRow">
                                <div className="formGroup">
                                    <label>Rôle</label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    >
                                        {ROLES.map(r => (
                                            <option key={r.value} value={r.value}>
                                                {r.icon} {r.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="formGroup">
                                    <label>Statut</label>
                                    <select
                                        value={newUser.status}
                                        onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                                    >
                                        <option value="Actif">Actif</option>
                                        <option value="Inactif">Inactif</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modalFooter">
                            <button className="btnCancel" onClick={() => setShowAddPopup(false)}>
                                Annuler
                            </button>
                            <button className="btnSave" onClick={handleAddUser}>
                                <FaSave /> Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== MODAL MODIFICATION ===== */}
            {showEditPopup && selectedUser && (
                <div className="modalOverlay" onClick={() => setShowEditPopup(false)}>
                    <div className="modalBox" onClick={(e) => e.stopPropagation()}>
                        <div className="modalHeader">
                            <h2>Modifier l'utilisateur</h2>
                            <FaTimes className="closeIcon" onClick={() => setShowEditPopup(false)} />
                        </div>
                        <div className="modalBody">
                            <div className="formRow">
                                <div className="formGroup">
                                    <label>Nom</label>
                                    <input
                                        type="text"
                                        value={selectedUser.nom}
                                        onChange={(e) => setSelectedUser({ ...selectedUser, nom: e.target.value })}
                                    />
                                </div>
                                <div className="formGroup">
                                    <label>Prénom</label>
                                    <input
                                        type="text"
                                        value={selectedUser.prenom}
                                        onChange={(e) => setSelectedUser({ ...selectedUser, prenom: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="formGroup">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={selectedUser.email}
                                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                                />
                            </div>
                            <div className="formGroup">
                                <label>Mot de passe</label>
                                <input
                                    type="password"
                                    value={selectedUser.password || ''}
                                    onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })}
                                    placeholder="Laisser vide pour ne pas changer"
                                />
                            </div>
                            <div className="formRow">
                                <div className="formGroup">
                                    <label>Rôle</label>
                                    <select
                                        value={selectedUser.role}
                                        onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                                    >
                                        {ROLES.map(r => (
                                            <option key={r.value} value={r.value}>
                                                {r.icon} {r.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="formGroup">
                                    <label>Statut</label>
                                    <select
                                        value={selectedUser.status || 'Actif'}
                                        onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}
                                    >
                                        <option value="Actif">Actif</option>
                                        <option value="Inactif">Inactif</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modalFooter">
                            <button className="btnCancel" onClick={() => setShowEditPopup(false)}>
                                Annuler
                            </button>
                            <button className="btnSave" onClick={handleUpdate}>
                                <FaSave /> Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== MODAL SUPPRESSION ===== */}
            {showDeletePopup && (
                <div className="modalOverlay" onClick={() => setShowDeletePopup(false)}>
                    <div className="modalBox modalSmall" onClick={(e) => e.stopPropagation()}>
                        <div className="modalHeader">
                            <h2>Confirmer la suppression</h2>
                        </div>
                        <div className="modalBody">
                            <p className="deleteText">
                                Êtes-vous sûr de vouloir supprimer cet utilisateur ?
                                Cette action est irréversible.
                            </p>
                        </div>
                        <div className="modalFooter">
                            <button className="btnCancel" onClick={() => setShowDeletePopup(false)}>
                                Annuler
                            </button>
                            <button className="btnDelete" onClick={confirmDelete}>
                                <FaTrashAlt /> Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Utilisateur;