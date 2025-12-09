import { useState, useEffect } from "react";
import { Search, Mail, Phone, MapPin, Calendar, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface UserProfile {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
    created_at: string;
}

const AdminUsers = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            // Fetch profiles that are likely customers
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
    (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm))
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-bold">Users Directory</h2>
                    <p className="text-muted-foreground">Manage and view all registered users</p>
                </div>
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
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
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-secondary/50">
                            <tr>
                                <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">User</th>
                                <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">Contact</th>
                                <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">Location</th>
                                <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">Joined Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                    {user.full_name?.charAt(0).toUpperCase() || "U"}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{user.full_name || "Unnamed User"}</p>
                                                    <p className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="space-y-1">
                                                {user.email && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email}
                                                    </div>
                                                )}
                                                {user.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Phone className="w-3 h-3" />
                                                        {user.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="w-3 h-3" />
                                                {user.city || "Unknown"}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                {format(new Date(user.created_at), "MMM d, yyyy")}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-muted-foreground">
                                        No users found matching "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
