import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Leaf, PawPrint, Shield, Camera } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [oauthError, setOauthError] = useState(null);
    const { login, error } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [searchParams] = useSearchParams();

    // Handle error query param set by backend on Google OAuth failure
    useEffect(() => {
        const err = searchParams.get('error');
        if (err === 'GoogleAuthDenied') setOauthError('Google sign-in was cancelled or denied.');
        else if (err === 'GoogleAuthFailed') setOauthError('Google sign-in failed. Please try again.');
        else if (err === 'ServerError') setOauthError('A server error occurred. Please try again.');
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = () => {
        // Redirect browser to backend Google OAuth route — Passport handles the rest
        window.location.href = `${API_BASE}/auth/google`;
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-black">
            {/* Fullscreen Nature Background */}
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1546182990-dffeafbe841d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                    alt="Wildlife Conservation"
                    className="object-cover w-full h-full opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
            </div>

            {/* Floating Particles - Leaves */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-leaf-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 10}s`,
                            animationDuration: `${15 + Math.random() * 20}s`,
                            opacity: 0.1 + Math.random() * 0.2
                        }}
                    >
                        <Leaf size={24 + Math.random() * 40} color="white" strokeWidth={1} />
                    </div>
                ))}
            </div>

            {/* Main Content - Asymmetrical Layout */}
            <div className="relative flex items-center min-h-screen">
                <div className="container px-6 mx-auto lg:px-12">
                    <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">

                        {/* Left Side - Brand Story */}
                        <div className="space-y-8 lg:w-1/2">
                            {/* Logo with Wildlife Silhouette */}
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full bg-amber-500/30 blur-2xl" />
                                    <div className="relative p-4 border bg-white/10 backdrop-blur-md rounded-2xl border-white/20">
                                        <PawPrint className="text-amber-400" size={36} strokeWidth={1.5} />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold tracking-tight text-white">
                                        Wild<span className="text-primary">Asset</span>
                                    </h1>
                                    <p className="text-sm text-white/60">Blockchain Protocol</p>
                                </div>
                            </div>

                            {/* Hero Quote */}
                            <div className="space-y-4">
                                <div className="relative">
                                    <span className="absolute text-8xl text-primary/20 -top-8 -left-4">"</span>
                                    <p className="relative pl-6 text-3xl italic font-light leading-relaxed text-white lg:text-4xl">
                                        Real-world assets meet decentralized finance. Protecting biodiversity through transparent tokenization.
                                    </p>
                                </div>
                                <p className="pl-6 text-lg text-white/60">â€” WildAsset Manifesto</p>
                            </div>

                            {/* Impact Stats - Minimal */}
                            <div className="flex gap-12 pl-6">
                                <div>
                                    <div className="text-3xl font-bold text-primary">$45M+</div>
                                    <div className="mt-1 text-sm tracking-wider uppercase text-white/50">Assets Tokenized</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary">12k+</div>
                                    <div className="mt-1 text-sm tracking-wider uppercase text-white/50">Global Holders</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary">0%</div>
                                    <div className="mt-1 text-sm tracking-wider uppercase text-white/50">Fee Protocol</div>
                                </div>
                            </div>

                            {/* Nature Badge */}
                            <div className="flex items-center gap-3 pt-4 pl-6">
                                <div className="flex -space-x-2">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="flex items-center justify-center w-8 h-8 border-2 border-black rounded-full bg-white/10 backdrop-blur-sm">
                                            <Camera size={14} className="text-white/70" />
                                        </div>
                                    ))}
                                </div>
                                <span className="text-sm text-white/50">Live from 12 conservation sites</span>
                            </div>
                        </div>

                        {/* Right Side - Floating Auth Card */}
                        <div className="lg:w-[420px] relative">
                            {/* Decorative Elements */}
                            <div className="absolute w-32 h-32 rounded-full -top-6 -right-6 bg-amber-500/10 blur-2xl" />
                            <div className="absolute w-32 h-32 rounded-full -bottom-6 -left-6 bg-emerald-500/10 blur-2xl" />

                            {/* Main Card */}
                            <div className="relative overflow-hidden border shadow-2xl bg-white/10 backdrop-blur-xl rounded-3xl border-white/20">

                                {/* Card Header with Nature Pattern */}
                                <div className="relative h-32 overflow-hidden bg-gradient-to-r from-amber-500/20 to-emerald-500/20">
                                    <div className="absolute inset-0"
                                        style={{
                                            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)',
                                            backgroundSize: '24px 24px'
                                        }}
                                    />
                                    <div className="absolute -bottom-8 -right-8">
                                        <PawPrint className="text-white/10" size={120} strokeWidth={1} />
                                    </div>
                                    <div className="absolute top-6 left-6">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 border rounded-full bg-white/20 backdrop-blur-md border-white/30">
                                            <Shield size={14} className="text-amber-400" />
                                            <span className="text-xs font-medium text-white">Protected Area</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-8">
                                    <div className="mb-8">
                                        <h2 className="mb-2 text-2xl font-bold text-white">Welcome Back, Guardian</h2>
                                        <p className="text-sm text-white/60">Sign in to continue protecting wildlife</p>
                                    </div>

                                    {(error || oauthError) && (
                                        <div className="p-4 mb-6 border bg-red-500/20 border-red-500/30 rounded-xl backdrop-blur-sm">
                                            <p className="text-sm text-center text-red-200">{oauthError || error}</p>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {/* Email */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-white/80">
                                                Email Address
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <Mail className="w-5 h-5 transition-colors text-white/40 group-focus-within:text-amber-400" />
                                                </div>
                                                <input
                                                    type="email"
                                                    className="block w-full py-3 pl-10 pr-3 text-white transition-all border bg-white/5 border-white/10 rounded-xl placeholder-white/30 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                                    placeholder="your@email.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Password */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="block text-sm font-medium text-white/80">
                                                    Password
                                                </label>
                                                <button
                                                    type="button"
                                                    className="text-xs transition-colors text-amber-400 hover:text-amber-300"
                                                >
                                                    Forgot?
                                                </button>
                                            </div>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <Lock className="w-5 h-5 transition-colors text-white/40 group-focus-within:text-amber-400" />
                                                </div>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    className="block w-full py-3 pl-10 pr-10 text-white transition-all border bg-white/5 border-white/10 rounded-xl placeholder-white/30 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="w-5 h-5 transition-colors text-white/40 hover:text-white/60" />
                                                    ) : (
                                                        <Eye className="w-5 h-5 transition-colors text-white/40 hover:text-white/60" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Sign In Button */}
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="relative w-full mt-6 overflow-hidden group rounded-xl"
                                        >
                                            <div className="absolute inset-0 transition-transform bg-gradient-to-r from-amber-500 to-amber-600 group-hover:scale-105" />
                                            <div className="absolute inset-0 transition-opacity opacity-0 group-hover:opacity-100 bg-gradient-to-r from-amber-600 to-amber-700" />
                                            <div className="relative px-4 py-3.5 flex items-center justify-center gap-2">
                                                {isSubmitting ? (
                                                    <span className="flex items-center gap-2 font-semibold text-white">
                                                        <div className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                                                        Signing in...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2 font-semibold text-white">
                                                        Continue to WildGuard
                                                        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                                    </span>
                                                )}
                                            </div>
                                        </button>

                                        {/* Divider */}
                                        <div className="relative my-5">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-white/10" />
                                            </div>
                                            <div className="relative flex justify-center text-xs">
                                                <span className="px-4 bg-transparent text-white/40">
                                                    or continue with
                                                </span>
                                            </div>
                                        </div>

                                        {/* Google Sign-In Button */}
                                        <button
                                            id="google-login-btn"
                                            type="button"
                                            onClick={handleGoogleLogin}
                                            className="flex items-center justify-center w-full gap-3 px-4 py-3 text-sm font-medium transition-all border border-white/20 rounded-xl text-white/90 hover:text-white hover:bg-white/10 hover:border-white/40 active:scale-95"
                                        >
                                            {/* Google "G" SVG Logo */}
                                            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                                                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                                                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                                                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                                            </svg>
                                            Sign in with Google
                                        </button>

                                        {/* Guest Access */}
                                        <button
                                            type="button"
                                            className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm transition-colors border border-white/10 rounded-xl text-white/50 hover:text-white/80 hover:bg-white/5"
                                        >
                                            <Leaf size={16} />
                                            Explore as Visitor
                                        </button>

                                        {/* Sign Up Link */}
                                        <p className="pt-4 mt-6 text-sm text-center border-t text-white/60 border-white/10">
                                            New to WildGuard?{' '}
                                            <Link
                                                to="/register"
                                                className="inline-flex items-center gap-1 font-medium text-amber-400 hover:text-amber-300 group"
                                            >
                                                Join the mission
                                                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                                            </Link>
                                        </p>
                                    </form>
                                </div>
                            </div>

                            {/* Trust Badge */}
                            <div className="mt-6 text-center">
                                <p className="text-xs text-white/40">
                                    Protected by end-to-end encryption â€¢ Non-profit initiative
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Moved leaf-float animation to global CSS (src/index.css) */}
        </div>
    );
};

export default Login;
