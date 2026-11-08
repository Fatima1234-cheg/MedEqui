import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

// 👇 Rôles autorisés dans l'app
export const ROLES = {
    ADMIN: "admin",
    INGENIEUR: "ingenieur",
    TECHNICIEN: "technicien"
};

// 👇 Permissions par rôle (facile à étendre)
export const PERMISSIONS = {
    admin: {
        equipements: { view: true, create: true, edit: true, delete: true },
        utilisateurs: { view: true, create: true, edit: true, delete: true },
        maintenance: { view: true, create: true, edit: true, delete: true },
        rapports: { view: true, create: true, edit: true, delete: true },
        dashboard: { view: true }
    },
    ingenieur: {
        equipements: { view: true, create: true, edit: true, delete: false },
        utilisateurs: { view: false, create: false, edit: false, delete: false },
        maintenance: { view: true, create: true, edit: true, delete: false },
        rapports: { view: true, create: true, edit: true, delete: false },
        dashboard: { view: true }
    },
    technicien: {
        equipements: { view: true, create: false, edit: false, delete: false },
        utilisateurs: { view: false, create: false, edit: false, delete: false },
        maintenance: { view: true, create: false, edit: true, delete: false }, // peut modifier le statut
        rapports: { view: true, create: true, edit: false, delete: false },
        dashboard: { view: false }
    }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    // Restaurer la session au démarrage
    useEffect(() => {
        const stored = localStorage.getItem("medequi_user");
        const token = localStorage.getItem("medequi_token");
        if (stored && token) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                localStorage.removeItem("medequi_user");
                localStorage.removeItem("medequi_token");
            }
        } else {
            localStorage.removeItem("medequi_user");
            localStorage.removeItem("medequi_token");
        }
    }, []);

    const login = (userData, token) => {
        setUser(userData);
        localStorage.setItem("medequi_user", JSON.stringify(userData));
        localStorage.setItem("medequi_token", token);
    };

    const logout = () => {
        const token = localStorage.getItem("medequi_token");
        if (token) {
            fetch("http://localhost:8081/logout", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => {});
        }
        setUser(null);
        localStorage.removeItem("medequi_user");
        localStorage.removeItem("medequi_token");
    };

    // Vérifie si l'utilisateur a la permission
    const can = (module, action = "view") => {
        if (!user?.role) return false;
        const role = user.role.toLowerCase();
        return PERMISSIONS[role]?.[module]?.[action] === true;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, can }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
    return ctx;
}