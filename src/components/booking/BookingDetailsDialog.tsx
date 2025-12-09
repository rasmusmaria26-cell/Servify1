
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
import { ChatInterface } from "./ChatInterface";
import { PriceNegotiation } from "./PriceNegotiation";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BookingDetailsDialogProps {
    booking: any;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: () => void;
    isVendorView?: boolean;
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

export function BookingDetailsDialog({ booking, isOpen, onClose, onUpdate, isVendorView = false }: BookingDetailsDialogProps) {
    const { toast } = useToast();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingReview, setExistingReview] = useState<any>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [activeBooking, setActiveBooking] = useState<any>(booking);

    // Fetch current user
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
    }, []);

    // Sync activeBooking with prop when it changes initially
    useEffect(() => {
        setActiveBooking(booking);
    }, [booking]);

    // Fetch fresh booking data
    const refreshBooking = async () => {
        if (!booking?.id) return;
        try {
            console.log("Fetching latest booking data for:", booking.id);
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('id', booking.id)
                .single();

            if (data) {
                console.log("Fresh data received:", data);
                const rawData = data as any;
                const safeBooking = {
                    ...activeBooking,
                    ...rawData,
                    service: activeBooking.service,
                    vendor: activeBooking.vendor,
                    customer: activeBooking.customer,
                    negotiated_price: rawData.negotiated_price,
                    price_status: rawData.price_status
                };
                setActiveBooking(safeBooking);
            }
        } catch (error) {
            console.error("Error refreshing booking:", error);
        }
    };

    // Realtime Subscription & Initial Refresh
    useEffect(() => {
        if (isOpen && booking?.id) {
            // Initial fetch
            refreshBooking();

            // Subscribe to detailed changes
            const channel = supabase
                .channel(`booking-${booking.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'bookings',
                        filter: `id=eq.${booking.id}`
                    },
                    (payload) => {
                        console.log("Realtime update received:", payload);
                        refreshBooking();
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [isOpen, booking?.id]);

    const handleUpdateInternal = () => {
        refreshBooking();
        if (onUpdate) onUpdate();
    };


    const handleCancelBooking = async () => {
        setIsCancelling(true);
        try {
            await updateBookingStatus(activeBooking.id, "cancelled");

            toast({
                title: "Booking Cancelled",
                description: "Your booking has been cancelled successfully.",
            });

            handleUpdateInternal();
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
        if (isOpen && activeBooking) {
            setRating(0);
            setComment("");
            setExistingReview(null);
            if (activeBooking.status === 'completed') {
                fetchReview();
            }
        }
    }, [isOpen, activeBooking]);

    const fetchReview = async () => {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('booking_id', activeBooking.id)
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

            const { error } = await supabase
                .from('reviews')
                .insert({
                    booking_id: activeBooking.id,
                    customer_id: user.id,
                    vendor_id: activeBooking.vendor_id,
                    rating,
                    comment
                });

            if (error) throw error;

            // Recalculate and update vendor rating
            if (activeBooking.vendor_id) {
                const { data: vendorReviews, error: reviewsError } = await supabase
                    .from('reviews')
                    .select('rating')
                    .eq('vendor_id', activeBooking.vendor_id);

                if (!reviewsError && vendorReviews) {
                    const totalReviews = vendorReviews.length;
                    const totalRating = vendorReviews.reduce((sum, r) => sum + r.rating, 0);
                    const newAverage = totalRating / totalReviews;

                    await supabase
                        .from('vendors')
                        .update({
                            rating: newAverage,
                            total_reviews: totalReviews
                        })
                        .eq('id', activeBooking.vendor_id);
                }
            }

            toast({
                title: "Review Submitted",
                description: "Thank you for your feedback!",
            });

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

    if (!activeBooking) return null;

    const isVendor = isVendorView || (currentUser && activeBooking?.vendor_id === currentUser.id);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl h-[90vh] flex flex-col overflow-hidden p-0">
                <DialogHeader className="px-6 pt-6 pb-2">
                    <DialogTitle>Booking Details</DialogTitle>
                    <DialogDescription>
                        View your booking information and status
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6 pb-6">
                    <div className="space-y-6">
                        {/* Status Badge */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{activeBooking.service}</h3>
                            <span
                                className={`px-4 py-2 rounded-full text-sm font-medium border ${statusColors[activeBooking.status as keyof typeof statusColors] || "bg-secondary"
                                    }`}
                            >
                                {statusLabels[activeBooking.status as keyof typeof statusLabels] || activeBooking.status}
                            </span>
                        </div>

                        {/* Negotiation Section */}
                        {!['completed', 'cancelled', 'rejected'].includes(activeBooking.status) && (
                            <div className="grid md:grid-cols-2 gap-4">
                                <PriceNegotiation
                                    booking={activeBooking}
                                    isVendor={!!isVendor}
                                    onUpdate={handleUpdateInternal}
                                />
                                {currentUser && (
                                    <ChatInterface
                                        bookingId={activeBooking.id}
                                        currentUserId={currentUser.id}
                                    />
                                )}
                            </div>
                        )}

                        {/* Booking Info Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <User className="w-4 h-4" />
                                    <span>Vendor</span>
                                </div>
                                <p className="font-medium">{activeBooking.vendor || "Not assigned"}</p>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <Calendar className="w-4 h-4" />
                                    <span>Scheduled Date</span>
                                </div>
                                <p className="font-medium">{activeBooking.date}</p>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <Clock className="w-4 h-4" />
                                    <span>Time</span>
                                </div>
                                <p className="font-medium">{activeBooking.time || "Not specified"}</p>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <CreditCard className="w-4 h-4" />
                                    <span>Initial Estimate</span>
                                </div>
                                <p className="font-medium text-primary">₹{activeBooking.price}</p>
                            </div>
                        </div>

                        {/* Address & Description */}
                        {activeBooking.address && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <MapPin className="w-4 h-4" />
                                    <span>Service Address</span>
                                </div>
                                <p className="font-medium bg-secondary p-3 rounded-lg">{activeBooking.address}</p>
                            </div>
                        )}

                        {activeBooking.description && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <FileText className="w-4 h-4" />
                                    <span>Issue Description</span>
                                </div>
                                <p className="text-sm bg-secondary p-3 rounded-lg">{activeBooking.description}</p>
                            </div>
                        )}

                        {/* Review Section */}
                        {activeBooking.status === 'completed' && (
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
                    </div>
                </ScrollArea>

                <div className="p-6 border-t bg-background z-10">
                    <div className="flex gap-3">
                        {/* Allow cancellation for pending AND accepted bookings */}
                        {['pending', 'accepted'].includes(activeBooking.status) && (
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
                        {(activeBooking.status === "on_the_way" || activeBooking.status === "in_progress") && (
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
