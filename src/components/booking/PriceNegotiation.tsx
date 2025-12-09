
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, DollarSign, Loader2 } from "lucide-react";
import { updateBookingPrice, updateBookingStatus } from "@/services/bookingService";
import { useToast } from "@/hooks/use-toast";

interface PriceNegotiationProps {
    booking: any; // Using any for now to avoid strict type mismatch with existing Booking type
    isVendor: boolean;
    onUpdate: () => void;
}

export function PriceNegotiation({ booking, isVendor, onUpdate }: PriceNegotiationProps) {
    const [proposedPrice, setProposedPrice] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleProposePrice = async () => {
        if (!proposedPrice || isNaN(Number(proposedPrice))) return;
        setIsSubmitting(true);
        try {
            await updateBookingPrice(booking.id, Number(proposedPrice));
            toast({
                title: "Price Proposed",
                description: `You have proposed ₹${proposedPrice}`,
            });
            setProposedPrice("");
            onUpdate();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update price",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAcceptPrice = async () => {
        setIsSubmitting(true);
        try {
            // Update status to 'accepted' and fix the price status if needed
            // For now, we just rely on the booking status being "pending" -> "accepted"
            // But negotiation might happen AFTER acceptance too? 
            // Design choice: Negotiation usually happens before work starts.
            // Let's assume this confirms the booking if it was pending.

            await updateBookingStatus(booking.id, "accepted");
            toast({
                title: "Offer Accepted",
                description: "Booking confirmed with the agreed price.",
            });
            onUpdate();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to accept offer",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentPrice = booking.negotiated_price || booking.estimated_price;
    const isNegotiating = booking.price_status === 'negotiating';

    return (
        <div className="bg-secondary/30 rounded-xl p-4 border border-border space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                        Price Status
                    </h4>
                    <p className="text-xl font-bold flex items-center gap-1 mt-1">
                        <DollarSign className="w-5 h-5 text-primary" />
                        {currentPrice ? `₹${currentPrice}` : "To be discussed"}
                    </p>
                    {isNegotiating && (
                        <span className="text-xs text-warning bg-warning/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                            Negotiation in Progress
                        </span>
                    )}
                </div>
            </div>

            {/* Vendor Actions: Propose Price */}
            {isVendor && booking.status !== 'accepted' && (
                <div className="flex gap-2">
                    <Input
                        type="number"
                        placeholder="Enter amount"
                        value={proposedPrice}
                        onChange={(e) => setProposedPrice(e.target.value)}
                        className="bg-background"
                    />
                    <Button onClick={handleProposePrice} disabled={isSubmitting || !proposedPrice}>
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Propose"}
                    </Button>
                </div>
            )}

            {/* Vendor: Accepted State */}
            {isVendor && booking.status === 'accepted' && (
                <div className="bg-green-500/10 text-green-600 p-3 rounded-lg border border-green-200 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <p className="text-sm font-medium">Customer accepted the price of ₹{booking.negotiated_price}</p>
                </div>
            )}

            {/* Customer Actions: Accept Price */}
            {!isVendor && isNegotiating && booking.negotiated_price && (
                <div className="bg-background/50 p-3 rounded-lg border border-primary/20">
                    <p className="text-sm mb-3">
                        Vendor proposed <strong>₹{booking.negotiated_price}</strong>. Do you accept?
                    </p>
                    <div className="flex gap-2">
                        <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleAcceptPrice}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-2" /> Accept Offer</>}
                        </Button>
                        {/* We could add a Reject/Counter button here later */}
                    </div>
                </div>
            )}
        </div>
    );
}
