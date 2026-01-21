import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Navigation = () => {
    const { token, logout } = useContext(AuthContext);

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm">
            <div className="container">
                <Link className="navbar-brand fw-bold text-primary" to="/home">Online Knižnica</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/home">
                                <i className="bi bi-book me-1"></i>Knihy
                            </Link>
                        </li>
                    </ul>
                    <ul className="navbar-nav align-items-center">
                        {!token ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">Prihlásenie</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="btn btn-primary ms-lg-2" to="/register">Registrácia</Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link me-3" to="/my-reservations">
                                        <i className="bi bi-bookmark me-1"></i>Moje rezervácie
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link me-3" to="/profile">
                                        <i className="bi bi-person me-1"></i>Môj profil
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-outline-danger ms-lg-2" onClick={logout}>Odhlásiť</button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;