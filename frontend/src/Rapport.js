import React, { useEffect, useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import { apiFetch } from './api';
import './Rapport.css';

const Rapport = () => {
    const imprimerPage = () => {
        window.print();
    };

    const initialRapport = {
        nom: '',
        adresse: '',
        telephone: '',
        email: '',
        type: '',
        contrat: '',
        date_demande: '',
        date_debut: '',
        date_fin: '',
        marque: '',
        modele: '',
        type_equipement: '',
        service: '',
        garantie: '',
        description_demande: '',
        intervenant: '',
        diagnostic: '',
        actions_realisees: ''
    };

    const [rapport, setRapport] = useState(initialRapport);
    const [savedReports, setSavedReports] = useState([]);
    const [reportsError, setReportsError] = useState('');

    useEffect(() => {
        apiFetch('/api/rapport')
            .then(response => {
                if (!response.ok) throw new Error('Historique des rapports indisponible.');
                return response.json();
            })
            .then(setSavedReports)
            .catch(error => setReportsError(error.message));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRapport(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await apiFetch('/api/rapport', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...rapport,
                    date_debut: rapport.date_debut || null,
                    date_fin: rapport.date_fin || null
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Erreur inconnue");

            alert("Rapport enregistré avec succès !");
            setSavedReports(current => [data, ...current]);
            setRapport(initialRapport);
        } catch (error) {
            alert(error.message);
            console.error("Erreur :", error);
        }
    };

    return (
        <div className="rapport">
            <div className="rapport-container">
                <h1>RAPPORT D'INTERVENTION</h1>

                <div className="main-info">
                    <div className="company-info">
                        <h2>MedEquip</h2>
                        <div><FaMapMarkerAlt className="icon" /> 126 Hurontario ST.</div>
                        <div><FaPhone className="icon" /> 705.444.1700</div>
                        <div>
                            <FaEnvelope className="icon" />
                            <a href="mailto:Info@collingwoodortho.com">Info@collingwoodortho.com</a>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="form-container">
                        {/* ===== SECTION 1 : Client + Intervention ===== */}
                        <div className="form-section">
                            <div className="section-block">
                                <h3>Informations sur le client</h3>
                                <div className="form-group">
                                    <label htmlFor="nom">Nom :</label>
                                    <input type="text" id="nom" name="nom"
                                        value={rapport.nom} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="adresse">Adresse :</label>
                                    <input type="text" id="adresse" name="adresse"
                                        value={rapport.adresse} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="telephone">Téléphone :</label>
                                    <input type="tel" id="telephone" name="telephone"
                                        value={rapport.telephone} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Mail :</label>
                                    <input type="email" id="email" name="email"
                                        value={rapport.email} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="section-block">
                                <h3>Détails de l'intervention</h3>
                                <div className="form-group">
                                    <label htmlFor="type">Type :</label>
                                    <input type="text" id="type" name="type"
                                        placeholder="Corrective / Préventive..."
                                        value={rapport.type} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="contrat">Contrat :</label>
                                    <input type="text" id="contrat" name="contrat"
                                        placeholder="Sous contrat / Hors contrat"
                                        value={rapport.contrat} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="date_demande">Date de demande :</label>
                                    <input type="date" id="date_demande" name="date_demande"
                                        value={rapport.date_demande} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="date_debut">Date de début :</label>
                                    <input type="date" id="date_debut" name="date_debut"
                                        value={rapport.date_debut} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="date_fin">Date de fin :</label>
                                    <input type="date" id="date_fin" name="date_fin"
                                        value={rapport.date_fin} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {/* ===== SECTION 2 : Équipement + Descriptions ===== */}
                        <div className="form-section">
                            <div className="section-block">
                                <h3>Identification de l'équipement</h3>
                                <div className="form-group">
                                    <label htmlFor="marque">Marque :</label>
                                    <input type="text" id="marque" name="marque"
                                        value={rapport.marque} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="modele">Modèle :</label>
                                    <input type="text" id="modele" name="modele"
                                        value={rapport.modele} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="type_equipement">Type :</label>
                                    <input type="text" id="type_equipement" name="type_equipement"
                                        value={rapport.type_equipement} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="service">Service :</label>
                                    <input type="text" id="service" name="service"
                                        value={rapport.service} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="garantie">Garantie :</label>
                                    <select id="garantie" name="garantie"
                                        value={rapport.garantie} onChange={handleChange} required>
                                        <option value="">-- Choisir --</option>
                                        <option value="OUI">OUI</option>
                                        <option value="NON">NON</option>
                                    </select>
                                </div>
                            </div>

                            <div className="section-block">
                                <h3>Description de la demande</h3>
                                <textarea name="description_demande"
                                    value={rapport.description_demande}
                                    onChange={handleChange} required />
                            </div>

                            <div className="section-block full-width">
                                <h3>Description de l'intervention</h3>
                                <div className="form-group">
                                    <label htmlFor="intervenant">Intervenant(s) :</label>
                                    <input type="text" id="intervenant" name="intervenant"
                                        value={rapport.intervenant} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="diagnostic">Diagnostic :</label>
                                    <input type="text" id="diagnostic" name="diagnostic"
                                        value={rapport.diagnostic} onChange={handleChange} required />
                                </div>
                                <div className="form-group form-group-textarea">
                                    <label htmlFor="actions_realisees">Actions réalisées :</label>
                                    <textarea id="actions_realisees" name="actions_realisees"
                                        value={rapport.actions_realisees}
                                        onChange={handleChange} required />
                                </div>
                            </div>
                        </div>

                        {/* ===== BOUTONS ===== */}
                        <div className="btn no-print">
                            <button type="submit" className="btnSave">Enregistrer</button>
                            <button type="button" className="btnPrint" onClick={imprimerPage}>
                                Imprimer
                            </button>
                        </div>
                    </form>

                    <section className="report-history no-print">
                        <div className="report-history-heading">
                            <div><p className="eyebrow">ARCHIVES</p><h2>Rapports enregistrés</h2></div>
                            <span>{savedReports.length} rapport{savedReports.length === 1 ? '' : 's'}</span>
                        </div>
                        {reportsError ? <div className="notice notice-error" role="alert">{reportsError}</div> : (
                            <div className="report-history-table-wrap">
                                <table className="data-table">
                                    <thead><tr><th>Intervention</th><th>Équipement</th><th>Service</th><th>Intervenant</th><th>Date de demande</th></tr></thead>
                                    <tbody>
                                        {savedReports.map(report => <tr key={report.id}>
                                            <td><strong>{report.type}</strong><small>{report.nom} · {report.contrat}</small></td>
                                            <td>{report.marque} {report.modele}<small>{report.type_equipement}</small></td>
                                            <td>{report.service}</td>
                                            <td>{report.intervenant}</td>
                                            <td>{report.date_demande ? new Date(`${String(report.date_demande).slice(0, 10)}T12:00:00`).toLocaleDateString('fr-FR') : '—'}</td>
                                        </tr>)}
                                        {savedReports.length === 0 && <tr><td colSpan="5" className="report-history-empty">Aucun rapport archivé pour le moment.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Rapport;