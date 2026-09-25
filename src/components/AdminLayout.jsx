import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Globe,
    LayoutDashboard,
    Shield,
    BarChart3,
    AlertTriangle,
    Package,
    Users,
    LogOut,
    User,
    ChevronLeft,
    ChevronRight,
    Bell,
    Sparkles,
    Navigation2,
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const adminNavItems = [


    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Users', to: '/users', icon: Users },
    { label: 'Case Management', to: '/case-management', icon: Shield },
    { label: 'Ranger Missions', to: '/ranger-missions', icon: Navigation2, matchPrefix: true },
    { label: 'Groq AI steps', to: '/ranger-ai-steps', icon: Sparkles, matchPrefix: true },
    { label: 'Alerts', to: '/alerts', icon: AlertTriangle },
    { label: 'Analytics', to: '/analytics', icon: BarChart3 },
    { label: 'Resources', to: '/resources', icon: Package },
    { label: 'Staff', to: '/staff', icon: Users },
];

const AdminLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-background font-sans">
            {/* ── Left Sidebar ── */}
            <aside
                className={`
                    fixed top-0 left-0 h-full z-40 flex flex-col
                    bg-surface/80 backdrop-blur-xl border-r border-white/5
                    transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
                    ${collapsed ? 'w-[88px]' : 'w-72'}
                `}
            >
                {/* Logo Section */}
                <div className="flex items-center gap-4 px-6 h-24 shrink-0 overflow-hidden">
                    <div className="p-2.5 bg-primary/10 rounded-2xl border border-primary/20 shadow-premium group cursor-pointer">
                        <Globe className="text-primary group-hover:rotate-180 transition-transform duration-700" size={28} />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col animate-fade-in">
                            <span className="text-2xl font-black text-white tracking-tighter leading-none">
                                Wild<span className="text-primary">Safe</span>
                            </span>
                            <span className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mt-1">Admin Command</span>
                        </div>
                    )}
                </div>

                {/* Navigation Section */}
                <nav className="flex-1 overflow-y-auto py-8 space-y-2 px-4 scrollbar-hide">
                    <div className={`${collapsed ? 'hidden' : 'px-4 mb-4'}`}>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Main Management</span>
                    </div>

                    {adminNavItems.map((item) => {
                        const { label, to, icon: NavIcon, matchPrefix } = item;
                        const active = matchPrefix
                            ? location.pathname.startsWith(to)
                            : location.pathname === to;
                        return (
                            <Link
                                key={to}
                                to={to}
                                title={collapsed ? label : undefined}
                                className={`
                                    group flex items-center gap-4 px-4 py-3.5 rounded-2xl
                                    transition-all duration-300 relative
                                    ${active
                                        ? 'bg-primary text-white shadow-premium'
                                        : 'text-text-muted hover:bg-white/[0.03] hover:text-white'
                                    }
                                `}
                            >
                                <NavIcon size={22} className={`shrink-0 transition-transform group-hover:scale-110 ${active ? 'animate-pulse' : ''}`} />
                                {!collapsed && <span className="font-bold text-sm tracking-wide">{label}</span>}
                                {active && !collapsed && (
                                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Account & Footer Section */}
                <div className="mt-auto px-4 py-8 space-y-4 border-t border-white/5 bg-black/20">
                    {/* User Profile Hook */}
                    <Link
                        to="/profile"
                        className={`
                            flex items-center gap-4 p-2 rounded-2xl transition-all border border-transparent
                            hover:bg-white/5 hover:border-white/10
                            ${collapsed ? 'justify-center' : ''}
                        `}
                    >
                        <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg overflow-hidden">
                                <User size={20} />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-surface" />
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0 animate-fade-in">
                                <div className="text-sm font-bold text-white truncate leading-tight">{user?.name}</div>
                                <div className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">Systems Admin</div>
                            </div>
                        )}
                    </Link>

                    {/* Quick Tools */}
                    <div className="flex flex-col gap-2">
                         <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-4 px-3 py-2 bg-white/5 rounded-xl'}`}>
                            <NotificationDropdown />
                            {!collapsed && <span className="text-xs font-bold text-text-muted">Broadcasts</span>}
                        </div>

                        <button
                            onClick={handleLogout}
                            className={`
                                flex items-center gap-4 w-full p-3 rounded-xl
                                text-text-muted hover:text-danger hover:bg-red-500/10 transition-all font-bold text-sm
                                ${collapsed ? 'justify-center' : ''}
                            `}
                        >
                            <LogOut size={20} className="shrink-0" />
                            {!collapsed && <span>System Exit</span>}
                        </button>
                    </div>
                </div>

                {/* Sidebar Expand/Collapse Toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="
                        absolute -right-4 top-12
                        w-8 h-8 rounded-xl bg-primary border-4 border-background
                        flex items-center justify-center text-white
                        hover:scale-110 transition-transform shadow-premium z-50
                    "
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </aside>

            {/* ── Main Dashboard Content ── */}
            <main
                className={`flex-1 min-h-screen transition-all duration-500 ease-in-out ${collapsed ? 'ml-[88px]' : 'ml-72'} bg-[#060b18]`}
            >
                <div className="p-8 animate-slide-up">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;

