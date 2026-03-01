import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card.jsx";
import { Wrench, Shield, Eye, EyeOff, ArrowLeft, Sparkles } from "lucide-react";
import { useToast } from "../hooks/useToast.js";
import api from "../services/api.js";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.login({
        email,
        password,
        role: "admin",
      });

      // Store user info
      localStorage.setItem("userId", response.user.id);
      localStorage.setItem("userRole", response.user.role);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", response.user.email);
      localStorage.setItem("userName", response.user.full_name);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${response.user.full_name}!`,
      });

      navigate("/admin");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
        <div className="absolute inset-0 bg-mesh opacity-30" />
        <div className="absolute inset-0 bg-dots opacity-10" />
      </div>

      {/* Floating Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-gradient-to-br from-blue-500/20 to-purple-500/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-gradient-to-br from-purple-500/20 to-blue-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute w-72 h-72 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Back Button */}
      <Link 
        to="/" 
        className={`absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300 group z-20 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Home</span>
      </Link>

      {/* Login Card */}
      <div className={`relative z-10 w-full max-w-md p-4 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <Card className="glass-card shadow-2xl border-0 overflow-hidden">
          {/* Decorative Top Bar */}
          <div className="h-2 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600" />
          
          <CardHeader className="space-y-4 pt-8 pb-4 flex flex-col items-center relative">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-xl animate-pulse-glow">
                <Shield className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="text-center">
              <CardTitle className="text-3xl font-bold text-gradient mb-1">Admin Portal</CardTitle>
              <CardDescription className="text-base">Sign in with your administrator credentials</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pb-8 px-8">
            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 pl-4 pr-4 rounded-xl border-2 border-border/50 bg-white/50 focus:bg-white focus:border-primary/50 transition-all duration-300 input-animated"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pl-4 pr-12 rounded-xl border-2 border-border/50 bg-white/50 focus:bg-white focus:border-primary/50 transition-all duration-300 input-animated"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-600/90 hover:to-blue-500/90 shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 btn-shine" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Sign In as Admin
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Badge */}
        <div className={`flex items-center justify-center gap-2 mt-6 text-gray-400 text-sm transition-all duration-700 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <Shield className="w-4 h-4 text-green-500" />
          <span>Admin access is monitored and logged</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
