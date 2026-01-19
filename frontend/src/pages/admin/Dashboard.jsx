import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../dashboard.css';

export default function AdminDashboard() {
    const { user, token } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/stats', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                setStats(await response.json());
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    };

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
                <div className="animate-pulse text-gradient" style={{ fontSize: '1.5rem' }}>Loading...</div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <div className="dashboard-header animate-fade-in">
                    <h1 className="page-title">Admin Dashboard 🛡️</h1>
                    <p className="page-subtitle">Welcome back, {user?.fullName}</p>
                </div>

                {/* Top Stats */}
                <div className="stats-row stagger">
                    <div className="card stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-value">{stats?.users || 0}</div>
                        <div className="stat-label">Total Students</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-value">{formatCurrency(stats?.fundsDistributed || 0)}</div>
                        <div className="stat-label">Funds Distributed</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-value">{formatCurrency(stats?.totalSavings || 0)}</div>
                        <div className="stat-label">Total Savings</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-value">{stats?.advances?.pending || 0}</div>
                        <div className="stat-label">Pending Approvals</div>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="dashboard-grid">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Advances Overview</h2>
                        </div>
                        <div className="admin-stats-list">
                            <div className="admin-stat-row">
                                <span className="admin-stat-label">
                                    <span className="badge badge-pending">Pending</span>
                                </span>
                                <span className="admin-stat-value">{stats?.advances?.pending || 0}</span>
                            </div>
                            <div className="admin-stat-row">
                                <span className="admin-stat-label">
                                    <span className="badge badge-active">Active</span>
                                </span>
                                <span className="admin-stat-value">{stats?.advances?.active || 0}</span>
                            </div>
                            <div className="admin-stat-row">
                                <span className="admin-stat-label">
                                    <span className="badge badge-completed">Completed</span>
                                </span>
                                <span className="admin-stat-value">{stats?.advances?.completed || 0}</span>
                            </div>
                            <div className="admin-stat-row total">
                                <span className="admin-stat-label">Total Advances</span>
                                <span className="admin-stat-value">{stats?.advances?.total || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Repayment Status</h2>
                        </div>
                        <div className="admin-stats-list">
                            <div className="admin-stat-row">
                                <span className="admin-stat-label">
                                    <span className="dot success"></span> Paid
                                </span>
                                <span className="admin-stat-value">{stats?.repayments?.paid || 0}</span>
                            </div>
                            <div className="admin-stat-row">
                                <span className="admin-stat-label">
                                    <span className="dot warning"></span> Pending
                                </span>
                                <span className="admin-stat-value">{stats?.repayments?.pending || 0}</span>
                            </div>
                            <div className="admin-stat-row">
                                <span className="admin-stat-label">
                                    <span className="dot danger"></span> Overdue
                                </span>
                                <span className="admin-stat-value">{stats?.repayments?.overdue || 0}</span>
                            </div>
                        </div>
                        {stats?.repayments && (
                            <div className="repayment-rate">
                                <div className="rate-label">Collection Rate</div>
                                <div className="rate-value text-gradient">
                                    {stats.repayments.paid + stats.repayments.pending > 0
                                        ? ((stats.repayments.paid / (stats.repayments.paid + stats.repayments.pending)) * 100).toFixed(1)
                                        : 0}%
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions stagger" style={{ marginTop: 'var(--spacing-8)' }}>
                    <a href="/admin/advances" className="action-card card">
                        <span className="action-icon">📋</span>
                        <span className="action-text">Review Advances</span>
                    </a>
                    <a href="/admin/users" className="action-card card">
                        <span className="action-icon">👥</span>
                        <span className="action-text">Manage Users</span>
                    </a>
                    <a href="/admin/schools" className="action-card card">
                        <span className="action-icon">🏫</span>
                        <span className="action-text">Manage Schools</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
