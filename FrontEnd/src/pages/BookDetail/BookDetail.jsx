import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import "./BookDetail.css";

const BookDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [isReserved, setIsReserved] = useState(false);

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchBook = async () => {
            try {
                const res = await api.get(`/books/${id}`);
                setBook(res.data);

                if (token) {
                    const resReservation = await api.get(`/books/${id}/reservation`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setIsReserved(resReservation.data.reserved);
                }

                setLoading(false);
            } catch (err) {
                console.error("Error fetching book:", err);
                setError("Nepodarilo sa načítať detaily knihy.");
                setLoading(false);
            }
        };

        fetchBook();
    }, [id, token]);

    const handleReserve = async () => {
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const res = await api.post(`/books/${id}/reserve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(res.data.message);
            setIsReserved(true);
            // Refresh book data to update available copies
            const updatedBook = await api.get(`/books/${id}`);
            setBook(updatedBook.data);
        } catch (err) {
            setError(err.response?.data?.error || "Chyba pri rezervácii.");
        }
    };

    const handleCancelReservation = async () => {
        try {
            const res = await api.delete(`/books/${id}/reserve`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(res.data.message);
            setIsReserved(false);
            // Refresh book data
            const updatedBook = await api.get(`/books/${id}`);
            setBook(updatedBook.data);
        } catch (err) {
            setError(err.response?.data?.error || "Chyba pri rušení rezervácie.");
        }
    };

    if (loading) return <div className="text-center mt-5">Načítavam...</div>;
    if (error && !book) return <div className="container mt-4 alert alert-danger">{error}</div>;
    if (!book) return <div className="container mt-4 alert alert-warning">Kniha nebola nájdená.</div>;

    return (
        <div className="container mt-4 book-detail">
            <button className="btn btn-outline-secondary mb-4" onClick={() => navigate(-1)}>
                &lsaquo; Späť
            </button>

            <div className="card shadow-lg border-0 overflow-hidden">
                <div className="row g-0">
                    <div className="col-md-4 bg-light d-flex align-items-center justify-content-center p-4">
                        {book.cover_image ? (
                            <img
                                src={book.cover_image}
                                className="img-fluid rounded shadow"
                                alt={book.title}
                                style={{ maxHeight: '450px', objectFit: 'contain' }}
                            />
                        ) : (
                            <div className="text-muted text-center">
                                <i className="bi bi-book fs-1 d-block mb-2"></i>
                                Žiadny obrázok
                            </div>
                        )}
                    </div>
                    <div className="col-md-8">
                        <div className="card-body p-4 p-lg-5">
                            {message && <div className="alert alert-success">{message}</div>}
                            {error && <div className="alert alert-danger">{error}</div>}

                            <h1 className="display-5 fw-bold mb-2">{book.title}</h1>
                            <h3 className="text-muted mb-4">{book.author}</h3>

                            <hr className="my-4" />

                            <div className="mb-4">
                                <h5 className="fw-bold">Popis</h5>
                                <p className="lead text-muted">
                                    {book.description || "Tento titul nemá zadaný popis."}
                                </p>
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-sm-6">
                                    <div className="p-3 bg-light rounded">
                                        <small className="text-muted d-block">ISBN</small>
                                        <span className="fw-bold">{book.isbn}</span>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="p-3 bg-light rounded">
                                        <small className="text-muted d-block">Dostupnosť</small>
                                        <span className={`fw-bold ${book.available_copies > 0 ? 'text-success' : 'text-danger'}`}>
                                            {book.available_copies} / {book.total_copies} kusov
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="d-grid gap-2 d-md-flex justify-content-md-start">
                                {isReserved ? (
                                    <button
                                        onClick={handleCancelReservation}
                                        className="btn btn-danger btn-lg px-5 py-3 shadow"
                                    >
                                        Zrušiť rezerváciu
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleReserve}
                                        className="btn btn-primary btn-lg px-5 py-3 shadow"
                                        disabled={book.available_copies <= 0}
                                    >
                                        {book.available_copies > 0 ? 'Rezervovať knihu' : 'Momentálne nedostupná'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetail;
