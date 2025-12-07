import { useEffect, useState, useContext } from "react";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
    const [profile, setProfile] = useState(null);
    const [books, setBooks] = useState([]);
    const { token, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await api.get("/auth/profile");
                setProfile(res.data);

                // Presmerovanie administrátorov na admin stránku
                if (res.data.role === 'administrator') {
                    navigate("/admin/books");
                }
            } catch (err) {
                logout();
                navigate("/login");
            }
        };

        const fetchBooks = async () => {
            try {
                const res = await api.get("/books");
                setBooks(res.data);
            } catch (err) {
                console.error("Error fetching books:", err);
            }
        };

        fetchProfile();
        fetchBooks();
    }, [token, navigate]);

    if (!profile) return <div className="text-center mt-5">Načítavam...</div>;

    return (
        <div className="container mt-4 home-page">
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {books.length === 0 ? (
                    <div className="col-12">
                        <div className="alert alert-info text-center" role="alert">
                            Zatiaľ neboli pridané žiadne knihy
                        </div>
                    </div>
                ) : (
                    books.map((book) => (
                        <div className="col" key={book.book_id}>
                            <div className="card h-100 shadow-sm">
                                {book.cover_image && (
                                    <img
                                        src={book.cover_image}
                                        className="card-img-top"
                                        alt={book.title}
                                        style={{ height: '250px', objectFit: 'cover' }}
                                    />
                                )}
                                <div className="card-body">
                                    <h5 className="card-title">{book.title}</h5>
                                    <h6 className="card-subtitle mb-2 text-muted">{book.author}</h6>
                                    {book.description && (
                                        <p className="card-text text-muted small">
                                            {book.description.length > 100
                                                ? `${book.description.substring(0, 100)}...`
                                                : book.description}
                                        </p>
                                    )}
                                    <p className="card-text mb-2">
                                        <small className="text-muted">ISBN: {book.isbn}</small>
                                    </p>
                                </div>
                                <div className="card-footer bg-white border-top-0">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className={`badge ${book.available_copies > 0 ? 'bg-success' : 'bg-danger'}`}>
                                            {book.available_copies > 0 ? 'Dostupné' : 'Nedostupné'}
                                        </span>
                                        <small className="text-muted">
                                            {book.available_copies}/{book.total_copies} ks
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Home;
