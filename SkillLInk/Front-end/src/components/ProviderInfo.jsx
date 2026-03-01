//import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Wallet, Clock, Sparkles, ArrowRight, CheckCircle, Star, Zap } from "lucide-react";
import { Button } from "./ui/button.jsx";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const features = [
  {
    icon: Users,
    title: "Reach More Customers",
    description: "Connect with thousands of potential clients looking for your services",
    color: "from-blue-500 to-cyan-500",
    bgLight: "bg-blue-100",
  },
  {
    icon: Wallet,
    title: "Secure Payments",
    description: "Get paid quickly and safely through our integrated payment system",
    color: "from-green-500 to-emerald-500",
    bgLight: "bg-green-100",
  },
  {
    icon: Clock,
    title: "Flexible Schedule",
    description: "Manage your availability and bookings on your own terms",
    color: "from-purple-500 to-pink-500",
    bgLight: "bg-purple-100",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Business",
    description: "Build your reputation and expand your service offerings",
    color: "from-orange-500 to-amber-500",
    bgLight: "bg-orange-100",
  },
];

const ProviderInfo = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-white to-amber-50/30" />
      <div className="absolute inset-0 bg-dots opacity-30" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-400/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Feature Cards */}
          <div className={`order-2 lg:order-1 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index}
                    className={`relative p-6 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-border/50 hover:border-accent/50 transition-all duration-500 cursor-pointer overflow-hidden group ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: `${(index + 2) * 100}ms` }}
                    onMouseEnter={() => setHoveredCard(index)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Hover gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                    
                    {/* Arrow indicator */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Right - Content */}
          <div className={`order-1 lg:order-2 space-y-8 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent/10 to-orange-500/10 rounded-full border border-accent/20">
              <Sparkles className="w-4 h-4 text-accent animate-pulse" />
              <span className="text-sm font-semibold text-accent">
                For Service Providers
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Grow Your Business
              <span className="block bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent mt-2">
                With SkillLink
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              Join our platform and take your service business to the next level. 
              Showcase your skills, manage bookings efficiently, and build lasting 
              customer relationships.
            </p>
            
            {/* Highlight Stats */}
            <div className="space-y-6">
              <div className="flex items-center gap-5 p-5 bg-white/80 backdrop-blur rounded-2xl border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-white">0%</span>
                </div>
                <div>
                  <p className="font-bold text-lg">Commission for first 3 months</p>
                  <p className="text-muted-foreground">Start earning from day one</p>
                </div>
                <Zap className="w-6 h-6 text-yellow-500 ml-auto animate-pulse" />
              </div>
              
              <div className="flex items-center gap-5 p-5 bg-white/80 backdrop-blur rounded-2xl border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-xl font-bold text-white">24/7</span>
                </div>
                <div>
                  <p className="font-bold text-lg">Support & Training</p>
                  <p className="text-muted-foreground">We help you succeed</p>
                </div>
                <Star className="w-6 h-6 text-yellow-500 ml-auto" />
              </div>
            </div>
            
            {/* CTA Button */}
            <Button 
              size="lg"
              className="text-lg h-14 px-8 rounded-full bg-gradient-to-r from-accent to-orange-500 hover:from-accent/90 hover:to-orange-500/90 shadow-xl hover:shadow-2xl hover:shadow-accent/20 transition-all duration-500 btn-shine group"
              onClick={() => navigate('/provider-signup')}
            >
              Join as Provider
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Free to join</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>No hidden fees</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Quick approval</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProviderInfo;