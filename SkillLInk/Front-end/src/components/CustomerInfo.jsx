
import { CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button.jsx";
const benefits = [
  "Find verified service providers near you instantly",
  "Compare ratings, reviews, and pricing transparently",
  "Book services at your convenience",
  "Secure payment with eSewa and Khalti integration",
  "Real-time booking updates and notifications",
  "24/7 customer support for any issues",
];

const CustomerInfo = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-secondary/50 to-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full">
              <span className="text-sm font-semibold text-primary">
                For Customers
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Get Quality Service
              <span className="block text-primary">
                At Your Doorstep
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground">
              Whether you need a quick repair or a major renovation, SkillLink connects 
              you with trusted professionals who deliver quality work on time.
            </p>
            
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              size="lg"
              variant="hero"
              className="text-lg h-14 px-8"
            >
              Get Started Now
            </Button> 
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10 rounded-3xl blur-3xl" />
            <div className="relative bg-card rounded-3xl p-8 shadow-2xl border-2 border-border">
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold">Search for services</p>
                    <p className="text-sm text-muted-foreground">Find the right professional</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-semibold">Compare & Book</p>
                    <p className="text-sm text-muted-foreground">Choose based on reviews</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-accent/10 rounded-xl border-2 border-accent">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-accent">Get it done!</p>
                    <p className="text-sm text-muted-foreground">Quality service delivered</p>
                  </div>
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