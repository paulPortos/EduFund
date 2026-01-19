import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../dashboard.css';

export default function AdminUsers() {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                setUsers(await response.json());
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

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
                    <h1 className="page-title">User Management 👥</h1>
                    <p className="page-subtitle">{users.length} registered users</p>
                </div>

                <div className="card">
                    <div className="card-header flex justify-between items-center">
                        <h2 className="card-title">All Users</h2>
                        <input
                            type="text"
                            className="input"
                            placeholder="Search users..."
                            style={{ maxWidth: '300px' }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Wallet</th>
                                    <th>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-name">{user.full_name}</div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`badge ${user.role === 'admin' ? 'badge-active' : 'badge-pending'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            {user.wallet_address ? (
                                                <span className="wallet-address">
                                                    {user.wallet_address.substring(0, 8)}...
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--color-text-muted)' }}>Not connected</span>
                                            )}
                                        </td>
                                        <td>{formatDate(user.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="empty-state">
                            <p>No users found matching "{search}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
