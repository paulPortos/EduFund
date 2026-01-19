import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../dashboard.css';

export default function TuitionAdvance() {
    const { token } = useAuth();
    const [schools, setSchools] = useState([]);
    const [advances, setAdvances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        schoolId: '',
        amount: '',
        durationMonths: '3',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [schoolsRes, advancesRes] = await Promise.all([
                fetch('/api/advances/schools', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/advances', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            if (schoolsRes.ok) setSchools(await schoolsRes.json());
            if (advancesRes.ok) setAdvances(await advancesRes.json());
        } catch (err) {
            console.error('Failed to fetch:', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateInterest = () => {
        const amount = parseFloat(form.amount) || 0;
        const months = parseInt(form.durationMonths);
        const rate = 0.02 * months;
        const total = amount * (1 + rate);
        const monthly = total / months;
        return { rate: rate * 100, total, monthly };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            const response = await fetch('/api/advances', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    schoolId: parseInt(form.schoolId),
                    amount: parseFloat(form.amount),
                    durationMonths: parseInt(form.durationMonths),
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setSuccess('Advance request submitted! Awaiting admin approval.');
            setForm({ schoolId: '', amount: '', durationMonths: '3' });
            fetchData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const hasActiveAdvance = advances.some(a => ['pending', 'active'].includes(a.status));
    const { rate, total, monthly } = calculateInterest();

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
                    <h1 className="page-title">Request Tuition Advance</h1>
                    <p className="page-subtitle">Get funds sent directly to your school</p>
                </div>

                <div className="dashboard-grid">
                    {/* Request Form */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">New Advance Request</h2>
                        </div>

                        {hasActiveAdvance ? (
                            <div className="empty-state">
                                <p>You already have a pending or active advance.</p>
                                <p style={{ marginTop: 'var(--spacing-2)' }}>Complete your current advance before requesting a new one.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                {error && <div className="auth-error">{error}</div>}
                                {success && <div className="success-message">{success}</div>}

                                <div className="input-group">
                                    <label className="input-label">Select School</label>
                                    <select
                                        className="input select"
                                        value={form.schoolId}
                                        onChange={(e) => setForm({ ...form, schoolId: e.target.value })}
                                        required
                                    >
                                        <option value="">Choose a verified school...</option>
                                        {schools.map((school) => (
                                            <option key={school.id} value={school.id}>{school.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Amount (PHP)</label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="50000"
                                        min="1000"
                                        max="500000"
                                        value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                        required
                                    />
                                    <small style={{ color: 'var(--color-text-muted)' }}>Min: ₱1,000 | Max: ₱500,000</small>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Repayment Duration</label>
                                    <select
                                        className="input select"
                                        value={form.durationMonths}
                                        onChange={(e) => setForm({ ...form, durationMonths: e.target.value })}
                                        required
                                    >
                                        <option value="3">3 Months</option>
                                        <option value="4">4 Months</option>
                                        <option value="5">5 Months</option>
                                        <option value="6">6 Months</option>
                                    </select>
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Preview */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Repayment Preview</h2>
                        </div>

                        {form.amount ? (
                            <div className="preview-content">
                                <div className="preview-row">
                                    <span>Principal Amount</span>
                                    <span className="preview-value">{formatCurrency(parseFloat(form.amount))}</span>
                                </div>
                                <div className="preview-row">
                                    <span>Interest Rate</span>
                                    <span className="preview-value">{rate.toFixed(0)}% (fixed)</span>
                                </div>
                                <div className="preview-row">
                                    <span>Duration</span>
                                    <span className="preview-value">{form.durationMonths} months</span>
                                </div>
                                <div className="preview-divider"></div>
                                <div className="preview-row highlight">
                                    <span>Total Repayment</span>
                                    <span className="preview-value">{formatCurrency(total)}</span>
                                </div>
                                <div className="preview-row highlight">
                                    <span>Monthly Payment</span>
                                    <span className="preview-value">{formatCurrency(monthly)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>Enter an amount to see repayment preview</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* History */}
                {advances.length > 0 && (
                    <div className="card" style={{ marginTop: 'var(--spacing-6)' }}>
                        <div className="card-header">
                            <h2 className="card-title">Your Advances</h2>
                        </div>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>School</th>
                                        <th>Amount</th>
                                        <th>Duration</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {advances.map((advance) => (
                                        <tr key={advance.id}>
                                            <td>{advance.school_name}</td>
                                            <td>{formatCurrency(advance.amount)}</td>
                                            <td>{advance.duration_months} months</td>
                                            <td><span className={`badge badge-${advance.status}`}>{advance.status}</span></td>
                                            <td>{new Date(advance.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
