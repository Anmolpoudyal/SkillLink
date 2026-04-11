import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/useToast.js";
import api from "../services/api.js";
import ScheduleManager from "../components/ScheduleManager.jsx";
import NotificationBell from "../components/NotificationBell.jsx";
import BrandLogo from "../components/BrandLogo.jsx";
import BookingChatModal from "../components/BookingChatModal.jsx";
import DirectChatModal from "../components/DirectChatModal.jsx";
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
  Star,
  MessageCircle,
} from "lucide-react";

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is a provider - redirect customers/admins away
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole === "customer") {
      navigate("/customer-dashboard");
    } else if (userRole === "admin") {
      navigate("/admin");
    }
  }, [navigate]);

  const [activeBookingTab, setActiveBookingTab] = useState("pending");
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatBooking, setChatBooking] = useState(null);
  const [showDirectInbox, setShowDirectInbox] = useState(false);
  const [directConversations, setDirectConversations] = useState([]);
  const [directLoading, setDirectLoading] = useState(false);
  const [showDirectChatModal, setShowDirectChatModal] = useState(false);
  const [directChatPeer, setDirectChatPeer] = useState(null);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const otpInputRefs = useRef([]);

  // Bookings state - fetched from API
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // Reviews state
  const [myReviews, setMyReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewStats, setReviewStats] = useState({ totalReviews: 0, averageRating: 0 });

  // Weekly schedule state
  const [weeklySchedule, setWeeklySchedule] = useState([
    { day: "Monday", enabled: false, startTime: "09:00 AM", endTime: "06:00 PM", breakStart: "", breakEnd: "" },
    { day: "Tuesday", enabled: false, startTime: "09:00 AM", endTime: "06:00 PM", breakStart: "", breakEnd: "" },
    { day: "Wednesday", enabled: false, startTime: "09:00 AM", endTime: "06:00 PM", breakStart: "", breakEnd: "" },
    { day: "Thursday", enabled: false, startTime: "09:00 AM", endTime: "06:00 PM", breakStart: "", breakEnd: "" },
    { day: "Friday", enabled: false, startTime: "09:00 AM", endTime: "06:00 PM", breakStart: "", breakEnd: "" },
    { day: "Saturday", enabled: false, startTime: "10:00 AM", endTime: "04:00 PM", breakStart: "", breakEnd: "" },
    { day: "Sunday", enabled: false, startTime: "10:00 AM", endTime: "04:00 PM", breakStart: "", breakEnd: "" },
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

  const mapBlockedSlots = (slots = []) =>
    slots.map((slot) => ({
      id: slot.id,
      date: slot.date, // keep YYYY-MM-DD from API for stable comparisons
      time: `${slot.startTime || "00:00"} - ${slot.endTime || "23:59"}`,
      startTime: slot.startTime,
      endTime: slot.endTime,
      reason: slot.reason || "Personal",
    }));

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

  // Loading state
  const [loading, setLoading] = useState(true);

  // Earnings state
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingEarnings, setPendingEarnings] = useState(0);

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

        // Set earnings from profile
        setTotalEarnings(parseFloat(user.total_earnings) || 0);
        setPendingEarnings(parseFloat(user.pending_earnings) || 0);

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

  // Fetch reviews on mount
  useEffect(() => {
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const response = await api.getMyReviews();
        setMyReviews(response.reviews || []);
        setReviewStats({
          totalReviews: response.totalReviews || 0,
          averageRating: response.averageRating || 0,
        });
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, []);

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
          setBlockedSlots(mapBlockedSlots(response.blockedSlots));
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
    earnings: totalEarnings,
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
        setBlockedSlots(mapBlockedSlots(response.blockedSlots));
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
    if (isVerifyingOtp) return;

    const otp = otpValues.join("");
    
    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the complete 6-digit code",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsVerifyingOtp(true);

      // First try to verify payment completion OTP
      const paymentResult = await api.payments.verifyCompletionOtp(selectedRequest.id, otp);
      
      if (paymentResult.success) {
        // Refresh bookings
        const response = await api.getProviderBookings();
        setBookings(response.bookings || []);
        
        // Update earnings from payment result
        if (paymentResult.earnings) {
          setTotalEarnings(prev => prev + paymentResult.earnings);
          setPendingEarnings(prev => prev + paymentResult.earnings);
        }
        
        // Also refresh profile to get latest earnings
        const profileResponse = await api.getProfile();
        if (profileResponse.user) {
          setTotalEarnings(parseFloat(profileResponse.user.total_earnings) || 0);
          setPendingEarnings(parseFloat(profileResponse.user.pending_earnings) || 0);
        }
        
        const alreadyFinalized = Boolean(paymentResult.alreadyFinalized);
        toast({
          title: alreadyFinalized ? "Already Finalized" : "Job Completed!",
          description: alreadyFinalized
            ? "This booking was already finalized. Status has been refreshed."
            : `Work completed! You earned NPR ${paymentResult.earnings?.toLocaleString() || '0'}`,
        });
        
        setShowOTPModal(false);
        setSelectedRequest(null);
        setOtpValues(["", "", "", "", "", ""]);
      }
    } catch (error) {
      console.error("Error completing booking:", error);
      
      // Check if it's an OTP error
      if (error.message.includes("Invalid") || error.message.includes("OTP")) {
        toast({
          title: "Invalid Code",
          description: "The completion code doesn't match. Please ask the customer for the correct code.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to complete booking",
          variant: "destructive",
        });
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleCloseModal = () => {
    if (isVerifyingOtp) return;
    setShowOTPModal(false);
    setSelectedRequest(null);
    setOtpValues(["", "", "", "", "", ""]);
  };

  const handleOpenChat = (request) => {
    setChatBooking(request);
    setShowChatModal(true);
  };

  const handleOpenDirectInbox = async () => {
    try {
      setDirectLoading(true);
      const response = await api.chat.getDirectConversations();
      setDirectConversations(response.conversations || []);
      setShowDirectInbox(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to load direct conversations",
        variant: "destructive",
      });
    } finally {
      setDirectLoading(false);
    }
  };

  const openDirectChatWithPeer = (conversation) => {
    setDirectChatPeer({
      id: conversation.peerId,
      name: conversation.peerName,
      role: conversation.peerRole,
    });
    setShowDirectInbox(false);
    setShowDirectChatModal(true);
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

  const handleCancelBeforePayment = async (request) => {
    const confirmed = window.confirm(
      "Cancel this booking before payment? This cannot be undone."
    );
    if (!confirmed) return;

    try {
      await api.updateBookingStatus(request.id, {
        status: "cancelled",
        rejectionReason: "Cancelled by provider before payment",
      });

      const response = await api.getProviderBookings();
      setBookings(response.bookings || []);

      toast({
        title: "Booking Cancelled",
        description: "The booking has been cancelled before payment.",
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel booking",
        variant: "destructive",
      });
    }
  };

  const StatCard = ({ title, value, icon: Icon, iconColor }) => (
    <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden">
      <CardContent className="p-6 relative">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mt-1">{value}</p>
          </div>
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
            iconColor.includes('yellow') ? 'bg-yellow-50' :
            iconColor.includes('blue') ? 'bg-blue-50' :
            iconColor.includes('green') ? 'bg-green-50' :
            'bg-teal-50'
          } group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-7 h-7 ${iconColor}`} />
          </div>
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
      <Card className={`bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 mb-4 ${isInProgress ? 'border-2 border-blue-200 ring-2 ring-blue-100' : isCompleted ? 'border-2 border-green-200 ring-2 ring-green-100' : 'border border-gray-100'}`}>
        <CardContent className="p-6">
          {/* Header with customer info and badge */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg shadow-sm">
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
              <p className="text-sm text-gray-600 mb-1">Booking Verification Code:</p>
              <p className="text-xl font-mono font-bold text-blue-600 tracking-wider">{request.verificationCode}</p>
              <p className="text-xs text-gray-500 mt-2">Show this to customer to verify your identity when you arrive.</p>
            </div>
          )}

          {/* Action Buttons - for pending */}
          <div className="mb-4">
            <Button
              variant="outline"
              onClick={() => handleOpenChat(request)}
              className="w-full border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat with {request.customer?.name || "Customer"}
            </Button>
          </div>

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

          {/* Complete Work Button - for in progress */}
          {isInProgress && (
            <>
              {(request.paymentStatus !== 'completed' && request.paymentStatus !== 'paid') && (
                <Button
                  onClick={() => handleCancelBeforePayment(request)}
                  variant="outline"
                  className="w-full mb-3 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel Booking (Before Payment)
                </Button>
              )}

              {/* Show payment status */}
              {(request.paymentStatus === 'completed' || request.paymentStatus === 'paid') ? (
                <Button
                  onClick={() => handleEnterOTP(request)}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-3"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Enter Completion Code
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700 text-center">
                      ⏳ Waiting for customer to complete payment
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    The customer will receive a completion code after payment. They'll share it with you once you complete the work.
                  </p>
                </div>
              )}
            </>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <BrandLogo imageClassName="h-10 md:h-11 drop-shadow-sm" />
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={handleOpenDirectInbox}
              className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-primary/5"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">Direct Chats</span>
            </button>
            <button 
              onClick={() => setShowEditProfileModal(true)}
              className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-primary/5"
            >
              <Edit className="w-5 h-5" />
              <span className="font-medium">Edit Profile</span>
            </button>
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-primary/5"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </button>
            <NotificationBell />
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-primary font-bold shadow-sm">
                {provider.initial}
              </div>
              <div className="hidden sm:block">
                <span className="text-gray-700 font-medium">{provider.name}</span>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
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
          <TabsList className="bg-white/80 backdrop-blur-sm border border-gray-200 p-1.5 rounded-xl mb-6 shadow-sm">
            <TabsTrigger
              value="requests"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all"
            >
              <Clock className="w-4 h-4" />
              Requests
            </TabsTrigger>
            <TabsTrigger
              value="availability"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all"
            >
              <Settings className="w-4 h-4" />
              Availability
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all"
            >
              <Star className="w-4 h-4" />
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Requests</h2>
              
              {/* Sub-tabs for request status */}
              <div className="flex items-center gap-2 mb-6 bg-white/60 backdrop-blur-sm p-1.5 rounded-xl w-fit">
                <button
                  onClick={() => setActiveBookingTab("pending")}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                    activeBookingTab === "pending"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-500 hover:bg-white/50"
                  }`}
                >
                  Pending
                  <span className="bg-gradient-to-r from-primary to-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingRequests.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveBookingTab("inProgress")}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                    activeBookingTab === "inProgress"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-500 hover:bg-white/50"
                  }`}
                >
                  In Progress
                  <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {inProgressRequests.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveBookingTab("completed")}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeBookingTab === "completed"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-500 hover:bg-white/50"
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
              {scheduleLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent"></div>
                </div>
              ) : (
                <ScheduleManager
                  initialSchedule={weeklySchedule}
                  initialBlockedSlots={blockedSlots}
                  onSaveSchedule={async (schedule) => {
                    setSavingSchedule(true);
                    try {
                      await api.saveAvailability(schedule);
                      setWeeklySchedule(schedule);
                      toast({
                        title: "Success",
                        description: "Schedule saved successfully!",
                      });
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: error.message || "Failed to save schedule",
                        variant: "destructive",
                      });
                    } finally {
                      setSavingSchedule(false);
                    }
                  }}
                  onAddBlockedSlot={async (timeOffData) => {
                    try {
                      await api.addTimeOff(timeOffData);
                      // Refresh blocked slots
                      const response = await api.getMyAvailability();
                      if (response.blockedSlots) {
                        setBlockedSlots(mapBlockedSlots(response.blockedSlots));
                      }
                      toast({
                        title: "Success",
                        description: "Time off added successfully!",
                      });
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: error.message || "Failed to add time off",
                        variant: "destructive",
                      });
                    }
                  }}
                  onDeleteBlockedSlot={async (id) => {
                    try {
                      await api.deleteTimeOff(id);
                      setBlockedSlots(prev => prev.filter(slot => slot.id !== id));
                      toast({
                        title: "Success",
                        description: "Time off removed",
                      });
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: error.message || "Failed to remove time off",
                        variant: "destructive",
                      });
                    }
                  }}
                  saving={savingSchedule}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">My Reviews & Ratings</h2>

              {/* Rating Overview */}
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Rating Overview</h3>
                  <div className="flex items-start gap-8">
                    {/* Left side - Overall rating */}
                    <div className="text-center">
                      <p className="text-5xl font-bold text-teal-500 mb-1">{reviewStats.averageRating}</p>
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < Math.floor(reviewStats.averageRating) ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">Based on {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}</p>
                    </div>

                    {/* Right side - Rating distribution bars */}
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((starCount) => {
                        const count = myReviews.filter(r => r.rating === starCount).length;
                        const total = myReviews.length || 1;
                        const percentage = (count / total) * 100;
                        return (
                          <div key={starCount} className="flex items-center gap-3">
                            <div className="flex items-center gap-1 w-8">
                              <span className="text-sm text-gray-600">{starCount}</span>
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            </div>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reviews List */}
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Reviews</h3>
                  {reviewsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent"></div>
                    </div>
                  ) : myReviews.length === 0 ? (
                    <div className="text-center py-12">
                      <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No reviews yet</p>
                      <p className="text-sm text-gray-400 mt-1">Reviews from your customers will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {myReviews.map((review, index) => {
                        const bgColors = ["bg-teal-500", "bg-blue-500", "bg-orange-500", "bg-teal-400", "bg-purple-500"];
                        const timeAgo = (dateStr) => {
                          const now = new Date();
                          const date = new Date(dateStr);
                          const diffMs = now - date;
                          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                          if (diffDays === 0) return "Today";
                          if (diffDays === 1) return "Yesterday";
                          if (diffDays < 7) return `${diffDays} days ago`;
                          if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
                          if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
                          return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
                        };
                        return (
                          <div key={review.id || index} className="py-5 border-b border-gray-100 last:border-0">
                            <div className="flex items-start gap-4">
                              <div className={`w-10 h-10 rounded-full ${bgColors[index % bgColors.length]} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                                {review.customerName?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="font-semibold text-gray-900">{review.customerName || 'Anonymous'}</p>
                                  <p className="text-sm text-gray-400">{timeAgo(review.createdAt)}</p>
                                </div>
                                <div className="flex items-center gap-1 mb-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${i < review.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
                                    />
                                  ))}
                                </div>
                                {review.comment && (
                                  <p className="text-gray-700 text-sm">{review.comment}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
                  <h3 className="text-xl font-semibold text-gray-800">Complete Work</h3>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isVerifyingOtp}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Enter the 6-digit completion code from the customer to finalize the work and receive your payment.
              </p>
            </div>

            {/* Service Details */}
            <div className="px-6 pb-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Customer</span>
                  <span className="text-sm font-medium text-gray-800">{selectedRequest.customer?.name || selectedRequest.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Service</span>
                  <span className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
                    {selectedRequest.problemDescription}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Amount</span>
                  <span className="text-sm font-bold text-green-500">
                    NPR {parseFloat(selectedRequest.finalAmount || selectedRequest.estimatedAmount || selectedRequest.amount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
              
              {/* Info box about the code */}
              <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  💡 The customer received this code after making the payment. They should only share it after you've completed the work.
                </p>
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
                disabled={isVerifyingOtp}
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerifyComplete}
                className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 text-white"
                disabled={otpValues.some((v) => !v) || isVerifyingOtp}
              >
                {isVerifyingOtp ? "Verifying..." : "Verify & Complete"}
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

      <BookingChatModal
        isOpen={showChatModal}
        onClose={() => {
          setShowChatModal(false);
          setChatBooking(null);
        }}
        booking={chatBooking}
        currentUserRole="service_provider"
      />

      {showDirectInbox && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[75] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Direct Conversations</h3>
              <button
                onClick={() => setShowDirectInbox(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              {directLoading ? (
                <p className="text-sm text-gray-500">Loading conversations...</p>
              ) : directConversations.length === 0 ? (
                <p className="text-sm text-gray-500">No direct conversations yet.</p>
              ) : (
                <div className="space-y-2">
                  {directConversations.map((conversation) => (
                    <button
                      key={conversation.peerId}
                      onClick={() => openDirectChatWithPeer(conversation)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <p className="font-medium text-gray-900">{conversation.peerName}</p>
                      <p className="text-xs text-gray-500 capitalize mb-1">
                        {conversation.peerRole?.replace("_", " ")}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <DirectChatModal
        isOpen={showDirectChatModal}
        onClose={() => {
          setShowDirectChatModal(false);
          setDirectChatPeer(null);
        }}
        peerUser={directChatPeer}
      />
    </div>
  );
};

export default ProviderDashboard;
