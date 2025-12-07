import { useState, useContext, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
    const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });
    const [error, setError] = useState("");
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
        setError("");

        // Klientska validácia
        if (formData.password !== formData.confirmPassword) {
            setError("Heslá sa nezhodujú!");
            return;
        }
        if (formData.password.length < 6) {
            setError("Heslo musí mať aspoň 6 znakov.");
            return;
        }

        try {
            await api.post("/auth/register", {
                email: formData.email,
                password: formData.password
            });
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.error || "Chyba pri registrácii");
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow-lg border-0 rounded-3">
                        <div className="card-body p-5">
                            <h2 className="text-center mb-4 fw-bold text-secondary">Registrácia</h2>
                            {error && <div className="alert alert-danger text-center" role="alert">{error}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label text-muted">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control form-control-lg"
                                        required
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
                                        placeholder="Minimálne 6 znakov"
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