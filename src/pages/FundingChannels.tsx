
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { FundingChannelsView } from "@/components/infographics/FundingChannelsView";

export default function FundingChannels() {
    const { data, isLoading } = useQuery({
        queryKey: ["static_content_public", "funding_channels"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("static_content")
                .select("content_ar")
                .eq("key", "funding_channels")
                .single();

            if (error) throw error;

            try {
                return JSON.parse(data.content_ar || "[]");
            } catch (e) {
                console.error("Failed to parse JSON", e);
                return [];
            }
        },
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return <FundingChannelsView items={data || []} />;
}
