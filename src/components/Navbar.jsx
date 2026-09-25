import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';


import { Shield, LogOut, LayoutDashboard, FileText, BarChart3, Menu, X, Globe, User, Plus, Package, AlertTriangle, Sparkles, ChevronDown, Navigation2 } from 'lucide-react';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleMenu = () => setIsOpen(!isOpen);

    // Admins use the sidebar layout
    if (isAuthenticated && user?.role === 'ADMIN') return null;

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
    ];

    const isActive = (path) => location.pathname === path;
    const isGroqAiSteps =
        location.pathname === '/ranger-ai-steps' || location.pathname.startsWith('/ranger-ai-steps/');

    return (
        <nav className={`
            fixed top-0 left-0 right-0 z-50 transition-all duration-500
            ${scrolled ? 'py-4' : 'py-6'}
        `}>
            <div className="max-w-7xl mx-auto px-6">
                <div className={`
                    glass-morphism px-6 py-3 flex justify-between items-center transition-all duration-500
                    ${scrolled ? 'rounded-2xl shadow-premium' : 'rounded-3xl'}
                `}>
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-all">
                            <Globe className="text-primary animate-pulse" size={24} />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tighter">
                            Wild<span className="text-primary">Safe</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.path}
                                to={link.path}
                                className={`
                                    text-sm font-bold transition-all hover:text-primary relative py-1
                                    ${isActive(link.path) ? 'text-primary' : 'text-text-muted'}
                                `}
                            >
                                {link.name}
                                {isActive(link.path) && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-fade-in" />
                                )}
                            </Link>
                        ))}

                        {isAuthenticated && (
                            <div className="h-6 w-px bg-white/10 mx-2" />
                        )}

                        {isAuthenticated && (
                             <Link 
                                to="/dashboard" 
                                className={`
                                    flex items-center gap-2 text-sm font-bold transition-all
                                    ${isActive('/dashboard') ? 'text-primary' : 'text-text-muted hover:text-white'}
                                `}
                            >
                                <LayoutDashboard size={18} />
                                <span>Dashboard</span>
                            </Link>
                        )}


                            {user?.role === 'OFFICER' && (
                                <>
                                    <Link to="/alerts" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-text-muted font-medium transition-colors hover:text-primary">
                                        <AlertTriangle size={18} />
                                        <span>Alerts</span>
                                    </Link>
                                    <Link to="/resources" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-text-muted font-medium transition-colors hover:text-primary">
                                        <Package size={18} />
                                        <span>Resources</span>
                                    </Link>
                                </>
                            )}

                        {isAuthenticated ? (
                            <div className="flex items-center gap-6">


                                {user?.role === 'CITIZEN' && (
                                    <div className="flex items-center gap-6">
                                        <Link 
                                            to="/threat-report" 
                                            className="flex items-center gap-2 text-sm text-text-muted hover:text-white font-bold transition-all"
                                        >
                                            <Plus size={18} className="text-primary" />
                                            <span>Report Threat</span>
                                        </Link>
                                    </div>
                                )}

                                {['OFFICER', 'CITIZEN'].includes(user?.role) && (
                                    <>
                                        {user?.role === 'OFFICER' && (
                                            <>
                                                <Link to="/ranger-missions" className="flex items-center gap-2 text-sm text-text-muted hover:text-white font-bold transition-all">
                                                    <Navigation2 size={18} />
                                                    <span>Ranger Missions</span>
                                                </Link>
                                                <Link
                                                    to="/ranger-ai-steps"
                                                    className={`
                                                        flex items-center gap-2 text-sm font-bold transition-all
                                                        ${isGroqAiSteps ? 'text-primary' : 'text-text-muted hover:text-white'}
                                                    `}
                                                >
                                                    <Sparkles size={18} />
                                                    <span>Groq AI steps</span>
                                                </Link>
                                            </>
                                        )}
                                        <div className="flex items-center gap-4">
                                            <NotificationDropdown />
                                        </div>
                                    </>
                                )}

                                {/* User Dropdown / Profile */}
                                <div className="group relative">
                                    <Link to="/profile" className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-white/5 border border-white/10 hover:border-primary/50 transition-all">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg">
                                            <User size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-white leading-none">{user?.name}</span>
                                            <span className="text-[10px] text-primary font-black uppercase tracking-widest">{user?.role}</span>
                                        </div>
                                        <ChevronDown size={14} className="text-text-muted transition-transform group-hover:rotate-180" />
                                    </Link>
                                    
                                    {/* Mini Dropdown */}
                                    <div className="absolute top-full right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                        <div className="glass-morphism p-2 shadow-premium">
                                            <button 
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-danger hover:bg-red-500/10 transition-all"
                                            >
                                                <LogOut size={16} />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-6">
                                <Link to="/login" className="text-sm font-bold text-text-muted hover:text-white transition-all">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary py-2.5 px-6 text-sm">
                                    Join Platform
                                    <Sparkles size={16} />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <div className="md:hidden flex items-center gap-4">
                        {isAuthenticated && ['OFFICER', 'CITIZEN'].includes(user?.role) && <NotificationDropdown />}
                        <button 
                            onClick={toggleMenu}
                            className="p-2 text-white hover:text-primary transition-colors"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`
                    md:hidden overflow-hidden transition-all duration-500 mt-4
                    ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 invisible'}
                `}>
                    <div className="glass-morphism p-6 flex flex-col gap-4 shadow-premium">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`text-lg font-bold ${isActive(link.path) ? 'text-primary' : 'text-text-muted'}`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {isAuthenticated && (
                             <Link 
                                to="/dashboard" 
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 font-bold ${isActive('/dashboard') ? 'text-primary' : 'text-white'}`}
                            >
                                <LayoutDashboard size={20} />
                                Dashboard
                            </Link>
                        )}
                        
                        {isAuthenticated ? (
                            <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
                                {user?.role === 'OFFICER' && (
                                    <Link 
                                        to="/ranger-missions" 
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 text-white font-bold"
                                    >
                                        <Navigation2 size={20} />
                                        Ranger Missions
                                    </Link>
                                )}
                                {user?.role === 'OFFICER' && (
                                    <Link 
                                        to="/ranger-ai-steps" 
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-3 font-bold ${isGroqAiSteps ? 'text-primary' : 'text-white'}`}
                                    >
                                        <Sparkles size={20} />
                                        Groq AI steps
                                    </Link>
                                )}
                                <Link 
                                    to="/profile" 
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 text-white font-bold"
                                >
                                    <User size={20} />
                                    Profile
                                </Link>
                                <button 
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 text-danger font-bold"
                                >
                                    <LogOut size={20} />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
                                <Link to="/login" className="text-white font-bold">Login</Link>
                                <Link to="/register" className="btn-primary w-full">Join Platform</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

