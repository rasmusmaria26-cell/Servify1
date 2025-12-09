import { supabase } from "@/integrations/supabase/client";

export interface Vendor {
    id: string;
    business_name: string;
    description: string | null;
    hourly_rate: number | null;
    is_verified: boolean;
    is_available: boolean;
    rating: number;
    total_reviews: number;
    service_radius_km: number | null;
    latitude: number | null;
    longitude: number | null;
    profile?: {
        avatar_url: string | null;
        full_name: string | null;
    };
}

/**
 * Fetch vendors that offer services in a specific category
 * @param serviceId - The service ID to find vendors for
 * @returns Array of vendors that can provide the service
 */
export async function fetchVendorsByService(serviceId: string): Promise<Vendor[]> {
    try {
        // First, get the service and its category
        const { data: service, error: serviceError } = await supabase
            .from("services")
            .select("category_id")
            .eq("id", serviceId)
            .single();

        if (serviceError) {
            console.error("Error fetching service:", serviceError);
            throw new Error("Failed to fetch service details");
        }

        if (!service) {
            throw new Error("Service not found");
        }

        // Fetch vendors that have this category in their service_categories array
        // and are both verified and available
        const { data: vendors, error: vendorsError } = await supabase
            .from("vendors")
            .select(`
        id,
        business_name,
        description,
        hourly_rate,
        is_verified,
        is_available,
        rating,
        total_reviews,
        service_radius_km,
        latitude,
        longitude,
        service_categories
      `)
            .contains("service_categories", [service.category_id])
            .eq("is_verified", true)
            .eq("is_available", true)
            .order("rating", { ascending: false });

        if (vendorsError) {
            console.error("Error fetching vendors:", vendorsError);
            throw new Error("Failed to fetch vendors");
        }

        // Transform the data to match our Vendor interface
        const transformedVendors: Vendor[] = (vendors || []).map((vendor: any) => ({
            id: vendor.id,
            business_name: vendor.business_name || "Unknown Vendor",
            description: vendor.description,
            hourly_rate: vendor.hourly_rate,
            is_verified: vendor.is_verified,
            is_available: vendor.is_available,
            rating: Number(vendor.rating) || 0,
            total_reviews: vendor.total_reviews || 0,
            service_radius_km: vendor.service_radius_km,
            latitude: vendor.latitude,
            longitude: vendor.longitude,
            profile: undefined,
        }));

        return transformedVendors;
    } catch (error) {
        console.error("Error in fetchVendorsByService:", error);
        throw error;
    }
}

/**
 * Fetch a single vendor by ID
 * @param vendorId - The vendor ID
 * @returns Vendor details
 */
export async function fetchVendorById(vendorId: string): Promise<Vendor | null> {
    try {
        const { data: vendor, error } = await supabase
            .from("vendors")
            .select(`
        id,
        business_name,
        description,
        hourly_rate,
        is_verified,
        is_available,
        rating,
        total_reviews,
        service_radius_km,
        latitude,
        longitude
      `)
            .eq("id", vendorId)
            .single();

        if (error) {
            console.error("Error fetching vendor:", error);
            throw new Error("Failed to fetch vendor details");
        }

        if (!vendor) {
            return null;
        }

        return {
            id: vendor.id,
            business_name: vendor.business_name || "Unknown Vendor",
            description: vendor.description,
            hourly_rate: vendor.hourly_rate,
            is_verified: vendor.is_verified,
            is_available: vendor.is_available,
            rating: Number(vendor.rating) || 0,
            total_reviews: vendor.total_reviews || 0,
            service_radius_km: vendor.service_radius_km,
            latitude: vendor.latitude,
            longitude: vendor.longitude,
            profile: undefined,
        };
    } catch (error) {
        console.error("Error in fetchVendorById:", error);
        throw error;
    }
}

/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 - Latitude of point 1
 * @param lon1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lon2 - Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
}
