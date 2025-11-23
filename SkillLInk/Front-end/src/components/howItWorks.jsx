import { Search, UserCheck, Calendar, Star } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search Services",
    description: "Browse and find the right service provider based on your location and needs",
  },
  {
    icon: UserCheck,
    title: "View Profiles",
    description: "Check provider ratings, reviews, and work portfolios to make informed decisions",
  },
  {
    icon: Calendar,
    title: "Book & Pay",
    description: "Schedule your service and pay securely through our integrated payment system",
  },
  {
    icon: Star,
    title: "Rate & Review",
    description: "Share your experience to help others and improve service quality",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Getting the help you need is simple and straightforward
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index}
                className="relative flex flex-col items-center text-center space-y-4"
              >
                <div className="relative z-10 w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Icon className="w-16 h-16 text-slate-600" />
                </div>
                <div className="absolute top-12 -left-4 text-8xl font-bold text-muted/10">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;