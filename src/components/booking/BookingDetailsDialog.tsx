import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, User, Phone, CreditCard, FileText } from "lucide-react";

interface BookingDetailsDialogProps {
    booking: any;
    isOpen: boolean;
    onClose: () => void;
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

export function BookingDetailsDialog({ booking, isOpen, onClose }: BookingDetailsDialogProps) {
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
                    {booking.description && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <FileText className="w-4 h-4" />
                                <span>Issue Description</span>
                            </div>
                            <p className="text-sm bg-secondary p-3 rounded-lg">{booking.description}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                        {booking.status === "pending" && (
                            <Button variant="destructive" className="flex-1">
                                Cancel Booking
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
