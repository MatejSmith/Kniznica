import { useState, useEffect, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminBooks = () => {
    const [books, setBooks] = useState([]);
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        author: "",
        isbn: "",
        description: "",
        cover_image: "",
        total_copies: 1,
        available_copies: 1
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editingBook, setEditingBook] = useState(null);
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

                // Redirect non-administrators to home
                if (res.data.role !== 'administrator') {
                    navigate("/home");
                }
            } catch (err) {
                logout();
                navigate("/login");
            }
        };

        fetchProfile();
        fetchBooks();
    }, [token, navigate]);

    const fetchBooks = async () => {
        try {
            const res = await api.get("/books");
            setBooks(res.data);
        } catch (err) {
            console.error("Error fetching books:", err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            if (editingBook) {
                // Update existing book
                await api.put(`/books/${editingBook.book_id}`, formData);
                setSuccess("Kniha bola úspešne aktualizovaná!");
                setEditingBook(null);
            } else {
                // Add new book
                await api.post("/books", formData);
                setSuccess("Kniha bola úspešne pridaná!");
            }
            setFormData({
                title: "",
                author: "",
                isbn: "",
                description: "",
                cover_image: "",
                total_copies: 1,
                available_copies: 1
            });
            fetchBooks();
        } catch (err) {
            setError(err.response?.data?.error || "Chyba pri spracovaní knihy");
        }
    };

    const handleEdit = (book) => {
        setEditingBook(book);
        setFormData({
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            description: book.description || "",
            cover_image: book.cover_image || "",
            total_copies: book.total_copies,
            available_copies: book.available_copies
        });
        setError("");
        setSuccess("");
    };

    const handleCancelEdit = () => {
        setEditingBook(null);
        setFormData({
            title: "",
            author: "",
            isbn: "",
            description: "",
            cover_image: "",
            total_copies: 1,
            available_copies: 1
        });
        setError("");
        setSuccess("");
    };

    const handleDelete = async (bookId, bookTitle) => {
        if (!window.confirm(`Naozaj chcete vymazať knihu "${bookTitle}"?`)) {
            return;
        }

        try {
            await api.delete(`/books/${bookId}`);
            setSuccess("Kniha bola úspešne vymazaná!");
            fetchBooks();
        } catch (err) {
            setError(err.response?.data?.error || "Chyba pri mazaní knihy");
        }
    };

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-lg-5 mb-4">
                    <div className="card shadow border-0">
                        <div className="card-header bg-primary text-white">
                            <h4 className="mb-0">{editingBook ? 'Upraviť knihu' : 'Pridať novú knihu'}</h4>
                        </div>
                        <div className="card-body p-4">
                            {error && <div className="alert alert-danger" role="alert">{error}</div>}
                            {success && <div className="alert alert-success" role="alert">{success}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Názov *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        className="form-control"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Autor *</label>
                                    <input
                                        type="text"
                                        name="author"
                                        className="form-control"
                                        value={formData.author}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">ISBN *</label>
                                    <input
                                        type="text"
                                        name="isbn"
                                        className="form-control"
                                        value={formData.isbn}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Popis</label>
                                    <textarea
                                        name="description"
                                        className="form-control"
                                        rows="3"
                                        value={formData.description}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">URL obrázka</label>
                                    <input
                                        type="text"
                                        name="cover_image"
                                        className="form-control"
                                        value={formData.cover_image}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="row">
                                    <div className="col-6 mb-3">
                                        <label className="form-label">Počet kusov</label>
                                        <input
                                            type="number"
                                            name="total_copies"
                                            className="form-control"
                                            value={formData.total_copies}
                                            onChange={handleChange}
                                            min="1"
                                        />
                                    </div>
                                    <div className="col-6 mb-3">
                                        <label className="form-label">Dostupné kusy</label>
                                        <input
                                            type="number"
                                            name="available_copies"
                                            className="form-control"
                                            value={formData.available_copies}
                                            onChange={handleChange}
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary w-100">
                                    {editingBook ? 'Aktualizovať knihu' : 'Pridať knihu'}
                                </button>
                                {editingBook && (
                                    <button type="button" className="btn btn-secondary w-100 mt-2" onClick={handleCancelEdit}>
                                        Zrušiť úpravu
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-lg-7">
                    <div className="card shadow border-0">
                        <div className="card-header bg-secondary text-white">
                            <h4 className="mb-0">Zoznam kníh ({books.length})</h4>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Názov</th>
                                            <th>Autor</th>
                                            <th>ISBN</th>
                                            <th className="text-center">Dostupné/Celkom</th>
                                            <th className="text-center">Akcie</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {books.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center text-muted py-4">
                                                    Zatiaľ neboli pridané žiadne knihy
                                                </td>
                                            </tr>
                                        ) : (
                                            books.map((book) => (
                                                <tr key={book.book_id}>
                                                    <td>{book.title}</td>
                                                    <td>{book.author}</td>
                                                    <td><small className="text-muted">{book.isbn}</small></td>
                                                    <td className="text-center">
                                                        <span className={`badge ${book.available_copies > 0 ? 'bg-success' : 'bg-danger'}`}>
                                                            {book.available_copies}/{book.total_copies}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        <button
                                                            className="btn btn-sm btn-outline-primary me-1"
                                                            onClick={() => handleEdit(book)}
                                                        >
                                                            Upraviť
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDelete(book.book_id, book.title)}
                                                        >
                                                            Vymazať
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBooks;
