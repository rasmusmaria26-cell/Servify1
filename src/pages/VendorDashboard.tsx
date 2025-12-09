import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Wallet,
  Star,
  User,
  LogOut,
  Bell,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  BadgeCheck,
  MapPin,
  Navigation,
  Phone,
  Loader2,
  Settings,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fetchVendorBookings, acceptBooking, rejectBooking, updateBookingStatus } from "@/services/bookingService";

interface VendorProfile {
  id: string;
  business_name: string;
  description: string | null;
  hourly_rate: number | null;
  is_verified: boolean;
  is_available: boolean;
  rating: number;
  total_reviews: number;
  total_jobs: number;
  kyc_status: string;
}

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [isDeclining, setIsDeclining] = useState<string | null>(null);

  // Dynamic vendor data
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [isLoadingVendor, setIsLoadingVendor] = useState(true);
  const [vendorError, setVendorError] = useState<string | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    loadVendorData();
  }, []);

  const loadVendorData = async () => {
    try {
      setIsLoadingVendor(true);
      setVendorError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login/vendor");
        return;
      }

      // Fetch vendor profile
      const { data: vendorData, error: vendorError } = await supabase
        .from("vendors")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (vendorError) {
        if (vendorError.code === 'PGRST116') {
          // No vendor profile found - redirect to onboarding
          toast({
            title: "Complete your profile",
            description: "Please complete vendor onboarding first.",
          });
          navigate("/vendor/onboarding");
          return;
        }
        throw vendorError;
      }

      setVendor(vendorData);

      // Fetch bookings for this vendor
      const bookings = await fetchVendorBookings(vendorData.id);

      // Map bookings to the format expected by the UI
      const pendingRequests = bookings.pending.map((booking: any) => ({
        id: booking.id,
        customer: booking.customer?.full_name || booking.customer?.email || "Unknown Customer",
        customerImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        service: booking.service?.name || "Unknown Service",
        location: booking.address,
        time: `${new Date(booking.scheduled_date).toLocaleDateString()} at ${booking.scheduled_time}`,
        price: booking.estimated_price || booking.service?.base_price || 0,
        description: booking.issue_description,
      }));

      const activeJobs = bookings.active.map((booking: any) => ({
        id: booking.id,
        customer: booking.customer?.full_name || booking.customer?.email || "Unknown Customer",
        customerImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        customerPhone: "+91 98765 00000", // TODO: Add phone to bookings
        service: booking.service?.name || "Unknown Service",
        status: booking.status,
        eta: booking.status === "accepted" ? "On the way" : booking.status,
        price: booking.final_price || booking.estimated_price || 0,
        address: booking.address,
      }));

      setRequests(pendingRequests);
      setJobs(activeJobs);


    } catch (error: any) {
      console.error("Error loading vendor data:", error);
      setVendorError("Failed to load vendor data");
      toast({
        title: "Error loading data",
        description: "Unable to fetch vendor information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingVendor(false);
    }
  };

  const handleAcceptJob = async (requestId: string) => {
    try {
      setIsAccepting(requestId);
      console.log("Accepting job:", requestId);

      // Accept booking in database
      await acceptBooking(requestId);

      // Reload vendor data to refresh bookings
      await loadVendorData();

      toast({
        title: "Job Accepted!",
        description: "You've accepted the job. Navigate to customer location.",
      });
    } catch (error) {
      console.error("Error accepting job:", error);
      toast({
        title: "Failed to accept",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAccepting(null);
    }
  };

  const handleDeclineJob = async (requestId: string) => {
    try {
      setIsDeclining(requestId);
      console.log("Declining job:", requestId);

      // Reject booking in database
      await rejectBooking(requestId);

      // Reload vendor data to refresh bookings
      await loadVendorData();

      toast({
        title: "Job Declined",
        description: "The request has been declined.",
      });
    } catch (error) {
      console.error("Error declining job:", error);
      toast({
        title: "Failed to decline",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeclining(null);
    }
  };

  const handleUpdateStatus = async (jobId: string, newStatus: string) => {
    try {
      console.log("Updating job status:", jobId, newStatus);

      // Update status in database
      await updateBookingStatus(jobId, newStatus);

      // Reload vendor data to refresh jobs
      await loadVendorData();

      toast({
        title: "Status Updated",
        description: `Job status changed to: ${newStatus.replace("_", " ")}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCallCustomer = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleNavigate = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, "_blank");
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Show loading state
  if (isLoadingVendor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading vendor dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (vendorError || !vendor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h2 className="font-display text-2xl font-bold mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mb-4">{vendorError || "Vendor profile not found"}</p>
          <Button onClick={loadVendorData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-success flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-success-foreground" />
            </div>
            <div>
              <span className="font-display text-lg font-bold block">Servify</span>
              <span className="text-xs text-muted-foreground">Vendor Portal</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {[
              { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
              { icon: Calendar, label: "Bookings", id: "bookings" },
              { icon: Clock, label: "Job History", id: "history" },
              { icon: Wallet, label: "Earnings", id: "earnings" },
              { icon: Star, label: "Reviews", id: "reviews" },
              { icon: User, label: "Profile", id: "profile" },
              { icon: Settings, label: "Settings", id: "settings" },
              { icon: HelpCircle, label: "Help", id: "help" },
            ].map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === item.id
                    ? "bg-success text-success-foreground"
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

        {/* Verified Badge */}
        <div className={`p-4 mx-4 mb-4 rounded-xl border ${vendor.is_verified
          ? "bg-success/10 border-success/20"
          : "bg-warning/10 border-warning/20"
          }`}>
          <div className="flex items-center gap-2 mb-2">
            <BadgeCheck className={`w-5 h-5 ${vendor.is_verified ? "text-success" : "text-warning"}`} />
            <span className={`font-semibold ${vendor.is_verified ? "text-success" : "text-warning"}`}>
              {vendor.is_verified ? "Verified Vendor" : "Pending Verification"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {vendor.is_verified
              ? "Your profile is verified and trusted by customers."
              : `KYC Status: ${vendor.kyc_status}. Awaiting admin approval.`
            }
          </p>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <div>
            <h1 className="font-display text-xl font-semibold capitalize">{activeTab}</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {vendor.business_name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${vendor.is_available
              ? "bg-success/10 text-success"
              : "bg-secondary text-muted-foreground"
              }`}>
              <span className={`w-2 h-2 rounded-full ${vendor.is_available ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
              {vendor.is_available ? "Online" : "Offline"}
            </div>
            <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            </button>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
              {vendor.business_name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {activeTab === "dashboard" && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Today's Earnings", value: "₹0", icon: Wallet, color: "text-success", trend: "—" },
                  { label: "Jobs Completed", value: vendor.total_jobs.toString(), icon: CheckCircle, color: "text-primary", trend: "Total" },
                  { label: "Rating", value: vendor.rating.toFixed(1), icon: Star, color: "text-warning", trend: `${vendor.total_reviews} reviews` },
                  { label: "Hourly Rate", value: `₹${vendor.hourly_rate || 0}`, icon: TrendingUp, color: "text-accent", trend: "Per hour" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-card rounded-xl p-5 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                        {stat.trend}
                      </span>
                    </div>
                    <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Requests */}
                <div className="bg-card rounded-2xl border border-border">
                  <div className="p-5 border-b border-border">
                    <h3 className="font-display text-lg font-semibold">New Requests</h3>
                    <p className="text-sm text-muted-foreground">Accept or decline incoming jobs</p>
                  </div>
                  <div className="divide-y divide-border">
                    {requests.length > 0 ? requests.map((request) => (
                      <div key={request.id} className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={request.customerImage}
                              alt={request.customer}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-medium text-foreground">{request.service}</p>
                              <p className="text-sm text-muted-foreground">{request.customer}</p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{request.time}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {request.distance}
                          </div>
                          <span>{request.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="font-display font-bold text-lg text-foreground">₹{request.price}</p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => handleDeclineJob(request.id)}
                              disabled={isDeclining === request.id}
                            >
                              {isDeclining === request.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              Decline
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="gap-1 bg-success hover:bg-success/90"
                              onClick={() => handleAcceptJob(request.id)}
                              disabled={isAccepting === request.id}
                            >
                              {isAccepting === request.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              Accept
                            </Button>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-10 text-center">
                        <p className="text-muted-foreground">No new requests</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {!vendor.is_verified && "Complete verification to receive booking requests"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Jobs */}
                <div className="bg-card rounded-2xl border border-border">
                  <div className="p-5 border-b border-border">
                    <h3 className="font-display text-lg font-semibold">Active Jobs</h3>
                    <p className="text-sm text-muted-foreground">Jobs currently in progress</p>
                  </div>
                  {jobs.length > 0 ? (
                    <div className="p-5 space-y-4">
                      {jobs.map((job) => (
                        <div key={job.id} className="p-4 rounded-xl bg-warning/5 border border-warning/20">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={job.customerImage}
                                alt={job.customer}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div>
                                <p className="font-medium text-foreground">{job.service}</p>
                                <p className="text-sm text-muted-foreground">{job.customer}</p>
                              </div>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium capitalize">
                              {job.status.replace("_", " ")}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{job.address}</span>
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-muted-foreground">ETA: {job.eta}</p>
                            <p className="font-display font-bold text-foreground">₹{job.price}</p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-1"
                              onClick={() => handleCallCustomer(job.customerPhone)}
                            >
                              <Phone className="w-4 h-4" /> Call
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-1"
                              onClick={() => handleNavigate(job.address)}
                            >
                              <Navigation className="w-4 h-4" /> Navigate
                            </Button>
                          </div>

                          <Button
                            className="w-full mt-3"
                            variant="default"
                            onClick={() => handleUpdateStatus(job.id, job.status === "on_the_way" ? "arrived" : "completed")}
                          >
                            {job.status === "on_the_way" ? "Mark as Arrived" : "Complete Job"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center">
                      <p className="text-muted-foreground">No active jobs right now</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="max-w-2xl">
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center font-display text-3xl font-bold text-primary">
                    {vendor.business_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-xl font-bold">{vendor.business_name}</h3>
                      {vendor.is_verified && <BadgeCheck className="w-5 h-5 text-success" />}
                    </div>
                    <p className="text-muted-foreground">{vendor.description || "No description provided"}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      KYC Status: <span className="font-medium capitalize">{vendor.kyc_status}</span>
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-secondary rounded-xl">
                    <p className="font-display text-2xl font-bold">{vendor.rating.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">Rating</p>
                  </div>
                  <div className="text-center p-4 bg-secondary rounded-xl">
                    <p className="font-display text-2xl font-bold">{vendor.total_jobs}</p>
                    <p className="text-sm text-muted-foreground">Jobs</p>
                  </div>
                  <div className="text-center p-4 bg-secondary rounded-xl">
                    <p className="font-display text-2xl font-bold">₹{vendor.hourly_rate || 0}</p>
                    <p className="text-sm text-muted-foreground">Hourly Rate</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">Edit Profile</Button>
              </div>
            </div>
          )}

          {/* Other Tabs - Placeholder */}
          {!["dashboard", "profile"].includes(activeTab) && (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <h3 className="font-display text-xl font-semibold mb-2 capitalize">{activeTab}</h3>
              <p className="text-muted-foreground">This section is coming soon.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;
