import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/useToast.js";
import api from "../services/api.js";
import {
  Clock,
  PlayCircle,
  CheckCircle,
  DollarSign,
  MapPin,
  Calendar,
  Settings,
  LogOut,
  Check,
  X,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  CalendarDays,
  Edit,
  Camera,
  Phone,
  Mail,
  User,
} from "lucide-react";

const ProviderDashboard = () => {
  const [activeBookingTab, setActiveBookingTab] = useState("pending");
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = useRef([]);
  const { toast } = useToast();

  // Bookings state - fetched from API
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // Weekly schedule state
  const [weeklySchedule, setWeeklySchedule] = useState([
    { day: "Monday", enabled: false, startTime: "09:00 AM", endTime: "06:00 PM" },
    { day: "Tuesday", enabled: false, startTime: "09:00 AM", endTime: "06:00 PM" },
    { day: "Wednesday", enabled: false, startTime: "09:00 AM", endTime: "06:00 PM" },
    { day: "Thursday", enabled: false, startTime: "09:00 AM", endTime: "06:00 PM" },
    { day: "Friday", enabled: false, startTime: "09:00 AM", endTime: "06:00 PM" },
    { day: "Saturday", enabled: false, startTime: "10:00 AM", endTime: "04:00 PM" },
    { day: "Sunday", enabled: false, startTime: "10:00 AM", endTime: "04:00 PM" },
  ]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1)); // January 2026
  const [blockedSlots, setBlockedSlots] = useState([
    { id: 1, date: "Jan 20, 2024", time: "08:00 - 12:00", reason: "Personal appointment" },
  ]);

  // Block time modal state
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [blockForm, setBlockForm] = useState({
    startTime: "09:00 AM",
    endTime: "06:00 PM",
    reason: "",
  });

  // Provider Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    hourlyRate: 600,
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    startTime: "09:00 AM",
    endTime: "06:00 PM",
  });

  const toggleDay = (day) => {
    setSettingsForm((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  const handleSaveSettings = () => {
    console.log("Saving settings:", settingsForm);
    // TODO: Implement API call to save settings
    setShowSettingsModal(false);
  };

  // Edit Profile modal state
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: "Ram Sharma",
    email: "ram.sharma@email.com",
    phone: "+977 9841234567",
    service: "Electrician",
    location: "Kathmandu",
    bio: "Professional electrician with over 8 years of experience in residential and commercial electrical work. Specialized in wiring, panel installations, and LED fixture setups. Committed to safety and quality workmanship.",
    experience: "8",
  });

  const serviceOptions = [
    "Electrician",
    "Plumber",
    "Carpenter",
    "AC Repair",
    "Painter",
    "Cleaner",
    "Appliance Repair",
  ];

  const locationOptions = [
    "Kathmandu",
    "Lalitpur",
    "Bhaktapur",
    "Pokhara",
    "Biratnagar",
  ];

  const handleSaveProfile = async () => {
    try {
      const response = await api.updateProfile({
        fullName: profileForm.fullName,
        email: profileForm.email,
        phone: profileForm.phone,
        bio: profileForm.bio,
        experience: parseInt(profileForm.experience) || 0,
        location: profileForm.location,
      });

      // Update local state
      setProvider({
        name: response.user.full_name,
        initial: response.user.full_name.charAt(0).toUpperCase(),
      });

      // Update localStorage
      localStorage.setItem("userName", response.user.full_name);
      localStorage.setItem("userEmail", response.user.email);

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      setShowEditProfileModal(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleOpenBlockModal = (date = null) => {
    if (date) {
      setSelectedDate(date);
    } else {
      // Default to today if no date selected
      setSelectedDate(new Date());
    }
    setBlockForm({ startTime: "09:00 AM", endTime: "06:00 PM", reason: "" });
    setShowBlockModal(true);
  };

  const handleCloseBlockModal = () => {
    setShowBlockModal(false);
    setSelectedDate(null);
  };

  const handleBlockTime = () => {
    // Call the API handler instead of local save
    handleAddTimeOff();
  };

  const navigate = useNavigate();

  // Loading state
  const [loading, setLoading] = useState(true);

  // Provider info - will be populated from API
  const [provider, setProvider] = useState({
    name: localStorage.getItem("userName") || "Provider",
    initial: (localStorage.getItem("userName") || "P").charAt(0).toUpperCase(),
  });

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.getProfile();
        const user = response.user;
        
        setProvider({
          name: user.full_name,
          initial: user.full_name.charAt(0).toUpperCase(),
        });

        setProfileForm({
          fullName: user.full_name || "",
          email: user.email || "",
          phone: user.phone || "",
          service: user.service_name || "Electrician",
          location: user.locations?.[0] || "Kathmandu",
          bio: user.bio || "",
          experience: user.years_of_experience?.toString() || "0",
        });

        setSettingsForm(prev => ({
          ...prev,
          hourlyRate: user.hourly_rate || 600,
        }));

        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile. Please login again.",
          variant: "destructive",
        });
        // Redirect to login if not authenticated
        if (error.message.includes("Not authorized")) {
          navigate("/Login");
        }
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, toast]);

  // Fetch availability on mount
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setScheduleLoading(true);
        const response = await api.getMyAvailability();
        
        if (response.schedule && response.schedule.length > 0) {
          setWeeklySchedule(response.schedule);
        }
        
        if (response.blockedSlots) {
          setBlockedSlots(response.blockedSlots.map(slot => ({
            id: slot.id,
            date: new Date(slot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: `${slot.startTime || '00:00'} - ${slot.endTime || '23:59'}`,
            reason: slot.reason || 'Personal'
          })));
        }
      } catch (error) {
        console.error("Error fetching availability:", error);
      } finally {
        setScheduleLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  // Fetch bookings on mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setBookingsLoading(true);
        const response = await api.getProviderBookings();
        setBookings(response.bookings || []);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast({
          title: "Error",
          description: "Failed to load bookings",
          variant: "destructive",
        });
      } finally {
        setBookingsLoading(false);
      }
    };

    fetchBookings();
  }, [toast]);

  // Filter bookings by status
  const pendingRequests = bookings.filter(b => b.status === 'pending');
  const inProgressRequests = bookings.filter(b => b.status === 'accepted' || b.status === 'in_progress');
  const completedRequests = bookings.filter(b => b.status === 'completed');

  // Stats data - now dynamic
  const stats = {
    newRequests: pendingRequests.length,
    inProgress: inProgressRequests.length,
    completed: completedRequests.length,
    earnings: completedRequests.reduce((sum, b) => sum + (parseFloat(b.finalAmount) || 0), 0),
  };

  // Save schedule handler
  const handleSaveSchedule = async () => {
    try {
      setSavingSchedule(true);
      await api.saveAvailability(weeklySchedule);
      toast({
        title: "Success",
        description: "Schedule saved successfully!",
      });
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save schedule",
        variant: "destructive",
      });
    } finally {
      setSavingSchedule(false);
    }
  };

  // Add time off handler
  const handleAddTimeOff = async () => {
    if (!selectedDate) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive",
      });
      return;
    }

    try {
      // Use local date format to avoid timezone issues
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      console.log("Adding time off for date:", dateStr, "selectedDate:", selectedDate);
      
      await api.addTimeOff({
        date: dateStr,
        startTime: blockForm.startTime,
        endTime: blockForm.endTime,
        reason: blockForm.reason || 'Personal'
      });

      // Refresh blocked slots
      const response = await api.getMyAvailability();
      if (response.blockedSlots) {
        setBlockedSlots(response.blockedSlots.map(slot => ({
          id: slot.id,
          date: new Date(slot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: `${slot.startTime || '00:00'} - ${slot.endTime || '23:59'}`,
          reason: slot.reason || 'Personal'
        })));
      }

      setShowBlockModal(false);
      setBlockForm({ startTime: "09:00 AM", endTime: "06:00 PM", reason: "" });
      
      toast({
        title: "Success",
        description: "Time off added successfully!",
      });
    } catch (error) {
      console.error("Error adding time off:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add time off",
        variant: "destructive",
      });
    }
  };

  // Delete time off handler
  const handleDeleteTimeOff = async (id) => {
    try {
      await api.deleteTimeOff(id);
      setBlockedSlots(prev => prev.filter(slot => slot.id !== id));
      toast({
        title: "Success",
        description: "Time off removed successfully!",
      });
    } catch (error) {
      console.error("Error deleting time off:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete time off",
        variant: "destructive",
      });
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await api.logout();
      localStorage.clear();
      navigate("/Login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      navigate("/Login");
    }
  };

  const handleEnterOTP = (request) => {
    setSelectedRequest(request);
    setOtpValues(["", "", "", "", "", ""]);
    setShowOTPModal(true);
  };

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyComplete = async () => {
    const otp = otpValues.join("");
    
    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the complete 6-digit code",
        variant: "destructive",
      });
      return;
    }
    
    // Verify OTP matches the booking's verification code
    if (otp !== selectedRequest?.verificationCode) {
      toast({
        title: "Invalid Code",
        description: "The verification code doesn't match. Please ask the customer for the correct code.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await api.updateBookingStatus(selectedRequest.id, {
        status: 'completed'
      });
      
      // Refresh bookings
      const response = await api.getProviderBookings();
      setBookings(response.bookings || []);
      
      toast({
        title: "Job Completed!",
        description: "The booking has been marked as completed.",
      });
      
      setShowOTPModal(false);
      setSelectedRequest(null);
      setOtpValues(["", "", "", "", "", ""]);
    } catch (error) {
      console.error("Error completing booking:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete booking",
        variant: "destructive",
      });
    }
  };

  const handleCloseModal = () => {
    setShowOTPModal(false);
    setSelectedRequest(null);
    setOtpValues(["", "", "", "", "", ""]);
  };

  // Accept booking modal state
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptingRequest, setAcceptingRequest] = useState(null);
  const [acceptForm, setAcceptForm] = useState({
    scheduledDateTime: "",
    totalAmount: 1500,
  });

  const handleOpenAcceptModal = (request) => {
    setAcceptingRequest(request);
    setAcceptForm({ scheduledDateTime: "", totalAmount: request.estimatedAmount || 1500 });
    setShowAcceptModal(true);
  };

  const handleCloseAcceptModal = () => {
    setShowAcceptModal(false);
    setAcceptingRequest(null);
  };

  const handleConfirmAccept = async () => {
    try {
      await api.updateBookingStatus(acceptingRequest.id, {
        status: 'accepted',
        estimatedAmount: acceptForm.totalAmount
      });
      
      // Refresh bookings
      const response = await api.getProviderBookings();
      setBookings(response.bookings || []);
      
      toast({
        title: "Success",
        description: "Booking accepted successfully!",
      });
      
      setShowAcceptModal(false);
      setAcceptingRequest(null);
    } catch (error) {
      console.error("Error accepting booking:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept booking",
        variant: "destructive",
      });
    }
  };

  const handleAccept = (request) => {
    handleOpenAcceptModal(request);
  };

  const handleReject = async (requestId) => {
    try {
      await api.updateBookingStatus(requestId, {
        status: 'rejected',
        rejectionReason: 'Not available at the requested time'
      });
      
      // Refresh bookings
      const response = await api.getProviderBookings();
      setBookings(response.bookings || []);
      
      toast({
        title: "Booking Rejected",
        description: "The booking request has been declined.",
      });
    } catch (error) {
      console.error("Error rejecting booking:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject booking",
        variant: "destructive",
      });
    }
  };

  const StatCard = ({ title, value, icon: Icon, iconColor }) => (
    <Card className="bg-white border border-gray-100 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          </div>
          <Icon className={`w-10 h-10 ${iconColor}`} />
        </div>
      </CardContent>
    </Card>
  );

  const BookingRequestCard = ({ request, showActions = true, isInProgress = false, isCompleted = false }) => {
    // Check if this is a new request (created within last 24 hours)
    const isNew = request.status === 'pending' && 
      new Date(request.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Format date for display
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    
    return (
      <Card className={`bg-white shadow-sm mb-4 ${isInProgress ? 'border-2 border-teal-100' : isCompleted ? 'border-2 border-green-100' : 'border border-gray-100'}`}>
        <CardContent className="p-6">
          {/* Header with customer info and badge */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-lg">
                {request.customer?.initial || 'C'}
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">{request.customer?.name || 'Customer'}</h4>
                <p className="text-sm text-teal-600">{request.customer?.phone || ''}</p>
              </div>
            </div>
            {isNew && (
              <span className="px-3 py-1 text-sm font-medium bg-teal-50 text-teal-600 rounded-full">
                New
              </span>
            )}
            {isInProgress && (
              <span className="px-3 py-1 text-sm font-medium bg-teal-500 text-white rounded-full">
                In Progress
              </span>
            )}
            {isCompleted && (
              <span className="px-3 py-1 text-sm font-medium bg-green-500 text-white rounded-full">
                Completed
              </span>
            )}
          </div>

          {/* Problem Description */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700">Problem Description:</p>
            <p className="text-sm text-gray-500">{request.problemDescription || 'No description provided'}</p>
          </div>

          {/* Location, Date, Time */}
          <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              {request.serviceAddress || 'Not specified'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              {formatDate(request.preferredDate)} {request.preferredTime || ''}
            </span>
          </div>

          {/* Amount to receive - for in progress and completed */}
          {(isInProgress || isCompleted) && request.estimatedAmount && (
            <div className={`${isCompleted ? 'bg-green-50 border-green-100' : 'bg-teal-50 border-teal-100'} border rounded-lg p-4 mb-4 flex items-center justify-between`}>
              <span className="text-sm text-gray-600">{isCompleted ? 'Amount received:' : 'Amount to receive:'}</span>
              <span className={`text-lg font-bold ${isCompleted ? 'text-green-500' : 'text-teal-600'}`}>
                NPR {parseFloat(request.finalAmount || request.estimatedAmount).toLocaleString()}
              </span>
            </div>
          )}

          {/* Verification Code - for accepted bookings */}
          {isInProgress && request.verificationCode && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Verification Code (Customer will provide):</p>
              <p className="text-xl font-mono font-bold text-blue-600 tracking-wider">{request.verificationCode}</p>
            </div>
          )}

          {/* Action Buttons - for pending */}
          {showActions && !isInProgress && !isCompleted && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleAccept(request)}
                className="bg-teal-500 hover:bg-teal-600 text-white py-3"
              >
                <Check className="w-4 h-4 mr-2" />
                Accept
              </Button>
              <Button
                onClick={() => handleReject(request.id)}
                variant="outline"
                className="border-gray-300 text-gray-600 hover:bg-gray-50 py-3"
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          )}

          {/* OTP Button - for in progress */}
          {isInProgress && (
            <Button
              onClick={() => handleEnterOTP(request)}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-3"
            >
              <Check className="w-4 h-4 mr-2" />
              Enter OTP to Complete
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  const getRequestsByTab = () => {
    switch (activeBookingTab) {
      case "pending":
        return pendingRequests;
      case "inProgress":
        return inProgressRequests;
      case "completed":
        return completedRequests;
      default:
        return pendingRequests;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">⚡</span>
            </div>
            <span className="text-xl font-semibold text-gray-800">SkillLink</span>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setShowEditProfileModal(true)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <Edit className="w-5 h-5" />
              <span>Edit Profile</span>
            </button>
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                {provider.initial}
              </div>
              <span className="text-gray-700">{provider.name}</span>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="New Requests"
            value={stats.newRequests}
            icon={Clock}
            iconColor="text-yellow-500"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={PlayCircle}
            iconColor="text-blue-500"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle}
            iconColor="text-green-500"
          />
          <StatCard
            title="Earnings"
            value={`NPR ${stats.earnings.toLocaleString()}`}
            icon={DollarSign}
            iconColor="text-teal-500"
          />
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-lg mb-6">
            <TabsTrigger
              value="requests"
              className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-800 px-6 flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Requests
            </TabsTrigger>
            <TabsTrigger
              value="availability"
              className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-800 px-6 flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Availability
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Requests</h2>
              
              {/* Sub-tabs for request status */}
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={() => setActiveBookingTab("pending")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                    activeBookingTab === "pending"
                      ? "bg-gray-100 text-gray-800"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  Pending
                  <span className="bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingRequests.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveBookingTab("inProgress")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                    activeBookingTab === "inProgress"
                      ? "bg-gray-100 text-gray-800"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  In Progress
                  <span className="bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {inProgressRequests.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveBookingTab("completed")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeBookingTab === "completed"
                      ? "bg-gray-100 text-gray-800"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  Completed
                </button>
              </div>

              {/* Request Cards */}
              <div>
                {bookingsLoading ? (
                  <div className="text-center py-12 text-gray-500">
                    Loading bookings...
                  </div>
                ) : (
                  <>
                    {getRequestsByTab().map((request) => (
                      <BookingRequestCard
                        key={request.id}
                        request={request}
                        showActions={activeBookingTab === "pending"}
                        isInProgress={activeBookingTab === "inProgress"}
                        isCompleted={activeBookingTab === "completed"}
                      />
                    ))}
                    {getRequestsByTab().length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        No {activeBookingTab === "inProgress" ? "in progress" : activeBookingTab} requests at the moment
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="availability">
            <div className="space-y-6">
              {/* Weekly Schedule */}
              <Card className="bg-white border border-gray-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-gray-700" />
                    <h3 className="text-xl font-semibold text-gray-800">Weekly Schedule</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">
                    Set your regular working hours for each day of the week
                  </p>

                  <div className="space-y-4">
                    {weeklySchedule.map((schedule, index) => (
                      <div key={schedule.day} className="flex items-center gap-4">
                        {/* Toggle */}
                        <button
                          onClick={() => {
                            const newSchedule = [...weeklySchedule];
                            newSchedule[index].enabled = !newSchedule[index].enabled;
                            setWeeklySchedule(newSchedule);
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            schedule.enabled ? "bg-teal-500" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              schedule.enabled ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>

                        {/* Day name */}
                        <span className={`w-28 font-medium ${
                          schedule.enabled ? "text-gray-800" : "text-gray-400"
                        }`}>
                          {schedule.day}
                        </span>

                        {/* Time inputs */}
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <input
                              type="text"
                              value={schedule.startTime}
                              onChange={(e) => {
                                const newSchedule = [...weeklySchedule];
                                newSchedule[index].startTime = e.target.value;
                                setWeeklySchedule(newSchedule);
                              }}
                              disabled={!schedule.enabled}
                              className={`w-28 px-3 py-2 border rounded-lg text-sm ${
                                schedule.enabled
                                  ? "border-gray-300 text-gray-700"
                                  : "border-gray-200 text-gray-400 bg-gray-50"
                              }`}
                            />
                            <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                          <span className="text-gray-500">to</span>
                          <div className="relative">
                            <input
                              type="text"
                              value={schedule.endTime}
                              onChange={(e) => {
                                const newSchedule = [...weeklySchedule];
                                newSchedule[index].endTime = e.target.value;
                                setWeeklySchedule(newSchedule);
                              }}
                              disabled={!schedule.enabled}
                              className={`w-28 px-3 py-2 border rounded-lg text-sm ${
                                schedule.enabled
                                  ? "border-gray-300 text-gray-700"
                                  : "border-gray-200 text-gray-400 bg-gray-50"
                              }`}
                            />
                            <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full mt-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-3 disabled:opacity-50"
                    onClick={handleSaveSchedule}
                    disabled={savingSchedule}
                  >
                    {savingSchedule ? "Saving..." : "Save Schedule"}
                  </Button>
                </CardContent>
              </Card>

              {/* Block Specific Dates/Times */}
              <Card className="bg-white border border-gray-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays className="w-5 h-5 text-gray-700" />
                    <h3 className="text-xl font-semibold text-gray-800">Block Specific Dates/Times</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">
                    Mark dates or time slots when you're unavailable
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Calendar */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-500" />
                        </button>
                        <span className="font-medium text-gray-800">
                          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1 text-center text-sm">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                          <div key={day} className="py-2 text-gray-500 font-medium">
                            {day}
                          </div>
                        ))}
                        {(() => {
                          const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
                          const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
                          const daysInPrevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
                          const cells = [];
                          
                          // Previous month days
                          for (let i = firstDay - 1; i >= 0; i--) {
                            cells.push(
                              <div key={`prev-${i}`} className="py-2 text-gray-300">
                                {daysInPrevMonth - i}
                              </div>
                            );
                          }
                          
                          // Current month days
                          const today = new Date();
                          for (let day = 1; day <= daysInMonth; day++) {
                            const isToday = day === today.getDate() && 
                              currentMonth.getMonth() === today.getMonth() && 
                              currentMonth.getFullYear() === today.getFullYear();
                            const dateToSelect = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                            cells.push(
                              <div
                                key={day}
                                onClick={() => handleOpenBlockModal(dateToSelect)}
                                className={`py-2 cursor-pointer rounded hover:bg-teal-50 ${
                                  isToday ? "bg-teal-500 text-white hover:bg-teal-600" : "text-gray-700"
                                }`}
                              >
                                {day}
                              </div>
                            );
                          }
                          
                          // Next month days
                          const remainingCells = 42 - cells.length;
                          for (let i = 1; i <= remainingCells; i++) {
                            cells.push(
                              <div key={`next-${i}`} className="py-2 text-gray-300">
                                {i}
                              </div>
                            );
                          }
                          
                          return cells;
                        })()}
                      </div>
                    </div>

                    {/* Blocked Slots */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-medium text-gray-800">Blocked Slots</span>
                        <Button
                          size="sm"
                          className="bg-teal-50 text-teal-600 hover:bg-teal-100"
                          onClick={() => handleOpenBlockModal()}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Block
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {blockedSlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="p-4 border border-gray-100 rounded-lg flex items-start justify-between"
                          >
                            <div>
                              <p className="font-medium text-gray-800">{slot.date}</p>
                              <p className="text-sm text-gray-500">{slot.time}</p>
                              <span className="inline-block mt-2 px-2 py-1 text-xs bg-teal-50 text-teal-600 rounded">
                                {slot.reason}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteTimeOff(slot.id)}
                              className="text-red-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        {blockedSlots.length === 0 && (
                          <p className="text-gray-500 text-center py-8">
                            No blocked slots
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* OTP Modal */}
      {showOTPModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-teal-500" />
                  <h3 className="text-xl font-semibold text-gray-800">Complete Service</h3>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Enter the 6-digit verification code from the customer to complete the job and receive payment.
              </p>
            </div>

            {/* Service Details */}
            <div className="px-6 pb-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Customer</span>
                  <span className="text-sm font-medium text-gray-800">{selectedRequest.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Service</span>
                  <span className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
                    {selectedRequest.problemDescription}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Payment</span>
                  <span className="text-sm font-bold text-green-500">
                    NPR {selectedRequest.amount?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* OTP Input */}
            <div className="px-6 pb-6">
              <div className="flex justify-center gap-3">
                {otpValues.map((value, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleOTPKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-semibold border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <Button
                onClick={handleCloseModal}
                variant="outline"
                className="flex-1 py-3 border-gray-300 text-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerifyComplete}
                className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 text-white"
                disabled={otpValues.some((v) => !v)}
              >
                Verify & Complete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Block Time Modal */}
      {showBlockModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-800">Block Date/Time</h3>
                <button
                  onClick={handleCloseBlockModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-teal-600">
                Blocking time for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {/* Time Inputs */}
            <div className="px-6 pb-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={blockForm.startTime}
                      onChange={(e) => setBlockForm({ ...blockForm, startTime: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-teal-500 rounded-lg text-gray-700 focus:ring-2 focus:ring-teal-100 outline-none"
                    />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={blockForm.endTime}
                      onChange={(e) => setBlockForm({ ...blockForm, endTime: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                    />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                  placeholder="Personal appointment, holiday, etc."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none resize-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <Button
                onClick={handleCloseBlockModal}
                variant="outline"
                className="flex-1 py-3 border-gray-300 text-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBlockTime}
                className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 text-white"
              >
                Block Time
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Provider Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-800">Provider Settings</h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Manage your availability and rates
              </p>
            </div>

            {/* Settings Form */}
            <div className="px-6 pb-4 space-y-6">
              {/* Hourly Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate (NPR)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={settingsForm.hourlyRate}
                    onChange={(e) => setSettingsForm({ ...settingsForm, hourlyRate: Number(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-teal-500 rounded-lg text-gray-700 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Available Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Available Days
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                        settingsForm.availableDays.includes(day)
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={settingsForm.startTime}
                      onChange={(e) => setSettingsForm({ ...settingsForm, startTime: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                    />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={settingsForm.endTime}
                      onChange={(e) => setSettingsForm({ ...settingsForm, endTime: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                    />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 pb-6">
              <Button
                onClick={handleSaveSettings}
                className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white p-6 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">Edit Profile</h3>
                <button
                  onClick={() => setShowEditProfileModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Update your profile information</p>
            </div>

            {/* Profile Form */}
            <div className="p-6 space-y-5">
              {/* Profile Photo */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-teal-400 flex items-center justify-center text-white font-bold text-2xl">
                    {profileForm.fullName.charAt(0)}
                  </div>
                  <button className="absolute bottom-0 right-0 w-7 h-7 bg-teal-500 rounded-full flex items-center justify-center text-white hover:bg-teal-600 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Profile Photo</p>
                  <p className="text-sm text-gray-500">Click camera to change</p>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                </div>
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Category
                </label>
                <select
                  value={profileForm.service}
                  onChange={(e) => setProfileForm({ ...profileForm, service: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                >
                  {serviceOptions.map((service) => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none appearance-none"
                  >
                    {locationOptions.map((location) => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Years of Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={profileForm.experience}
                  onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About Me
                </label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  rows={4}
                  placeholder="Describe your skills, experience, and what makes you stand out..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{profileForm.bio.length}/500 characters</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="sticky bottom-0 bg-white p-6 pt-4 border-t border-gray-100">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowEditProfileModal(false)}
                  className="flex-1 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 text-white"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accept Booking Modal */}
      {showAcceptModal && acceptingRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-800">Accept Booking Request</h3>
                <button
                  onClick={handleCloseAcceptModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Provide schedule and payment details for the customer
              </p>
            </div>

            {/* Form */}
            <div className="px-6 pb-4 space-y-5">
              {/* Scheduled Date & Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={acceptForm.scheduledDateTime}
                  onChange={(e) => setAcceptForm({ ...acceptForm, scheduledDateTime: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-teal-500 rounded-lg text-gray-700 focus:ring-2 focus:ring-teal-100 outline-none"
                />
              </div>

              {/* Total Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Amount (NPR)
                </label>
                <input
                  type="number"
                  value={acceptForm.totalAmount}
                  onChange={(e) => setAcceptForm({ ...acceptForm, totalAmount: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                />
              </div>

              {/* Customer will receive */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Customer will receive:</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    Scheduled time confirmation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    Payment QR code
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    Verification OTP for service completion
                  </li>
                </ul>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <Button
                onClick={handleCloseAcceptModal}
                variant="outline"
                className="flex-1 py-3 border-gray-300 text-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAccept}
                className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 text-white"
              >
                Confirm & Send Details
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard;
