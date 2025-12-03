import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
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
        try {
            const res = await axios.post("http://localhost:3000/api/auth/login", { email, password });
            login(res.data.token);
            navigate("/home");
        } catch (err) {
            setError("Nesprávne meno alebo heslo");
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-lg border-0 rounded-3">
                        <div className="card-body p-5">
                            <h2 className="text-center mb-4 fw-bold text-secondary">Prihlásenie</h2>
                            {error && <div className="alert alert-danger text-center" role="alert">{error}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label text-muted">Email</label>
                                    <input
                                        type="email"
                                        className="form-control form-control-lg"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="name@example.com"
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