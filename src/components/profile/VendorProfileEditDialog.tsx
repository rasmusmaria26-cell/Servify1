import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { fetchServiceCategories } from "@/services/serviceService";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VendorProfileEditDialogProps {
    vendor: any;
    onUpdate: () => void;
}

export function VendorProfileEditDialog({ vendor, onUpdate }: VendorProfileEditDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const [categories, setCategories] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        business_name: "",
        hourly_rate: 0,
        description: "",
        is_available: false,
        service_categories: [] as string[],
    });

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (vendor) {
            setFormData({
                business_name: vendor.business_name || "",
                hourly_rate: vendor.hourly_rate || 0,
                description: vendor.description || "",
                is_available: vendor.is_available || false,
                service_categories: vendor.service_categories || [],
            });
        }
    }, [vendor]);

    const loadCategories = async () => {
        try {
            const data = await fetchServiceCategories();
            setCategories(data);
        } catch (error) {
            console.error("Failed to load categories", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData({ ...formData, is_available: checked });
    };

    const handleCategoryToggle = (categoryId: string) => {
        setFormData(prev => {
            const current = prev.service_categories || [];
            if (current.includes(categoryId)) {
                return { ...prev, service_categories: current.filter(id => id !== categoryId) };
            } else {
                return { ...prev, service_categories: [...current, categoryId] };
            }
        });
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
                    service_categories: formData.service_categories,
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
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Edit Business Profile</DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-1 pr-4">
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

                        <div className="grid gap-2">
                            <Label>Service Categories</Label>
                            <div className="grid grid-cols-2 gap-2 border rounded-lg p-3">
                                {categories.map((category) => (
                                    <div key={category.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`cat-${category.id}`}
                                            checked={formData.service_categories?.includes(category.id)}
                                            onCheckedChange={() => handleCategoryToggle(category.id)}
                                        />
                                        <label
                                            htmlFor={`cat-${category.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            {category.name}
                                        </label>
                                    </div>
                                ))}
                                {categories.length === 0 && <p className="text-sm text-muted-foreground col-span-2">Loading categories...</p>}
                            </div>
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
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
