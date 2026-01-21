import { useEffect, useState, useContext } from "react";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    
    const [searchQuery, setSearchQuery] = useState("");
    const [availabilityFilter, setAvailabilityFilter] = useState("all"); 
    const [sortBy, setSortBy] = useState("newest"); 

    
    useEffect(() => {
        if (token) {
            const checkAdmin = async () => {
                try {
                    const res = await api.get("/auth/profile");
                    if (res.data.role === 'administrator') {
                        navigate("/admin/books");
                    }
                } catch (err) {
                    console.error("Error checking profile:", err);
                }
            };
            checkAdmin();
        }
    }, [token, navigate]);

    
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await api.get("/books");
                setBooks(res.data);
                setFilteredBooks(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching books:", err);
                setLoading(false);
            }
        };
        fetchBooks();
    }, []);

    
    useEffect(() => {
        let result = [...books];

        
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(book =>
                book.title.toLowerCase().includes(query) ||
                book.author.toLowerCase().includes(query) ||
                book.isbn.toLowerCase().includes(query)
            );
        }

        
        if (availabilityFilter === "available") {
            result = result.filter(book => book.available_copies > 0);
        } else if (availabilityFilter === "unavailable") {
            result = result.filter(book => book.available_copies === 0);
        }

        
        if (sortBy === "title") {
            result.sort((a, b) => a.title.localeCompare(b.title, 'sk'));
        } else if (sortBy === "rating") {
            result.sort((a, b) => Number(b.average_rating) - Number(a.average_rating));
        } else {
            
            result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        setFilteredBooks(result);
    }, [books, searchQuery, availabilityFilter, sortBy]);

    const clearFilters = () => {
        setSearchQuery("");
        setAvailabilityFilter("all");
        setSortBy("newest");
    };

    if (loading) return <div className="text-center mt-5">Načítavam...</div>;

    return (
        <div className="container mt-4 home-page">
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-4">
                    <div className="row g-3 align-items-end">
                        <div className="col-12 col-md-5">
                            <label className="form-label text-muted small fw-bold">Vyhľadávanie</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <i className="bi bi-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Názov, autor alebo ISBN..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-6 col-md-3">
                            <label className="form-label text-muted small fw-bold">Dostupnosť</label>
                            <select
                                className="form-select"
                                value={availabilityFilter}
                                onChange={(e) => setAvailabilityFilter(e.target.value)}
                            >
                                <option value="all">Všetky knihy</option>
                                <option value="available">Len dostupné</option>
                                <option value="unavailable">Nedostupné</option>
                            </select>
                        </div>

                        <div className="col-6 col-md-3">
                            <label className="form-label text-muted small fw-bold">Zoradiť podľa</label>
                            <select
                                className="form-select"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="newest">Najnovšie</option>
                                <option value="title">Názov (A-Z)</option>
                                <option value="rating">Hodnotenie</option>
                            </select>
                        </div>

                        <div className="col-12 col-md-1">
                            <button
                                className="btn btn-outline-secondary w-100"
                                onClick={clearFilters}
                                title="Vymazať filtre"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                    </div>

                    <div className="mt-3 text-muted small">
                        Zobrazených <strong>{filteredBooks.length}</strong> z <strong>{books.length}</strong> kníh
                        {searchQuery && <span className="ms-2 badge bg-primary">{searchQuery}</span>}
                        {availabilityFilter !== "all" && (
                            <span className="ms-2 badge bg-secondary">
                                {availabilityFilter === "available" ? "Dostupné" : "Nedostupné"}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {filteredBooks.length === 0 ? (
                    <div className="col-12">
                        <div className="alert alert-info text-center" role="alert">
                            {books.length === 0
                                ? "Zatiaľ neboli pridané žiadne knihy"
                                : "Žiadne knihy nezodpovedajú vašim kritériám"}
                        </div>
                    </div>
                ) : (
                    filteredBooks.map((book) => (
                        <div className="col" key={book.book_id}>
                            {/* zobrazenie lokalneho obrazka je vygenerovany pomocou AI */}
                            <div className="card h-100 shadow-sm book-card" onClick={() => navigate(`/books/${book.book_id}`)} style={{ cursor: 'pointer' }}>
                                {book.cover_image && (
                                    <img
                                        src={
                                            book.cover_image.startsWith('/uploads')
                                                ? `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}${book.cover_image}`
                                                : book.cover_image
                                        }
                                        className="card-img-top"
                                        alt={book.title}
                                        style={{ height: '250px', objectFit: 'cover' }}
                                    />
                                )}
                                <div className="card-body">
                                    <h5 className="card-title">{book.title}</h5>
                                    <h6 className="card-subtitle mb-2 text-muted">{book.author}</h6>

                                    <div className="mb-2">
                                        <span className="text-warning me-1">
                                            <i className={`bi bi-star${book.average_rating > 0 ? '-fill' : ''}`}></i>
                                        </span>
                                        <span className="fw-bold">{Number(book.average_rating).toFixed(1)}</span>
                                        <span className="text-muted small ms-1">({book.review_count})</span>
                                    </div>

                                    {book.description && (
                                        <p className="card-text text-muted small">
                                            {book.description.length > 100
                                                ? `${book.description.substring(0, 100)}...`
                                                : book.description}
                                        </p>
                                    )}
                                </div>
                                <div className="card-footer bg-white border-top-0 d-flex justify-content-between align-items-center">
                                    <span className={`badge ${book.available_copies > 0 ? 'bg-success' : 'bg-danger'}`}>
                                        {book.available_copies > 0 ? 'Dostupné' : 'Nedostupné'}
                                    </span>
                                    <button className="btn btn-outline-primary btn-sm">Detail</button>
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
