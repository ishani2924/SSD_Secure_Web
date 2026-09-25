import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Shield, Target, Users, Globe, Zap, CheckCircle } from 'lucide-react';

const About = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
                {/* Vision Section */}
                <div className="text-center mb-24">
                    <h1 className="text-5xl font-extrabold text-white mb-8">Our Mission</h1>
                    <p className="max-w-3xl mx-auto text-xl text-text-muted leading-relaxed">
                        WildAsset Protocol is the world's first decentralized platform dedicated to the tokenization of real-world wildlife conservation assets. We believe that by fractionalizing ownership, we can democratize conservation and unlock billions in capital for our planet's most vulnerable ecosystems.
                    </p>
                </div>

                {/* Core Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
                    <div className="p-10 glass-morphism space-y-6">
                        <div className="p-3 inline-block bg-primary/20 rounded-xl">
                            <Shield className="text-primary" size={32} />
                        </div>
                        <h2 className="text-3xl font-bold text-white">The Challenge</h2>
                        <p className="text-text-muted leading-relaxed">
                            Traditional conservation funding is often centralized, slow, and lacks transparency. Millions of hectares of wildlife habitat are lost every year because traditional financial models fail to capture the real-world value of biodiversity.
                        </p>
                    </div>

                    <div className="p-10 glass-morphism border-primary/30 space-y-6">
                        <div className="p-3 inline-block bg-primary/20 rounded-xl">
                            <Zap className="text-primary" size={32} />
                        </div>
                        <h2 className="text-3xl font-bold text-white">The WildAsset Solution</h2>
                        <p className="text-text-muted leading-relaxed">
                            We use blockchain technology to turn physical land and wildlife assets into digital tokens. This allows anyone, anywhere, to own a fraction of a conservation project, participating in its governance and supporting its impact directly.
                        </p>
                    </div>
                </div>

                {/* Values Table */}
                <div className="glass-morphism overflow-hidden">
                    <div className="p-8 border-b border-border">
                        <h3 className="text-2xl font-bold text-white">Our Technology Stack</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
                        {[
                            { title: "Smart Contracts", tech: "Solidity / Polygon", desc: "Secure, automated asset management and distribution." },
                            { title: "Data Oracles", tech: "Chainlink", desc: "Verifying real-world conservation data on-chain." },
                            { title: "Storage", tech: "IPFS", desc: "Decentralized storage for asset documentation and certificates." }
                        ].map((item, i) => (
                            <div key={i} className="p-8 space-y-4">
                                <h4 className="text-primary font-bold">{item.title}</h4>
                                <p className="text-white text-lg font-semibold">{item.tech}</p>
                                <p className="text-text-muted text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team / Global Impact */}
                <div className="mt-32 text-center">
                    <h2 className="text-4xl font-bold text-white mb-16">Global Impact Network</h2>
                    <div className="flex flex-wrap justify-center gap-12">
                        {[
                            { icon: <Globe />, label: "12 Countries" },
                            { icon: <Target />, label: "45 Species Protected" },
                            { icon: <Users />, label: "50k+ Community" },
                            { icon: <CheckCircle />, label: "Verified Impact" }
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-surface rounded-full text-primary">
                                    {stat.icon}
                                </div>
                                <span className="text-white font-medium">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default About;
