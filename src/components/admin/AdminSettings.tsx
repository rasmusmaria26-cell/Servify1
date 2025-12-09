import { useState, useEffect } from "react";
import { User, Mail, Phone, Lock, Save, Loader2, Bell, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const AdminSettings = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const [profile, setProfile] = useState({
        id: "",
        full_name: "",
        email: "",
        phone: "",
    });

    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        newVendorSignup: true,
        disputeAlerts: true,
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("user_id", user.id)
                    .single();

                if (profileData) {
                    setProfile({
                        id: user.id, // We keep using auth ID as the identifier
                        full_name: profileData.full_name || "",
                        email: user.email || "",
                        phone: profileData.phone || "",
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setIsSaving(true);
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: profile.full_name,
                    phone: profile.phone,
                })
                .eq("user_id", profile.id); // Update based on user_id (which is stored in profile.id)

            if (error) throw error;

            toast({
                title: "Profile Updated",
                description: "Your admin profile settings have been saved.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update profile",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h2 className="text-2xl font-display font-bold">Settings</h2>
                <p className="text-muted-foreground">Manage your account and platform preferences</p>
            </div>

            <div className="grid gap-8">
                {/* Profile Section */}
                <section className="bg-card rounded-2xl border border-border p-6 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Admin Profile</h3>
                            <p className="text-sm text-muted-foreground">Update your personal details</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4 max-w-xl">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="fullName"
                                    className="pl-9"
                                    value={profile.full_name}
                                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    className="pl-9 bg-secondary/50"
                                    value={profile.email}
                                    disabled
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Email cannot be changed directly</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    className="pl-9"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button onClick={handleUpdateProfile} disabled={isSaving}>
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Notifications Section */}
                <section className="bg-card rounded-2xl border border-border p-6 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Notifications</h3>
                            <p className="text-sm text-muted-foreground">Manage how you receive alerts</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4 max-w-xl">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Email Alerts</Label>
                                <p className="text-sm text-muted-foreground">Receive daily summaries via email</p>
                            </div>
                            <Switch
                                checked={notifications.emailAlerts}
                                onCheckedChange={(c) => setNotifications({ ...notifications, emailAlerts: c })}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">New Vendor Signups</Label>
                                <p className="text-sm text-muted-foreground">Get notified when a new vendor registers</p>
                            </div>
                            <Switch
                                checked={notifications.newVendorSignup}
                                onCheckedChange={(c) => setNotifications({ ...notifications, newVendorSignup: c })}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Dispute Alerts</Label>
                                <p className="text-sm text-muted-foreground">Immediate notification for new disputes</p>
                            </div>
                            <Switch
                                checked={notifications.disputeAlerts}
                                onCheckedChange={(c) => setNotifications({ ...notifications, disputeAlerts: c })}
                            />
                        </div>
                    </div>
                </section>

                {/* Security Section (Placeholder) */}
                <section className="bg-card rounded-2xl border border-border p-6 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Security</h3>
                            <p className="text-sm text-muted-foreground">Account security settings</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="max-w-xl">
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <Lock className="w-4 h-4 mr-2" />
                            Change Password
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                            For security reasons, you will be redirected to the password reset page.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminSettings;
