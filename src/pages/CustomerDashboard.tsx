import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  Calendar,
  Clock,
  MapPin,
  Bell,
  User,
  LogOut,
  Plus,
  Star,
  ChevronRight,
  Smartphone,
  Car,
  Zap,
  MessageSquare,
  CreditCard,
  Settings,
  HelpCircle,
  Menu,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LiveMap from "@/components/tracking/LiveMap";
import { supabase } from "@/integrations/supabase/client";
import { ProfileEditDialog } from "@/components/profile/ProfileEditDialog";
import { fetchCustomerBookings } from "@/services/bookingService";
import { BookingDetailsDialog } from "@/components/booking/BookingDetailsDialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const recentBookings = [
  {
    id: "BK001",
    service: "Mobile Screen Repair",
    vendor: "TechFix Solutions",
    vendorPhone: "+91 98765 43210",
    status: "on_the_way",
    date: "Today, 2:30 PM",
    price: 1499,
    icon: Smartphone,
    address: "123, MG Road, Koramangala, Bangalore - 560034",
  },
  {
    id: "BK002",
    service: "Car AC Service",
    vendor: "AutoCare Hub",
    status: "completed",
    date: "Nov 28, 2024",
    price: 2499,
    icon: Car,
  },
  {
    id: "BK003",
    service: "Electrical Wiring",
    vendor: "PowerPro Electric",
    status: "scheduled",
    date: "Dec 5, 2024",
    price: 899,
    icon: Zap,
  },
];

