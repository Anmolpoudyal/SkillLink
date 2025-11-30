import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 

const HomeNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate(); // <-- FIXED

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold text-foreground">SkillLink</span>
          </div>
          
          {/* Desktop buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button 
              variant="ghost" 
              className="font-medium" 
              onClick={() => navigate('/firstlandingpage')}
            >
              Sign In
            </Button>

            <Button 
              variant="hero" 
              onClick={() => navigate('/provider-signup')}
            >
              Get Started
            </Button>
          </div>
          
          <button 
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        
        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border">
            
            <Link to="#services" className="block text-foreground hover:text-primary font-medium">
              Services
            </Link>

            <Link to="/browse" className="block text-foreground hover:text-primary font-medium">
              Browse Providers
            </Link>

            <Link to="#how-it-works" className="block text-foreground hover:text-primary font-medium">
              How It Works
            </Link>

            <Link to="#about" className="block text-foreground hover:text-primary font-medium">
              About
            </Link>

            <div className="flex flex-col gap-2 pt-4">
              <Button 
                variant="ghost" 
                className="w-full font-medium" 
                onClick={() => navigate('/firstlandingpage')}
              >
                Sign In
              </Button>

              <Button 
                variant="hero" 
                className="w-full" 
                onClick={() => navigate('/provider-signup')}
              >
                Get Started
              </Button>
            </div>

          </div>
        )}
      </div>
    </nav>
  );
};

export default HomeNav;
