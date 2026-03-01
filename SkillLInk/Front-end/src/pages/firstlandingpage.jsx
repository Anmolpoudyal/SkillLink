import React, { useEffect, useState } from "react";
import { FaUserTie, FaTools, FaStar, FaShieldAlt, FaCheckCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import Footer from "../components/ui/footer.jsx";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-orange-50/30 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-dots opacity-30 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center p-8 min-h-screen">
        {/* Logo */}
        <div className={`flex items-center gap-3 mb-4 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg animate-pulse-glow">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <span className="text-3xl font-bold text-gradient">SkillLink</span>
        </div>

        {/* Hero Text */}
        <div className={`text-center mb-4 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Nepal's #1 Service Platform</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-center mb-3">
            Welcome to{" "}
            <span className="text-gradient-animated">SkillLink</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Connect with trusted professionals or showcase your skills to thousands
          </p>
        </div>

        {/* Choose Role Text */}
        <p className={`text-lg text-center mb-8 text-muted-foreground transition-all duration-700 delay-200 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <span className="inline-flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-primary" />
            Choose how you want to continue
          </span>
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl justify-center">

          {/* Customer Card */}
          <Link 
            to="/customer-signup" 
            className={`block transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="group relative cursor-pointer glass-card rounded-3xl p-8 card-hover overflow-hidden">
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />
              
              {/* Icon */}
              <div className="relative flex justify-center mb-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:shadow-blue-500/30 transition-all duration-500 group-hover:rotate-3">
                  <FaUserTie size={48} className="text-white" />
                </div>
                {/* Floating Badge */}
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                  Popular
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center mb-2 group-hover:text-primary transition-colors">
                I'm a Customer
              </h2>
              <p className="text-center mb-6 text-muted-foreground">
                Looking for skilled professionals
              </p>

              <ul className="space-y-3">
                {[
                  "Browse skilled workers (electricians, plumbers, etc.)",
                  "Book services quickly and easily",
                  "Secure and reliable process",
                  "Track your service history",
                ].map((item, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-3 text-foreground/80 group-hover:text-foreground transition-colors"
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <FaCheckCircle className="text-green-500 flex-shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-6 pt-6 border-t border-border/50">
                <div className="flex items-center justify-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all">
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </Link>

          {/* Worker Card */}
          <Link 
            to="/provider-signup" 
            className={`block transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="group relative cursor-pointer glass-card rounded-3xl p-8 card-hover overflow-hidden">
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />
              
              {/* Icon */}
              <div className="relative flex justify-center mb-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:shadow-orange-500/30 transition-all duration-500 group-hover:-rotate-3">
                  <FaTools size={48} className="text-white" />
                </div>
                {/* Floating Badge */}
                <div className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  Earn ₹₹₹
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center mb-2 group-hover:text-accent transition-colors">
                I'm a Worker
              </h2>
              <p className="text-center mb-6 text-muted-foreground">
                Ready to offer my professional services
              </p>

              <ul className="space-y-3">
                {[
                  "Showcase your skills (electrician, plumber, etc.)",
                  "Get more job opportunities",
                  "Manage bookings with ease",
                  "Grow your professional profile",
                ].map((item, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-3 text-foreground/80 group-hover:text-foreground transition-colors"
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <FaCheckCircle className="text-orange-500 flex-shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-6 pt-6 border-t border-border/50">
                <div className="flex items-center justify-center gap-2 text-accent font-semibold group-hover:gap-4 transition-all">
                  <span>Apply Now</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </Link>

        </div>

        {/* Trust Indicators */}
        <div className={`mt-12 flex flex-wrap items-center justify-center gap-8 text-muted-foreground transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-green-500" />
            <span className="text-sm">Verified Professionals</span>
          </div>
          <div className="flex items-center gap-2">
            <FaStar className="text-yellow-500" />
            <span className="text-sm">4.9 Average Rating</span>
          </div>
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-primary" />
            <span className="text-sm">10,000+ Services Completed</span>
          </div>
        </div>

        {/* Already have an account */}
        <div className={`mt-8 transition-all duration-700 delay-600 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link 
              to="/Login" 
              className="text-primary font-semibold link-underline hover:text-primary/80 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
