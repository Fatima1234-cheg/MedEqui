import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function ProtectedRoute({ module, action = "view", children }) {
    const { user, can } = useAuth();

    // Pas connecté → login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Connecté mais pas autorisé → redirection
    if (module && !can(module, action)) {
        return <Navigate to="/forbidden" replace />; // ou /dashboard
    }

    return children;
}

export default ProtectedRoute;