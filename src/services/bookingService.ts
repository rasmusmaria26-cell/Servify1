import { supabase } from "@/integrations/supabase/client";

export interface Booking {
    id: string;
    customer_id: string;
    vendor_id: string;
    service_id: string;
    issue_description: string;
    scheduled_date: string;
    scheduled_time: string;
    address: string;
    estimated_price: number | null;
    final_price: number | null;
    status: string;
    payment_status: string;
    ai_diagnosis: any;
    issue_images: string[] | null;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
    customer_rating: number | null;
    customer_review: string | null;
    vendor_rating: number | null;
    vendor_review: string | null;
    // Joined data
    customer?: {
        email: string;
        full_name: string | null;
    };
    service?: {
        name: string;
        base_price: number;
    };
}

/**
 * Fetch bookings for a specific vendor
 */
export async function fetchVendorBookings(vendorId: string): Promise<{
    pending: Booking[];
    active: Booking[];
    completed: Booking[];
}> {
    try {
        const { data, error } = await supabase
            .from("bookings")
            .select("*")
            .eq("vendor_id", vendorId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        const bookings = (data || []).map((booking: any) => ({
            ...booking,
            customer: {
                email: "Customer",
                full_name: null,
            },
            service: {
                name: "Service",
                base_price: 0,
            },
        }));

        // Categorize bookings
        const pending = bookings.filter((b: Booking) => b.status === "pending");
        const active = bookings.filter((b: Booking) =>
            ["accepted", "on_the_way", "arrived", "in_progress"].includes(b.status)
        );
        const completed = bookings.filter((b: Booking) =>
            ["completed", "cancelled", "rejected"].includes(b.status)
        );

        return { pending, active, completed };
    } catch (error) {
        console.error("Error fetching vendor bookings:", error);
        throw error;
    }
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
    bookingId: string,
    status: string
): Promise<void> {
    try {
        const { error } = await supabase
            .from("bookings")
            .update({ status })
            .eq("id", bookingId);

        if (error) throw error;
    } catch (error) {
        console.error("Error updating booking status:", error);
        throw error;
    }
}

/**
 * Accept a booking
 */
export async function acceptBooking(bookingId: string): Promise<void> {
    return updateBookingStatus(bookingId, "accepted");
}

/**
 * Reject a booking
 */
export async function rejectBooking(bookingId: string): Promise<void> {
    return updateBookingStatus(bookingId, "rejected");
}

/**
 * Fetch bookings for a specific customer
 */
export async function fetchCustomerBookings(customerId: string): Promise<{
    active: Booking[];
    scheduled: Booking[];
    completed: Booking[];
}> {
    try {
        const { data, error } = await supabase
            .from("bookings")
            .select("*")
            .eq("customer_id", customerId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        const bookings = (data || []).map((booking: any) => ({
            ...booking,
            customer: {
                email: "Customer",
                full_name: null,
            },
            service: {
                name: "Service",
                base_price: 0,
            },
        }));

        // Categorize bookings
        const active = bookings.filter((b: Booking) =>
            ["accepted", "on_the_way", "arrived", "in_progress"].includes(b.status)
        );
        const scheduled = bookings.filter((b: Booking) => b.status === "pending");
        const completed = bookings.filter((b: Booking) =>
            ["completed", "cancelled", "rejected"].includes(b.status)
        );

        return { active, scheduled, completed };
    } catch (error) {
        console.error("Error fetching customer bookings:", error);
        throw error;
    }
}
