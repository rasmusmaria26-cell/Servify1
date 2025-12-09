import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, User, Phone, CreditCard, FileText, Star, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { updateBookingStatus } from "@/services/bookingService";

interface BookingDetailsDialogProps {
    booking: any;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: () => void;
}

const statusColors = {
    pending: "bg-warning/10 text-warning border-warning/20",
    accepted: "bg-primary/10 text-primary border-primary/20",
    on_the_way: "bg-info/10 text-info border-info/20",
    in_progress: "bg-warning/10 text-warning border-warning/20",
    completed: "bg-success/10 text-success border-success/20",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusLabels = {
    pending: "Pending Approval",
    accepted: "Accepted",
    on_the_way: "Vendor On The Way",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    rejected: "Rejected",
};

export function BookingDetailsDialog({ booking, isOpen, onClose, onUpdate }: BookingDetailsDialogProps) {
    const { toast } = useToast();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingReview, setExistingReview] = useState<any>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancelBooking = async () => {
        setIsCancelling(true);
        try {
            await updateBookingStatus(booking.id, "cancelled");

            toast({
                title: "Booking Cancelled",
                description: "Your booking has been cancelled successfully.",
            });

            if (onUpdate) onUpdate();
            onClose();
        } catch (error) {
            console.error("Error cancelling booking:", error);
            toast({
                title: "Cancellation Failed",
                description: "Could not cancel booking. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsCancelling(false);
        }
    };

    // Reset state when dialog opens or booking changes
    useEffect(() => {
        if (isOpen && booking) {
            setRating(0);
            setComment("");
            setExistingReview(null);
            if (booking.status === 'completed') {
                fetchReview();
            }
        }
    }, [isOpen, booking]);

    const fetchReview = async () => {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('booking_id', booking.id)
                .single();

            if (data) {
                setExistingReview(data);
            }
        } catch (error) {
            console.error("Error fetching review:", error);
        }
    };

    const handleSubmitReview = async () => {
        if (rating === 0) return;

        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Needed: vendor_id from the booking. 
            // Warning: booking object structure might vary. ensure vendor_id is present in the prop or fetched.
            // Assuming booking object has vendor_id. If not, we might need to fetch it or ensure parent passes it.
            // Based on previous code, booking object seems to be a display object (vendor name string), not full db object.
            // We need the ACTUAL vendor_id UUID.

            // Let's assume booking.vendor_id is passed. If not, we'll need to fix the parent or fetch it.
            // Checking CustomerDashboard.tsx, it maps data but doesn't explicitly include vendor_id.
            // We'll need to update CustomerDashboard.tsx to pass vendor_id.

            const { error } = await supabase
                .from('reviews')
                .insert({
                    booking_id: booking.id,
                    customer_id: user.id,
                    vendor_id: booking.vendor_id, // We need to ensure this is passed!
                    rating,
                    comment
                });

            if (error) throw error;

            // Recalculate and update vendor rating
            if (booking.vendor_id) {
                // 1. Fetch all reviews for this vendor to calculate new average
                const { data: vendorReviews, error: reviewsError } = await supabase
                    .from('reviews')
                    .select('rating')
                    .eq('vendor_id', booking.vendor_id);

                if (!reviewsError && vendorReviews) {
                    const totalReviews = vendorReviews.length;
                    const totalRating = vendorReviews.reduce((sum, r) => sum + r.rating, 0);
                    const newAverage = totalRating / totalReviews;

                    // 2. Update vendor table
                    await supabase
                        .from('vendors')
                        .update({
                            rating: newAverage,
                            total_reviews: totalReviews
                        })
                        .eq('id', booking.vendor_id);
                }
            }

            toast({
                title: "Review Submitted",
                description: "Thank you for your feedback!",
            });

            // Refresh review to show display state
            fetchReview();

        } catch (error) {
            console.error("Error submitting review:", error);
            toast({
                title: "Submission Failed",
                description: "Could not submit review. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!booking) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Booking Details</DialogTitle>
                    <DialogDescription>
                        View your booking information and status
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{booking.service}</h3>
                        <span
                            className={`px-4 py-2 rounded-full text-sm font-medium border ${statusColors[booking.status as keyof typeof statusColors] || "bg-secondary"
                                }`}
                        >
                            {statusLabels[booking.status as keyof typeof statusLabels] || booking.status}
                        </span>
                    </div>

                    {/* Booking Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <User className="w-4 h-4" />
                                <span>Vendor</span>
                            </div>
                            <p className="font-medium">{booking.vendor || "Not assigned"}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Calendar className="w-4 h-4" />
                                <span>Scheduled Date</span>
                            </div>
                            <p className="font-medium">{booking.date}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Clock className="w-4 h-4" />
                                <span>Time</span>
                            </div>
                            <p className="font-medium">{booking.time || "Not specified"}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <CreditCard className="w-4 h-4" />
                                <span>Price</span>
                            </div>
                            <p className="font-medium text-primary">₹{booking.price}</p>
                        </div>
                    </div>

                    {/* Address */}
                    {booking.address && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <MapPin className="w-4 h-4" />
                                <span>Service Address</span>
                            </div>
                            <p className="font-medium bg-secondary p-3 rounded-lg">{booking.address}</p>
                        </div>
                    )}

                    {/* Issue Description */}
                    {/* Issue Description */}
                    {booking.description && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <FileText className="w-4 h-4" />
                                <span>Issue Description</span>
                            </div>
                            <p className="text-sm bg-secondary p-3 rounded-lg">{booking.description}</p>
                        </div>
                    )}

                    {/* Review Section */}
                    {booking.status === 'completed' && (
                        <div className="pt-4 border-t space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Star className="w-5 h-5 text-warning fill-warning" />
                                Review & Rating
                            </h3>

                            {existingReview ? (
                                <div className="bg-secondary/50 p-4 rounded-xl space-y-2">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-4 h-4 ${star <= existingReview.rating
                                                    ? "text-warning fill-warning"
                                                    : "text-muted-foreground/30"
                                                    }`}
                                            />
                                        ))}
                                        <span className="text-sm font-medium ml-2">{existingReview.rating}.0</span>
                                    </div>
                                    {existingReview.comment && (
                                        <p className="text-sm text-foreground">{existingReview.comment}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className="focus:outline-none transition-transform hover:scale-110"
                                            >
                                                <Star
                                                    className={`w-8 h-8 ${star <= rating
                                                        ? "text-warning fill-warning"
                                                        : "text-muted-foreground/20 hover:text-warning/50"
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <Textarea
                                        placeholder="Share your experience with this vendor..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="resize-none"
                                        rows={3}
                                    />
                                    <Button
                                        onClick={handleSubmitReview}
                                        disabled={rating === 0 || isSubmitting}
                                        className="w-full"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            "Submit Review"
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                        {booking.status === "pending" && (
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={handleCancelBooking}
                                disabled={isCancelling}
                            >
                                {isCancelling ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Cancelling...
                                    </>
                                ) : (
                                    "Cancel Booking"
                                )}
                            </Button>
                        )}
                        {(booking.status === "on_the_way" || booking.status === "in_progress") && (
                            <Button variant="outline" className="flex-1">
                                <Phone className="w-4 h-4 mr-2" />
                                Call Vendor
                            </Button>
                        )}
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}


