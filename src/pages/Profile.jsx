import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useFixedNavOffsetClass } from '../hooks/useFixedNavOffsetClass';
import { User, Mail, Shield, Wallet, BarChart3, Settings, TrendingUp, History, Zap } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const navPt = useFixedNavOffsetClass();

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className={`max-w-7xl mx-auto px-6 pb-24 animate-slide-up ${navPt || 'pt-12'}`}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column - User Info */}
                    <div className="space-y-8">
                        <div className="premium-card text-center group">
                            <div className="relative w-32 h-32 mx-auto mb-6">
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/40 transition-all duration-500" />
                                <div className="relative w-full h-full bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center border-4 border-surface shadow-premium">
                                    <User size={64} className="text-white" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-1">{user.name}</h2>
                            <p className="text-primary font-bold text-sm tracking-widest uppercase mb-6">{user.role} MEMBER</p>
                            <div className="flex justify-center gap-3">
                                <span className="status-badge status-green">Verified</span>
                                <span className="status-badge status-purple">Lvl 4 Impact</span>
                            </div>
                        </div>

                        <div className="premium-card space-y-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Shield size={20} className="text-primary" />
                                </div>
                                Account Security
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4 p-4 bg-surface-light/30 rounded-xl border border-white/5">
                                    <Mail className="text-text-muted mt-1" size={18} />
                                    <div>
                                        <div className="text-[10px] text-text-muted uppercase font-bold tracking-widest mb-1">Email Address</div>
                                        <div className="text-white font-medium">{user.email}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 bg-surface-light/30 rounded-xl border border-white/5">
                                    <Wallet className="text-text-muted mt-1" size={18} />
                                    <div>
                                        <div className="text-[10px] text-text-muted uppercase font-bold tracking-widest mb-1">Wallet Identity</div>
                                        <div className="text-white font-mono text-xs">0x71C...492b</div>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full btn-primary">
                                <Settings size={18} />
                                Settings
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Stats & Assets */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: "Impact Portfolio", value: "$4,250.00", icon: <TrendingUp className="text-primary" />, trend: "+12.4%" },
                                { label: "Active Tokens", value: "12 Assets", icon: <BarChart3 className="text-secondary" />, trend: "+2" },
                                { label: "Contribution Score", value: "850", icon: <Zap className="text-accent" />, trend: "Top 5%" }
                            ].map((stat, i) => (
                                <div key={i} className="premium-card">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 bg-surface-light rounded-2xl border border-white/5">{stat.icon}</div>
                                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">{stat.trend}</span>
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-1 tracking-tight">{stat.value}</div>
                                    <div className="text-sm text-text-muted font-medium">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Holdings Table */}
                        <div className="premium-card p-0 overflow-hidden">
                            <div className="p-8 pb-4 flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-1">Your WildAssets</h3>
                                    <p className="text-sm text-text-muted">Managed fractional wildlife tokens</p>
                                </div>
                                <button className="text-sm text-primary font-bold hover:text-white transition-colors">Explorer All Items</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/[0.02]">
                                            <th className="px-8 py-5 text-[10px] text-text-muted uppercase font-bold tracking-widest">Asset Name</th>
                                            <th className="px-8 py-5 text-[10px] text-text-muted uppercase font-bold tracking-widest">Ownership</th>
                                            <th className="px-8 py-5 text-[10px] text-text-muted uppercase font-bold tracking-widest">Market Value</th>
                                            <th className="px-8 py-5 text-[10px] text-text-muted uppercase font-bold tracking-widest text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {[
                                            { name: "Serengeti Corridor A", share: "2.5%", value: "$1,250", status: "Active", color: "status-green" },
                                            { name: "Rhino Sanctuary Alpha", share: "0.8%", value: "$800", status: "Pledged", color: "status-orange" },
                                            { name: "Coastal Mangrove Beta", share: "5.0%", value: "$2,200", status: "Active", color: "status-green" }
                                        ].map((asset, i) => (
                                            <tr key={i} className="group hover:bg-white/[0.03] transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="text-white font-bold group-hover:text-primary transition-colors">{asset.name}</div>
                                                </td>
                                                <td className="px-8 py-6 text-text-muted font-medium">{asset.share}</td>
                                                <td className="px-8 py-6 text-white font-bold">{asset.value}</td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className={`status-badge ${asset.color}`}>
                                                        {asset.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="premium-card">
                            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                <div className="p-2 bg-secondary/10 rounded-lg">
                                    <History size={20} className="text-secondary" />
                                </div>
                                Ecosystem Activity
                            </h3>
                            <div className="space-y-6">
                                {[
                                    { action: "Dividend Distribution", detail: "Received income share from Serengeti conservation", date: "2 days ago", icon: <TrendingUp size={16} className="text-primary" /> },
                                    { action: "Governance Participation", detail: "You voted on Protocol Expansion Proposal #14", date: "5 days ago", icon: <Shield size={16} className="text-secondary" /> },
                                    { action: "Portfolio Diversification", detail: "Acquired new positions in Mangrove Sanctuary", date: "1 week ago", icon: <Zap size={16} className="text-accent" /> }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 p-4 hover:bg-white/[0.02] rounded-2xl transition-all border border-transparent hover:border-white/5">
                                        <div className="p-3 bg-surface-light rounded-xl h-fit">
                                            {item.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="text-white font-bold">{item.action}</div>
                                                <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{item.date}</div>
                                            </div>
                                            <div className="text-sm text-text-muted leading-relaxed font-medium">{item.detail}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>

    );
};

export default Profile;
