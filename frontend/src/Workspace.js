import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    FaBell, FaBoxes, FaCalendarCheck, FaChartLine,
    FaClipboardList, FaSignOutAlt, FaUsers
} from 'react-icons/fa';
import { useAuth } from './AuthContext';
import { apiFetch } from './api';
import './Workspace.css';

/* =========================================================
   LOGO MedEqui — SVG intégré
   ========================================================= */
function MedEquiLogo({ size = 44, variant = 'dark' }) {
    const isDark = variant === 'dark';
    const bg = isDark ? '#163a34' : '#ffffff';
    const accent = isDark ? '#c8f0d8' : '#247451';
    const line = isDark ? '#ffffff' : '#163a34';

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="MedEqui"
            role="img"
            style={{ flexShrink: 0 }}
        >
            {/* Fond arrondi */}
            <rect x="2" y="2" width="60" height="60" rx="14" fill={bg} />

            {/* Bouclier */}
            <path
                d="M32 10 L50 16 V34 C50 44 42 51 32 54 C22 51 14 44 14 34 V16 Z"
                fill="none"
                stroke={accent}
                strokeWidth="2.5"
                strokeLinejoin="round"
            />

            {/* Pulsation cardiaque */}
            <path
                d="M19 33 H26 L29 27 L33 39 L36 33 H45"
                fill="none"
                stroke={line}
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Point lumineux */}
            <circle cx="33" cy="18" r="2" fill={accent} />
        </svg>
    );
}

/* =========================================================
   NAVIGATION
   ========================================================= */
const navigation = [
    { to: '/dashboard',    label: "Vue d'ensemble",  icon: FaChartLine,     module: 'dashboard' },
    { to: '/equipements',  label: 'Équipements',     icon: FaBoxes,         module: 'equipements' },
    { to: '/maintenance',  label: 'Maintenance',     icon: FaCalendarCheck, module: 'maintenance' },
    { to: '/rapports',     label: 'Rapports',        icon: FaClipboardList, module: 'rapports' },
    { to: '/utilisateurs', label: 'Équipe',          icon: FaUsers,         module: 'utilisateurs' }
];

const titles = {
    '/dashboard': "Vue d'ensemble",
    '/equipements': 'Parc biomédical',
    '/maintenance': 'Suivi de maintenance',
    '/rapports': "Rapports d'intervention",
    '/utilisateurs': 'Équipe et accès'
};

/* =========================================================
   WORKSPACE (layout principal)
   ========================================================= */
