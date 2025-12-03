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
        <div className="main-container">
            <div className="custom-card">
                <h2 className="card-title">Vitajte v profile</h2>
                <div className="alert alert-info">
                    <strong>Prihlásený používateľ:</strong> {profile.email}
                </div>
                <p><strong>Rola:</strong> {profile.role}</p>
                <p><strong>Dátum registrácie:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>

                <hr />
                <h4>Správa účtu</h4>
                <p>Tu môžete spravovať svoje nastavenia.</p>
                <button onClick={handleDelete} className="btn btn-custom btn-delete">
                    Zmazať účet (CRUD - Delete)
                </button>
            </div>
        </div>
    );
};

export default Profile;