const statusColors = {
  on_the_way: "bg-warning/10 text-warning",
  in_progress: "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
  scheduled: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

const statusLabels = {
  on_the_way: "On the Way",
  in_progress: "In Progress",
  completed: "Completed",
  scheduled: "Scheduled",
  cancelled: "Cancelled",
};

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login/customer");
        return;
      }
      setUserId(user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.log("Profile not found, will be created on edit");
      }
      setProfile(data);

      // Fetch customer bookings
      await loadBookings(user.id);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const loadBookings = async (customerId: string) => {
    try {
      setIsLoadingBookings(true);
      const { active, scheduled, completed } = await fetchCustomerBookings(customerId);

      // Combine all bookings for display
      const allBookings = [...active, ...scheduled, ...completed].map((booking: any) => ({
        id: booking.id,
        service: booking.service?.name || "Service",
        vendor: booking.vendor?.business_name || "Vendor",
        vendor_id: booking.vendor_id, // Critical for reviews
        status: booking.status,
        date: new Date(booking.scheduled_date).toLocaleDateString(),
        time: booking.scheduled_time,
        price: booking.estimated_price || 0,
        icon: Smartphone, // Default icon
        address: booking.address,
        description: booking.issue_description,
      }));

      setBookings(allBookings);
    } catch (error) {
      console.error("Error loading bookings:", error);
      toast({
        title: "Error loading bookings",
        description: "Unable to fetch your bookings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate]);



  const handleTabChange = (tabId: string) => {
    console.log("Switching to tab:", tabId);
    setActiveTab(tabId);

    // Handle specific navigation
    if (tabId === "profile") {
      toast({
        title: "Profile",
        description: "Opening your profile settings...",
      });
    }
  };

  const handleBookingClick = (bookingId: string) => {
    console.log("Opening booking:", bookingId);
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setSelectedBookingDetails(booking);
      setShowBookingDetails(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate("/");
  };

  // Prioritize "on_the_way" or "in_progress", then "accepted", then "pending"
  const activeBooking = bookings.find(b => ["on_the_way", "in_progress"].includes(b.status))
    || bookings.find(b => b.status === "accepted")
    || bookings.find(b => b.status === "pending");

  const recentBookings = bookings.slice(0, 3); // Show only 3 most recent


  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <>
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2" onClick={onClose}>
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Home className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">Servify</span>
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {[
            { icon: Home, label: "Dashboard", id: "dashboard" },
            { icon: Calendar, label: "My Bookings", id: "bookings" },
            { icon: MapPin, label: "Track Service", id: "tracking" },
            { icon: Clock, label: "Service History", id: "history" },
            { icon: CreditCard, label: "Payments", id: "payments" },
            { icon: MessageSquare, label: "Messages", id: "messages" },
            { icon: User, label: "Profile", id: "profile" },
            { icon: Settings, label: "Settings", id: "settings" },
            { icon: HelpCircle, label: "Help & Support", id: "help" },
          ].map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  handleTabChange(item.id);
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
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border fixed h-full">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 transition-all duration-300">
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 bg-opacity-80 backdrop-blur">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground hover:text-foreground">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-card border-r border-border">
                <SidebarContent onClose={() => setIsMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>
            <h1 className="font-display text-lg sm:text-xl font-semibold capitalize truncate max-w-[150px] sm:max-w-none">
              {activeTab}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
                <p className="text-xs text-muted-foreground">Customer</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 sm:p-6 pb-20">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <>
              {/* Welcome & Quick Action */}
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="flex-1 bg-gradient-hero rounded-2xl p-8 text-primary-foreground">
                  <h2 className="font-display text-2xl font-bold mb-2">
                    Welcome back, {profile?.full_name?.split(' ')[0] || "User"}!
                  </h2>
                  <p className="text-primary-foreground/80 mb-6">
                    Need help with something? Book a service in just a few clicks.
                  </p>
                  <Button asChild variant="hero">
                    <Link to="/services">
                      <Plus className="w-5 h-5" /> Book a Service
                    </Link>
                  </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 md:w-80">
                  {[
                    { label: "Active Bookings", value: bookings.filter(b => ["accepted", "on_the_way", "in_progress", "pending"].includes(b.status)).length.toString(), icon: Clock },
                    { label: "Completed", value: bookings.filter(b => b.status === "completed").length.toString(), icon: Star },
                    { label: "Total Spent", value: `₹${bookings.reduce((sum, b) => sum + (b.price || 0), 0).toLocaleString()}`, icon: CreditCard },
                    { label: "Total Bookings", value: bookings.length.toString(), icon: User },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-card rounded-xl p-4 border border-border"
                    >
                      <stat.icon className="w-5 h-5 text-primary mb-2" />
                      <p className="font-display text-xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Service Tracking */}
              {activeBooking && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg font-semibold">Active Service</h3>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("tracking")}>
                      Full Tracking <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                        <activeBooking.icon className="w-6 h-6 text-warning" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{activeBooking.service}</p>
                        <p className="text-sm text-muted-foreground">
                          {['on_the_way', 'in_progress'].includes(activeBooking.status)
                            ? `${activeBooking.vendor} • ETA: 15 min`
                            : activeBooking.status === "accepted"
                              ? "Booking Confirmed - Waiting for Vendor"
                              : "Waiting for Vendor Approval"}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[activeBooking.status as keyof typeof statusColors]}`}>
                        {statusLabels[activeBooking.status as keyof typeof statusLabels]}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Bookings */}
              <div className="bg-card rounded-2xl border border-border">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold">Recent Bookings</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("bookings")}>
                    View All <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="divide-y divide-border">
                  {isLoadingBookings ? (
                    <div className="p-6 text-center text-muted-foreground">Loading bookings...</div>
                  ) : recentBookings.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">No bookings yet</div>
                  ) : recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      onClick={() => handleBookingClick(booking.id)}
                      className="p-6 flex items-center gap-4 hover:bg-secondary/50 transition-colors cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <booking.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {booking.service}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.vendor} • {booking.date}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status as keyof typeof statusColors]
                          }`}
                      >
                        {statusLabels[booking.status as keyof typeof statusLabels]}
                      </span>
                      <p className="font-semibold text-foreground">₹{booking.price}</p>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Tracking Tab */}
          {activeTab === "tracking" && (
            activeBooking ? (
              ['on_the_way', 'in_progress'].includes(activeBooking.status) ? (
                <LiveMap
                  vendorName={activeBooking.vendor}
                  vendorPhone={activeBooking.vendorPhone}
                  estimatedTime="15 min"
                  status="on_the_way"
                  customerAddress={activeBooking.address}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-2xl border border-border">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Clock className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {activeBooking.status === "accepted" ? "Booking Confirmed!" : "Pending Confirmation"}
                  </h3>
                  <p className="text-muted-foreground max-w-md mb-8">
                    {activeBooking.status === "accepted"
                      ? "Your booking is confirmed. Real-time tracking will become available once the vendor starts their journey to your location."
                      : "We've received your booking request. You'll be notified as soon as a vendor accepts your request."}
                  </p>

                  <div className="bg-secondary/50 p-6 rounded-xl w-full max-w-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Service</span>
                      <span className="font-medium">{activeBooking.service}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Vendor</span>
                      <span className="font-medium">{activeBooking.vendor}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[activeBooking.status as keyof typeof statusColors]}`}>
                        {statusLabels[activeBooking.status as keyof typeof statusLabels]}
                      </span>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-2xl border border-border">
                <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Service</h3>
                <p className="text-muted-foreground max-w-md">
                  You don't have any active services to track at the moment.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => navigate("/services")}>
                  Book a Service
                </Button>
              </div>
            )
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="bg-card rounded-2xl border border-border">
              <div className="p-6 border-b border-border">
                <h3 className="font-display text-lg font-semibold">My Bookings</h3>
              </div>
              <div className="divide-y divide-border">
                {isLoadingBookings ? (
                  <div className="p-6 text-center text-muted-foreground">Loading bookings...</div>
                ) : bookings.filter(b => !['completed', 'cancelled', 'rejected'].includes(b.status)).length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">No active bookings</div>
                ) : bookings.filter(b => !['completed', 'cancelled', 'rejected'].includes(b.status)).map((booking) => (
                  <div
                    key={booking.id}
                    onClick={() => handleBookingClick(booking.id)}
                    className="p-6 flex items-center gap-4 hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <booking.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{booking.service}</p>
                      <p className="text-sm text-muted-foreground">{booking.vendor} • {booking.date}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status as keyof typeof statusColors]}`}>
                      {statusLabels[booking.status as keyof typeof statusLabels]}
                    </span>
                    <p className="font-semibold text-foreground">₹{booking.price}</p>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service History Tab */}
          {activeTab === "history" && (
            <div className="bg-card rounded-2xl border border-border">
              <div className="p-6 border-b border-border">
                <h3 className="font-display text-lg font-semibold">Service History</h3>
              </div>
              <div className="divide-y divide-border">
                {isLoadingBookings ? (
                  <div className="p-6 text-center text-muted-foreground">Loading history...</div>
                ) : bookings.filter(b => ['completed', 'cancelled', 'rejected'].includes(b.status)).length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">No past bookings found</div>
                ) : bookings.filter(b => ['completed', 'cancelled', 'rejected'].includes(b.status)).map((booking) => (
                  <div
                    key={booking.id}
                    onClick={() => handleBookingClick(booking.id)}
                    className="p-6 flex items-center gap-4 hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                      <booking.icon className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{booking.service}</p>
                      <p className="text-sm text-muted-foreground">{booking.vendor} • {booking.date}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status as keyof typeof statusColors]}`}>
                      {statusLabels[booking.status as keyof typeof statusLabels]}
                    </span>
                    <p className="font-semibold text-foreground">₹{booking.price}</p>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="max-w-2xl">
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold">{profile?.full_name || "User"}</h3>
                    <p className="text-muted-foreground">{profile?.email || "No email"}</p>
                    <p className="text-sm text-muted-foreground">{profile?.phone || "No phone number"}</p>
                  </div>
                </div>

                {profile && (
                  <div className="grid gap-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">City</p>
                        <p>{profile.city || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">State</p>
                        <p>{profile.state || "-"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Address</p>
                      <p>{profile.address || "-"}</p>
                    </div>
                  </div>
                )}

                <ProfileEditDialog profile={profile} userId={userId} onUpdate={fetchProfile} />
              </div>
            </div>
          )}

          {/* Other Tabs - Placeholder */}
          {!["dashboard", "tracking", "bookings", "profile", "history"].includes(activeTab) && (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <h3 className="font-display text-xl font-semibold mb-2 capitalize">{activeTab}</h3>
              <p className="text-muted-foreground">This section is coming soon.</p>
            </div>
          )}
        </div>
      </main>

      {/* Booking Details Dialog */}
      <BookingDetailsDialog
        booking={selectedBookingDetails}
        isOpen={showBookingDetails}
        onClose={() => setShowBookingDetails(false)}
        onUpdate={fetchProfile}
      />
    </div>
  );
};

export default CustomerDashboard;

// Force rebuild for HMR
