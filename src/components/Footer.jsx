import React from 'react';
import { Globe, Shield, Github, Twitter, Linkedin, Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="mt-20 border-t border-border bg-surface/30 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-2xl font-bold text-white">
                            <Globe className="text-primary" />
                            <span>WildAsset</span>
                        </div>
                        <p className="text-text-muted text-sm leading-relaxed">
                            Revolutionizing wildlife conservation through blockchain-based RWA tokenization and fractional ownership.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Platform</h4>
                        <ul className="space-y-3 text-sm text-text-muted">
                            <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
                            <li><a href="/about" className="hover:text-primary transition-colors">About</a></li>
                            <li><a href="/dashboard" className="hover:text-primary transition-colors">Marketplace</a></li>
                            <li><a href="/login" className="hover:text-primary transition-colors">Login</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Legal</h4>
                        <ul className="space-y-3 text-sm text-text-muted">
                            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Compliance</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Connect</h4>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 glass-morphism hover:bg-primary/20 transition-colors">
                                <Twitter size={20} className="text-text-muted" />
                            </a>
                            <a href="#" className="p-2 glass-morphism hover:bg-primary/20 transition-colors">
                                <Linkedin size={20} className="text-text-muted" />
                            </a>
                            <a href="#" className="p-2 glass-morphism hover:bg-primary/20 transition-colors">
                                <Github size={20} className="text-text-muted" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-text-muted">
                        © 2026 WildAsset Protocol. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                        Made with <Heart size={16} className="text-red-500 fill-red-500" /> for Wildlife
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
