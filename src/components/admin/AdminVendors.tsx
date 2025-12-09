import { useState, useEffect } from "react";
import { Search, MapPin, Star, ShieldCheck, ShieldAlert, Loader2, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Vendor {
    id: string;
    business_name: string;
    is_verified: boolean;
    kyc_status: string;
    rating: number;
    total_jobs: number;
    city: string | null;
    created_at: string;
    email?: string; // might need to join with profiles or auth if possible, but let's stick to vendor table data for now
}

const AdminVendors = () => {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from("vendors")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setVendors(data || []);
        } catch (error) {
            console.error("Error fetching vendors:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load vendors",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleVerification = async (vendor: Vendor) => {
        try {
            const newStatus = !vendor.is_verified;
            const kycStatus = newStatus ? 'approved' : 'pending';

            const { error } = await supabase
                .from("vendors")
                .update({
                    is_verified: newStatus,
                    kyc_status: kycStatus
                })
                .eq("id", vendor.id);

            if (error) throw error;

            toast({
                title: newStatus ? "Vendor Verified" : "Verification Revoked",
                description: `${vendor.business_name} has been ${newStatus ? "verified" : "unverified"}.`,
            });

            fetchVendors();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update vendor status",
            });
        }
    };

    const filteredVendors = vendors.filter(vendor =>
        vendor.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-bold">Vendor Management</h2>
                    <p className="text-muted-foreground">Monitor and manage service providers</p>
                </div>
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search vendors..."
                        className="pl-9 bg-card"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredVendors.map((vendor) => (
                        <div key={vendor.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${vendor.is_verified ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                        {vendor.business_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">{vendor.business_name}</h3>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <MapPin className="w-3 h-3" />
                                            {vendor.city || "Unknown Location"}
                                        </div>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => toggleVerification(vendor)}>
                                            {vendor.is_verified ? "Revoke Verification" : "Approve Vendor"}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="bg-secondary/50 rounded-lg p-2 text-center">
                                    <div className="flex items-center justify-center gap-1 text-warning mb-1">
                                        <Star className="w-3 h-3 fill-warning" />
                                        <span className="font-bold text-sm">{vendor.rating.toFixed(1)}</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Rating</p>
                                </div>
                                <div className="bg-secondary/50 rounded-lg p-2 text-center">
                                    <p className="font-bold text-sm text-foreground">{vendor.total_jobs}</p>
                                    <p className="text-[10px] text-muted-foreground">Jobs Done</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${vendor.is_verified ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                    {vendor.is_verified ? (
                                        <>
                                            <ShieldCheck className="w-3 h-3" /> Verified
                                        </>
                                    ) : (
                                        <>
                                            <ShieldAlert className="w-3 h-3" /> Pending
                                        </>
                                    )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    Joined {format(new Date(vendor.created_at), "MMM yyyy")}
                                </span>
                            </div>
                        </div>
                    ))}

                    {filteredVendors.length === 0 && (
                        <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-xl border border-border">
                            No vendors found matching "{searchTerm}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminVendors;
