import { useEffect, useMemo, useState } from 'react';
import { FaCalendarPlus, FaSearch, FaTimes, FaWrench } from 'react-icons/fa';
import { useAuth } from './AuthContext';
import { apiFetch } from './api';
import './Workspace.css';

const emptyOrder = { title: '', equipment_id: '', assigned_to_user_id: '', type: 'Préventive', priority: 'Normale', status: 'Planifiée', assigned_to: '', due_date: '', notes: '' };

function displayDate(value) {
    if (!value) return '—';
    return new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Maintenance() {
    const { can } = useAuth();
    const [orders, setOrders] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [assignees, setAssignees] = useState([]);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('Toutes');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyOrder);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [orderResponse, equipmentResponse, assigneeResponse] = await Promise.all([
                apiFetch('/maintenance'),
                apiFetch('/equipements'),
                apiFetch('/maintenance/assignees')
            ]);
            const failedResponse = [orderResponse, equipmentResponse, assigneeResponse].find(response => !response.ok);
            if (failedResponse) {
                const detail = failedResponse.status === 403
                    ? 'Ton rôle ne permet pas de consulter toutes les données requises.'
                    : `Le serveur a répondu HTTP ${failedResponse.status}.`;
                throw new Error(`Impossible de charger le planning de maintenance. ${detail}`);
            }
            const [orderData, equipmentData, assigneeData] = await Promise.all([
                orderResponse.json(), equipmentResponse.json(), assigneeResponse.json()
            ]);
            setOrders(orderData);
            setEquipment(equipmentData);
            setAssignees(assigneeData);
        } catch (loadError) {
            setError(loadError.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const filteredOrders = useMemo(() => orders.filter(order => {
        const matchesFilter = filter === 'Toutes' || order.status === filter;
        const searchable = `${order.title} ${order.equipment_name || ''} ${order.assigned_to || ''}`.toLowerCase();
        return matchesFilter && searchable.includes(query.toLowerCase());
    }), [orders, filter, query]);

    const updateField = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));

    const submitOrder = async event => {
        event.preventDefault();
        setError('');
        try {
            const response = await apiFetch('/maintenance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, equipment_id: form.equipment_id || null })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Enregistrement impossible.');
            setOrders(current => [result, ...current]);
            setForm(emptyOrder);
            setShowForm(false);
        } catch (submitError) {
            setError(submitError.message);
        }
    };

    const changeStatus = async (order, status) => {
        try {
            const response = await apiFetch(`/maintenance/${order.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...order, status })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Mise à jour impossible.');
            setOrders(current => current.map(item => item.id === order.id ? result : item));
        } catch (updateError) {
            setError(updateError.message);
        }
    };

    return (
        <section className="maintenance-page">
            <div className="page-heading">
                <div><p className="eyebrow">ORDRES DE TRAVAIL</p><h1>Suivi de maintenance</h1><p className="page-subtitle">Planifiez les préventifs et suivez les interventions correctives.</p></div>
                {can('maintenance', 'create') && <button className="primary-action" onClick={() => { setError(''); setShowForm(true); }}><FaCalendarPlus /> Nouvelle intervention</button>}
            </div>
            {error && <div className="notice notice-error" role="alert">{error}</div>}
            <div className="maintenance-summary"><div><span className="summary-label">Toutes</span><strong>{orders.length}</strong></div><div><span className="summary-label">Planifiées</span><strong>{orders.filter(item => item.status === 'Planifiée').length}</strong></div><div><span className="summary-label">En cours</span><strong>{orders.filter(item => item.status === 'En cours').length}</strong></div><div><span className="summary-label">Terminées</span><strong>{orders.filter(item => item.status === 'Terminée').length}</strong></div></div>
            <div className="maintenance-toolbar"><div className="maintenance-search"><FaSearch /><input aria-label="Rechercher une intervention" placeholder="Rechercher par intervention, équipement, technicien…" value={query} onChange={event => setQuery(event.target.value)} /></div><div className="filter-segment" role="group" aria-label="Filtrer par statut">{['Toutes', 'Planifiée', 'En cours', 'Terminée'].map(option => <button key={option} className={filter === option ? 'selected' : ''} onClick={() => setFilter(option)}>{option}</button>)}</div></div>
            <div className="maintenance-table-wrap"><table className="data-table maintenance-table"><thead><tr><th>Intervention</th><th>Équipement</th><th>Type</th><th>Priorité</th><th>Échéance</th><th>Responsable</th><th>Statut</th></tr></thead><tbody>{filteredOrders.map(order => <tr key={order.id}><td><div className="work-order-title"><span className="work-order-icon"><FaWrench /></span><span><strong>{order.title}</strong><small>OT-{String(order.id).padStart(4, '0')}</small></span></div></td><td>{order.equipment_name || 'Non affecté'}</td><td>{order.type}</td><td><span className={`priority-pill priority-${String(order.priority).toLowerCase()}`}>{order.priority}</span></td><td>{displayDate(order.due_date)}</td><td>{order.assigned_to || 'À affecter'}</td><td><select aria-label={`Statut de ${order.title}`} disabled={!can('maintenance', 'edit')} className={`inline-status status-${String(order.status).toLowerCase().replaceAll(' ', '-')}`} value={order.status} onChange={event => changeStatus(order, event.target.value)}><option>Planifiée</option><option>En cours</option><option>Terminée</option><option>Annulée</option></select></td></tr>)}{!loading && filteredOrders.length === 0 && <tr><td colSpan="7" className="table-empty"><span className="empty-symbol"><FaCalendarPlus /></span><strong>{query || filter !== 'Toutes' ? 'Aucun résultat pour ces filtres' : 'Aucune intervention planifiée'}</strong><span>Créez un ordre de travail pour assurer le suivi du parc.</span></td></tr>}{loading && <tr><td colSpan="7" className="table-empty">Chargement du planning…</td></tr>}</tbody></table></div>
            {showForm && <div className="modal-backdrop" onClick={() => setShowForm(false)}><form className="work-order-modal" onSubmit={submitOrder} onClick={event => event.stopPropagation()}><div className="modal-heading"><div><p className="eyebrow">NOUVEL ORDRE DE TRAVAIL</p><h2>Planifier une intervention</h2></div><button type="button" className="icon-button" onClick={() => setShowForm(false)} aria-label="Fermer"><FaTimes /></button></div>{error && <div className="notice notice-error">{error}</div>}<label>Titre de l’intervention<input name="title" value={form.title} onChange={updateField} placeholder="Ex. Contrôle annuel du moniteur" required /></label><div className="form-grid"><label>Équipement<select name="equipment_id" value={form.equipment_id} onChange={updateField}><option value="">Non affecté</option>{equipment.map(item => <option key={item.id} value={item.id}>{item.designation} · {item.numero_de_serie}</option>)}</select></label><label>Type<select name="type" value={form.type} onChange={updateField}><option>Préventive</option><option>Corrective</option><option>Contrôle qualité</option><option>Installation</option></select></label><label>Priorité<select name="priority" value={form.priority} onChange={updateField}><option>Basse</option><option>Normale</option><option>Haute</option><option>Critique</option></select></label><label>Échéance<input type="date" name="due_date" value={form.due_date} onChange={updateField} required /></label><label>Responsable<select name="assigned_to_user_id" value={form.assigned_to_user_id} onChange={updateField}><option value="">À affecter plus tard</option>{assignees.map(person => <option key={person.id} value={person.id}>{person.prenom} {person.nom} · {person.role === 'ingenieur' ? 'Ingénieur biomédical' : 'Technicien'}</option>)}</select></label><label>Statut<select name="status" value={form.status} onChange={updateField}><option>Planifiée</option><option>En cours</option></select></label></div><label>Consignes / description<textarea name="notes" value={form.notes} onChange={updateField} rows="3" placeholder="Détails utiles pour l’intervention" /></label><div className="modal-actions"><button type="button" className="secondary-action" onClick={() => setShowForm(false)}>Annuler</button><button type="submit" className="primary-action">Enregistrer l’intervention</button></div></form></div>}
        </section>
    );
}
