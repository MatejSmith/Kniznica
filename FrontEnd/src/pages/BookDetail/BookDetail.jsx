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
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [isReserved, setIsReserved] = useState(false);

    
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [reviewError, setReviewError] = useState(null);
    const [reviewSuccess, setReviewSuccess] = useState(null);

    const fetchBook = async () => {
        try {
            const res = await api.get(`/books/${id}`);
            setBook(res.data);

            
            if (token) {
                try {
                    const resReservation = await api.get(`/books/${id}/reservation`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setIsReserved(resReservation.data.reserved);
                } catch (err) {
                    console.error("Error checking reservation:", err);
                }
            }
        } catch (err) {
            console.error("Error fetching book:", err);
            setError("Nepodarilo sa načítať detaily knihy.");
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await api.get(`/reviews/${id}`);
            setReviews(res.data);
        } catch (err) {
            console.error("Error fetching reviews:", err);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchBook(), fetchReviews()]);
            setLoading(false);
        };

        loadData();
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
            fetchBook();
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
            fetchBook();
        } catch (err) {
            setError(err.response?.data?.error || "Chyba pri rušení rezervácie.");
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setReviewError(null);
        setReviewSuccess(null);

        if (!comment.trim()) {
            setReviewError("Komentár nemôže byť prázdny.");
            return;
        }

        try {
            await api.post("/reviews", {
                book_id: id,
                rating,
                comment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setReviewSuccess("Recenzia bola úspešne pridaná.");
            setComment("");
            setRating(5);
            fetchReviews();
            fetchBook();
        } catch (err) {
            setReviewError(err.response?.data?.error || "Chyba pri pridávaní recenzie.");
        }
    };

    if (loading) return <div className="text-center mt-5">Načítavam...</div>;
    if (error && !book) return <div className="container mt-4 alert alert-danger">{error}</div>;
    if (!book) return <div className="container mt-4 alert alert-warning">Kniha nebola nájdená.</div>;

    return (
        <div className="container mt-4 mb-5 book-detail">
            <button className="btn btn-outline-secondary mb-4" onClick={() => navigate(-1)}>
                &lsaquo; Späť
            </button>

            <div className="card shadow-lg border-0 overflow-hidden mb-5">
                <div className="row g-0">
                    <div className="col-md-4 bg-light d-flex align-items-center justify-content-center p-4">
                        {/* zobrazenie lokalneho obrazka je vygenerovany pomocou AI */}
                        {book.cover_image ? (
                            <img
                                src={
                                    book.cover_image.startsWith('/uploads')
                                        ? `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}${book.cover_image}`
                                        : book.cover_image
                                }
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
                            <h3 className="text-muted mb-3">{book.author}</h3>

                            <div className="mb-4 h5">
                                <span className="text-warning me-1">
                                    <i className={`bi bi-star${book.average_rating > 0 ? '-fill' : ''}`}></i>
                                </span>
                                <span className="fw-bold">{Number(book.average_rating).toFixed(1)}</span>
                                <span className="text-muted small ms-2">({book.review_count} {book.review_count === 1 ? 'recenzia' : (book.review_count >= 2 && book.review_count <= 4 ? 'recenzie' : 'recenzií')})</span>
                            </div>

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

                            
                            {token ? (
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
                            ) : (
                                <div className="alert alert-light border d-flex align-items-center">
                                    <i className="bi bi-info-circle me-2 text-primary"></i>
                                    <span>
                                        Pre rezerváciu knihy sa prosím <a href="/login" className="fw-bold">prihláste</a> alebo <a href="/register" className="fw-bold">zaregistrujte</a>.
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            
            <div className="reviews-section">
                <h2 className="fw-bold mb-4">Recenzie ({reviews.length})</h2>

                
                {token ? (
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-3">Pridať recenziu</h5>
                            {reviewError && <div className="alert alert-danger">{reviewError}</div>}
                            {reviewSuccess && <div className="alert alert-success">{reviewSuccess}</div>}

                            <form onSubmit={handleReviewSubmit}>
                                <div className="mb-3">
                                    <label className="form-label text-muted">Hodnotenie</label>
                                    <div className="rating-input h3" onMouseLeave={() => setHoverRating(0)}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <i
                                                key={star}
                                                className={`bi bi-star${star <= (hoverRating || rating) ? '-fill' : ''} text-warning me-2`}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                            ></i>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted">Komentár</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Napíšte vašu recenziu..."
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-dark px-4 py-2">Odoslať recenziu</button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="alert alert-light border mb-4 d-flex align-items-center">
                        <i className="bi bi-chat-left-text me-2 text-primary"></i>
                        <span>
                            Pre pridanie recenzie sa prosím <a href="/login" className="fw-bold">prihláste</a>.
                        </span>
                    </div>
                )}

                
                <div className="reviews-list">
                    {reviews.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="bi bi-chat-left-dots fs-1 d-block mb-3"></i>
                            <p>Zatiaľ žiadne recenzie. Buďte prvý, kto napíše názor!</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.review_id} className="card border-0 shadow-sm mb-3">
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div className="fw-bold h5 mb-0">{review.username}</div>
                                        {/* Zobrazenie hodnotenia bolo vygenerovane pomocou AI */}
                                        <div className="text-warning h5 mb-0">
                                            {[...Array(5)].map((_, i) => (
                                                <i key={i} className={`bi bi-star${i < review.rating ? '-fill' : ''}`}></i>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-muted mb-2">{review.comment}</p>
                                    <small className="text-secondary">
                                        {new Date(review.created_at).toLocaleDateString('sk-SK')}
                                    </small>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};


export default BookDetail;