export function Workspace({ onLogout }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, can } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    useEffect(() => {
        let active = true;
        const refreshNotifications = async () => {
            try {
                const response = await apiFetch('/notifications');
                if (!response.ok) return;
                const data = await response.json();
                if (active) setNotifications(data);
            } catch {
                // Notifications stay optional while the workspace loads.
            }
        };

        refreshNotifications();
        const interval = window.setInterval(refreshNotifications, 10000);
        return () => {
            active = false;
            window.clearInterval(interval);
        };
    }, [user?.id]);

    const visibleNav = navigation.filter(item => can(item.module, 'view'));

    const roleLabel = {
        admin: 'Administrateur',
        ingenieur: 'Ingénieur biomédical',
        technicien: 'Technicien'
    }[user?.role?.toLowerCase()] || 'Utilisateur';

    const initials = `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`.toUpperCase() || 'US';
    const unreadCount = notifications.filter(notification => !notification.read_at).length;

    const openNotification = async notification => {
        if (!notification.read_at) {
            const response = await apiFetch(`/notifications/${notification.id}/read`, { method: 'PATCH' });
            if (response.ok) {
                setNotifications(current => current.map(item => item.id === notification.id
                    ? { ...item, read_at: new Date().toISOString() }
                    : item));
            }
        }
        setNotificationsOpen(false);
        navigate(notification.link || '/maintenance');
    };

    return (
        <div className="workspace-shell">
            <aside className="workspace-sidebar">
                {/* ===== BRAND ===== */}
                <button className="workspace-brand" onClick={() => navigate('/dashboard')}>
                    <MedEquiLogo size={44} variant="dark" />
                    <span className="brand-text">
                        <strong>MedEqui</strong>
                        <small>GESTION BIOMÉDICALE</small>
                    </span>
                </button>

                <div className="sidebar-caption">ESPACE DE TRAVAIL</div>

                <nav className="workspace-nav">
                    {visibleNav.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) => `workspace-nav-link${isActive ? ' active' : ''}`}
                        >
                            <Icon aria-hidden="true" />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <div className="workspace-user">
                        <div className="user-avatar">{initials}</div>
                        <div className="user-label">
                            <strong>{user?.prenom} {user?.nom}</strong>
                            <small>{roleLabel}</small>
                        </div>
                        <button
                            className="icon-button logout-button"
                            onClick={onLogout}
                            title="Déconnexion"
                        >
                            <FaSignOutAlt />
                        </button>
                    </div>
                </div>
            </aside>

            <main className="workspace-main">
                <header className="workspace-topbar">
                    <div className="breadcrumb">
                        <MedEquiLogo size={22} variant="light" />
                        <span>MedEqui</span>
                        <span className="breadcrumb-separator">/</span>
                        <strong>{titles[location.pathname] || 'Espace de travail'}</strong>
                    </div>
                    <div className="topbar-actions">
                        <span className="topbar-date">
                            {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full' }).format(new Date())}
                        </span>
                        <div className="notification-control">
                            <button
                                className={`icon-button notification-button${unreadCount ? ' has-unread' : ''}`}
                                aria-label={`Notifications${unreadCount ? `, ${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : ''}`}
                                aria-expanded={notificationsOpen}
                                aria-haspopup="dialog"
                                onClick={() => setNotificationsOpen(current => !current)}
                            >
                                <FaBell />
                                {unreadCount > 0 && <span className="notification-count">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                            </button>
                            {notificationsOpen && <section className="notification-panel" aria-label="Notifications reçues">
                                <div className="notification-panel-heading">
                                    <div><p className="eyebrow">ACTIVITÉ</p><h2>Notifications</h2></div>
                                    {unreadCount > 0 && <span>{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span>}
                                </div>
                                {notifications.length ? (
                                    <ul className="notification-list">
                                        {notifications.map(notification => <li key={notification.id} className={!notification.read_at ? 'unread' : ''}>
                                            <button onClick={() => openNotification(notification)}>
                                                <span className="notification-item-icon"><FaCalendarCheck /></span>
                                                <span className="notification-item-copy">
                                                    <strong>{notification.title}</strong>
                                                    <small>{notification.message}</small>
                                                    <time>{new Date(notification.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</time>
                                                </span>
                                                {!notification.read_at && <i className="unread-dot" />}
                                            </button>
                                        </li>)}
                                    </ul>
                                ) : (
                                    <div className="notification-empty"><FaBell /><strong>Aucune notification</strong><span>Les nouvelles interventions assignées apparaîtront ici.</span></div>
                                )}
                            </section>}
                        </div>
                    </div>
                </header>
                <div className="workspace-content"><Outlet /></div>
            </main>
        </div>
    );
}

/* =========================================================
   DASHBOARD
   ========================================================= */
export function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [equipment, setEquipment] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        Promise.all([apiFetch('/equipements'), apiFetch('/maintenance')])
            .then(async ([equipmentResponse, orderResponse]) => {
                if (!equipmentResponse.ok || !orderResponse.ok)
                    throw new Error('Les données du tableau de bord sont indisponibles.');
                const [equipmentData, orderData] = await Promise.all([
                    equipmentResponse.json(),
                    orderResponse.json()
                ]);
                setEquipment(equipmentData);
                setOrders(orderData);
            })
            .catch(error => setLoadError(error.message));
    }, []);

    const today = new Date().toISOString().slice(0, 10);
    const openOrders = orders.filter(order =>
        !['terminée', 'terminee', 'annulée'].includes(String(order.status).toLowerCase())
    );
    const lateOrders = openOrders.filter(order =>
        order.due_date && String(order.due_date).slice(0, 10) < today
    );
    const operational = equipment.filter(item =>
        !['hors service', 'en panne', 'indisponible'].includes(String(item.status || '').toLowerCase())
    ).length;
    const serviceCounts = equipment.reduce((counts, item) => {
        const service = item.service || 'Non affecté';
        counts[service] = (counts[service] || 0) + 1;
        return counts;
    }, {});
    const services = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return (
        <section className="dashboard-page">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">CENTRE HOSPITALIER · PARC TECHNIQUE</p>
                    <h1>Bonjour, {user?.prenom || 'équipe biomédicale'}</h1>
                    <p className="page-subtitle">Vue opérationnelle du parc et des interventions biomédicales.</p>
                </div>
                <button className="primary-action" onClick={() => navigate('/maintenance')}>
                    <FaCalendarCheck /> Planifier une intervention
                </button>
            </div>

            {loadError && (
                <div className="notice notice-error" role="alert">
                    {loadError} Vérifie que le backend fonctionne sur le port 8081.
                </div>
            )}

            <div className="metric-grid">
                <article className="metric-card metric-primary">
                    <div className="metric-top"><span>Équipements recensés</span><FaBoxes /></div>
                    <strong>{equipment.length}</strong>
                    <small>Appareils dans le parc</small>
                    <div className="metric-accent" />
                </article>
                <article className="metric-card">
                    <div className="metric-top"><span>Opérationnels</span><span className="metric-mark green">●</span></div>
                    <strong>{operational}</strong>
                    <small>Équipements disponibles</small>
                </article>
                <article className="metric-card">
                    <div className="metric-top"><span>Interventions ouvertes</span><FaCalendarCheck /></div>
                    <strong>{openOrders.length}</strong>
                    <small>Préventives et correctives</small>
                </article>
                <article className={`metric-card ${lateOrders.length ? 'metric-alert' : ''}`}>
                    <div className="metric-top"><span>En retard</span><span className="metric-mark coral">!</span></div>
                    <strong>{lateOrders.length}</strong>
                    <small>À traiter en priorité</small>
                </article>
            </div>

            <div className="dashboard-grid">
                <section className="panel service-panel">
                    <div className="panel-heading">
                        <div><p className="eyebrow">RÉPARTITION</p><h2>Équipements par service</h2></div>
                        <button className="text-action" onClick={() => navigate('/equipements')}>
                            Voir le parc <span>→</span>
                        </button>
                    </div>
                    {services.length ? (
                        <div className="service-list">
                            {services.map(([name, count], index) => (
                                <div className="service-row" key={name}>
                                    <div className="service-meta"><span>{name}</span><strong>{count}</strong></div>
                                    <div className="service-track">
                                        <i
                                            className={`service-fill fill-${index + 1}`}
                                            style={{ width: `${Math.max(8, count / equipment.length * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <span className="empty-symbol"><FaBoxes /></span>
                            <strong>Votre parc apparaîtra ici</strong>
                            <p>Ajoutez les premiers équipements biomédicaux pour suivre leur répartition.</p>
                            <button className="text-action" onClick={() => navigate('/equipements')}>
                                Ouvrir les équipements →
                            </button>
                        </div>
                    )}
                </section>

                <section className="panel attention-panel">
                    <div className="panel-heading">
                        <div><p className="eyebrow">À SURVEILLER</p><h2>Priorités de maintenance</h2></div>
                        <span className="priority-count">{lateOrders.length}</span>
                    </div>
                    {lateOrders.length ? (
                        <ul className="priority-list">
                            {lateOrders.slice(0, 4).map(order => (
                                <li key={order.id}>
                                    <span className="priority-indicator" />
                                    <div>
                                        <strong>{order.title}</strong>
                                        <small>
                                            {order.equipment_name || 'Équipement'} · échéance{' '}
                                            {new Date(`${String(order.due_date).slice(0, 10)}T12:00:00`)
                                                .toLocaleDateString('fr-FR')}
                                        </small>
                                    </div>
                                    <span className="priority-tag">En retard</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="calm-state">
                            <span>✓</span>
                            <div>
                                <strong>Aucun retard signalé</strong>
                                <p>Les interventions en retard apparaîtront ici.</p>
                            </div>
                        </div>
                    )}
                    <button className="panel-footer-action" onClick={() => navigate('/maintenance')}>
                        Consulter le planning <span>→</span>
                    </button>
                </section>

                <section className="panel recent-panel">
                    <div className="panel-heading">
                        <div><p className="eyebrow">ACTIVITÉ</p><h2>Interventions récentes</h2></div>
                        <button className="text-action" onClick={() => navigate('/maintenance')}>
                            Tout voir <span>→</span>
                        </button>
                    </div>
                    {orders.length ? (
                        <div className="recent-table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Intervention</th>
                                        <th>Équipement</th>
                                        <th>Échéance</th>
                                        <th>État</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.slice(0, 5).map(order => (
                                        <tr key={order.id}>
                                            <td>
                                                <strong>{order.title}</strong>
                                                <small>{order.type}</small>
                                            </td>
                                            <td>{order.equipment_name || '—'}</td>
                                            <td>
                                                {order.due_date
                                                    ? new Date(`${String(order.due_date).slice(0, 10)}T12:00:00`)
                                                        .toLocaleDateString('fr-FR')
                                                    : '—'}
                                            </td>
                                            <td><span className="status-pill">{order.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-inline">Aucune intervention enregistrée.</div>
                    )}
                </section>
            </div>
        </section>
    );
}