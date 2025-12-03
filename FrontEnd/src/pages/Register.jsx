import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

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
            await axios.post("http://localhost:3000/api/auth/register", {
                email: formData.email,
                password: formData.password
            });
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.error || "Chyba pri registrácii");
        }
    };

    return (
        <div className="main-container">
            <div className="custom-card col-md-6 mx-auto">
                <h2 className="card-title">Registrácia</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            required
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Heslo</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            required
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Potvrdenie hesla</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-control"
                            required
                            onChange={handleChange}
                        />
                    </div>
                    <button type="submit" className="btn btn-custom">Registrovať sa</button>
                </form>
            </div>
        </div>
    );
};

export default Register;