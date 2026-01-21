import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import "./MyReservations.css";

const MyReservations = () => {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const fetchReservations = async () => {
        try {
            const res = await api.get("/books/mine", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReservations(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching reservations:", err);
            setError("Nepodarilo sa načítať rezervácie.");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        fetchReservations();
    }, [token, navigate]);

    const handleCancelReservation = async (bookId) => {
        if (!window.confirm("Naozaj chcete zrušiť túto rezerváciu?")) return;

        try {
            await api.delete(`/books/${bookId}/reserve`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage("Rezervácia bola úspešne zrušená.");
            fetchReservations();
        } catch (err) {
            console.error("Error canceling reservation:", err);
            setError("Nepodarilo sa zrušiť rezerváciu.");
        }
    };

    if (loading) return <div className="text-center mt-5">Načítavam rezervácie...</div>;

    return (
        <div className="container mt-5 my-reservations">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">Moje rezervácie</h2>
                <span className="badge bg-primary rounded-pill px-3 py-2">
                    {reservations.length} {reservations.length === 1 ? 'Aktívna' : (reservations.length >= 2 && reservations.length <= 4 ? 'Aktívne' : 'Aktívnych')}
                </span>
            </div>

            {error && <div className="alert alert-danger shadow-sm mb-4"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</div>}
            {message && <div className="alert alert-success shadow-sm mb-4"><i className="bi bi-check-circle-fill me-2"></i>{message}</div>}

            {reservations.length === 0 ? (
                <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
                    <div className="mb-4">
                        <i className="bi bi-book-half display-1 text-light"></i>
                    </div>
                    <h4>Zatiaľ nemáte žiadne rezervácie</h4>
                    <p className="text-muted">Vyberte si knihu v našom zozname a rezervujte si ju.</p>
                    <button className="btn btn-primary mt-3 px-4 py-2 fw-bold" onClick={() => navigate("/home")}>
                        Prezerať knihy
                    </button>
                </div>
            ) : (
                <div className="row row-cols-1 row-cols-lg-2 g-4">
                    {reservations.map((res) => (
                        <div className="col" key={res.reservation_id}>
                            <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden reservation-card">
                                <div className="row g-0 h-100">
                                    <div className="col-4">
                                        <img
                                            src={res.cover_image || 'https://via.placeholder.com/150x225?text=Kniha'}
                                            alt={res.title}
                                            className="img-fluid h-100 w-100"
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div className="col-8">
                                        <div className="card-body d-flex flex-column h-100 p-4">
                                            <div className="mb-auto">
                                                <h5 className="card-title fw-bold mb-1">{res.title}</h5>
                                                <p className="card-text text-muted small mb-3">{res.author}</p>
                                                <div className="text-muted small">
                                                    <i className="bi bi-calendar3 me-2"></i>
                                                    Rezervované: {new Date(res.reservation_date).toLocaleDateString('sk-SK')}
                                                </div>
                                            </div>
                                            <div className="mt-4 d-flex gap-2">
                                                <button
                                                    className="btn btn-outline-primary btn-sm px-3 fw-bold"
                                                    onClick={() => navigate(`/books/${res.book_id}`)}
                                                >
                                                    Detail
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm px-3 fw-bold"
                                                    onClick={() => handleCancelReservation(res.book_id)}
                                                >
                                                    Zrušiť
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyReservations;
