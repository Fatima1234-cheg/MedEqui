import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./Login";
import { Workspace, Dashboard } from "./Workspace";
import Maintenance from "./Maintenance";
import Rapport from "./Rapport";
import Utilisateur from "./Utilisateur";
import Admins from "./Admins";
import Forbidden from "./Forbidden"; // petite page 403

function AppRoutes() {
    const { user, logout, can } = useAuth();
    const homeRoute = can('dashboard') ? '/dashboard' : '/equipements';

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to={homeRoute} replace /> : <Login />} />

            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Workspace onLogout={logout} />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/dashboard" replace />} />

                <Route path="dashboard" element={
                    <ProtectedRoute module="dashboard">
                        <Dashboard />
                    </ProtectedRoute>
                } />

                <Route path="equipements" element={
                    <ProtectedRoute module="equipements">
                        <Admins />
                    </ProtectedRoute>
                } />

                <Route path="maintenance" element={
                    <ProtectedRoute module="maintenance">
                        <Maintenance />
                    </ProtectedRoute>
                } />

                <Route path="rapports" element={
                    <ProtectedRoute module="rapports">
                        <Rapport />
                    </ProtectedRoute>
                } />

                <Route path="utilisateurs" element={
                    <ProtectedRoute module="utilisateurs">
                        <Utilisateur />
                    </ProtectedRoute>
                } />
            </Route>

            <Route path="/forbidden" element={<Forbidden />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}