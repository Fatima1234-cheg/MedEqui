import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaTrash, FaEye, FaEllipsisV, FaTimes, FaSave, FaEdit } from 'react-icons/fa';
import { useAuth } from './AuthContext';
import { authHeaders } from './api';
import './Admins.css';

function Admins() {
    const { can } = useAuth();
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAdmin, setNewAdmin] = useState({
        designation: '', numero_de_serie: '', marque: '',
        service: '', modele: '', date: '', status: '', contrat: ''
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [tempAdmin, setTempAdmin] = useState({
        designation: '', numero_de_serie: '', marque: '',
        service: '', modele: '', date: '', status: '', contrat: ''
    });
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => { getAdmins(); }, []);

    const getAdmins = async () => {
        try {
            const res = await axios.get('http://localhost:8081/equipements', { headers: authHeaders() });
            setData(res.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des equipements :", error);
        }
    };

    const handleDelete = async (id) => {
        setItemToDelete(id);
        setShowDeletePopup(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`http://localhost:8081/equipements/${itemToDelete}`, { headers: authHeaders() });
            setData(prevData => prevData.filter(admin => admin.id !== itemToDelete));
            setShowDeletePopup(false);
        } catch (error) {
            alert("Échec de la suppression : " + (error.response?.data?.error || error.message));
        }
    };

    const cancelDelete = () => {
        setShowDeletePopup(false);
        setItemToDelete(null);
    };

    const handleViewDetails = (equipements) => setSelectedAdmin(equipements);

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8081/equipements', newAdmin, { headers: authHeaders() });
            setData([...data, response.data]);
            setShowAddModal(false);
            setNewAdmin({
                designation: '', numero_de_serie: '', marque: '',
                service: '', modele: '', date: '', status: '', contrat: ''
            });
        } catch (error) {
            setErrorMessage(error.response?.data?.error || "Erreur lors de l'ajout");
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8081/equipements/${editingAdmin.id}`, tempAdmin, { headers: authHeaders() });
            setData(prev => prev.map(equipements =>
                equipements.id === editingAdmin.id ? { ...equipements, ...tempAdmin } : equipements
            ));
            setEditingAdmin(null);
            setSelectedAdmin(null);
        } catch (error) {
            alert("Échec de la mise à jour : " + (error.response?.data?.error || error.message));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAdmin(prev => ({ ...prev, [name]: value }));
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try { return new Date(dateStr).toLocaleDateString('fr-FR'); }
        catch { return dateStr; }
    };

    return (
        <div className="pageContainer">
            <div className="container">
                <div className="header">
                    <h2 className="title">Équipements</h2>

                    {/* ✅ BARRE DE RECHERCHE avec icône À GAUCHE + espace avec le bouton */}
                    <div className="searchContainer">
    <div className="inputWrapper">
        <FaSearch className="searchIcon" />
        <input
            type="text"
            className="searchInput"
            placeholder="Rechercher par Numéro de Série"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
    </div>
    {can('equipements', 'create') && (
        <button className="addButton" onClick={() => setShowAddModal(true)}>
            Ajouter
        </button>
    )}
</div>
                </div>

                {/* Modale d'ajout */}
                {showAddModal && (
                    <div className="modalOverlay" onClick={() => setShowAddModal(false)}>
                        <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                            <div className="modalHeader">
                                <h3>Ajouter un équipement</h3>
                                <FaTimes className="closeIcon" onClick={() => setShowAddModal(false)} />
                            </div>
                            <form onSubmit={handleAddAdmin}>
                                <div className="modalBody">
                                    {errorMessage && <div className="errorMessage">{errorMessage}</div>}
                                    <div className="formRow">
                                        <div className="formGroup">
                                            <label className="label">Désignation:</label>
                                            <input type="text" name="designation" className="input"
                                                value={newAdmin.designation} onChange={handleInputChange} required />
                                        </div>
                                        <div className="formGroup">
                                            <label className="label">Numéro de série:</label>
                                            <input type="text" name="numero_de_serie" className="input"
                                                value={newAdmin.numero_de_serie} onChange={handleInputChange} required />
                                        </div>
                                    </div>
                                    <div className="formRow">
                                        <div className="formGroup">
                                            <label className="label">Marque:</label>
                                            <input type="text" name="marque" className="input"
                                                value={newAdmin.marque} onChange={handleInputChange} required />
                                        </div>
                                        <div className="formGroup">
                                            <label className="label">Service:</label>
                                            <input type="text" name="service" className="input"
                                                value={newAdmin.service} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="formRow">
                                        <div className="formGroup">
                                            <label className="label">Modèle:</label>
                                            <input type="text" name="modele" className="input"
                                                value={newAdmin.modele} onChange={handleInputChange} required />
                                        </div>
                                        <div className="formGroup">
                                            <label className="label">Date:</label>
                                            <input type="date" name="date" className="input"
                                                value={newAdmin.date} onChange={handleInputChange} required />
                                        </div>
                                    </div>
                                    <div className="formRow">
                                        <div className="formGroup">
                                            <label className="label">Status:</label>
                                            <input type="text" name="status" className="input"
                                                value={newAdmin.status} onChange={handleInputChange} required />
                                        </div>
                                        <div className="formGroup">
                                            <label className="label">Contrat:</label>
                                            <input type="text" name="contrat" className="input"
                                                value={newAdmin.contrat} onChange={handleInputChange} required />
                                        </div>
                                    </div>
                                </div>
                                <div className="modalFooter">
                                    <button type="submit" className="saveButton">
                                        <FaSave /> Enregistrer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modale détails/modification */}
                {selectedAdmin && (
                    <div className="modalOverlay" onClick={() => {
                        setSelectedAdmin(null);
                        setEditingAdmin(null);
                    }}>
                        <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                            <div className="modalHeader">
                                <h3>{editingAdmin ? "Modifier" : "Détails de"} l'Equipement</h3>
                                <FaTimes className="closeIcon" onClick={() => {
                                    setSelectedAdmin(null);
                                    setEditingAdmin(null);
                                }} />
                            </div>
                            <div className="modalBody">
                                {editingAdmin ? (
                                    <form onSubmit={handleUpdate}>
                                        <div className="formRow">
                                            <div className="formGroup">
                                                <label className="label">Désignation:</label>
                                                <input type="text" className="input" value={tempAdmin.designation}
                                                    onChange={(e) => setTempAdmin(prev => ({ ...prev, designation: e.target.value }))} required />
                                            </div>
                                            <div className="formGroup">
                                                <label className="label">Numéro de série:</label>
                                                <input type="text" className="input" value={tempAdmin.numero_de_serie}
                                                    onChange={(e) => setTempAdmin(prev => ({ ...prev, numero_de_serie: e.target.value }))} required />
                                            </div>
                                        </div>
                                        <div className="formRow">
                                            <div className="formGroup">
                                                <label className="label">Marque:</label>
                                                <input type="text" className="input" value={tempAdmin.marque}
                                                    onChange={(e) => setTempAdmin(prev => ({ ...prev, marque: e.target.value }))} required />
                                            </div>
                                            <div className="formGroup">
                                                <label className="label">Service:</label>
                                                <input type="text" className="input" value={tempAdmin.service}
                                                    onChange={(e) => setTempAdmin(prev => ({ ...prev, service: e.target.value }))} />
                                            </div>
                                        </div>
                                        <div className="formRow">
                                            <div className="formGroup">
                                                <label className="label">Modèle:</label>
                                                <input type="text" className="input" value={tempAdmin.modele}
                                                    onChange={(e) => setTempAdmin(prev => ({ ...prev, modele: e.target.value }))} required />
                                            </div>
                                            <div className="formGroup">
                                                <label className="label">Date:</label>
                                                <input type="date" className="input"
                                                    value={tempAdmin.date ? tempAdmin.date.split('T')[0] : ''}
                                                    onChange={(e) => setTempAdmin(prev => ({ ...prev, date: e.target.value }))} required />
                                            </div>
                                        </div>
                                        <div className="formRow">
                                            <div className="formGroup">
                                                <label className="label">Status:</label>
                                                <input type="text" className="input" value={tempAdmin.status}
                                                    onChange={(e) => setTempAdmin(prev => ({ ...prev, status: e.target.value }))} required />
                                            </div>
                                            <div className="formGroup">
                                                <label className="label">Contrat:</label>
                                                <input type="text" className="input" value={tempAdmin.contrat}
                                                    onChange={(e) => setTempAdmin(prev => ({ ...prev, contrat: e.target.value }))} required />
                                            </div>
                                        </div>
                                        <div className="modalFooter">
                                            <button type="submit" className="saveButton">
                                                <FaSave /> Enregistrer
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="detailsGrid">
                                        <div className="detailCard"><span className="detailLabel">ID</span><span className="detailValue">{selectedAdmin.id}</span></div>
                                        <div className="detailCard"><span className="detailLabel">Désignation</span><span className="detailValue">{selectedAdmin.designation}</span></div>
                                        <div className="detailCard"><span className="detailLabel">Numéro de série</span><span className="detailValue">{selectedAdmin.numero_de_serie}</span></div>
                                        <div className="detailCard"><span className="detailLabel">Marque</span><span className="detailValue">{selectedAdmin.marque}</span></div>
                                        <div className="detailCard"><span className="detailLabel">Service</span><span className="detailValue">{selectedAdmin.service || 'N/A'}</span></div>
                                        <div className="detailCard"><span className="detailLabel">Modèle</span><span className="detailValue">{selectedAdmin.modele || 'N/A'}</span></div>
                                        <div className="detailCard"><span className="detailLabel">Date</span><span className="detailValue">{formatDate(selectedAdmin.date)}</span></div>
                                        <div className="detailCard"><span className="detailLabel">Status</span><span className="detailValue">{selectedAdmin.status || 'N/A'}</span></div>
                                        <div className="detailCard detailCardFull"><span className="detailLabel">Contrat</span><span className="detailValue">{selectedAdmin.contrat}</span></div>
                                        {can('equipements', 'edit') && (
                                            <div className="modalFooter detailFooter">
                                                <button className="editButton" onClick={() => {
                                                    setEditingAdmin(selectedAdmin);
                                                    setTempAdmin({ ...selectedAdmin });
                                                }}>
                                                    <FaEdit /> Modifier
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Popup suppression */}
                {showDeletePopup && (
                    <div className="modalOverlay">
                        <div className="modalContent modalSmall">
                            <div className="modalHeader">
                                <h3>Confirmer la suppression</h3>
                            </div>
                            <div className="modalBody">
                                <p>Êtes-vous sûr de vouloir supprimer cet équipement ?</p>
                            </div>
                            <div className="modalFooter">
                                <button className="cancelButton" onClick={cancelDelete}>Annuler</button>
                                <button className="deleteButton" onClick={confirmDelete}>Confirmer</button>
                            </div>
                        </div>
                    </div>
                )}

                <table className="table">
                    <thead>
                        <tr>
                            <th className="tableHeader">ID</th>
                            <th className="tableHeader">Désignation</th>
                            <th className="tableHeader">Num Série</th>
                            <th className="tableHeader">Marque</th>
                            <th className="tableHeader">Service</th>
                            <th className="tableHeader">Modèle</th>
                            <th className="tableHeader">Date</th>
                            <th className="tableHeader">Status</th>
                            <th className="tableHeader">Contrat</th>
                            <th className="tableHeader actionsHeader">
                                <div className="actionsHeaderInner">
                                    Actions
                                    <FaEllipsisV className="ellipsisIcon" />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.filter(d => d.numero_de_serie.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((d, i) => (
                                <tr key={i} className="tableRow">
                                    <td className="tableCell">{d.id}</td>
                                    <td className="tableCell">{d.designation}</td>
                                    <td className="tableCell">{d.numero_de_serie}</td>
                                    <td className="tableCell">{d.marque}</td>
                                    <td className="tableCell">{d.service}</td>
                                    <td className="tableCell">{d.modele}</td>
                                    <td className="tableCell">{formatDate(d.date)}</td>
                                    <td className="tableCell">{d.status}</td>
                                    <td className="tableCell">{d.contrat}</td>
                                    <td className="tableCell actions">
                                        <div className="actions">
                                            <button className="viewButton" onClick={() => handleViewDetails(d)} title="Voir détails">
                                                <FaEye />
                                            </button>
                                            {can('equipements', 'delete') && (
                                                <button className="deleteButton" onClick={() => handleDelete(d.id)} title="Supprimer">
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        {data.filter(d => d.numero_de_serie.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                            <tr>
                                <td colSpan="10" className="emptyRow">Aucun équipement trouvé</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Admins;