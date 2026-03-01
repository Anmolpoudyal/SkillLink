import { Search, UserCheck, Calendar, Star, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const steps = [
  {
    icon: Search,
    title: "Search Services",
    description: "Browse and find the right service provider based on your location and needs",
    color: "from-blue-500 to-cyan-500",
    features: ["Location-based search", "Filter by ratings"],
  },
  {
    icon: UserCheck,
    title: "View Profiles",
    description: "Check provider ratings, reviews, and work portfolios to make informed decisions",
    color: "from-purple-500 to-pink-500",
    features: ["Verified reviews", "Portfolio gallery"],
  },
  {
    icon: Calendar,
    title: "Book & Pay",
    description: "Schedule your service and pay securely through our integrated payment system",
    color: "from-green-500 to-emerald-500",
    features: ["Flexible scheduling", "Secure payments"],
  },
  {
    icon: Star,
    title: "Rate & Review",
    description: "Share your experience to help others and improve service quality",
    color: "from-orange-500 to-amber-500",
    features: ["Leave feedback", "Build community"],
  },
];

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
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

  // Auto-rotate active step
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section ref={sectionRef} className="py-28 relative overflow-hidden" id="how-it-works">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30" />
      <div className="absolute inset-0 bg-grid opacity-30" />
      
      {/* Decorative blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Simple Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Getting the help you need is simple and straightforward
          </p>
        </div>
        
        {/* Steps Container */}
        <div className="max-w-6xl mx-auto">
          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-8 relative">
            {/* Connecting line */}
            <div className="absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <div 
              className="absolute top-20 left-0 h-1 bg-gradient-to-r from-primary to-accent transition-all duration-700"
              style={{ width: `${(activeStep + 1) * 25}%` }}
            />
            
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeStep;
              const isPast = index < activeStep;
              
              return (
                <div 
                  key={index}
                  className={`relative flex flex-col items-center text-center transition-all duration-700 cursor-pointer ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                  onClick={() => setActiveStep(index)}
                >
                  {/* Step number background */}
                  <div className={`absolute -top-2 text-[120px] font-bold transition-all duration-500 ${
                    isActive ? 'text-primary/10' : 'text-muted/5'
                  }`}>
                    {index + 1}
                  </div>
                  
                  {/* Icon circle */}
                  <div className={`relative z-10 w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isActive 
                      ? `bg-gradient-to-br ${step.color} shadow-2xl scale-110` 
                      : isPast 
                        ? 'bg-primary/20 scale-100'
                        : 'bg-muted scale-95'
                  }`}>
                    <Icon className={`w-16 h-16 transition-colors duration-300 ${
                      isActive || isPast ? 'text-white' : 'text-muted-foreground'
                    }`} />
                    
                    {/* Pulse ring for active */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent animate-ping opacity-20" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className={`mt-8 transition-all duration-500 ${isActive ? 'transform-none' : 'opacity-70'}`}>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-[200px]">
                      {step.description}
                    </p>
                    
                    {/* Features - only show for active */}
                    <div className={`mt-4 space-y-2 transition-all duration-500 ${isActive ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                      {step.features.map((feature, i) => (
                        <div key={i} className="flex items-center justify-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div 
                  key={index}
                  className={`flex gap-6 items-start p-6 rounded-2xl bg-white/80 backdrop-blur border border-border/50 shadow-sm transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Step {index + 1}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Progress dots for desktop */}
        <div className="hidden lg:flex justify-center gap-2 mt-12">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeStep 
                  ? 'bg-primary w-8' 
                  : 'bg-muted hover:bg-primary/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;