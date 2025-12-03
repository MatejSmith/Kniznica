import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const { token, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await axios.get("http://localhost:3000/api/auth/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfile(res.data);
            } catch (err) {
                logout();
                navigate("/login");
            }
        };

        fetchProfile();
    }, [token, navigate, logout]);

    const handleDelete = async () => {
        if (window.confirm("Naozaj chcete zmazať svoj účet?")) {
            try {
                await axios.delete("http://localhost:3000/api/auth/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                logout();
                alert("Účet bol zmazaný.");
            } catch (err) {
                alert("Chyba pri mazaní účtu.");
            }
        }
    };

    if (!profile) return <div className="text-center mt-5">Načítavam...</div>;

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow border-0">
                        <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
                            <h2 className="text-center fw-bold text-secondary">Vitajte v profile</h2>
                        </div>
                        <div className="card-body p-4">
                            <div className="alert alert-info d-flex align-items-center" role="alert">
                                <i className="bi bi-person-circle me-2 fs-4"></i>
                                <div>
                                    <strong>Prihlásený používateľ:</strong> {profile.email}
                                </div>
                            </div>

                            <div className="list-group list-group-flush mb-4">
                                <div className="list-group-item d-flex justify-content-between align-items-center">
                                    <span className="text-muted">Rola</span>
                                    <span className="badge bg-secondary rounded-pill">{profile.role}</span>
                                </div>
                                <div className="list-group-item d-flex justify-content-between align-items-center">
                                    <span className="text-muted">Dátum registrácie</span>
                                    <span>{new Date(profile.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <hr className="my-4" />

                            <h4 className="mb-3 text-secondary">Správa účtu</h4>
                            <p className="text-muted mb-4">Tu môžete spravovať svoje nastavenia.</p>

                            <button onClick={handleDelete} className="btn btn-danger w-100">
                                Zmazať účet (CRUD - Delete)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;