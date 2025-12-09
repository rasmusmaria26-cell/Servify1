import { useState, useEffect } from "react";
import { Search, Calendar, MapPin, Loader2, Filter, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Booking {
    id: string;
    created_at: string;
    scheduled_date: string;
    status: string;
    final_cost: number;
    estimated_cost: number;
    customer_id: string;
    vendor_id: string | null;
    service_id: string;
    vendor?: { business_name: string };
    service?: { name: string };
    customer?: { full_name: string; email: string };
}

const AdminBookings = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setIsLoading(true);

            // Fetch bookings with related vendor and service data
            // Note: We can't easily join profiles on customer_id directly IF there isn't an explicit FK to profiles.
            // We referenced auth.users. However, often we can double join or map client side.
            // Let's try to fetch, then map profiles.
            const { data: bookingsData, error } = await supabase
                .from("bookings")
                .select(`
                    *,
                    vendor:vendors(business_name),
                    service:services(name)
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Fetch customer profiles manually for the bookings
            // Get unique customer IDs
            const customerIds = [...new Set(bookingsData?.map(b => b.customer_id) || [])];

            let profilesMap: Record<string, any> = {};
            if (customerIds.length > 0) {
                const { data: profiles } = await supabase
                    .from("profiles")
                    .select("user_id, full_name, email")
                    .in("user_id", customerIds);

                if (profiles) {
                    profiles.forEach(p => {
                        profilesMap[p.user_id] = p;
                    });
                }
            }

            // Combine data
            const enrichedBookings = bookingsData?.map(b => ({
                ...b,
                customer: profilesMap[b.customer_id] || { full_name: "Unknown", email: "" }
            })) || [];

            setBookings(enrichedBookings);

        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed": return "bg-success/10 text-success hover:bg-success/20";
            case "cancelled": return "bg-destructive/10 text-destructive hover:bg-destructive/20";
            case "confirmed": return "bg-primary/10 text-primary hover:bg-primary/20";
            case "in_progress": return "bg-accent/10 text-accent hover:bg-accent/20";
            default: return "bg-secondary text-muted-foreground hover:bg-secondary/80";
        }
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.customer?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.vendor?.business_name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold">Bookings</h2>
                    <p className="text-muted-foreground">Monitor all platform service requests</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search ID, customer, vendor..."
                            className="pl-9 bg-card"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px] bg-card">
                            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-secondary/50">
                                <tr>
                                    <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">Booking ID</th>
                                    <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">Service Info</th>
                                    <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">Customer</th>
                                    <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">Vendor</th>
                                    <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">Status</th>
                                    <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredBookings.length > 0 ? (
                                    filteredBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-secondary/30 transition-colors">
                                            <td className="py-4 px-6">
                                                <span className="font-mono text-xs text-muted-foreground">#{booking.id.slice(0, 8)}</span>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {format(new Date(booking.created_at), "MMM d, yyyy")}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="font-medium text-foreground">{booking.service?.name || "Unknown Service"}</p>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                                    <Calendar className="w-3 h-3" />
                                                    {booking.scheduled_date ? format(new Date(booking.scheduled_date), "MMM d") : "No date"}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="text-sm font-medium">{booking.customer?.full_name}</p>
                                            </td>
                                            <td className="py-4 px-6">
                                                {booking.vendor ? (
                                                    <p className="text-sm text-primary font-medium">{booking.vendor.business_name}</p>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <Badge variant="secondary" className={`capitalize ${getStatusColor(booking.status)}`}>
                                                    {booking.status.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="font-medium">
                                                    {booking.final_cost ? `₹${booking.final_cost}` : (booking.estimated_cost ? `~₹${booking.estimated_cost}` : "Pending")}
                                                </p>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-muted-foreground">
                                            No bookings found matching filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBookings;
