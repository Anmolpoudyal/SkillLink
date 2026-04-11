import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card.jsx";
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, Sparkles, Shield } from "lucide-react";
import { useToast } from "../hooks/useToast.js";
import api from "../services/api.js";
import BrandLogo from "../components/BrandLogo.jsx";


const CustomerSignup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    const labels = ["", "Weak", "Fair", "Good", "Strong"];
    const colors = ["", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
    return { strength, label: labels[strength], color: colors[strength] };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.customerSignup({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      // Store user info
      localStorage.setItem("userId", response.user.id);
      localStorage.setItem("userRole", "customer");
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", response.user.email);
      localStorage.setItem("userName", response.user.full_name);

      toast({
        title: "Account Created",
        description: `Registered as ${response.user.full_name} (Customer)`,
      });

      // Navigate to customer dashboard or home
      navigate("/");
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    "Access verified professionals",
    "Secure payment options",
    "Real-time booking updates",
    "24/7 customer support",
  ];

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="absolute inset-0 bg-mesh opacity-70" />
        <div className="absolute inset-0 bg-dots opacity-20" />
      </div>

      {/* Floating Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-gradient-to-br from-primary/30 to-blue-400/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-gradient-to-br from-cyan-400/30 to-blue-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      {/* Left Side - Benefits (Hidden on mobile) */}
      <div className={`hidden lg:flex lg:w-1/2 relative z-10 items-center justify-center p-12 transition-all duration-1000 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
        <div className="max-w-md">
          <div className="mb-8">
            <BrandLogo imageClassName="h-20 drop-shadow-md" />
          </div>

          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Join thousands of<br />
            <span className="text-gradient">happy customers</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            Get access to verified service providers and enjoy premium features.
          </p>

          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-3 p-4 bg-white/80 rounded-xl shadow-sm backdrop-blur transition-all duration-500`}
                style={{ transitionDelay: `${(index + 2) * 100}ms`, opacity: mounted ? 1 : 0, transform: mounted ? 'translateX(0)' : 'translateX(-20px)' }}
              >
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-medium text-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Social Proof */}
          <div className={`mt-10 flex items-center gap-4 transition-all duration-700 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex -space-x-3">
              {[1,2,3,4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div>
              <p className="font-semibold text-foreground">10,000+ customers</p>
              <p className="text-sm text-muted-foreground">already trust us</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 relative z-10">
        {/* Back Button */}
        <Link 
          to="/" 
          className={`absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300 group ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </Link>

        <div className={`w-full max-w-md transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Card className="glass-card shadow-2xl border-0 overflow-hidden">
            {/* Decorative Top Bar */}
            <div className="h-2 bg-gradient-to-r from-primary via-blue-400 to-cyan-400" />
            
            <CardHeader className="space-y-2 pt-8 pb-4 flex flex-col items-center">
              <div className="lg:hidden flex items-center gap-3 mb-2">
                <BrandLogo imageClassName="h-14 drop-shadow-sm" />
              </div>
              <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
              <CardDescription className="text-base">Join SkillLink as a Customer</CardDescription>
            </CardHeader>

            <CardContent className="pb-8 px-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-semibold flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="h-12 rounded-xl border-2 border-border/50 bg-white/50 focus:bg-white focus:border-primary/50 transition-all duration-300"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-12 rounded-xl border-2 border-border/50 bg-white/50 focus:bg-white focus:border-primary/50 transition-all duration-300"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+977 98XXXXXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="h-12 rounded-xl border-2 border-border/50 bg-white/50 focus:bg-white focus:border-primary/50 transition-all duration-300"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="h-12 pr-12 rounded-xl border-2 border-border/50 bg-white/50 focus:bg-white focus:border-primary/50 transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {/* Password Strength */}
                  {formData.password && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          style={{ width: `${passwordStrength.strength * 25}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className={`h-12 pr-12 rounded-xl border-2 bg-white/50 focus:bg-white transition-all duration-300 ${
                        formData.confirmPassword && formData.confirmPassword !== formData.password
                          ? 'border-red-500/50 focus:border-red-500'
                          : formData.confirmPassword && formData.confirmPassword === formData.password
                          ? 'border-green-500/50 focus:border-green-500'
                          : 'border-border/50 focus:border-primary/50'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.confirmPassword === formData.password && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Passwords match
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 btn-shine mt-6" 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Create Account
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link to="/login" className="text-primary hover:text-primary/80 font-semibold link-underline">
                  Sign In
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Security Badge */}
          <div className={`flex items-center justify-center gap-2 mt-6 text-muted-foreground text-sm transition-all duration-700 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            <Shield className="w-4 h-4 text-green-500" />
            <span>Your data is secure with 256-bit encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSignup;
