import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../dashboard.css';

export default function AdminSchools() {
    const { token } = useAuth();
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ name: '', walletAddress: '', verified: true });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        try {
            const response = await fetch('/api/admin/schools', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                setSchools(await response.json());
            }
        } catch (err) {
            console.error('Failed to fetch schools:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('/api/admin/schools', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setShowAdd(false);
            setForm({ name: '', walletAddress: '', verified: true });
            fetchSchools();
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleVerification = async (schoolId, verified) => {
        try {
            await fetch(`/api/admin/schools/${schoolId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ verified: !verified }),
            });
            fetchSchools();
        } catch (err) {
            console.error('Toggle failed:', err);
        }
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
                            <h1 className="page-title">School Management 🏫</h1>
                            <p className="page-subtitle">Manage verified school wallets</p>
                        </div>
                        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                            + Add School
                        </button>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Verified Schools</h2>
                    </div>

                    <div className="schools-grid stagger">
                        {schools.map((school) => (
                            <div key={school.id} className="school-card">
                                <div className="school-info">
                                    <h3 className="school-name">{school.name}</h3>
                                    <div className="school-wallet">
                                        {school.wallet_address.substring(0, 12)}...{school.wallet_address.substring(school.wallet_address.length - 8)}
                                    </div>
                                </div>
                                <div className="school-actions">
                                    <button
                                        className={`toggle-btn ${school.verified ? 'active' : ''}`}
                                        onClick={() => toggleVerification(school.id, school.verified)}
                                    >
                                        {school.verified ? '✓ Verified' : 'Unverified'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {schools.length === 0 && (
                        <div className="empty-state">
                            <p>No schools added yet</p>
                        </div>
                    )}
                </div>

                {/* Add Modal */}
                {showAdd && (
                    <div className="modal-overlay" onClick={() => setShowAdd(false)}>
                        <div className="modal card" onClick={(e) => e.stopPropagation()}>
                            <h2 className="card-title">Add New School</h2>
                            {error && <div className="auth-error">{error}</div>}
                            <form onSubmit={handleAdd}>
                                <div className="input-group">
                                    <label className="input-label">School Name</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g., University of the Philippines"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Wallet Address</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="0x..."
                                        value={form.walletAddress}
                                        onChange={(e) => setForm({ ...form, walletAddress: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={form.verified}
                                            onChange={(e) => setForm({ ...form, verified: e.target.checked })}
                                        />
                                        <span>Verified immediately</span>
                                    </label>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Add School
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
