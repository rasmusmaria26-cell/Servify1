import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VendorProfileEditDialogProps {
    vendor: any;
    onUpdate: () => void;
}

export function VendorProfileEditDialog({ vendor, onUpdate }: VendorProfileEditDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        business_name: "",
        hourly_rate: 0,
        description: "",
        is_available: false,
    });

    useEffect(() => {
        if (vendor) {
            setFormData({
                business_name: vendor.business_name || "",
                hourly_rate: vendor.hourly_rate || 0,
                description: vendor.description || "",
                is_available: vendor.is_available || false,
            });
        }
    }, [vendor]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData({ ...formData, is_available: checked });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from("vendors")
                .update({
                    business_name: formData.business_name,
                    hourly_rate: Number(formData.hourly_rate),
                    description: formData.description,
                    is_available: formData.is_available,
                })
                .eq("id", vendor.id);

            if (error) throw error;

            toast({
                title: "Profile updated",
                description: "Your vendor profile has been updated successfully.",
            });
            onUpdate();
            setOpen(false);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">Edit Profile</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Business Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="business_name">Business Name</Label>
                        <Input
                            id="business_name"
                            name="business_name"
                            value={formData.business_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="hourly_rate">Hourly Rate (₹)</Label>
                        <Input
                            id="hourly_rate"
                            name="hourly_rate"
                            type="number"
                            min="0"
                            value={formData.hourly_rate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Tell customers about your services..."
                        />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Available for Jobs</Label>
                            <p className="text-sm text-muted-foreground">
                                Turn off to stop receiving new bookings
                            </p>
                        </div>
                        <Switch
                            checked={formData.is_available}
                            onCheckedChange={handleSwitchChange}
                        />
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
