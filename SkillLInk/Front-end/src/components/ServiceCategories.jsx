
import { Wrench, Zap, Hammer, PaintBucket, Droplets, Laptop, Tv, Shield, ArrowRight, Sparkles } from "lucide-react";
import { Card } from "./ui/Card.jsx";
import { useState, useEffect, useRef } from "react";

const categories = [
  {
    icon: Wrench,
    title: "Plumbing",
    description: "Pipe repairs, installations, and maintenance",
    color: "from-blue-500 to-cyan-500",
    bgLight: "bg-blue-50",
    providers: "450+",
  },
  {
    icon: Zap,
    title: "Electrical",
    description: "Wiring, repairs, and electrical installations",
    color: "from-yellow-500 to-orange-500",
    bgLight: "bg-yellow-50",
    providers: "380+",
  },
  {
    icon: Hammer,
    title: "Carpentry",
    description: "Furniture making, repairs, and custom woodwork",
    color: "from-amber-600 to-orange-700",
    bgLight: "bg-amber-50",
    providers: "290+",
  },
  {
    icon: PaintBucket,
    title: "Painting",
    description: "Interior and exterior painting services",
    color: "from-purple-500 to-pink-500",
    bgLight: "bg-purple-50",
    providers: "320+",
  },
  {
    icon: Droplets,
    title: "Cleaning",
    description: "Home and office cleaning services",
    color: "from-teal-500 to-emerald-500",
    bgLight: "bg-teal-50",
    providers: "510+",
  },
  {
    icon: Laptop,
    title: "IT Services",
    description: "Computer repair and tech support",
    color: "from-indigo-500 to-blue-600",
    bgLight: "bg-indigo-50",
    providers: "180+",
  },
  {
    icon: Tv,
    title: "Appliance Repair",
    description: "Fix your household appliances",
    color: "from-red-500 to-rose-600",
    bgLight: "bg-red-50",
    providers: "260+",
  },
  {
    icon: Shield,
    title: "Security",
    description: "CCTV installation and security systems",
    color: "from-slate-600 to-gray-700",
    bgLight: "bg-slate-50",
    providers: "140+",
  },
];

const ServiceCategories = () => {
  const [visibleCards, setVisibleCards] = useState([]);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate cards one by one
            categories.forEach((_, index) => {
              setTimeout(() => {
                setVisibleCards((prev) => [...prev, index]);
              }, index * 100);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-28 relative overflow-hidden" id="services">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/30 to-white" />
      <div className="absolute inset-0 bg-dots opacity-30" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">What We Offer</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            Popular <span className="text-gradient">Services</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse our wide range of trusted professionals ready to help with your needs
          </p>
        </div>
        
        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const isVisible = visibleCards.includes(index);
            
            return (
              <Card 
                key={index}
                className={`group relative p-6 bg-white/80 backdrop-blur-sm hover:bg-white border-2 border-transparent hover:border-primary/20 transition-all duration-500 cursor-pointer overflow-hidden ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {/* Hover gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                {/* Icon */}
                <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:shadow-xl group-hover:-rotate-3 transition-all duration-500`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                  {category.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {category.description}
                </p>
                
                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <span className="text-xs font-medium text-muted-foreground">
                    {category.providers} providers
                  </span>
                  <div className="flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceCategories;