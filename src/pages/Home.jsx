import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Globe, Shield, Zap, TrendingUp, Users, ArrowRight, 
  Layers, Lock, Landmark, ChevronRight, ChevronLeft,
  Leaf, Droplets, TreePine, Heart, Award, Sparkles,
  Play, CheckCircle, Star, MapPin, Camera
} from 'lucide-react';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Wildlife slideshow images with captions
  const slides = [
    {
      url: "https://images.unsplash.com/photo-1549366021-9f761d450615?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      title: "African Elephant",
      location: "Savanna Ecosystem",
      description: "Protecting the giants of the wild"
    },
    {
      url: "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      title: "Bengal Tiger",
      location: "Sunderbans Reserve",
      description: "Securing habitats for endangered species"
    },
    {
      url: "https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      title: "Mountain Gorilla",
      location: "Virunga Mountains",
      description: "Preserving biodiversity hotspots"
    },
    {
      url: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      title: "Great Barrier Reef",
      location: "Marine Protected Area",
      description: "Tokenizing ocean conservation"
    }
  ];

  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="min-h-screen bg-background text-text selection:bg-primary/30">
      <Navbar />

      {/* Hero Section with Slideshow */}
      <section className="relative h-screen overflow-hidden">
        {/* Slideshow Background */}
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-background/80 z-10" />
              <img
                src={slide.url}
                alt={slide.title}
                className="w-full h-full object-cover transform animate-ken-burns"
              />
            </div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-20 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Column - Text Content */}
              <div className="text-left animate-slide-up">
                <div className="inline-flex items-center gap-3 px-4 py-2 mb-8 bg-white/5 backdrop-blur-md rounded-full border border-white/10 group cursor-pointer hover:border-primary/50 transition-all">
                  <Sparkles size={16} className="text-primary animate-pulse" />
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white">
                    The Future of Wildlife Preservation
                  </span>
                  <ChevronRight size={14} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                </div>

                <h1 className="text-6xl lg:text-8xl font-black text-white mb-8 leading-[0.9] tracking-tighter">
                  Invest in the <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent animate-gradient">
                    Wild Assets
                  </span>
                </h1>

                <p className="text-xl text-text-muted mb-10 leading-relaxed max-w-xl font-medium">
                  Join the WildAsset Protocol. Secure the future of our planet through 
                  fractional ownership of wildlife habitats, powered by transparent 
                  blockchain technology.
                </p>

                <div className="flex flex-wrap gap-6">
                  <Link
                    to="/register"
                    className="btn-primary group !py-4 !px-10"
                  >
                    Get Started 
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </Link>
                  
                  <Link
                    to="/about"
                    className="btn-secondary !py-4 !px-10"
                  >
                    <Play size={18} fill="currentColor" /> Watch Story
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="mt-16 flex items-center gap-10">
                  <div className="flex items-center gap-3 group px-4 py-2 rounded-xl hover:bg-white/5 transition-all">
                    <CheckCircle size={24} className="text-primary" />
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white uppercase tracking-wider">Fully Regulated</span>
                      <span className="text-[10px] text-text-muted">SEC Compliant</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 group px-4 py-2 rounded-xl hover:bg-white/5 transition-all">
                    <Shield size={24} className="text-secondary" />
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white uppercase tracking-wider">Secure Assets</span>
                      <span className="text-[10px] text-text-muted">Managed on-chain</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Live Stats Card */}
              <div className="hidden lg:block animate-fade-in group">
                <div className="premium-card !p-10 relative overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px] group-hover:bg-primary/30 transition-all duration-700" />
                  
                  <div className="flex items-center justify-between mb-10 relative z-10">
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight">Ecosystem Vitals</h3>
                      <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">Real-time Metrics</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/20">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                      <span className="text-[10px] text-green-500 font-black uppercase">Active Now</span>
                    </div>
                  </div>
                  
                  <div className="space-y-10 relative z-10">
                    {[
                      { label: "Total Reserve Value", value: "$24,582,000", progress: 85, color: "var(--primary)" },
                      { label: "Land Area Protected", value: "120,450 Acres", progress: 65, color: "var(--secondary)" },
                      { label: "Conservation Holders", value: "15,892 Nodes", progress: 92, color: "var(--accent)" }
                    ].map((m, i) => (
                      <div key={i} className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-sm text-text-muted font-bold uppercase tracking-wider">{m.label}</span>
                          <span className="text-lg font-black text-white font-mono">{m.value}</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className="h-full rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${m.progress}%`, backgroundColor: m.color, boxShadow: `0 0 15px ${m.color}66` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 pt-10 border-t border-white/10 relative z-10">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="flex flex-col gap-1">
                        <div className="text-3xl font-black text-white tracking-tighter italic">42+</div>
                        <div className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em]">Partner Hubs</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="text-3xl font-black text-white tracking-tighter italic">12</div>
                        <div className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em]">Nations Active</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slideshow Controls */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-8 px-8 py-4 bg-white/5 backdrop-blur-2xl rounded-full border border-white/10 shadow-premium">
          <button
            onClick={prevSlide}
            className="p-2 text-text-muted hover:text-white transition-all transform hover:scale-110 active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex gap-4 items-center">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentSlide(index);
                }}
                className={`h-1 rounded-full transition-all duration-500 ${
                  index === currentSlide 
                    ? 'w-12 bg-primary shadow-[0_0_10px_var(--primary)]' 
                    : 'w-4 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={nextSlide}
            className="p-2 text-text-muted hover:text-white transition-all transform hover:scale-110 active:scale-95"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-40 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-32">
            <div className="inline-flex items-center gap-3 px-4 py-2 mb-8 bg-primary/5 rounded-full border border-primary/20">
              <Award size={18} className="text-primary" />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-primary">Core Advantages</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">
              A Platform Built for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Sustainable Impact
              </span>
            </h2>
            <p className="text-xl text-text-muted max-w-3xl mx-auto font-medium">
              We leverage advanced multi-chain architecture to make wildlife 
              conservation liquid, transparent, and accessible to everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Layers size={32} />,
                title: "Fractional Ownership",
                desc: "Own piece of a sanctuary starting from just $10. True democratization of conservation capital.",
                color: "primary",
                stats: "$10 Entry Point"
              },
              {
                icon: <Lock size={32} />,
                title: "Proof of Impact",
                desc: "Every milestone verified on-chain. Real-time cameras and LIDAR data secure your investment.",
                color: "secondary",
                stats: "24/7 Monitoring"
              },
              {
                icon: <Landmark size={32} />,
                title: "RWA Liquidity",
                desc: "Trade your conservation credits on our secondary marketplace. Liquidity meets ecology.",
                color: "accent",
                stats: "$12M Vol/m"
              },
              {
                icon: <Shield size={32} />,
                title: "Enterprise Grade",
                desc: "Audited smart contracts and deep-level insurance for your digital asset portfolio.",
                color: "primary",
                stats: "Fully Insured"
              },
              {
                icon: <TrendingUp size={32} />,
                title: "Yield Generation",
                desc: "Earn sustainable yields through eco-tourism and carbon credit secondary markets.",
                color: "secondary",
                stats: "Up to 14% APY"
              },
              {
                icon: <Users size={32} />,
                title: "DAO Governance",
                desc: "Your tokens are your voice. Vote on expansion proposals and resource allocation.",
                color: "accent",
                stats: "Self Sovereign"
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="premium-card group hover:-translate-y-4"
              >
                <div className={`w-16 h-16 mb-8 rounded-2xl bg-${feature.color}/10 flex items-center justify-center text-${feature.color} group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-text-muted mb-8 leading-relaxed font-medium">{feature.desc}</p>
                
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                  <span className={`text-[10px] font-black text-${feature.color} uppercase tracking-[0.2em]`}>
                    {feature.stats}
                  </span>
                  <div className="p-2 bg-white/5 rounded-full group-hover:bg-primary/20 transition-all">
                    <ArrowRight size={16} className="text-text-muted group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 relative px-6 group">
        <div className="max-w-7xl mx-auto premium-card !p-20 relative overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/30 border-primary/20 hover:border-primary/40">
          <div className="absolute inset-0 bg-background/40 backdrop-blur-3xl -z-10" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] -z-10 animate-float" />
          
          <div className="max-w-3xl mx-auto text-center relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 mb-10 bg-white/10 rounded-full border border-white/10">
              <Heart size={18} className="text-primary animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white">The Global Movement</span>
            </div>

            <h2 className="text-5xl md:text-8xl font-black text-white mb-10 leading-[0.9] tracking-tighter">
              Ready to claim your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Legacy?
              </span>
            </h2>

            <p className="text-xl text-text-muted mb-16 font-medium leading-relaxed">
              Join 15,000+ pioneers in the first multi-chain protocol dedicated 
              to real-world wildlife asset tokenization. Be part of the change.
            </p>

            <div className="flex flex-wrap justify-center gap-8">
              <Link
                to="/register"
                className="btn-primary !py-5 !px-12 !text-lg shadow-2xl hover:shadow-primary/50"
              >
                Join the Waitlist
              </Link>
              
              <Link
                to="/projects"
                className="btn-secondary !py-5 !px-12 !text-lg"
              >
                Explore Projects
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes ken-burns {
          0% { transform: scale(1); }
          100% { transform: scale(1.15); }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-ken-burns {
          animation: ken-burns 30s ease-in-out infinite alternate;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 5s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;