import { useState, useEffect } from "react";
import { Star, User, Calendar, MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    customer?: {
        full_name: string;
        avatar_url: string;
    };
    booking?: {
        service?: {
            name: string;
        };
    };
}

interface VendorReviewsProps {
    vendorId: string;
}

const VendorReviews = ({ vendorId }: VendorReviewsProps) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchReviews();
    }, [vendorId]);

    const fetchReviews = async () => {
        try {
            setIsLoading(true);

            const { data, error } = await supabase
                .from("reviews")
                .select(`
          id,
          rating,
          comment,
          created_at,
          customer_id,
          booking:booking_id (
            service:service_id (
              name
            )
          )
        `)
                .eq("vendor_id", vendorId)
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Fetch customer profiles manually since 'customer' relation query might fail if not set up with exact foreign key name
            // Or we can rely on customer_id to fetch profiles separate if needed.
            // Let's try to map it. detailed mapping might require joined query improvements, 
            // but for now we'll fetch customer profiles for these reviews.

            const reviewsWithCustomers = await Promise.all((data || []).map(async (review: any) => {
                const { data: customerData } = await supabase
                    .from("profiles")
                    .select("full_name, avatar_url")
                    .eq("user_id", review.customer_id)
                    .single();

                return {
                    ...review,
                    customer: customerData || { full_name: "Anonymous", avatar_url: "" }
                };
            }));

            setReviews(reviewsWithCustomers);
        } catch (err: any) {
            console.error("Error fetching reviews:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-destructive bg-destructive/10 rounded-xl">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>Failed to load reviews</p>
            </div>
        )
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">No Reviews Yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                    Reviews from your customers will appear here once you complete jobs and they rate your service.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-2xl border border-border md:col-span-1">
                    <div className="text-center">
                        <div className="text-4xl font-bold font-display text-foreground mb-1">
                            {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                        </div>
                        <div className="flex justify-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-4 h-4 ${star <= (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) ? "text-warning fill-warning" : "text-muted-foreground/30"}`}
                                />
                            ))}
                        </div>
                        <p className="text-sm text-muted-foreground">{reviews.length} total reviews</p>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-card p-6 rounded-2xl border border-border">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden">
                                        {review.customer?.avatar_url ? (
                                            <img src={review.customer.avatar_url} alt={review.customer.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-foreground">{review.customer?.full_name || "Customer"}</h4>
                                        <p className="text-xs text-muted-foreground">{review.booking?.service?.name || "Service"}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(review.created_at), "MMM d, yyyy")}
                                </span>
                            </div>

                            <div className="flex gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-4 h-4 ${star <= review.rating ? "text-warning fill-warning" : "text-muted-foreground/30"}`}
                                    />
                                ))}
                            </div>

                            {review.comment && (
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    "{review.comment}"
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VendorReviews;
