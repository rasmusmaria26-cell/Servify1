import { supabase } from "@/integrations/supabase/client";

export interface Service {
    id: string;
    name: string;
    description: string | null;
    base_price: number | null;
    estimated_duration: string | null;
    category_id: string;
    category?: {
        id: string;
        name: string;
        slug: string;
        icon: string | null;
        color: string | null;
    };
}

/**
 * Fetch all active services with their categories
 * @returns Array of services
 */
export async function fetchAllServices(): Promise<Service[]> {
    try {
        const { data: services, error } = await supabase
            .from("services")
            .select(`
        id,
        name,
        description,
        base_price,
        estimated_duration,
        category_id,
        service_categories:category_id (
          id,
          name,
          slug,
          icon,
          color
        )
      `)
            .eq("is_active", true)
            .order("name");

        if (error) {
            console.error("Error fetching services:", error);
            throw new Error("Failed to fetch services");
        }

        // Transform the data to match our Service interface
        const transformedServices: Service[] = (services || []).map((service: any) => ({
            id: service.id,
            name: service.name,
            description: service.description,
            base_price: service.base_price,
            estimated_duration: service.estimated_duration,
            category_id: service.category_id,
            category: service.service_categories ? {
                id: service.service_categories.id,
                name: service.service_categories.name,
                slug: service.service_categories.slug,
                icon: service.service_categories.icon,
                color: service.service_categories.color,
            } : undefined,
        }));

        return transformedServices;
    } catch (error) {
        console.error("Error in fetchAllServices:", error);
        throw error;
    }
}

/**
 * Fetch all service categories
 * @returns Array of categories
 */
export async function fetchServiceCategories() {
    try {
        const { data: categories, error } = await supabase
            .from("service_categories")
            .select("*")
            .eq("is_active", true)
            .order("name");

        if (error) {
            console.error("Error fetching categories:", error);
            throw new Error("Failed to fetch categories");
        }

        return categories || [];
    } catch (error) {
        console.error("Error in fetchServiceCategories:", error);
        throw error;
    }
}
