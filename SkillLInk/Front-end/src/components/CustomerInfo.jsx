
import { CheckCircle2, Sparkles, ArrowRight, Shield, Wallet, Clock, Star } from "lucide-react";
import { Button } from "./ui/button.jsx";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const benefits = [
  { text: "Find verified service providers near you instantly", icon: Shield },
  { text: "Compare ratings, reviews, and pricing transparently", icon: Star },
  { text: "Book services at your convenience", icon: Clock },
  { text: "Secure payment with eSewa and Khalti integration", icon: Wallet },
  { text: "Real-time booking updates and notifications", icon: Clock },
  { text: "24/7 customer support for any issues", icon: Shield },
];

const CustomerInfo = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
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
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/30" />
      <div className="absolute inset-0 bg-mesh opacity-40" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-400/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-full border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary">
                For Customers
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Get Quality Service
              <span className="block text-gradient mt-2">
                At Your Doorstep
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              Whether you need a quick repair or a major renovation, SkillLink connects 
              you with trusted professionals who deliver quality work on time.
            </p>
            
            {/* Benefits List */}
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li 
                  key={index} 
                  className={`flex items-start gap-4 transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                  }`}
                  style={{ transitionDelay: `${(index + 2) * 100}ms` }}
                >
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-lg text-foreground">{benefit.text}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              size="lg"
              className="text-lg h-14 px-8 rounded-full bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 btn-shine group"
              onClick={() => navigate('/customer-signup')}
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
          {/* Right - Interactive Card */}
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-cyan-400/20 rounded-3xl blur-3xl opacity-60" />
            
            {/* Main Card */}
            <div className="relative glass-card rounded-3xl p-8 shadow-2xl">
              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex items-center gap-4 p-5 bg-white/80 rounded-2xl border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg">Search for services</p>
                    <p className="text-sm text-muted-foreground">Find the right professional</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                
                {/* Step 2 */}
                <div className="flex items-center gap-4 p-5 bg-white/80 rounded-2xl border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg">Compare & Book</p>
                    <p className="text-sm text-muted-foreground">Choose based on reviews</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                
                {/* Step 3 - Highlighted */}
                <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-accent/10 to-orange-500/10 rounded-2xl border-2 border-accent shadow-lg animate-pulse-glow">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg text-accent">Get it done!</p>
                    <p className="text-sm text-muted-foreground">Quality service delivered</p>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-accent" />
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border/50">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">98%</p>
                  <p className="text-xs text-muted-foreground">Satisfaction</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">15min</p>
                  <p className="text-xs text-muted-foreground">Avg Response</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">Secure</p>
                  <p className="text-xs text-muted-foreground">Payments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerInfo;