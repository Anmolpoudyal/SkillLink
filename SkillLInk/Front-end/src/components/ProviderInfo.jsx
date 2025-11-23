//import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Wallet, Clock } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Reach More Customers",
    description: "Connect with thousands of potential clients looking for your services",
  },
  {
    icon: Wallet,
    title: "Secure Payments",
    description: "Get paid quickly and safely through our integrated payment system",
  },
  {
    icon: Clock,
    title: "Flexible Schedule",
    description: "Manage your availability and bookings on your own terms",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Business",
    description: "Build your reputation and expand your service offerings",
  },
];

const ProviderInfo = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index}
                    className="p-6 bg-card rounded-2xl border-2 border-border hover:border-primary/50 transition-all hover:shadow-lg"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="order-1 lg:order-2 space-y-8">
            <div className="inline-block px-4 py-2 bg-accent/10 rounded-full">
              <span className="text-sm font-semibold text-accent">
                For Service Providers
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Grow Your Business
              <span className="block text-accent">
                With SkillLink
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground">
              Join our platform and take your service business to the next level. 
              Showcase your skills, manage bookings efficiently, and build lasting 
              customer relationships.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">0%</span>
                </div>
                <div>
                  <p className="font-semibold text-lg">Commission for first 3 months</p>
                  <p className="text-muted-foreground">Start earning from day one</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-accent">24/7</span>
                </div>
                <div>
                  <p className="font-semibold text-lg">Support & Training</p>
                  <p className="text-muted-foreground">We help you succeed</p>
                </div>
              </div>
            </div>
            
            {/* <Button 
              size="lg"
              variant="hero"
              className="text-lg h-14 px-8 bg-gradient-to-r from-primary to-accent"
            >
              Join as Provider
            </Button> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProviderInfo;