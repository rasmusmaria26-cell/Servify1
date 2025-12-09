import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Settings,
  LogOut,
  Bell,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  DollarSign,
  BarChart3,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  Download,
  File,
  Menu,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminVendors from "@/components/admin/AdminVendors";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminBookings from "@/components/admin/AdminBookings";

interface PendingVendor {
  id: string;
  business_name: string;
  description: string | null;
  kyc_status: string;
  is_verified: boolean;
  service_categories: string[];
  created_at: string;
  user_id: string;
  kyc_documents: any;
  phone?: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [pendingVendors, setPendingVendors] = useState<PendingVendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingVendor, setProcessingVendor] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<PendingVendor | null>(null);
  const [showKycDialog, setShowKycDialog] = useState(false);

  // Stats State
  const [stats, setStats] = useState({
    revenue: 0,
    activeUsers: 0,
    verifiedVendors: 0
  });

  useEffect(() => {
    checkAdminAuth();
    loadPendingVendors();
    loadStats();
  }, []);

  const checkAdminAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login/customer");
    }
  };

  const loadStats = async () => {
    try {
      // 1. Calculate Total Revenue (Sum of final_cost from completed bookings)
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('final_cost')
        .eq('status', 'completed');

      if (bookingsError) throw bookingsError;
      const totalRevenue = bookingsData?.reduce((sum, b) => sum + (b.final_cost || 0), 0) || 0;

      // 2. Count Active Users (Customers)
      // Check user_roles table for 'customer' role
      const { count: userCount, error: userError } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');

      if (userError) throw userError;

      // 3. Count Verified Vendors
      const { count: vendorCount, error: vendorError } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', true);

      if (vendorError) throw vendorError;

      setStats({
        revenue: totalRevenue,
        activeUsers: userCount || 0,
        verifiedVendors: vendorCount || 0
      });

    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadPendingVendors = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("is_verified", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPendingVendors(data || []);
    } catch (error) {
      console.error("Error loading pending vendors:", error);
      toast({
        title: "Error loading vendors",
        description: "Unable to fetch pending vendors.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveVendor = async (vendorId: string) => {
    try {
      setProcessingVendor(vendorId);

      const { error } = await supabase
        .from("vendors")
        .update({
          is_verified: true,
          kyc_status: "approved",
        })
        .eq("id", vendorId);

      if (error) throw error;

      toast({
        title: "Vendor Approved",
        description: "The vendor has been verified and can now receive bookings.",
      });

      setPendingVendors(pendingVendors.filter(v => v.id !== vendorId));
      setShowKycDialog(false);
    } catch (error) {
      console.error("Error approving vendor:", error);
      toast({
        title: "Approval Failed",
        description: "Unable to approve vendor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingVendor(null);
    }
  };

  const handleRejectVendor = async (vendorId: string) => {
    try {
      setProcessingVendor(vendorId);

      const { error } = await supabase
        .from("vendors")
        .update({
          kyc_status: "rejected",
        })
        .eq("id", vendorId);

      if (error) throw error;

      toast({
        title: "Vendor Rejected",
        description: "The vendor application has been rejected.",
        variant: "destructive",
      });

      setPendingVendors(pendingVendors.filter(v => v.id !== vendorId));
      setShowKycDialog(false);
    } catch (error) {
      console.error("Error rejecting vendor:", error);
      toast({
        title: "Rejection Failed",
        description: "Unable to reject vendor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingVendor(null);
    }
  };

  const handleViewKyc = (vendor: PendingVendor) => {
    setSelectedVendor(vendor);
    setShowKycDialog(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };


  // Extracted Sidebar Content
  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <>
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2" onClick={onClose}>
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-display text-lg font-bold block">Servify</span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {[
            { icon: LayoutDashboard, label: "Overview", id: "dashboard" },
            { icon: Users, label: "Users", id: "users" },
            { icon: Briefcase, label: "Vendors", id: "vendors" },
            { icon: FileText, label: "Bookings", id: "bookings" },
            { icon: AlertTriangle, label: "Disputes", id: "disputes" },
            { icon: BarChart3, label: "Analytics", id: "analytics" },
            { icon: Settings, label: "Settings", id: "settings" },
          ].map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  setActiveTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border fixed h-full">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 transition-all duration-300">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 bg-opacity-80 backdrop-blur">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground hover:text-foreground">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-card border-r border-border">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <div>
              <h1 className="font-display text-lg sm:text-xl font-semibold">Admin Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground capitalize hidden sm:block">{activeTab}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {pendingVendors.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </button>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
              AD
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 pb-20">
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-success", change: "+12%" },
                  { label: "Active Users", value: stats.activeUsers.toString(), icon: Users, color: "text-primary", change: "+5%" },
                  { label: "Verified Vendors", value: stats.verifiedVendors.toString(), icon: UserCheck, color: "text-accent", change: "+2%" },
                  { label: "Pending KYC", value: pendingVendors.length.toString(), icon: AlertTriangle, color: "text-warning", change: "Live" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-card rounded-xl p-5 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                        {stat.change}
                      </span>
                    </div>
                    <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Pending Approvals */}
              <div className="bg-card rounded-2xl border border-border">
                <div className="p-5 border-b border-border flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold">Pending Approvals</h3>
                    <p className="text-sm text-muted-foreground">Vendors awaiting KYC verification</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-warning/10 text-warning text-sm font-medium">
                    {pendingVendors.length} pending
                  </span>
                </div>

                {isLoading ? (
                  <div className="p-10 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-muted-foreground">Loading pending vendors...</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {pendingVendors.length > 0 ? (
                      pendingVendors.map((vendor) => (
                        <div key={vendor.id} className="p-5 hover:bg-secondary/50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-foreground">{vendor.business_name}</h4>
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning">
                                  {vendor.kyc_status}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {vendor.description || "No description provided"}
                              </p>
                              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                <span>📍 {vendor.city || "N/A"}, {vendor.state || "N/A"}</span>
                                <span>📞 {vendor.phone || "N/A"}</span>
                                <span>📅 {new Date(vendor.created_at).toLocaleDateString()}</span>
                                <span>🏷️ {vendor.service_categories.length} categories</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => handleViewKyc(vendor)}
                            >
                              <Eye className="w-4 h-4" />
                              View KYC
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-destructive hover:bg-destructive/10"
                              onClick={() => handleRejectVendor(vendor.id)}
                              disabled={processingVendor === vendor.id}
                            >
                              {processingVendor === vendor.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              Reject
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="gap-1 bg-success hover:bg-success/90"
                              onClick={() => handleApproveVendor(vendor.id)}
                              disabled={processingVendor === vendor.id}
                            >
                              {processingVendor === vendor.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              Approve
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success" />
                        <p className="text-muted-foreground">No pending vendor approvals</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'vendors' && <AdminVendors />}
          {activeTab === 'analytics' && <AdminAnalytics />}
          {activeTab === 'settings' && <AdminSettings />}
          {activeTab === 'bookings' && <AdminBookings />}

          {/* Placeholders for other tabs */}
          {!['dashboard', 'users', 'vendors', 'analytics', 'settings', 'bookings'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl border border-border">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Settings className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2 capitalize">{activeTab} Module</h3>
              <p className="text-muted-foreground text-center max-w-md">
                The {activeTab} management module is currently under development.
                Full functionality will be available in the next update.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* KYC Documents Dialog */}
      <Dialog open={showKycDialog} onOpenChange={setShowKycDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>KYC Documents - {selectedVendor?.business_name}</DialogTitle>
            <DialogDescription>
              Review the submitted KYC documents before approving the vendor
            </DialogDescription>
          </DialogHeader>

          {selectedVendor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Business Name:</span>
                  <p className="font-medium">{selectedVendor.business_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <p className="font-medium">{selectedVendor.phone || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Address:</span>
                  <p className="font-medium">{selectedVendor.address || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-medium capitalize">{selectedVendor.kyc_status}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Uploaded Documents</h4>
                {selectedVendor.kyc_documents ? (
                  <div className="space-y-2">
                    {Object.entries(selectedVendor.kyc_documents)
                      .filter(([key]) => key !== 'uploadedAt')
                      .map(([key, value]: [string, any]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                          <div className="flex items-center gap-2">
                            <File className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          </div>
                          {value ? (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(value, '_blank')}
                                className="gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = value;
                                  link.download = `${key}_${selectedVendor.business_name}`;
                                  link.click();
                                }}
                                className="gap-1"
                              >
                                <Download className="w-3 h-3" />
                                Download
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not uploaded</span>
                          )}
                        </div>
                      ))}
                    {selectedVendor.kyc_documents.uploadedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Uploaded: {new Date(selectedVendor.kyc_documents.uploadedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowKycDialog(false)}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-destructive hover:bg-destructive/10"
                  onClick={() => handleRejectVendor(selectedVendor.id)}
                  disabled={processingVendor === selectedVendor.id}
                >
                  {processingVendor === selectedVendor.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Reject
                </Button>
                <Button
                  className="flex-1 bg-success hover:bg-success/90"
                  onClick={() => handleApproveVendor(selectedVendor.id)}
                  disabled={processingVendor === selectedVendor.id}
                >
                  {processingVendor === selectedVendor.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
