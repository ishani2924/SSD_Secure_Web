import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Phone, Eye, EyeOff, Github, Leaf, PawPrint, ArrowRight, Shield, Camera, Heart, MapPin, Trophy, Users } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        location: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState('');
    const { register, error } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFetchLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported in this browser.');
            return;
        }

        setIsLocating(true);
        setLocationError('');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                setFormData((prev) => ({
                    ...prev,
                    location: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    }
                }));
                setIsLocating(false);
            },
            () => {
                setLocationError('Location access denied or unavailable. Please allow location to continue.');
                setIsLocating(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.location) {
            setLocationError('Please fetch your location before registering.');
            return;
        }

        setIsSubmitting(true);
        try {
            await register(formData);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-black">
            {/* STUNNING WILDLIFE BACKGROUND - HIGH RESOLUTION */}
            <div className="absolute inset-0">
                {/* African Wildlife Landscape with Elephants, Zebras, and Giraffes */}
                <img 
                    src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80" 
                    alt="African Savannah Wildlife - Elephants, Zebras, and Giraffes at Sunset" 
                    className="object-cover w-full h-full opacity-60"
                />
                {/* Dramatic gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-emerald-950/80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
            </div>

            {/* Floating Particles - Fireflies */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-firefly"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 10}s`,
                            animationDuration: `${8 + Math.random() * 12}s`,
                        }}
                    >
                        <div className="relative">
                            <div className="absolute inset-0 w-2 h-2 rounded-full bg-amber-400/30 blur-md" />
                            <div className="w-1.5 h-1.5 bg-amber-300/80 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Leaves */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-leaf-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 15}s`,
                            animationDuration: `${18 + Math.random() * 20}s`,
                            opacity: 0.1 + Math.random() * 0.2
                        }}
                    >
                        <Leaf size={20 + Math.random() * 35} className="text-emerald-400/30" strokeWidth={1} />
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="relative flex items-center min-h-screen py-12">
                <div className="container px-6 mx-auto lg:px-12">
                    <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
                        
                        {/* Left Side - Enhanced Brand Story with Wildlife Focus */}
                        <div className="space-y-8 lg:w-1/2">
                            {/* Logo with Wildlife Badge */}
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full bg-amber-500/40 blur-2xl animate-pulse" />
                                    <div className="relative p-4 border shadow-2xl bg-black/30 backdrop-blur-xl rounded-2xl border-amber-500/30">
                                        <PawPrint className="text-amber-400" size={36} strokeWidth={1.5} />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold tracking-tight text-white">
                                        Wild<span className="text-amber-400">Guard</span>
                                    </h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <MapPin size={14} className="text-amber-400/70" />
                                        <p className="text-sm text-amber-200/70">African Savannah Conservation</p>
                                    </div>
                                </div>
                            </div>

                            {/* Hero Message with Wildlife Statistics */}
                            <div className="space-y-6">
                                <div className="relative">
                                    <span className="absolute text-8xl text-amber-500/20 -top-8 -left-4">🦁</span>
                                    <h2 className="relative pl-6 text-4xl font-bold leading-tight text-white lg:text-5xl">
                                        Protect Africa's
                                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300">
                                            Magnificent Wildlife
                                        </span>
                                    </h2>
                                </div>
                                
                                <p className="pl-6 text-lg leading-relaxed text-white/80 drop-shadow-lg">
                                    Join our mission to protect elephants, lions, giraffes, and zebras from poaching and habitat loss. 
                                    Every guardian brings us closer to a future where wildlife thrives.
                                </p>
                            </div>

                            {/* Impact Statistics Cards */}
                            <div className="grid grid-cols-3 gap-4 pt-2 pl-6">
                                <div className="p-4 border bg-black/30 backdrop-blur-md rounded-xl border-amber-500/20">
                                    <div className="text-2xl font-bold text-amber-400">3,500+</div>
                                    <div className="mt-1 text-xs tracking-wider uppercase text-white/60">Elephants Saved</div>
                                </div>
                                <div className="p-4 border bg-black/30 backdrop-blur-md rounded-xl border-amber-500/20">
                                    <div className="text-2xl font-bold text-amber-400">125+</div>
                                    <div className="mt-1 text-xs tracking-wider uppercase text-white/60">Rangers Trained</div>
                                </div>
                                <div className="p-4 border bg-black/30 backdrop-blur-md rounded-xl border-amber-500/20">
                                    <div className="text-2xl font-bold text-amber-400">15</div>
                                    <div className="mt-1 text-xs tracking-wider uppercase text-white/60">Reserves</div>
                                </div>
                            </div>

                            {/* Wildlife Species Badges */}
                            <div className="flex flex-wrap items-center gap-3 pt-2 pl-6">
                                <span className="px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full border border-amber-500/30 text-white/80 text-xs flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Elephants
                                </span>
                                <span className="px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full border border-amber-500/30 text-white/80 text-xs flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Lions
                                </span>
                                <span className="px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full border border-amber-500/30 text-white/80 text-xs flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Giraffes
                                </span>
                                <span className="px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full border border-amber-500/30 text-white/80 text-xs flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Zebras
                                </span>
                                <span className="px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full border border-amber-500/30 text-white/80 text-xs flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Rhinos
                                </span>
                            </div>

                            {/* Community Badge - Enhanced */}
                            <div className="flex items-center gap-4 pt-4 pl-6">
                                <div className="flex -space-x-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex items-center justify-center w-10 h-10 text-sm font-bold text-white border-2 rounded-full shadow-xl bg-gradient-to-br from-amber-500 to-amber-600 border-black/50">
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-center w-10 h-10 text-sm font-bold border-2 rounded-full bg-black/50 backdrop-blur-sm border-amber-500/50 text-amber-400">
                                        +50k
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 font-medium text-white">
                                        <Users size={16} className="text-amber-400" />
                                        50,000+ Guardians
                                    </div>
                                    <div className="text-sm text-white/60">Already protecting African wildlife</div>
                                </div>
                            </div>

                            {/* Conservation Impact Message */}
                            <div className="p-5 pl-6 mt-2 border bg-gradient-to-r from-amber-900/40 to-amber-800/20 backdrop-blur-sm rounded-xl border-amber-600/30">
                                <div className="flex items-start gap-3">
                                    <Trophy size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-white/90">2024 Conservation Impact Award Winner</p>
                                        <p className="mt-1 text-xs text-white/60">Recognized for innovative wildlife protection technology</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Enhanced Registration Card */}
                        <div className="lg:w-[480px] relative">
                            {/* Decorative Elements - Enhanced */}
                            <div className="absolute w-64 h-64 rounded-full -top-6 -right-6 bg-amber-600/20 blur-3xl animate-pulse" />
                            <div className="absolute w-64 h-64 rounded-full -bottom-6 -left-6 bg-emerald-600/20 blur-3xl animate-pulse animation-delay-2000" />
                            
                            {/* Main Card - Enhanced Glass Effect */}
                            <div className="relative overflow-hidden border shadow-2xl bg-black/40 backdrop-blur-xl rounded-3xl border-amber-500/30">
                                
                                {/* Card Header with Wildlife Pattern */}
                                <div className="relative h-32 overflow-hidden">
                                    <img 
                                        src="https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=2068&q=80" 
                                        alt="African Savannah Sunset" 
                                        className="object-cover w-full h-full opacity-40"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
                                    
                                    {/* Wildlife Silhouettes */}
                                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute text-2xl bottom-2 left-6 text-white/20">
                                        🦒 🐘 🦁
                                    </div>
                                    
                                    <div className="absolute top-6 left-6">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 border rounded-full bg-black/50 backdrop-blur-md border-amber-500/40">
                                            <UserPlus size={14} className="text-amber-400" />
                                            <span className="text-xs font-medium text-white">Join the Herd</span>
                                        </div>
                                    </div>
                                    
                                    <div className="absolute -bottom-6 -right-6 opacity-20">
                                        <PawPrint size={120} className="text-amber-400" strokeWidth={1.5} />
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-8">
                                    <div className="mb-6">
                                        <h2 className="mb-2 text-2xl font-bold text-white">Create Your Account</h2>
                                        <p className="text-sm text-amber-200/70">Become a guardian of African wildlife today</p>
                                    </div>

                                    {error && (
                                        <div className="p-4 mb-6 border bg-red-950/60 border-red-500/40 rounded-xl backdrop-blur-sm">
                                            <p className="text-sm text-center text-red-200">{error}</p>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Full Name */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-medium text-amber-200/80">
                                                Full Name
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <User className="w-4 h-4 transition-colors text-amber-400/50 group-focus-within:text-amber-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    className="block w-full pl-9 pr-3 py-2.5 bg-black/40 border border-amber-500/30 rounded-lg text-white placeholder-amber-200/30 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                                                    placeholder="Enter your full name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Email Address */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-medium text-amber-200/80">
                                                Email Address
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <Mail className="w-4 h-4 transition-colors text-amber-400/50 group-focus-within:text-amber-400" />
                                                </div>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    className="block w-full pl-9 pr-3 py-2.5 bg-black/40 border border-amber-500/30 rounded-lg text-white placeholder-amber-200/30 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                                                    placeholder="your@email.com"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Phone Number */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-medium text-amber-200/80">
                                                Phone Number <span className="text-amber-200/40">(optional)</span>
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <Phone className="w-4 h-4 transition-colors text-amber-400/50 group-focus-within:text-amber-400" />
                                                </div>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    className="block w-full pl-9 pr-3 py-2.5 bg-black/40 border border-amber-500/30 rounded-lg text-white placeholder-amber-200/30 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                                                    placeholder="+1 (555) 000-9999"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        {/* Registration Location */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-amber-200/80">
                                                Location <span className="text-amber-300">(required for nearest emergency alerts)</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={handleFetchLocation}
                                                disabled={isLocating}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-black/40 border border-amber-500/30 rounded-lg text-amber-200/90 hover:text-white hover:bg-amber-600/20 hover:border-amber-400 transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                <MapPin size={16} />
                                                {isLocating ? 'Fetching location...' : 'Use My Current Location'}
                                            </button>

                                            <div className="text-xs text-amber-100/80 bg-black/30 border border-amber-500/20 rounded-lg px-3 py-2">
                                                {formData.location
                                                    ? `Captured: ${formData.location.coordinates[1].toFixed(6)}, ${formData.location.coordinates[0].toFixed(6)}`
                                                    : 'No location captured yet'}
                                            </div>

                                            {locationError && (
                                                <p className="text-xs text-red-300">{locationError}</p>
                                            )}
                                        </div>

                                        {/* Password */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-medium text-amber-200/80">
                                                Password
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <Lock className="w-4 h-4 transition-colors text-amber-400/50 group-focus-within:text-amber-400" />
                                                </div>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="password"
                                                    className="block w-full pl-9 pr-9 py-2.5 bg-black/40 border border-amber-500/30 rounded-lg text-white placeholder-amber-200/30 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                                                    placeholder="Create a strong password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="w-4 h-4 transition-colors text-amber-400/50 hover:text-amber-400" />
                                                    ) : (
                                                        <Eye className="w-4 h-4 transition-colors text-amber-400/50 hover:text-amber-400" />
                                                    )}
                                                </button>
                                            </div>
                                            <p className="mt-1 text-xs text-amber-200/40">
                                                Minimum 8 characters with letters & numbers
                                            </p>
                                        </div>

                                        {/* Terms & Conditions */}
                                        <div className="flex items-start gap-3 pt-2">
                                            <input
                                                type="checkbox"
                                                id="terms"
                                                checked={acceptedTerms}
                                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                                className="w-4 h-4 mt-1 rounded border-amber-500/30 bg-black/40 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                                            />
                                            <label htmlFor="terms" className="text-xs text-amber-200/70">
                                                I agree to the{' '}
                                                <a href="#" className="font-medium text-amber-400 hover:text-amber-300">Terms of Service</a>
                                                {' '}and{' '}
                                                <a href="#" className="font-medium text-amber-400 hover:text-amber-300">Privacy Policy</a>
                                                , and I commit to protecting African wildlife and their habitats.
                                            </label>
                                        </div>

                                        {/* Register Button - Enhanced */}
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !acceptedTerms}
                                            className="relative w-full mt-4 overflow-hidden rounded-lg group disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <div className="absolute inset-0 transition-transform bg-gradient-to-r from-amber-600 to-amber-700 group-hover:scale-105" />
                                            <div className="absolute inset-0 transition-opacity opacity-0 group-hover:opacity-100 bg-gradient-to-r from-amber-500 to-amber-600" />
                                            <div className="absolute inset-0 opacity-20 group-hover:opacity-30" 
                                                style={{
                                                    backgroundImage: 'repeating-linear-gradient(45deg, white 0px, white 2px, transparent 2px, transparent 8px)',
                                                }}
                                            />
                                            <div className="relative flex items-center justify-center gap-2 px-4 py-3">
                                                {isSubmitting ? (
                                                    <span className="flex items-center gap-2 text-sm font-semibold text-white">
                                                        <div className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                                                        Creating Account...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2 text-sm font-semibold text-white">
                                                        <PawPrint size={16} />
                                                        Become a Wildlife Guardian
                                                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                                    </span>
                                                )}
                                            </div>
                                        </button>

                                        {/* Social Login */}
                                        <div className="relative my-4">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-amber-500/20" />
                                            </div>
                                            <div className="relative flex justify-center text-xs">
                                                <span className="px-4 bg-black/40 text-amber-200/60">
                                                    or sign up with
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-black/40 border border-amber-500/30 rounded-lg text-amber-200/80 hover:text-white hover:bg-amber-600/20 hover:border-amber-400 transition-all text-sm"
                                            >
                                                <Github size={16} />
                                                GitHub
                                            </button>
                                            <button
                                                type="button"
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-black/40 border border-amber-500/30 rounded-lg text-amber-200/80 hover:text-white hover:bg-amber-600/20 hover:border-amber-400 transition-all text-sm"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                </svg>
                                                Google
                                            </button>
                                        </div>

                                        {/* Login Link */}
                                        <p className="pt-4 mt-6 text-xs text-center border-t text-amber-200/60 border-amber-500/20">
                                            Already protecting wildlife?{' '}
                                            <Link 
                                                to="/login" 
                                                className="inline-flex items-center gap-1 font-medium text-amber-400 hover:text-amber-300 group"
                                            >
                                                Sign in here
                                                <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                                            </Link>
                                        </p>
                                    </form>
                                </div>
                            </div>

                            {/* Enhanced Trust Badge */}
                            <div className="mt-6 text-center">
                                <p className="flex items-center justify-center gap-2 text-xs text-amber-200/50">
                                    <Shield size={12} />
                                    SSL Encrypted • 100% of proceeds go to African wildlife conservation
                                </p>
                                <p className="mt-2 text-xs text-amber-200/30">
                                    Verified non-profit • EIN: 84-1234567
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes firefly {
                    0% {
                        transform: translateY(0) translateX(0) scale(1);
                        opacity: 0;
                    }
                    20% {
                        opacity: 0.8;
                    }
                    80% {
                        opacity: 0.6;
                    }
                    100% {
                        transform: translateY(-100px) translateX(50px) scale(0.5);
                        opacity: 0;
                    }
                }
                @keyframes leaf-float {
                    0% {
                        transform: translateY(100vh) rotate(0deg);
                        opacity: 0;
                    }
                    20% {
                        opacity: 0.3;
                    }
                    80% {
                        opacity: 0.2;
                    }
                    100% {
                        transform: translateY(-100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
                .animate-firefly {
                    animation: firefly linear infinite;
                }
                .animate-leaf-float {
                    animation: leaf-float linear infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
            `}</style>
        </div>
    );
};

export default Register;