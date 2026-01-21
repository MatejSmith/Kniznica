import { useState, useContext, useEffect } from "react";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login, token } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            navigate("/home");
        }
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        
        if (identifier.length < 3) {
            setError("Email alebo užívateľské meno musí mať aspoň 3 znaky.");
            return;
        }
        if (password.length < 6) {
            setError("Heslo musí mať aspoň 6 znakov.");
            return;
        }

        try {
            const res = await api.post("/auth/login", { identifier, password });
            login(res.data.token);
            navigate("/home");
        } catch (err) {
            setError(err.response?.data?.error || "Nesprávne prihlasovacie údaje");
        }
    };

    return (
        <div className="container mt-5 login-page">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-lg border-0 rounded-3">
                        <div className="card-body p-5">
                            <h2 className="text-center mb-4 fw-bold text-secondary">Prihlásenie</h2>
                            {error && <div className="alert alert-danger text-center" role="alert">{error}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label text-muted">Email alebo Užívateľské meno</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        required
                                        placeholder="email@example.com alebo username"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label text-muted">Heslo</label>
                                    <input
                                        type="password"
                                        className="form-control form-control-lg"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="********"
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary btn-lg w-100">Prihlásiť sa</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Login;
