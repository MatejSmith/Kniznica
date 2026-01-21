import { useState, useEffect, useContext } from "react";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
    const { token } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [originalData, setOriginalData] = useState({});
    const [errors, setErrors] = useState([]);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setLoading(false);
            navigate("/login");
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await api.get("/auth/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const { username, email } = res.data;
                setFormData({ ...formData, username, email });
                setOriginalData({ username, email });
                setLoading(false);
            } catch (err) {
                console.error("Error fetching profile:", err);
                setErrors(["Nepodarilo sa načítať údaje profilu."]);
                setLoading(false);
            }
        };

        if (token) {
            fetchProfile();
        }
    }, [token]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        setSuccess(null);

        const localErrors = [];

        // Validácia emailu
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            localErrors.push("Neplatný formát emailu.");
        }

        // Validácia užívateľského mena
        if (formData.username && (formData.username.length < 3 || formData.username.length > 50)) {
            localErrors.push("Užívateľské meno musí mať 3 až 50 znakov.");
        }

        // Validácia hesla
        if (formData.password) {
            if (formData.password !== formData.confirmPassword) {
                localErrors.push("Heslá sa nezhodujú!");
            }
            if (formData.password.length < 6) {
                localErrors.push("Heslo musí mať aspoň 6 znakov.");
            }
            if (!/[A-Z]/.test(formData.password)) {
                localErrors.push("Heslo musí obsahovať aspoň jedno veľké písmeno.");
            }
            if (!/[a-z]/.test(formData.password)) {
                localErrors.push("Heslo musí obsahovať aspoň jedno malé písmeno.");
            }
            if (!/[0-9]/.test(formData.password)) {
                localErrors.push("Heslo musí obsahovať aspoň jedno číslo.");
            }
        }

        if (localErrors.length > 0) {
            setErrors(localErrors);
            return;
        }

        // Zistiť zmeny
        const updates = {};
        if (formData.username !== originalData.username) updates.username = formData.username;
        if (formData.email !== originalData.email) updates.email = formData.email;
        if (formData.password) updates.password = formData.password;

        if (Object.keys(updates).length === 0) {
            setErrors(["Neboli vykonané žiadne zmeny."]);
            return;
        }

        try {
            const res = await api.put("/auth/profile", updates, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess(res.data.message);
            setOriginalData({ username: formData.username, email: formData.email });
            setFormData({ ...formData, password: "", confirmPassword: "" });
        } catch (err) {
            if (Array.isArray(err.response?.data?.errors)) {
                setErrors(err.response.data.errors);
            } else {
                setErrors([err.response?.data?.error || "Chyba pri aktualizácii profilu."]);
            }
        }
    };

    if (loading) return <div className="text-center mt-5">Načítavam profil...</div>;

    return (
        <div className="container mt-5 profile-page">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                        <div className="card-header bg-primary text-white p-4 text-center">
                            <div className="profile-avatar mb-3">
                                <i className="bi bi-person-circle display-1"></i>
                            </div>
                            <h2 className="fw-bold mb-0">Môj Profil</h2>
                            <p className="opacity-75 mb-0">Správa osobných údajov</p>
                        </div>
                        <div className="card-body p-5">
                            {errors.length > 0 && (
                                <div className="alert alert-danger shadow-sm mb-4">
                                    <ul className="mb-0 list-unstyled">
                                        {errors.map((err, idx) => (
                                            <li key={idx}><i className="bi bi-exclamation-triangle-fill me-2"></i>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {success && (
                                <div className="alert alert-success shadow-sm mb-4">
                                    <i className="bi bi-check-circle-fill me-2"></i>{success}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="form-label text-muted fw-bold small text-uppercase">Užívateľské meno</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0"><i className="bi bi-person text-primary"></i></span>
                                        <input
                                            type="text"
                                            name="username"
                                            className="form-control bg-light border-0"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label text-muted fw-bold small text-uppercase">Email</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0"><i className="bi bi-envelope text-primary"></i></span>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control bg-light border-0"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <hr className="my-5 opacity-25" />
                                <h5 className="fw-bold mb-4">Zmena hesla <small className="text-muted fw-normal">(voliteľné)</small></h5>

                                <div className="mb-4">
                                    <label className="form-label text-muted fw-bold small text-uppercase">Nové Heslo</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0"><i className="bi bi-lock text-primary"></i></span>
                                        <input
                                            type="password"
                                            name="password"
                                            className="form-control bg-light border-0"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Zadajte nové heslo"
                                        />
                                    </div>
                                </div>

                                <div className="mb-5">
                                    <label className="form-label text-muted fw-bold small text-uppercase">Potvrdenie nového hesla</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0"><i className="bi bi-shield-check text-primary"></i></span>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            className="form-control bg-light border-0"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Zopakujte nové heslo"
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary btn-lg w-100 shadow-sm py-3 fw-bold">
                                    Uložiť zmeny
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
