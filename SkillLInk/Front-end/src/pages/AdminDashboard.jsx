import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select.jsx";
import { useToast } from "../hooks/useToast.js";
import api from "../services/api.js";
import { Shield, Users, UserCheck, UserX, Search, Eye, Download, Ban, CheckCircle, DollarSign, CreditCard, LogOut, AlertTriangle, MessageSquare, ChevronDown } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({ role: "all", status: "all" });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewingCertificate, setViewingCertificate] = useState(null);
  const [activeSection, setActiveSection] = useState("users"); // "users" | "reports"
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportFilter, setReportFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");

  // Handle auth errors by clearing localStorage and redirecting
  const handleAuthError = (error) => {
    if (error.message?.includes('Access denied') || error.message?.includes('Not authorized')) {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      toast({
        title: "Session Expired",
        description: "Please login again as admin",
        variant: "destructive",
      });
      setTimeout(() => navigate("/login"), 1500);
      return true;
    }
    return false;
  };

  useEffect(() => {
    // Check if user is admin - verify with server
    const verifyAdmin = async () => {
      const userRole = localStorage.getItem("userRole");
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      
      if (!isLoggedIn || userRole !== "admin") {
        toast({
          title: "Access Denied",
          description: "You must be an admin to access this page",
          variant: "destructive",
        });
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      // Verify session with server
      try {
        const currentUser = await api.getCurrentUser();
        if (currentUser.role !== 'admin') {
          // localStorage is stale, update it and redirect
          localStorage.setItem("userRole", currentUser.role);
          toast({
            title: "Access Denied",
            description: "You are not logged in as admin",
            variant: "destructive",
          });
          setTimeout(() => navigate("/login"), 1500);
          return;
        }
        fetchData();
      } catch (error) {
        if (!handleAuthError(error)) {
          toast({
            title: "Session Error",
            description: "Please login again",
            variant: "destructive",
          });
          setTimeout(() => navigate("/login"), 1500);
        }
      }
    };

    verifyAdmin();
  }, [navigate, toast]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const apiFilters = {};
      if (filters.role !== "all") apiFilters.role = filters.role;
      if (filters.status !== "all") apiFilters.status = filters.status;
      
      const [usersData, statsData] = await Promise.all([
        api.admin.getUsers(apiFilters),
        api.admin.getStats(),
      ]);
      setUsers(usersData.users);
      setStats(statsData.stats);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch data",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole === "admin") {
      fetchData();
    }
  }, [filters]);

  // Fetch reports
  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const data = await api.admin.getReports(reportFilter);
      setReports(data.reports || []);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch reports",
          variant: "destructive",
        });
      }
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole === "admin" && activeSection === "reports") {
      fetchReports();
    }
  }, [reportFilter, activeSection]);

  const handleUpdateReport = async (reportId, status) => {
    try {
      await api.admin.updateReport(reportId, { status, admin_notes: adminNotes });
      toast({
        title: "Success",
        description: `Report ${status} successfully`,
      });
      setSelectedReport(null);
      setAdminNotes("");
      fetchReports();
      fetchData(); // refresh stats
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update report",
        variant: "destructive",
      });
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await api.admin.updateUserStatus(userId, newStatus);
      
      toast({
        title: "Success",
        description: `User ${newStatus ? "activated" : "suspended"} successfully`,
      });
      
      fetchData();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast({
          title: "Error",
          description: error.message || "Failed to update user status",
          variant: "destructive",
        });
      }
    }
  };

  const viewUserDetails = async (userId) => {
    try {
      const data = await api.admin.getUserDetails(userId);
      setSelectedUser(data.user);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch user details",
        variant: "destructive",
      });
    }
  };

  const viewCertificate = async (providerId) => {
    try {
      const data = await api.admin.getProviderCertificate(providerId);
      setViewingCertificate(data.certificate);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch certificate",
        variant: "destructive",
      });
    }
  };

  const downloadCertificate = () => {
    if (!viewingCertificate) return;
    
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${viewingCertificate}`;
    link.download = `certificate_${selectedUser?.id}.pdf`;
    link.click();
  };

  // Handle logout - clear all stored data
  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear localStorage and redirect
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
      navigate("/login");
    }
  };

  const filteredUsers = users.filter((user) =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage users and monitor platform activity</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/")} className="hover:bg-primary/5 hover:border-primary transition-all">
                Back to Home
              </Button>
              <Button variant="destructive" onClick={handleLogout} className="shadow-md hover:shadow-lg transition-all">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <>
              {/* User Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="bg-white/80 backdrop-blur-sm border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Total Customers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">{stats.total_customers}</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Total Providers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">{stats.total_providers}</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{stats.active_users}</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Suspended Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">{stats.suspended_users}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Transaction Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-blue-500/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                      <CardTitle className="text-sm font-medium text-muted-foreground">Gross Transactions</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">NPR {Number(stats.gross_transactions || 0).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total payment volume</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_transactions || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">All time payments</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <CardTitle className="text-sm font-medium text-muted-foreground">Completed Payments</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.completed_transactions || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">NPR {Number(stats.completed_amount || 0).toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{stats.pending_transactions || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Awaiting completion</p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Section Tabs */}
          <div className="flex gap-2">
            <Button
              variant={activeSection === "users" ? "default" : "outline"}
              onClick={() => setActiveSection("users")}
              className={activeSection === "users" ? "bg-primary text-white" : ""}
            >
              <Users className="h-4 w-4 mr-2" />
              User Management
            </Button>
            <Button
              variant={activeSection === "reports" ? "default" : "outline"}
              onClick={() => setActiveSection("reports")}
              className={activeSection === "reports" ? "bg-red-500 hover:bg-red-600 text-white" : ""}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Reports
              {stats && parseInt(stats.pending_reports) > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                  {stats.pending_reports}
                </span>
              )}
            </Button>
          </div>

          {/* Reports Section */}
          {activeSection === "reports" && (
            <Card className="bg-white/80 backdrop-blur-sm border-gray-100 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Reports Management
                </CardTitle>
                <CardDescription>Review and manage customer reports against providers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Report Filters */}
                <div className="flex gap-2">
                  {["all", "pending", "reviewed", "resolved", "dismissed"].map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={reportFilter === status ? "default" : "outline"}
                      onClick={() => setReportFilter(status)}
                      className={`capitalize ${reportFilter === status ? "bg-primary text-white" : ""}`}
                    >
                      {status}
                    </Button>
                  ))}
                </div>

                {/* Reports Table */}
                {reportsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3 font-medium">Date</th>
                          <th className="text-left p-3 font-medium">Customer</th>
                          <th className="text-left p-3 font-medium">Provider</th>
                          <th className="text-left p-3 font-medium">Reason</th>
                          <th className="text-left p-3 font-medium">Status</th>
                          <th className="text-left p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.map((report) => (
                          <tr key={report.id} className="border-t hover:bg-muted/50">
                            <td className="p-3 text-sm">{new Date(report.created_at).toLocaleDateString()}</td>
                            <td className="p-3">
                              <div>
                                <p className="font-medium text-sm">{report.customer_name}</p>
                                <p className="text-xs text-muted-foreground">{report.customer_email}</p>
                              </div>
                            </td>
                            <td className="p-3">
                              <div>
                                <p className="font-medium text-sm">{report.provider_name}</p>
                                <p className="text-xs text-muted-foreground">{report.provider_service || 'N/A'}</p>
                              </div>
                            </td>
                            <td className="p-3 text-sm max-w-[200px] truncate">{report.reason}</td>
                            <td className="p-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                report.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                                report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {report.status}
                              </span>
                            </td>
                            <td className="p-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => { setSelectedReport(report); setAdminNotes(report.admin_notes || ""); }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {reports.length === 0 && (
                      <div className="text-center p-8 text-muted-foreground">
                        No reports found
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Report Detail Modal */}
          {selectedReport && (
            <>
              <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedReport(null)} />
              <Card className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50 overflow-y-auto max-h-[90vh]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Report Details
                  </CardTitle>
                  <CardDescription>Submitted {new Date(selectedReport.created_at).toLocaleString()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Reported by</p>
                      <p className="font-semibold">{selectedReport.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{selectedReport.customer_email}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Provider</p>
                      <p className="font-semibold">{selectedReport.provider_name}</p>
                      <p className="text-sm text-muted-foreground">{selectedReport.provider_email}</p>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-xs font-medium text-red-600 mb-1">Reason</p>
                    <p className="font-semibold text-red-800">{selectedReport.reason}</p>
                  </div>

                  {selectedReport.description && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                      <p className="text-sm bg-gray-50 rounded-lg p-4">{selectedReport.description}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Current Status</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedReport.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      selectedReport.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                      selectedReport.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedReport.status}
                    </span>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1 block">Admin Notes</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this report..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <Button variant="outline" onClick={() => setSelectedReport(null)}>
                      Close
                    </Button>
                    {selectedReport.status === 'pending' && (
                      <Button
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => handleUpdateReport(selectedReport.id, 'reviewed')}
                      >
                        Mark Reviewed
                      </Button>
                    )}
                    {(selectedReport.status === 'pending' || selectedReport.status === 'reviewed') && (
                      <>
                        <Button
                          className="bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => handleUpdateReport(selectedReport.id, 'resolved')}
                        >
                          Resolve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleUpdateReport(selectedReport.id, 'dismissed')}
                        >
                          Dismiss
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Filters and Search */}
          {activeSection === "users" && (
          <Card className="bg-white/80 backdrop-blur-sm border-gray-100 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">User Management</CardTitle>
              <CardDescription>View and manage all users on the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white/50 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Select value={filters.role} onValueChange={(value) => setFilters({ ...filters, role: value })}>
                  <SelectTrigger className="bg-white/50">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="customer">Customers</SelectItem>
                    <SelectItem value="service_provider">Providers</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Users Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Phone</th>
                    <th className="text-left p-3 font-medium">Role</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t hover:bg-muted/50">
                      <td className="p-3">{user.full_name}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">{user.phone}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'service_provider' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3">
                        {user.is_active ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <Ban className="h-4 w-4" />
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewUserDetails(user.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {user.role === 'service_provider' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user);
                                viewCertificate(user.id);
                              }}
                            >
                              Certificate
                            </Button>
                          )}
                          {user.role !== 'admin' && (
                            <Button
                              size="sm"
                              variant={user.is_active ? "destructive" : "default"}
                              onClick={() => handleStatusToggle(user.id, user.is_active)}
                            >
                              {user.is_active ? "Suspend" : "Activate"}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                  No users found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
          )}

        {/* User Details Modal */}
        {selectedUser && !viewingCertificate && (
          <Card className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50 overflow-y-auto max-h-[90vh]">
            <CardHeader>
              <CardTitle>User Details</CardTitle>
              <CardDescription>{selectedUser.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-lg">{selectedUser.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-lg">{selectedUser.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <p className="text-lg capitalize">{selectedUser.role.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                  <p className="text-lg">{selectedUser.is_active ? 'Active' : 'Suspended'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p className="text-lg">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedUser.provider_details && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold text-lg mb-3">Provider Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Service Category</p>
                      <p className="text-lg">{selectedUser.provider_details.service_category}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Hourly Rate</p>
                      <p className="text-lg">Rs. {selectedUser.provider_details.hourly_rate || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Experience</p>
                      <p className="text-lg">{selectedUser.provider_details.years_of_experience || 'N/A'} years</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Locations</p>
                      <p className="text-lg">{selectedUser.provider_details.locations?.filter(Boolean).join(', ') || 'N/A'}</p>
                    </div>
                    {selectedUser.provider_details.bio && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Bio</p>
                        <p className="text-lg">{selectedUser.provider_details.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Close
                </Button>
                {selectedUser.role === 'service_provider' && (
                  <Button onClick={() => viewCertificate(selectedUser.id)}>
                    View Certificate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certificate Viewer Modal */}
        {viewingCertificate && (
          <Card className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl z-50 overflow-y-auto max-h-[90vh]">
            <CardHeader>
              <CardTitle>Provider Certificate</CardTitle>
              <CardDescription>{selectedUser?.full_name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <iframe
                  src={`data:application/pdf;base64,${viewingCertificate}`}
                  className="w-full h-[500px]"
                  title="Certificate"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => {
                  setViewingCertificate(null);
                  setSelectedUser(null);
                }}>
                  Close
                </Button>
                <Button onClick={downloadCertificate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overlay for modals */}
        {(selectedUser || viewingCertificate) && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => {
              setSelectedUser(null);
              setViewingCertificate(null);
            }}
          />
        )}
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
