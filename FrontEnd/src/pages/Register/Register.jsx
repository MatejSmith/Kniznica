import { useState, useContext, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Register.css";

const Register = () => {
    const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });
    const [errors, setErrors] = useState([]);
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);

    useEffect(() => {
        if (token) {
            navigate("/home");
        }
    }, [token, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);

        // Klientska validácia
        const localErrors = [];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            localErrors.push("Neplatný formát emailu.");
        }
        if (formData.email.length > 254) {
            localErrors.push("Email je príliš dlhý (maximum 254 znakov).");
        }
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

        if (localErrors.length > 0) {
            setErrors(localErrors);
            return;
        }

        try {
            await api.post("/auth/register", {
                email: formData.email,
                password: formData.password
            });
            navigate("/login");
        } catch (err) {
            // Podpora pre nové pole errors zo servera
            if (Array.isArray(err.response?.data?.errors)) {
                setErrors(err.response.data.errors);
            } else {
                setErrors([err.response?.data?.error || "Chyba pri registrácii"]);
            }
        }
    };

    return (
        <div className="container mt-5 register-page">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow-lg border-0 rounded-3">
                        <div className="card-body p-5">
                            <h2 className="text-center mb-4 fw-bold text-secondary">Registrácia</h2>
                            {errors.length > 0 && (
                                <div className="alert alert-danger text-center" role="alert">
                                    <ul className="mb-0" style={{ listStyle: "none", padding: 0 }}>
                                        {errors.map((err, idx) => (
                                            <li key={idx}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label text-muted">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control form-control-lg"
                                        required
                                        maxLength={254}
                                        onChange={handleChange}
                                        placeholder="name@example.com"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted">Heslo</label>
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control form-control-lg"
                                        required
                                        onChange={handleChange}
                                        placeholder="Min. 6 znakov, veľké/malé písmeno, číslo"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label text-muted">Potvrdenie hesla</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className="form-control form-control-lg"
                                        required
                                        onChange={handleChange}
                                        placeholder="Zopakujte heslo"
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary btn-lg w-100">Registrovať sa</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
