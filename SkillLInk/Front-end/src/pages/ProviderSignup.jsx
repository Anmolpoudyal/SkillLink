import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import { Textarea } from "../components/ui/textarea.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../components/ui/Card.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../components/ui/select.jsx";
import { Upload, User, Mail, Phone, Lock, Briefcase, MapPin, DollarSign, Clock, FileText, ArrowLeft, CheckCircle, Sparkles, Shield, Eye, EyeOff, TrendingUp, Users, Wallet } from "lucide-react";
import { useToast } from "../hooks/useToast.js";
import api from "../services/api.js";
import BrandLogo from "../components/BrandLogo.jsx";

const serviceCategories = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "AC Repair",
  "Appliance Repair",
  "Cleaning Service",
  "Painter",
  "Pest Control",
];

const locations = [
  "Kathmandu",
  "Lalitpur",
  "Bhaktapur",
  "Pokhara",
  "Biratnagar",
  "Birgunj",
  "Dharan",
  "Butwal",
];





const ProviderSignup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    serviceCategory: "",
    locations: [],
    hourlyRate: "",
    experience: "",
    bio: "",
    ctevtCertificate: null,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, ctevtCertificate: e.target.files[0] });
    }
  };

  const toggleLocation = (location) => {
    setFormData((prev) => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter((l) => l !== location)
        : [...prev.locations, location],
    }));
  };

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

    if (formData.locations.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one service location",
        variant: "destructive",
      });
      return;
    }

    if (!formData.ctevtCertificate) {
      toast({
        title: "Error",
        description: "Please upload your CTEVT certificate",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Convert file to base64
      const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = (error) => reject(error);
        });
      };

      const certificateBase64 = await fileToBase64(formData.ctevtCertificate);

      const response = await api.providerSignup({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        serviceCategory: formData.serviceCategory,
        locations: formData.locations,
        hourlyRate: parseFloat(formData.hourlyRate),
        experience: parseInt(formData.experience),
        bio: formData.bio,
        certificate: certificateBase64,
      });

      toast({
        title: "Application Submitted",
        description: "Your provider account has been created successfully!",
      });

      // Store user info
      localStorage.setItem("userId", response.user.id);
      localStorage.setItem("userRole", "service_provider");
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", response.user.email);
      localStorage.setItem("userName", response.user.full_name);

      setTimeout(() => {
        navigate("/");
      }, 1500);
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

    

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="absolute inset-0 bg-mesh opacity-70" />
        <div className="absolute inset-0 bg-dots opacity-20" />
      </div>

      {/* Floating Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-gradient-to-br from-accent/30 to-orange-400/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-gradient-to-br from-amber-400/30 to-yellow-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      {/* Left Side - Benefits (Hidden on mobile) */}
      <div className={`hidden lg:flex lg:w-2/5 relative z-10 items-center justify-center p-12 transition-all duration-1000 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
        <div className="max-w-md">
          <div className="mb-8">
            <BrandLogo imageClassName="h-20 drop-shadow-md" />
          </div>

          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Grow your business<br />
            <span className="bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">with SkillLink</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            Join our network of trusted professionals and reach thousands of customers.
          </p>

          {/* Benefits */}
          <div className="space-y-4">
            {[
              { icon: Users, text: "Reach more customers", color: "bg-blue-100 text-blue-600" },
              { icon: Wallet, text: "Secure & fast payments", color: "bg-green-100 text-green-600" },
              { icon: TrendingUp, text: "Grow your reputation", color: "bg-purple-100 text-purple-600" },
              { icon: Clock, text: "Flexible schedule", color: "bg-orange-100 text-orange-600" },
            ].map((benefit, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-3 p-4 bg-white/80 rounded-xl shadow-sm backdrop-blur transition-all duration-500`}
                style={{ transitionDelay: `${(index + 2) * 100}ms`, opacity: mounted ? 1 : 0, transform: mounted ? 'translateX(0)' : 'translateX(-20px)' }}
              >
                <div className={`w-10 h-10 rounded-full ${benefit.color} flex items-center justify-center flex-shrink-0`}>
                  <benefit.icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-foreground">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className={`mt-10 grid grid-cols-3 gap-4 transition-all duration-700 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            <div className="text-center p-3 bg-white/60 rounded-xl">
              <p className="text-2xl font-bold text-accent">0%</p>
              <p className="text-xs text-muted-foreground">First 3 months</p>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-xl">
              <p className="text-2xl font-bold text-primary">2,500+</p>
              <p className="text-xs text-muted-foreground">Providers</p>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-xl">
              <p className="text-2xl font-bold text-green-600">24/7</p>
              <p className="text-xs text-muted-foreground">Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-3/5 flex items-start justify-center p-4 py-8 relative z-10 overflow-y-auto">
        {/* Back Button */}
        <Link 
          to="/" 
          className={`fixed top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300 group z-20 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </Link>

        <div className={`w-full max-w-2xl transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Card className="glass-card shadow-2xl border-0 overflow-hidden">
            {/* Decorative Top Bar */}
            <div className="h-2 bg-gradient-to-r from-accent via-orange-400 to-amber-400" />
            
            <CardHeader className="space-y-2 pt-8 pb-4 flex flex-col items-center">
              <div className="lg:hidden flex items-center gap-3 mb-2">
                <BrandLogo imageClassName="h-14 drop-shadow-sm" />
              </div>
              <CardTitle className="text-2xl font-bold">Apply as Service Provider</CardTitle>
              <CardDescription className="text-base">Complete your application for admin review</CardDescription>
              
              {/* Progress Steps */}
              <div className="flex items-center gap-2 mt-4">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      step >= s 
                        ? 'bg-gradient-to-br from-accent to-orange-500 text-white shadow-lg' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                    </div>
                    {s < 3 && (
                      <div className={`w-12 h-1 mx-1 rounded transition-all duration-300 ${step > s ? 'bg-accent' : 'bg-muted'}`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between w-full max-w-xs text-xs text-muted-foreground mt-1">
                <span>Personal</span>
                <span>Service</span>
                <span>Verify</span>
              </div>
            </CardHeader>

            <CardContent className="pb-8 px-8">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Step 1: Personal Info */}
                <div className={`space-y-4 transition-all duration-300 ${step === 1 ? 'block' : 'hidden'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold text-lg">Personal Information</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-semibold">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="h-12 rounded-xl border-2 border-border/50 bg-white/50 focus:bg-white focus:border-accent/50 transition-all duration-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="h-12 rounded-xl border-2 border-border/50 bg-white/50 focus:bg-white focus:border-accent/50 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+977 98XXXXXXXX"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="h-12 rounded-xl border-2 border-border/50 bg-white/50 focus:bg-white focus:border-accent/50 transition-all duration-300"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className="h-12 pr-12 rounded-xl border-2 border-border/50 bg-white/50 focus:bg-white focus:border-accent/50 transition-all duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          className="h-12 pr-12 rounded-xl border-2 border-border/50 bg-white/50 focus:bg-white focus:border-accent/50 transition-all duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="button" 
                    onClick={() => setStep(2)}
                    className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-accent to-orange-500 hover:from-accent/90 hover:to-orange-500/90 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Continue to Service Details
                  </Button>
                </div>

                {/* Step 2: Service Details */}
                <div className={`space-y-4 transition-all duration-300 ${step === 2 ? 'block' : 'hidden'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold text-lg">Service Details</h3>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Service Category</Label>
                    <Select
                      value={formData.serviceCategory}
                      onValueChange={(value) =>
                        setFormData({ ...formData, serviceCategory: value })
                      }
                    >
                      <SelectTrigger className="h-12 rounded-xl border-2 border-border/50 bg-white/50 focus:bg-white focus:border-accent/50">
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>

                      <SelectContent>
                        {serviceCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      Service Locations
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {locations.map((location) => (
                        <Button
                          key={location}
                          type="button"
                          variant={
                            formData.locations.includes(location)
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => toggleLocation(location)}
                          className={`rounded-xl transition-all duration-300 ${
                            formData.locations.includes(location)
                              ? 'bg-gradient-to-r from-accent to-orange-500 border-0 shadow-md'
                              : 'hover:border-accent/50'
                          }`}
                        >
                          {location}
                        </Button>
                      ))}
                    </div>
                    {formData.locations.length > 0 && (
                      <p className="text-xs text-accent font-medium">
                        {formData.locations.length} location(s) selected
                      </p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate" className="text-sm font-semibold flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        Hourly Rate (NPR)
                      </Label>
                      <Input
                        id="hourlyRate"
                        name="hourlyRate"
                        type="number"
                        placeholder="500"
                        value={formData.hourlyRate}
                        onChange={handleChange}
                        required
                        className="h-12 rounded-xl border-2 border-border/50 bg-white/50 focus:bg-white focus:border-accent/50 transition-all duration-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience" className="text-sm font-semibold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        Years of Experience
                      </Label>
                      <Input
                        id="experience"
                        name="experience"
                        type="number"
                        placeholder="5"
                        value={formData.experience}
                        onChange={handleChange}
                        required
                        className="h-12 rounded-xl border-2 border-border/50 bg-white/50 focus:bg-white focus:border-accent/50 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      Bio / Description
                    </Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Describe your experience, skills, and why customers should choose you..."
                      value={formData.bio}
                      onChange={handleChange}
                      rows="4"
                      required
                      className="rounded-xl border-2 border-border/50 bg-white/50 focus:bg-white focus:border-accent/50 transition-all duration-300 resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 h-12 rounded-xl"
                    >
                      Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setStep(3)}
                      className="flex-1 h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-accent to-orange-500 hover:from-accent/90 hover:to-orange-500/90 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Continue to Verification
                    </Button>
                  </div>
                </div>

                {/* Step 3: Certificate Upload */}
                <div className={`space-y-4 transition-all duration-300 ${step === 3 ? 'block' : 'hidden'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold text-lg">Certification Verification</h3>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">CTEVT Certificate</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Upload your CTEVT certificate for verification. This helps us verify your qualifications and build trust with customers.
                    </p>

                    <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                      formData.ctevtCertificate 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-border hover:border-accent/50 hover:bg-accent/5'
                    }`}>
                      {formData.ctevtCertificate ? (
                        <div className="space-y-2">
                          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                          </div>
                          <p className="font-semibold text-green-700">
                            {formData.ctevtCertificate.name}
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormData({ ...formData, ctevtCertificate: null })}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            Remove file
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                            <Upload className="h-8 w-8 text-accent" />
                          </div>

                          <Label htmlFor="ctevtCertificate" className="cursor-pointer">
                            <span className="text-accent hover:text-accent/80 font-semibold text-lg">
                              Click to upload
                            </span>
                            <span className="text-muted-foreground">
                              {" "}or drag and drop
                            </span>
                          </Label>
                          <p className="text-sm text-muted-foreground mt-2">
                            PDF, PNG, JPG up to 10MB
                          </p>

                          <Input
                            id="ctevtCertificate"
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                    <h4 className="font-semibold text-sm">Application Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className="text-muted-foreground">Name:</p>
                      <p className="font-medium">{formData.fullName || '-'}</p>
                      <p className="text-muted-foreground">Service:</p>
                      <p className="font-medium">{formData.serviceCategory || '-'}</p>
                      <p className="text-muted-foreground">Rate:</p>
                      <p className="font-medium">{formData.hourlyRate ? `NPR ${formData.hourlyRate}/hr` : '-'}</p>
                      <p className="text-muted-foreground">Locations:</p>
                      <p className="font-medium">{formData.locations.length > 0 ? formData.locations.join(', ') : '-'}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1 h-12 rounded-xl"
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-accent to-orange-500 hover:from-accent/90 hover:to-orange-500/90 shadow-lg hover:shadow-xl hover:shadow-accent/20 transition-all duration-300 btn-shine" 
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Submit Application
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link to="/login" className="text-accent hover:text-accent/80 font-semibold link-underline">
                  Sign In
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Security Badge */}
          <div className={`flex items-center justify-center gap-2 mt-6 text-muted-foreground text-sm transition-all duration-700 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            <Shield className="w-4 h-4 text-green-500" />
            <span>Your information is secure and verified by our team</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderSignup;
