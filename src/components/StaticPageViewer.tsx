
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StaticPageViewerProps {
    pageKey: string;
    defaultTitle: string;
}

export default function StaticPageViewer({ pageKey, defaultTitle }: StaticPageViewerProps) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["static_content_public", pageKey],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("static_content")
                .select("*")
                .eq("key", pageKey)
                .single();

            if (error) throw error;
            return data;
        },
    });

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-8 text-center text-red-500">
                عذراً، حدث خطأ أثناء تحميل المحتوى.
            </div>
        );
    }

    return (
        <div className="container max-w-4xl py-8">
            <Card className="border-t-4 border-t-primary shadow-lg">
                <CardHeader className="text-center pb-8 border-b bg-muted/20">
                    <CardTitle className="text-3xl font-bold text-primary">
                        {data?.title_ar || defaultTitle}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-8">
                    <div
                        className="prose prose-lg prose-gray dark:prose-invert max-w-none text-right"
                        dangerouslySetInnerHTML={{ __html: data?.content_ar || "<p>لا يوجد محتوى حالياً.</p>" }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
