import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../dashboard.css';

export default function StudentDashboard() {
    const { user, token } = useAuth();
    const [advances, setAdvances] = useState([]);
    const [savings, setSavings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [advancesRes, savingsRes] = await Promise.all([
                fetch('/api/advances', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/savings', { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            if (advancesRes.ok) setAdvances(await advancesRes.json());
            if (savingsRes.ok) setSavings(await savingsRes.json());
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    const activeAdvance = advances.find(a => ['pending', 'active'].includes(a.status));
    const totalSavings = savings.reduce((sum, b) => sum + b.current_amount, 0);
    const upcomingPayments = advances
        .filter(a => a.status === 'active')
        .flatMap(a => a.repayments?.filter(r => r.status === 'pending') || []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="page flex items-center justify-center">
                <div className="animate-pulse text-gradient" style={{ fontSize: '1.5rem' }}>
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <div className="dashboard-header animate-fade-in">
                    <h1 className="page-title">Welcome, {user?.fullName}! 👋</h1>
                    <p className="page-subtitle">Here's your education finance overview</p>
                </div>

                {/* Quick Stats */}
                <div className="stats-row stagger">
                    <div className="card stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-value">{formatCurrency(totalSavings)}</div>
                        <div className="stat-label">Total Savings</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-icon">📚</div>
                        <div className="stat-value">{savings.length}</div>
                        <div className="stat-label">Savings Buckets</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-icon">📋</div>
                        <div className="stat-value">{advances.length}</div>
                        <div className="stat-label">Total Advances</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-icon">⏰</div>
                        <div className="stat-value">{upcomingPayments.length}</div>
                        <div className="stat-label">Pending Payments</div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="dashboard-grid">
                    {/* Active Advance */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Active Advance</h2>
                        </div>
                        {activeAdvance ? (
                            <div className="advance-summary">
                                <div className="advance-amount">{formatCurrency(activeAdvance.amount)}</div>
                                <div className="advance-school">{activeAdvance.school_name}</div>
                                <div className="advance-meta">
                                    <span className={`badge badge-${activeAdvance.status}`}>
                                        {activeAdvance.status}
                                    </span>
                                    <span>{activeAdvance.duration_months} months</span>
                                </div>
                                <div className="advance-progress">
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${((activeAdvance.total_repayment - (activeAdvance.remaining || activeAdvance.total_repayment)) / activeAdvance.total_repayment) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>No active advance</p>
                                <Link to="/student/advance" className="btn btn-primary btn-sm">
                                    Request Advance
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Savings Overview */}
                    <div className="card">
                        <div className="card-header flex justify-between items-center">
                            <h2 className="card-title">Savings Buckets</h2>
                            <Link to="/student/savings" className="btn btn-secondary btn-sm">View All</Link>
                        </div>
                        {savings.length > 0 ? (
                            <div className="savings-list">
                                {savings.slice(0, 3).map((bucket) => (
                                    <div key={bucket.id} className="savings-item">
                                        <div className="savings-info">
                                            <div className="savings-name">{bucket.name}</div>
                                            <div className="savings-progress-text">
                                                {formatCurrency(bucket.current_amount)} / {formatCurrency(bucket.target_amount)}
                                            </div>
                                        </div>
                                        <div className="progress-bar" style={{ flex: 1 }}>
                                            <div
                                                className={`progress-fill ${bucket.current_amount >= bucket.target_amount ? 'success' : ''}`}
                                                style={{ width: `${Math.min((bucket.current_amount / bucket.target_amount) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>No savings buckets yet</p>
                                <Link to="/student/savings" className="btn btn-primary btn-sm">
                                    Create Bucket
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions stagger">
                    <Link to="/student/advance" className="action-card card">
                        <span className="action-icon">💸</span>
                        <span className="action-text">Request Advance</span>
                    </Link>
                    <Link to="/student/savings" className="action-card card">
                        <span className="action-icon">🎯</span>
                        <span className="action-text">Add Savings Goal</span>
                    </Link>
                    <Link to="/student/repayments" className="action-card card">
                        <span className="action-icon">📅</span>
                        <span className="action-text">View Repayments</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
