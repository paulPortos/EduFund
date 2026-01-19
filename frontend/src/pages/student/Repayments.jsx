import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../dashboard.css';

export default function Repayments() {
    const { token } = useAuth();
    const [advances, setAdvances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [payingId, setPayingId] = useState(null);

    useEffect(() => {
        fetchAdvances();
    }, []);

    const fetchAdvances = async () => {
        try {
            const response = await fetch('/api/advances', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                // Fetch repayments for active advances
                const advancesWithRepayments = await Promise.all(
                    data.filter(a => a.status === 'active').map(async (advance) => {
                        const repRes = await fetch(`/api/advances/${advance.id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        if (repRes.ok) {
                            const fullAdvance = await repRes.json();
                            return fullAdvance;
                        }
                        return advance;
                    })
                );
                setAdvances(advancesWithRepayments);
            }
        } catch (err) {
            console.error('Failed to fetch:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async (advanceId) => {
        setPayingId(advanceId);
        try {
            const response = await fetch(`/api/advances/${advanceId}/repay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ amount: 0 }),
            });

            if (response.ok) {
                fetchAdvances();
            }
        } catch (err) {
            console.error('Payment failed:', err);
        } finally {
            setPayingId(null);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
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
                    <h1 className="page-title">Repayment Schedule 📅</h1>
                    <p className="page-subtitle">Track and manage your advance repayments</p>
                </div>

                {advances.length > 0 ? (
                    <div className="advances-list stagger">
                        {advances.map((advance) => (
                            <div key={advance.id} className="card advance-detail">
                                <div className="advance-detail-header">
                                    <div>
                                        <h3 className="advance-detail-school">{advance.school_name}</h3>
                                        <p className="advance-detail-amount">
                                            {formatCurrency(advance.amount)} → {formatCurrency(advance.total_repayment)}
                                        </p>
                                    </div>
                                    <span className={`badge badge-${advance.status}`}>{advance.status}</span>
                                </div>

                                {advance.repayments && advance.repayments.length > 0 && (
                                    <div className="repayments-schedule">
                                        <h4 className="schedule-title">Payment Schedule</h4>
                                        <div className="table-container">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Due Date</th>
                                                        <th>Amount</th>
                                                        <th>Status</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {advance.repayments.map((repayment, index) => (
                                                        <tr key={repayment.id}>
                                                            <td>{index + 1}</td>
                                                            <td>{formatDate(repayment.due_date)}</td>
                                                            <td>{formatCurrency(repayment.amount)}</td>
                                                            <td>
                                                                <span className={`badge badge-${repayment.status === 'paid' ? 'completed' : repayment.status}`}>
                                                                    {repayment.status}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                {repayment.status === 'pending' && (
                                                                    <button
                                                                        className="btn btn-success btn-sm"
                                                                        onClick={() => handlePay(advance.id)}
                                                                        disabled={payingId === advance.id}
                                                                    >
                                                                        {payingId === advance.id ? 'Processing...' : 'Pay Now'}
                                                                    </button>
                                                                )}
                                                                {repayment.status === 'paid' && (
                                                                    <span style={{ color: 'var(--color-accent-success)' }}>✓ Paid</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="repayment-summary">
                                            <div className="summary-item">
                                                <span>Paid</span>
                                                <span className="summary-value success">
                                                    {advance.repayments.filter(r => r.status === 'paid').length} / {advance.repayments.length}
                                                </span>
                                            </div>
                                            <div className="summary-item">
                                                <span>Remaining</span>
                                                <span className="summary-value">
                                                    {formatCurrency(
                                                        advance.repayments
                                                            .filter(r => r.status === 'pending')
                                                            .reduce((sum, r) => sum + r.amount, 0)
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card empty-state-large">
                        <div className="empty-icon">📋</div>
                        <h3>No Active Repayments</h3>
                        <p>You don't have any active advances with pending repayments.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
