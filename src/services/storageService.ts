import { supabase } from "@/integrations/supabase/client";

export const uploadIssueImage = async (file: File): Promise<string> => {
    try {
        // Generate a unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload the file
        const { error: uploadError } = await supabase.storage
            .from('issue-images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            throw uploadError;
        }

        // Get the public URL
        const { data } = supabase.storage
            .from('issue-images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};
