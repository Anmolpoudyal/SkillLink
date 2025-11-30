import { ArrowRight } from "lucide-react";
import heroImage from "../assets/landingpageBG.png";
import { Button } from "./ui/button.jsx";
import { Link, useNavigate } from "react-router-dom";
function Starter() {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/20" />

      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <div className="inline-block px-4 py-2 bg-blue-500 rounded-full">
              <span className="text-sm font-semibold text-secondary-foreground">
                Connecting Nepal's Skilled Workforce
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Find Trusted
              <span className="block bg-gradient-to-r from-blue-500 to-red-500 bg-clip-text text-transparent">
                Service Providers
              </span>
              Near You
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl">
              SkillLink connects you with verified plumbers, electricians,
              carpenters, and technicians in your area. Quality service,
              transparent pricing, trusted reviews.
            </p>

             <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                variant="hero"
                className="text-lg h-14 px-8"
                onClick={() => navigate('/Login')}
              >
                Find Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg h-14 px-8"
                onClick={() => navigate('/provider-signup')}
              >
                Become a Provider
              </Button>
            </div>
            

            <div className="flex items-center gap-8 pt-4">
              <div>
                <p className="text-3xl font-bold text-foreground">2,500+</p>
                <p className="text-sm text-muted-foreground">
                  Service Providers
                </p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div>
                <p className="text-3xl font-bold text-foreground">10,000+</p>
                <p className="text-sm text-muted-foreground">Happy Customers</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div>
                <p className="text-3xl font-bold text-foreground">4.8★</p>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right duration-700 delay-300">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
            <img
              src={heroImage}
              alt="Skilled workers ready to help"
              className="relative rounded-3xl shadow-2xl w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Starter;
