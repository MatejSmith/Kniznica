import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Home from "./pages/Home/Home";
import AdminBooks from "./pages/AdminBooks/AdminBooks";
import BookDetail from "./pages/BookDetail/BookDetail";
import Profile from "./pages/Profile/Profile";
import { AuthProvider } from "./context/AuthContext";
import './App.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Navigation />
                <Routes>
                    <Route path="/" element={<h1 className="text-center mt-5">Vitajte v Online Knižnici</h1>} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/books/:id" element={<BookDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/admin/books" element={<AdminBooks />} />
                </Routes>
            </Router>
        </AuthProvider >
    );
}

export default App;