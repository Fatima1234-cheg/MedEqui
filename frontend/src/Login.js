import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "./AuthContext";
import "./Login.css";
import 'bootstrap/dist/css/bootstrap.min.css';

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlertMessage("");

        if (!email || !password) {
            setAlertMessage("Veuillez remplir tous les champs !");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post("http://localhost:8081/login", { email, password });

            // Le backend doit renvoyer : { id, nom, prenom, email, role }
            const { id, nom, prenom, role, token } = response.data;

            if (!role || !token) {
                setAlertMessage("Réponse de connexion invalide.");
                return;
            }

            // Stocker l'utilisateur + rôle globalement
            login({ id, nom, prenom, email, role }, token);

            const destination = role.toLowerCase() === 'technicien' ? '/equipements' : '/dashboard';
            navigate(destination, { replace: true });
        } catch (error) {
            setAlertMessage(
                error.response?.data?.error ||
                "Impossible de joindre le serveur. Vérifie que le backend est démarré."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="wrapper">
            {alertMessage && (
                <div className="alert-message" role="alert">
                    {alertMessage}
                </div>
            )}

            <div className="login-container">
                <div className="login-image">
                    <div className="image-overlay">
                        <h1 className="brand-title">MedEqui</h1>
                        <div className="brand-underline"></div>
                        <p className="brand-tagline">
                            Gestion de maintenance assistée par ordinateur
                        </p>
                    </div>
                    <img src="/logo.png" alt="MedEqui" className="imgmed" />
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-header">
                        <h2 className="title">Connexion</h2>
                        <p className="subtitle">Accédez à votre espace de gestion</p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email</label>
                        <div className="input-wrapper">
                            <span className="input-icon"><FaEnvelope /></span>
                            <input
                                type="email"
                                id="email"
                                className="form-input"
                                placeholder="votre.email@exemple.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Mot de passe</label>
                        <div className="input-wrapper">
                            <span className="input-icon"><FaLock /></span>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? "Connexion..." : "Se connecter"}
                    </button>

                    <p className="footer-text">
                        © {new Date().getFullYear()} MedEqui — Tous droits réservés
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Login;