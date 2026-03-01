import { ArrowRight, Sparkles, Star, Shield, Clock } from "lucide-react";
import heroImage from "../assets/landingpageBG.png";
import { Button } from "./ui/button.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Starter() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-[95vh] flex items-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-orange-50/50" />
      <div className="absolute inset-0 bg-mesh opacity-50" />
      
      {/* Floating Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] -top-48 -right-48 bg-gradient-to-br from-primary/20 to-blue-400/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute w-[500px] h-[500px] top-1/2 -left-48 bg-gradient-to-br from-accent/20 to-orange-400/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute w-[400px] h-[400px] -bottom-24 right-1/4 bg-gradient-to-br from-cyan-400/15 to-blue-400/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 border-2 border-primary/20 rounded-full animate-float opacity-40" />
      <div className="absolute bottom-32 right-20 w-16 h-16 border-2 border-accent/20 rounded-lg rotate-45 animate-float animation-delay-2000 opacity-40" />
      <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-primary/10 rounded-full animate-pulse" />

      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className={`space-y-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-full border border-primary/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary">
                Nepal's #1 Service Marketplace
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
              Find Trusted
              <span className="block mt-2 text-gradient-animated">
                Service Providers
              </span>
              <span className="block mt-2">Near You</span>
            </h1>

            {/* Description */}
            <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
              SkillLink connects you with verified plumbers, electricians,
              carpenters, and technicians in your area. Quality service,
              transparent pricing, trusted reviews.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button 
                size="lg" 
                className="text-lg h-14 px-8 rounded-full bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 btn-shine group"
                onClick={() => navigate('/Login')}
              >
                Find Services
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg h-14 px-8 rounded-full border-2 hover:bg-accent/10 hover:border-accent hover:text-accent transition-all duration-300"
                onClick={() => navigate('/provider-signup')}
              >
                Become a Provider
              </Button>
            </div>

            {/* Stats with Animation */}
            <div className="flex items-center gap-6 lg:gap-10 pt-6">
              {[
                { value: "2,500+", label: "Service Providers", delay: "delay-100" },
                { value: "10,000+", label: "Happy Customers", delay: "delay-200" },
                { value: "4.8★", label: "Average Rating", delay: "delay-300" },
              ].map((stat, index) => (
                <div 
                  key={index} 
                  className={`transition-all duration-700 ${stat.delay} ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                >
                  <p className="text-3xl lg:text-4xl font-bold text-gradient">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className={`flex flex-wrap items-center gap-6 pt-4 transition-all duration-700 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <span>Verified Pros</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Star className="w-4 h-4 text-yellow-600" />
                </div>
                <span>Top Rated</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <span>Quick Booking</span>
              </div>
            </div>
          </div>

          {/* Right - Hero Image */}
          <div className={`relative transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            {/* Decorative rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[90%] h-[90%] rounded-full border-2 border-dashed border-primary/10 animate-spin-slow" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[75%] h-[75%] rounded-full border-2 border-dashed border-accent/10 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '20s' }} />
            </div>
            
            {/* Glow effect behind image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-accent/30 rounded-3xl blur-3xl opacity-50 animate-pulse" />
            
            {/* Main image */}
            <div className="relative">
              <img
                src={heroImage}
                alt="Skilled workers ready to help"
                className="relative rounded-3xl shadow-2xl w-full object-cover animate-float"
              />
              
              {/* Floating Cards */}
              <div className="absolute -left-8 top-1/4 bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-xl animate-fade-in-left border border-white/50" style={{ animationDelay: '0.8s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">100% Verified</p>
                    <p className="text-xs text-muted-foreground">All providers checked</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -right-4 bottom-1/4 bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-xl animate-fade-in-right border border-white/50" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">4.9 Rating</p>
                    <p className="text-xs text-muted-foreground">10k+ reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-700 delay-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <span className="text-sm">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-muted-foreground/50 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Starter;
