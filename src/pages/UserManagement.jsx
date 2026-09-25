import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import {
    Users, Search, Filter, Mail, Shield, Calendar,
    Loader2, AlertCircle, Check, MoreVertical, User
} from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/auth/users');
            setUsers(res.data);
            setError(null);
        } catch {
            setError('Failed to load users. Please try again.');
            showToast('Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/auth/users/${userId}/role`, { role: newRole });
            showToast(`User role updated to ${newRole}`);
            fetchUsers();
        } catch {
            showToast('Failed to update user role', 'error');
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === '' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'OFFICER': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        }
    };

    return (
        <div className="min-h-screen pb-16">
            <Navbar />

            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white animate-fade-in
                    ${toast.type === 'error' ? 'bg-danger/90' : 'bg-primary/90'}`}>
                    {toast.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
                    <span className="font-medium text-sm">{toast.msg}</span>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-6 mt-12 animate-fade-in">
                <div className="mb-10">
                    <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                        <Users className="text-primary" size={36} />
                        User Management
                    </h1>
                    <p className="text-text-muted">View and manage all registered platform members.</p>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-primary transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <select
                            className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-primary transition-colors appearance-none"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="">All Roles</option>
                            <option value="CITIZEN">Citizen</option>
                            <option value="OFFICER">Officer</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                </div>

                {/* Users List */}
                <div className="glass-morphism overflow-hidden">
                    {loading ? (
                        <div className="p-20 text-center">
                            <Loader2 className="animate-spin mx-auto text-primary mb-4" size={32} />
                            <p className="text-text-muted">Retrieving user data...</p>
                        </div>
                    ) : error ? (
                        <div className="p-20 text-center">
                            <AlertCircle className="mx-auto text-danger mb-4" size={48} />
                            <p className="text-white text-lg font-bold mb-2">{error}</p>
                            <button onClick={fetchUsers} className="btn-primary mt-4 py-2 px-6">Retry</button>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-20 text-center">
                            <Search className="mx-auto text-text-muted mb-4 opacity-40" size={48} />
                            <p className="text-text-muted text-lg">No users found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Joined Date</th>
                                        <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/10 overflow-hidden shadow-inner">
                                                        <User size={20} className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold leading-none mb-1.5">{user.name}</p>
                                                        <div className="flex items-center gap-2 text-text-muted text-xs">
                                                            <Mail size={12} />
                                                            <span>{user.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getRoleBadgeColor(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-text-muted">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <select
                                                        className="bg-surface border border-border rounded-lg text-xs py-1 px-2 text-white outline-none focus:border-primary transition-colors selection:bg-primary"
                                                        value={user.role}
                                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                    >
                                                        <option value="CITIZEN">Citizen</option>
                                                        <option value="OFFICER">Officer</option>
                                                        <option value="ADMIN">Admin</option>
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default UserManagement;
