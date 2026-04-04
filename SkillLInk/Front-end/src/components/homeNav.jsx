import { Button } from "./ui/button";
import { Menu, X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import BrandLogo from "./BrandLogo";

const HomeNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-white/50' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <BrandLogo imageClassName="h-12 md:h-14 drop-shadow-md group-hover:scale-[1.02] transition-transform duration-300" />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Button 
              variant="ghost" 
              className="font-medium rounded-full px-6 hover:bg-primary/10 hover:text-primary transition-all duration-300" 
              onClick={() => navigate('/firstlandingpage')}
            >
              Sign In
            </Button>

            <Button 
              className="font-medium rounded-full px-6 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 btn-shine"
              onClick={() => navigate('/provider-signup')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-4 space-y-3 border-t border-border/50">
            <Link 
              to="#services" 
              className="block px-4 py-2 text-foreground hover:text-primary hover:bg-primary/5 rounded-xl font-medium transition-all"
              onClick={() => setIsOpen(false)}
            >
              Services
            </Link>

            <Link 
              to="#how-it-works" 
              className="block px-4 py-2 text-foreground hover:text-primary hover:bg-primary/5 rounded-xl font-medium transition-all"
              onClick={() => setIsOpen(false)}
            >
              How It Works
            </Link>

            <Link 
              to="#about" 
              className="block px-4 py-2 text-foreground hover:text-primary hover:bg-primary/5 rounded-xl font-medium transition-all"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>

            <div className="flex flex-col gap-2 pt-4 px-4">
              <Button 
                variant="outline" 
                className="w-full font-medium rounded-xl" 
                onClick={() => {
                  navigate('/firstlandingpage');
                  setIsOpen(false);
                }}
              >
                Sign In
              </Button>

              <Button 
                className="w-full font-medium rounded-xl bg-gradient-to-r from-primary to-blue-500"
                onClick={() => {
                  navigate('/provider-signup');
                  setIsOpen(false);
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HomeNav;
