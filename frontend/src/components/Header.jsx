import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <Link to="/" className="logo">
                        <span className="logo-icon">E</span>
                        <span className="logo-text">EduFund</span>
                    </Link>

                    <nav className="nav">
                        {!isAuthenticated ? (
                            <>
                                <Link to="/login" className="nav-link">Login</Link>
                                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
                            </>
                        ) : user?.role === 'admin' ? (
                            <>
                                <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
                                <Link to="/admin/users" className="nav-link">Users</Link>
                                <Link to="/admin/advances" className="nav-link">Advances</Link>
                                <Link to="/admin/schools" className="nav-link">Schools</Link>
                                <button onClick={handleLogout} className="btn btn-secondary btn-sm">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/student/dashboard" className="nav-link">Dashboard</Link>
                                <Link to="/student/advance" className="nav-link">Advance</Link>
                                <Link to="/student/savings" className="nav-link">Savings</Link>
                                <Link to="/student/repayments" className="nav-link">Repayments</Link>
                                <button onClick={handleLogout} className="btn btn-secondary btn-sm">Logout</button>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
