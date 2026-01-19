import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../dashboard.css';

export default function SavingsBucket() {
    const { token } = useAuth();
    const [buckets, setBuckets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [depositBucket, setDepositBucket] = useState(null);
    const [depositAmount, setDepositAmount] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        name: '',
        targetAmount: '',
        frequency: 'weekly',
    });

    useEffect(() => {
        fetchBuckets();
    }, []);

    const fetchBuckets = async () => {
        try {
            const response = await fetch('/api/savings', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) setBuckets(await response.json());
        } catch (err) {
            console.error('Failed to fetch:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('/api/savings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: form.name,
                    targetAmount: parseFloat(form.targetAmount),
                    frequency: form.frequency,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setSuccess('Savings bucket created!');
            setShowCreate(false);
            setForm({ name: '', targetAmount: '', frequency: 'weekly' });
            fetchBuckets();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeposit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(`/api/savings/${depositBucket.id}/deposit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ amount: parseFloat(depositAmount) }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setSuccess(`Deposited successfully! Progress: ${data.progress}`);
            setDepositBucket(null);
            setDepositAmount('');
            fetchBuckets();
        } catch (err) {
            setError(err.message);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getProgress = (bucket) => {
        return Math.min((bucket.current_amount / bucket.target_amount) * 100, 100);
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
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="page-title">Savings Buckets 🎯</h1>
                            <p className="page-subtitle">Set and achieve your education savings goals</p>
                        </div>
                        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                            + New Bucket
                        </button>
                    </div>
                </div>

                {success && <div className="success-message" style={{ marginBottom: 'var(--spacing-4)' }}>{success}</div>}
                {error && <div className="auth-error" style={{ marginBottom: 'var(--spacing-4)' }}>{error}</div>}

                {/* Buckets Grid */}
                {buckets.length > 0 ? (
                    <div className="buckets-grid stagger">
                        {buckets.map((bucket) => (
                            <div key={bucket.id} className={`card bucket-card ${bucket.status === 'completed' ? 'completed' : ''}`}>
                                <div className="bucket-header">
                                    <h3 className="bucket-name">{bucket.name}</h3>
                                    <span className={`badge badge-${bucket.status}`}>{bucket.status}</span>
                                </div>

                                <div className="bucket-amounts">
                                    <div className="bucket-current">{formatCurrency(bucket.current_amount)}</div>
                                    <div className="bucket-target">of {formatCurrency(bucket.target_amount)}</div>
                                </div>

                                <div className="progress-bar" style={{ marginBottom: 'var(--spacing-4)' }}>
                                    <div
                                        className={`progress-fill ${getProgress(bucket) >= 100 ? 'success' : ''}`}
                                        style={{ width: `${getProgress(bucket)}%` }}
                                    />
                                </div>

                                <div className="bucket-meta">
                                    <span className="bucket-frequency">{bucket.frequency} deposits</span>
                                    <span>{getProgress(bucket).toFixed(1)}%</span>
                                </div>

                                {bucket.status === 'active' && (
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        style={{ width: '100%', marginTop: 'var(--spacing-4)' }}
                                        onClick={() => setDepositBucket(bucket)}
                                    >
                                        Make Deposit
                                    </button>
                                )}

                                {bucket.status === 'completed' && (
                                    <div className="bucket-completed-badge">🎉 Goal Reached!</div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card empty-state-large">
                        <div className="empty-icon">💰</div>
                        <h3>No Savings Buckets Yet</h3>
                        <p>Start saving for your education goals today!</p>
                        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                            Create Your First Bucket
                        </button>
                    </div>
                )}

                {/* Create Modal */}
                {showCreate && (
                    <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                        <div className="modal card" onClick={(e) => e.stopPropagation()}>
                            <h2 className="card-title">Create Savings Bucket</h2>
                            <form onSubmit={handleCreate}>
                                <div className="input-group">
                                    <label className="input-label">Bucket Name</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g., 2nd Semester Tuition"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Target Amount (PHP)</label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="30000"
                                        min="1000"
                                        value={form.targetAmount}
                                        onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Deposit Frequency</label>
                                    <select
                                        className="input select"
                                        value={form.frequency}
                                        onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                                    >
                                        <option value="weekly">Weekly</option>
                                        <option value="biweekly">Bi-weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Create Bucket
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Deposit Modal */}
                {depositBucket && (
                    <div className="modal-overlay" onClick={() => setDepositBucket(null)}>
                        <div className="modal card" onClick={(e) => e.stopPropagation()}>
                            <h2 className="card-title">Deposit to {depositBucket.name}</h2>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-4)' }}>
                                Current: {formatCurrency(depositBucket.current_amount)} / {formatCurrency(depositBucket.target_amount)}
                            </p>
                            <form onSubmit={handleDeposit}>
                                <div className="input-group">
                                    <label className="input-label">Deposit Amount (PHP)</label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="1000"
                                        min="1"
                                        value={depositAmount}
                                        onChange={(e) => setDepositAmount(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setDepositBucket(null)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-success">
                                        Deposit
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
