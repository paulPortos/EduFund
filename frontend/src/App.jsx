import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentDashboard from './pages/student/Dashboard';
import TuitionAdvance from './pages/student/TuitionAdvance';
import SavingsBucket from './pages/student/SavingsBucket';
import Repayments from './pages/student/Repayments';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminAdvances from './pages/admin/Advances';
import AdminSchools from './pages/admin/Schools';

function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div className="page flex items-center justify-center">
                <div className="animate-pulse text-gradient" style={{ fontSize: '1.5rem' }}>
                    Loading...
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
    }

    return children;
}

function PublicRoute({ children }) {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="page flex items-center justify-center">
                <div className="animate-pulse text-gradient" style={{ fontSize: '1.5rem' }}>
                    Loading...
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
    }

    return children;
}

function AppRoutes() {
    return (
        <>
            <Header />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                {/* Student Routes */}
                <Route path="/student/dashboard" element={
                    <ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>
                } />
                <Route path="/student/advance" element={
                    <ProtectedRoute allowedRoles={['student']}><TuitionAdvance /></ProtectedRoute>
                } />
                <Route path="/student/savings" element={
                    <ProtectedRoute allowedRoles={['student']}><SavingsBucket /></ProtectedRoute>
                } />
                <Route path="/student/repayments" element={
                    <ProtectedRoute allowedRoles={['student']}><Repayments /></ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={
                    <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                    <ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>
                } />
                <Route path="/admin/advances" element={
                    <ProtectedRoute allowedRoles={['admin']}><AdminAdvances /></ProtectedRoute>
                } />
                <Route path="/admin/schools" element={
                    <ProtectedRoute allowedRoles={['admin']}><AdminSchools /></ProtectedRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}
