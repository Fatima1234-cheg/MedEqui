import React from "react";
import { useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import { useAuth } from "./AuthContext";
import "./Forbidden.css";

function Forbidden() {
    const navigate = useNavigate();
    const { can } = useAuth();
    const home = ['dashboard', 'equipements', 'maintenance', 'rapports', 'utilisateurs']
        .find(module => can(module, 'view'));

    return (
        <div className="forbidden-wrapper">
            <div className="forbidden-box">
                <div className="forbidden-icon"><FaLock /></div>
                <h1>Accès refusé</h1>
                <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
                <button onClick={() => navigate(`/${home || 'login'}`, { replace: true })}>Retour à mon espace</button>
            </div>
        </div>
    );
}

export default Forbidden;