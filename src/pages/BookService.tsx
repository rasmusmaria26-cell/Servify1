import { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Mic,
  Brain,
  MapPin,
  Star,
  Clock,
  Shield,
  CheckCircle,
  Loader2,
  Lock,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PaymentModal from "@/components/payment/PaymentModal";
import ImageUpload from "@/components/booking/ImageUpload";
import { analyzeIssue, DiagnosisResult } from "@/services/ai";
import { fetchVendorsByService, Vendor } from "@/services/vendorService";

const steps = [
  { id: 1, title: "Describe Issue" },
  { id: 2, title: "AI Diagnosis" },
  { id: 3, title: "Choose Vendor" },
  { id: 4, title: "Schedule" },
  { id: 5, title: "Confirm" },
];

// Vendors will be fetched dynamically from Supabase

const BookService = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [issueDescription, setIssueDescription] = useState("");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [address, setAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);

  // Vendor-related state
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [vendorsError, setVendorsError] = useState<string | null>(null);

  const selectedVendorData = vendors.find((v) => v.id === selectedVendor);

  // Fetch vendors when reaching step 3
  useEffect(() => {
    if (currentStep === 3 && serviceId) {
      loadVendors();
    }
  }, [currentStep, serviceId]);

  const loadVendors = async () => {
    if (!serviceId) return;

    try {
      setIsLoadingVendors(true);
      setVendorsError(null);
      const fetchedVendors = await fetchVendorsByService(serviceId);
      setVendors(fetchedVendors);

      if (fetchedVendors.length === 0) {
        toast({
          title: "No vendors available",
          description: "There are no vendors available for this service at the moment.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading vendors:", error);
      setVendorsError("Failed to load vendors. Please try again.");
      toast({
        title: "Error loading vendors",
        description: "Unable to fetch available vendors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingVendors(false);
    }
  };

  // Handle going to next step (Step 1 -> Step 2)
  const handleNext = () => {
    if (!issueDescription.trim()) {
      toast({
        title: "Description required",
        description: "Please describe your issue before proceeding.",
        variant: "destructive",
      });
      return;
    }

    console.log("Proceeding to AI analysis step");
    console.log("Issue description:", issueDescription);
    console.log("Uploaded images:", uploadedImages.length);

    // Save data and proceed
    setCurrentStep(2);
  };

  // AI Analysis
  const handleAnalyze = async () => {
    if (!issueDescription.trim()) {
      toast({
        title: "Description required",
        description: "Please describe your issue before analysis.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      console.log("Starting AI analysis for issue:", issueDescription);

      const result = await analyzeIssue(issueDescription, uploadedImages);

      console.log("AI analysis complete:", result);
      setDiagnosisResult(result);

      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your issue. Review the diagnosis below.",
      });
      setCurrentStep(2);
    } catch (error) {
      console.error("Error during analysis:", error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze the issue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOpenPayment = () => {
    console.log("Bypassing payment - directly confirming booking");
    // Skip payment modal and directly confirm booking
    handlePaymentSuccess();
  };

  const handlePaymentSuccess = async () => {
    console.log("Payment successful, creating booking in database");

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Create booking in database
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          customer_id: user.id,
          vendor_id: selectedVendor,
          service_id: serviceId,
          issue_description: issueDescription,
          scheduled_date: selectedDate,
          scheduled_time: selectedTime,
          address: address,
          status: "pending",
          payment_status: "pending", // Will be 'paid' when Razorpay is enabled
          ai_diagnosis: diagnosisResult ? JSON.parse(JSON.stringify(diagnosisResult)) : null,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating booking:", error);
        throw error;
      }

      console.log("Booking created successfully:", data);

      setIsPaymentModalOpen(false);
      toast({
        title: "Booking Confirmed!",
        description: "Your service has been booked successfully. You can track it from your dashboard.",
      });
      navigate("/customer/dashboard");
    } catch (error: any) {
      console.error("Error in handlePaymentSuccess:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "Unable to create booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTakePhoto = async () => {
    try {
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Camera not available",
          description: "Please use the file upload option instead.",
          variant: "destructive",
        });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // In a real app, you'd open a camera modal here
      stream.getTracks().forEach(track => track.stop());

      toast({
        title: "Camera access granted",
        description: "Camera feature coming soon. Please use file upload for now.",
      });
    } catch (error) {
      console.error("Camera error:", error);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access or use file upload.",
        variant: "destructive",
      });
    }
  };

  const handleVoiceInput = () => {
    // Check for speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support voice input. Please type your issue.",
        variant: "destructive",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIssueDescription((prev) => prev + " " + transcript);
      toast({
        title: "Voice captured",
        description: "Your voice input has been added to the description.",
      });
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      toast({
        title: "Voice input failed",
        description: "Please try again or type your issue.",
        variant: "destructive",
      });
    };

    recognition.start();
    toast({
      title: "Listening...",
      description: "Speak now to describe your issue.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Link */}
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-10">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${currentStep >= step.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                    }`}
                >
                  {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`hidden sm:block w-16 lg:w-24 h-1 mx-2 rounded transition-colors ${currentStep > step.id ? "bg-primary" : "bg-secondary"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="bg-card rounded-2xl border border-border p-8">
            {/* Step 1: Describe Issue */}
            {currentStep === 1 && (
              <div>
                <h2 className="font-display text-2xl font-bold mb-2">Describe Your Issue</h2>
                <p className="text-muted-foreground mb-8">
                  Tell us what's wrong. You can type, upload images, or use voice input.
                </p>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="issue">What's the problem?</Label>
                    <Textarea
                      id="issue"
                      placeholder="E.g., My phone screen is cracked and touch is not working properly..."
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      className="mt-2 min-h-[120px]"
                    />
                  </div>

                  {/* Working Image Upload */}
                  <div>
                    <Label>Upload Images/Videos (Optional)</Label>
                    <div className="mt-2">
                      <ImageUpload
                        images={uploadedImages}
                        onImagesChange={setUploadedImages}
                        maxFiles={5}
                        maxSizeMB={10}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="gap-2" onClick={handleTakePhoto}>
                      <Camera className="w-4 h-4" /> Take Photo
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={handleVoiceInput}>
                      <Mic className="w-4 h-4" /> Voice Input
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  {/* Optional AI Analysis - Secondary */}
                  <Button
                    variant="outline"
                    onClick={handleAnalyze}
                    disabled={!issueDescription || isAnalyzing}
                    className="gap-2"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4" />
                    )}
                    AI Analysis (Optional)
                  </Button>

                  {/* Primary Next Button */}
                  <Button
                    onClick={handleNext}
                    disabled={!issueDescription}
                    className="gap-2"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: AI Diagnosis */}
            {currentStep === 2 && (
              <div>
                <h2 className="font-display text-2xl font-bold mb-2">AI Diagnosis</h2>
                <p className="text-muted-foreground mb-8">
                  Our AI has analyzed your issue. Here's what we found:
                </p>

                <div className="bg-primary/5 rounded-xl p-6 border border-primary/20 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Diagnosis Result</h3>
                      <p className="text-muted-foreground mb-4">
                        {diagnosisResult?.diagnosis || "Based on your description, we have analyzed the issue."}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-card rounded-lg">
                          <p className="text-sm text-muted-foreground">Estimated Cost</p>
                          <p className="font-display font-bold text-lg">{diagnosisResult?.estimatedCost || "Calculating..."}</p>
                        </div>
                        <div className="p-3 bg-card rounded-lg">
                          <p className="text-sm text-muted-foreground">Estimated Time</p>
                          <p className="font-display font-bold text-lg">{diagnosisResult?.estimatedTime || "Calculating..."}</p>
                        </div>
                      </div>
                      {diagnosisResult?.recommendedService && (
                        <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                          <p className="text-sm text-muted-foreground">Recommended Service</p>
                          <p className="font-semibold text-primary">{diagnosisResult.recommendedService}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button onClick={() => setCurrentStep(3)}>
                    Choose Vendor <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Choose Vendor */}
            {currentStep === 3 && (
              <div>
                <h2 className="font-display text-2xl font-bold mb-2">Choose a Vendor</h2>
                <p className="text-muted-foreground mb-8">
                  Select from verified service providers near you.
                </p>

                {/* Loading State */}
                {isLoadingVendors && (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-5 rounded-xl border-2 border-border animate-pulse">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-secondary" />
                          <div className="flex-1 space-y-2">
                            <div className="h-5 bg-secondary rounded w-1/3" />
                            <div className="h-4 bg-secondary rounded w-2/3" />
                          </div>
                          <div className="h-8 bg-secondary rounded w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Error State */}
                {vendorsError && !isLoadingVendors && (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Failed to Load Vendors</h3>
                    <p className="text-muted-foreground mb-4">{vendorsError}</p>
                    <Button onClick={loadVendors} variant="outline">
                      Try Again
                    </Button>
                  </div>
                )}

                {/* Empty State */}
                {!isLoadingVendors && !vendorsError && vendors.length === 0 && (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No Vendors Available</h3>
                    <p className="text-muted-foreground">
                      There are no service providers available for this service at the moment.
                    </p>
                  </div>
                )}

                {/* Vendor List */}
                {!isLoadingVendors && !vendorsError && vendors.length > 0 && (
                  <div className="space-y-4">
                    {vendors.map((vendor) => (
                      <div
                        key={vendor.id}
                        onClick={() => setSelectedVendor(vendor.id)}
                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${selectedVendor === vendor.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={vendor.profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.business_name)}&background=8B5CF6&color=fff`}
                            alt={vendor.business_name}
                            className="w-14 h-14 rounded-xl object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">{vendor.business_name}</h3>
                              {vendor.is_verified && (
                                <Shield className="w-4 h-4 text-success" />
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-warning text-warning" />
                                {vendor.rating.toFixed(1)} ({vendor.total_reviews})
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {vendor.service_radius_km ? `${vendor.service_radius_km} km radius` : 'Available'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-display font-bold text-xl text-foreground">
                              ₹{vendor.hourly_rate ? vendor.hourly_rate.toLocaleString() : 'TBD'}
                            </p>
                            <p className="text-xs text-muted-foreground">{vendor.hourly_rate ? 'per hour' : 'estimated'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button onClick={() => setCurrentStep(4)} disabled={!selectedVendor}>
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Schedule */}
            {currentStep === 4 && (
              <div>
                <h2 className="font-display text-2xl font-bold mb-2">Schedule Service</h2>
                <p className="text-muted-foreground mb-8">
                  Choose when and where you'd like the service.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="date">Preferred Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Preferred Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <Label htmlFor="address">Service Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your complete address..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(5)}
                    disabled={!selectedDate || !selectedTime || !address}
                  >
                    Review Booking <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Confirm & Payment */}
            {currentStep === 5 && (
              <div>
                <h2 className="font-display text-2xl font-bold mb-2">Confirm Booking</h2>
                <p className="text-muted-foreground mb-8">
                  Review your booking details and proceed to payment.
                </p>

                <div className="space-y-4">
                  <div className="p-4 bg-secondary rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Service</p>
                    <p className="font-semibold">Mobile Screen Repair</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Vendor</p>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{selectedVendorData?.business_name}</p>
                      {selectedVendorData?.is_verified && (
                        <Shield className="w-4 h-4 text-success" />
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-secondary rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Schedule</p>
                    <p className="font-semibold">
                      {selectedDate} at {selectedTime}
                    </p>
                  </div>
                  <div className="p-4 bg-secondary rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Service Address</p>
                    <p className="font-semibold">{address}</p>
                  </div>

                  {/* Price Breakdown */}
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Service Charge</span>
                      <span>₹{selectedVendorData?.hourly_rate?.toLocaleString() || 'TBD'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platform Fee (2%)</span>
                      <span>₹{Math.round((selectedVendorData?.hourly_rate || 0) * 0.02).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">GST (18%)</span>
                      <span>₹{Math.round(((selectedVendorData?.hourly_rate || 0) * 1.02) * 0.18).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between">
                      <span className="font-semibold">Total Amount</span>
                      <span className="font-display font-bold text-xl text-primary">
                        ₹{Math.round(((selectedVendorData?.hourly_rate || 0) * 1.02) * 1.18).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
                    <Lock className="w-4 h-4 text-success" />
                    <span>Secure payment powered by 256-bit encryption</span>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={() => setCurrentStep(4)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button
                    variant="hero"
                    onClick={handleOpenPayment}
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Pay Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={selectedVendorData?.price || 0}
        serviceName="Mobile Screen Repair"
        vendorName={selectedVendorData?.name || ""}
      />
    </div>
  );
};

export default BookService;
