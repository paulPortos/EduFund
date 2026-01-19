import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../dashboard.css';

export default function AdminAdvances() {
    const { token } = useAuth();
    const [advances, setAdvances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [processingId, setProcessingId] = useState(null);
    const [notes, setNotes] = useState('');
    const [showNotesModal, setShowNotesModal] = useState(null);

    useEffect(() => {
        fetchAdvances();
    }, [filter]);

    const fetchAdvances = async () => {
        try {
            const url = filter ? `/api/admin/advances?status=${filter}` : '/api/admin/advances';
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                setAdvances(await response.json());
            }
        } catch (err) {
            console.error('Failed to fetch advances:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (advanceId, action) => {
        setProcessingId(advanceId);
        try {
            const response = await fetch(`/api/admin/advances/${advanceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: action, notes }),
            });

            if (response.ok) {
                setShowNotesModal(null);
                setNotes('');
                fetchAdvances();
            }
        } catch (err) {
            console.error('Action failed:', err);
        } finally {
            setProcessingId(null);
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
                    <h1 className="page-title">Advance Management 📋</h1>
                    <p className="page-subtitle">Review and manage tuition advance requests</p>
                </div>

                <div className="card">
                    <div className="card-header flex justify-between items-center">
                        <h2 className="card-title">Advances</h2>
                        <div className="filter-tabs">
                            {['pending', 'active', 'completed', 'rejected', ''].map((status) => (
                                <button
                                    key={status}
                                    className={`filter-tab ${filter === status ? 'active' : ''}`}
                                    onClick={() => setFilter(status)}
                                >
                                    {status || 'All'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>School</th>
                                    <th>Amount</th>
                                    <th>Duration</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {advances.map((advance) => (
                                    <tr key={advance.id}>
                                        <td>
                                            <div className="user-info">
                                                <div className="user-name">{advance.full_name}</div>
                                                <div className="user-email">{advance.email}</div>
                                            </div>
                                        </td>
                                        <td>{advance.school_name}</td>
                                        <td>
                                            <div>{formatCurrency(advance.amount)}</div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                                → {formatCurrency(advance.total_repayment)}
                                            </div>
                                        </td>
                                        <td>{advance.duration_months} months</td>
                                        <td>
                                            <span className={`badge badge-${advance.status}`}>{advance.status}</span>
                                        </td>
                                        <td>{formatDate(advance.created_at)}</td>
                                        <td>
                                            {advance.status === 'pending' && (
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => setShowNotesModal({ id: advance.id, action: 'approved' })}
                                                        disabled={processingId === advance.id}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => setShowNotesModal({ id: advance.id, action: 'rejected' })}
                                                        disabled={processingId === advance.id}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                            {advance.admin_notes && (
                                                <div className="admin-notes" title={advance.admin_notes}>
                                                    📝 Notes
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {advances.length === 0 && (
                        <div className="empty-state">
                            <p>No {filter} advances found</p>
                        </div>
                    )}
                </div>

                {/* Notes Modal */}
                {showNotesModal && (
                    <div className="modal-overlay" onClick={() => setShowNotesModal(null)}>
                        <div className="modal card" onClick={(e) => e.stopPropagation()}>
                            <h2 className="card-title">
                                {showNotesModal.action === 'approved' ? 'Approve' : 'Reject'} Advance
                            </h2>
                            <div className="input-group">
                                <label className="input-label">Admin Notes (optional)</label>
                                <textarea
                                    className="input"
                                    rows={3}
                                    placeholder="Add notes for this decision..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                            <div className="modal-actions">
                                <button className="btn btn-secondary" onClick={() => setShowNotesModal(null)}>
                                    Cancel
                                </button>
                                <button
                                    className={`btn ${showNotesModal.action === 'approved' ? 'btn-success' : 'btn-primary'}`}
                                    onClick={() => handleAction(showNotesModal.id, showNotesModal.action)}
                                    disabled={processingId}
                                >
                                    {processingId ? 'Processing...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
