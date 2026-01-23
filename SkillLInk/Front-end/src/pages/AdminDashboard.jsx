import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select.jsx";
import { useToast } from "../hooks/useToast.js";
import api from "../services/api.js";
import { Shield, Users, UserCheck, UserX, Search, Eye, Download, Ban, CheckCircle } from "lucide-react";

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

  useEffect(() => {
    // Check if user is admin
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

    fetchData();
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
      toast({
        title: "Error",
        description: error.message || "Failed to fetch data",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
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

  const filteredUsers = users.filter((user) =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 p-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage users and monitor platform activity</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_customers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_providers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.active_users}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Suspended Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.suspended_users}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
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
                  className="pl-9"
                />
              </div>
              <Select value={filters.role} onValueChange={(value) => setFilters({ ...filters, role: value })}>
                <SelectTrigger>
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
  );
};

export default AdminDashboard;
