import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    CheckCircle,
    Upload,
    Briefcase,
    IndianRupee,
    MapPin,
} from "lucide-react";
import { fetchServiceCategories } from "@/services/serviceService";

const steps = [
    { id: 1, title: "Business Info", icon: Building2 },
    { id: 2, title: "Services", icon: Briefcase },
    { id: 3, title: "Pricing", icon: IndianRupee },
    { id: 4, title: "Verification", icon: CheckCircle },
];

const VendorOnboarding = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        businessName: "",
        description: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        selectedCategories: [] as string[],
        hourlyRate: "",
        serviceRadius: "10",
        isAvailable: true,
        kycDocuments: {
            governmentId: null as File | null,
            businessLicense: null as File | null,
            addressProof: null as File | null,
        },
        termsAccepted: false,
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setIsLoadingCategories(true);
            const data = await fetchServiceCategories();
            setCategories(data);
        } catch (error) {
            console.error("Error loading categories:", error);
            toast({
                title: "Error loading categories",
                description: "Unable to fetch service categories. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoadingCategories(false);
        }
    };

    const handleNext = () => {
        // Validation for each step
        if (currentStep === 1) {
            if (!formData.businessName || !formData.description || !formData.phone) {
                toast({
                    title: "Required fields missing",
                    description: "Please fill in all required business information.",
                    variant: "destructive",
                });
                return;
            }
        } else if (currentStep === 2) {
            if (formData.selectedCategories.length === 0) {
                toast({
                    title: "Select at least one service",
                    description: "Please select the services you want to offer.",
                    variant: "destructive",
                });
                return;
            }
        } else if (currentStep === 3) {
            if (!formData.hourlyRate || parseFloat(formData.hourlyRate) <= 0) {
                toast({
                    title: "Invalid hourly rate",
                    description: "Please enter a valid hourly rate.",
                    variant: "destructive",
                });
                return;
            }
        }

        setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleCategoryToggle = (categoryId: string) => {
        setFormData((prev) => ({
            ...prev,
            selectedCategories: prev.selectedCategories.includes(categoryId)
                ? prev.selectedCategories.filter((id) => id !== categoryId)
                : [...prev.selectedCategories, categoryId],
        }));
    };

    const handleFileUpload = (field: keyof typeof formData.kycDocuments, file: File | null) => {
        // Validate file size (max 2MB)
        if (file && file.size > 2 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Please upload a file smaller than 2MB.",
                variant: "destructive",
            });
            return;
        }

        setFormData((prev) => ({
            ...prev,
            kycDocuments: {
                ...prev.kycDocuments,
                [field]: file,
            },
        }));
    };

    const handleSubmit = async () => {
        if (!formData.termsAccepted) {
            toast({
                title: "Accept terms and conditions",
                description: "Please accept the terms and conditions to continue.",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsSubmitting(true);

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error("User not authenticated");
            }

            // Upload KYC documents to Supabase Storage
            const kycDocs: any = {
                uploadedAt: new Date().toISOString(),
            };

            // Upload each document
            for (const [key, file] of Object.entries(formData.kycDocuments)) {
                if (file) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${user.id}/${key}_${Date.now()}.${fileExt}`;

                    const { data, error } = await supabase.storage
                        .from('kyc-documents')
                        .upload(fileName, file, {
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (error) {
                        console.error(`Error uploading ${key}:`, error);
                        // Continue with other uploads even if one fails
                        kycDocs[key] = null;
                    } else {
                        // Get public URL
                        const { data: { publicUrl } } = supabase.storage
                            .from('kyc-documents')
                            .getPublicUrl(fileName);

                        kycDocs[key] = publicUrl;
                    }
                }
            }

            // Insert vendor profile
            const { error } = await supabase.from("vendors").insert({
                user_id: user.id,
                business_name: formData.businessName,
                description: formData.description,
                phone: formData.phone,
                hourly_rate: parseFloat(formData.hourlyRate),
                service_categories: formData.selectedCategories,
                service_radius_km: parseInt(formData.serviceRadius),
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                is_available: formData.isAvailable,
                is_verified: false, // Requires admin approval
                kyc_status: "pending",
                kyc_documents: kycDocs,
                rating: 0,
                total_reviews: 0,
                total_jobs: 0,
            });

            if (error) throw error;

            toast({
                title: "Onboarding complete!",
                description: "Your vendor profile has been created. Awaiting verification.",
            });

            // Redirect to vendor dashboard
            navigate("/vendor/dashboard");
        } catch (error: any) {
            console.error("Error creating vendor profile:", error);
            toast({
                title: "Error creating profile",
                description: error.message || "Unable to create vendor profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                        Become a Vendor
                    </h1>
                    <p className="text-muted-foreground">
                        Complete your profile to start offering services
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="max-w-4xl mx-auto mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${currentStep >= step.id
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary text-muted-foreground"
                                            }`}
                                    >
                                        <step.icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs mt-2 font-medium hidden sm:block">
                                        {step.title}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`h-1 flex-1 mx-2 transition-all ${currentStep > step.id ? "bg-primary" : "bg-secondary"
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <div className="max-w-2xl mx-auto bg-card rounded-2xl border border-border p-8 shadow-lg">
                    {/* Step 1: Business Information */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="font-display text-2xl font-bold mb-2">
                                    Business Information
                                </h2>
                                <p className="text-muted-foreground">
                                    Tell us about your business
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="businessName">
                                        Business Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="businessName"
                                        placeholder="e.g., TechFix Solutions"
                                        value={formData.businessName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, businessName: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">
                                        Description <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe your services and expertise..."
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="phone">
                                        Contact Phone <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+91 98765 43210"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="address">Business Address</Label>
                                    <Input
                                        id="address"
                                        placeholder="Street address"
                                        value={formData.address}
                                        onChange={(e) =>
                                            setFormData({ ...formData, address: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            placeholder="City"
                                            value={formData.city}
                                            onChange={(e) =>
                                                setFormData({ ...formData, city: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="state">State</Label>
                                        <Input
                                            id="state"
                                            placeholder="State"
                                            value={formData.state}
                                            onChange={(e) =>
                                                setFormData({ ...formData, state: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="pincode">Pincode</Label>
                                        <Input
                                            id="pincode"
                                            placeholder="123456"
                                            value={formData.pincode}
                                            onChange={(e) =>
                                                setFormData({ ...formData, pincode: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Service Categories */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="font-display text-2xl font-bold mb-2">
                                    Select Services
                                </h2>
                                <p className="text-muted-foreground">
                                    Choose the services you want to offer
                                </p>
                            </div>

                            {isLoadingCategories ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="p-4 rounded-xl border border-border animate-pulse"
                                        >
                                            <div className="h-12 bg-secondary rounded mb-2" />
                                            <div className="h-4 bg-secondary rounded w-2/3" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => handleCategoryToggle(category.id)}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${formData.selectedCategories.includes(category.id)
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/30"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${formData.selectedCategories.includes(category.id)
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-secondary"
                                                        }`}
                                                >
                                                    <Briefcase className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">{category.name}</h3>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Pricing & Availability */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="font-display text-2xl font-bold mb-2">
                                    Pricing & Service Area
                                </h2>
                                <p className="text-muted-foreground">
                                    Set your rates and service radius
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="hourlyRate">
                                        Hourly Rate (₹) <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="hourlyRate"
                                            type="number"
                                            placeholder="1500"
                                            className="pl-10"
                                            value={formData.hourlyRate}
                                            onChange={(e) =>
                                                setFormData({ ...formData, hourlyRate: e.target.value })
                                            }
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        This is your base hourly rate. You can adjust for specific jobs.
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="serviceRadius">
                                        Service Radius (km)
                                    </Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="serviceRadius"
                                            type="number"
                                            placeholder="10"
                                            className="pl-10"
                                            value={formData.serviceRadius}
                                            onChange={(e) =>
                                                setFormData({ ...formData, serviceRadius: e.target.value })
                                            }
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Maximum distance you're willing to travel for service calls
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="isAvailable"
                                        checked={formData.isAvailable}
                                        onChange={(e) =>
                                            setFormData({ ...formData, isAvailable: e.target.checked })
                                        }
                                        className="w-4 h-4"
                                    />
                                    <Label htmlFor="isAvailable" className="cursor-pointer">
                                        I'm currently available for new bookings
                                    </Label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: KYC Verification */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="font-display text-2xl font-bold mb-2">
                                    Verification Documents
                                </h2>
                                <p className="text-muted-foreground">
                                    Upload documents for KYC verification
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label>Government ID (Aadhaar/PAN/Driving License)</Label>
                                    <div className="mt-2 flex items-center gap-3">
                                        <Input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) =>
                                                handleFileUpload("governmentId", e.target.files?.[0] || null)
                                            }
                                            className="flex-1"
                                        />
                                        {formData.kycDocuments.governmentId && (
                                            <CheckCircle className="w-5 h-5 text-success" />
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label>Business License (Optional)</Label>
                                    <div className="mt-2 flex items-center gap-3">
                                        <Input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) =>
                                                handleFileUpload("businessLicense", e.target.files?.[0] || null)
                                            }
                                            className="flex-1"
                                        />
                                        {formData.kycDocuments.businessLicense && (
                                            <CheckCircle className="w-5 h-5 text-success" />
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label>Address Proof</Label>
                                    <div className="mt-2 flex items-center gap-3">
                                        <Input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) =>
                                                handleFileUpload("addressProof", e.target.files?.[0] || null)
                                            }
                                            className="flex-1"
                                        />
                                        {formData.kycDocuments.addressProof && (
                                            <CheckCircle className="w-5 h-5 text-success" />
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-secondary rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={formData.termsAccepted}
                                        onChange={(e) =>
                                            setFormData({ ...formData, termsAccepted: e.target.checked })
                                        }
                                        className="w-4 h-4 mt-1"
                                    />
                                    <Label htmlFor="terms" className="cursor-pointer text-sm">
                                        I accept the terms and conditions and agree to provide genuine
                                        services to customers. I understand that my profile will be
                                        verified before I can start accepting bookings.
                                    </Label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-border">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={currentStep === 1 || isSubmitting}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>

                        {currentStep < 4 ? (
                            <Button onClick={handleNext}>
                                Next
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Upload className="w-4 h-4 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Complete Onboarding
                                        <CheckCircle className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorOnboarding;
