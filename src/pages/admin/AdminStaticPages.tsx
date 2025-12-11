
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea"; // Using Textarea as a simple editor
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

const PAGES = [
    { key: "selection_criteria", label: "معايير الاختيار" },
    { key: "funding_channels", label: "قنوات الدعم" },
];

export default function AdminStaticPages() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState(PAGES[0].key);
    const [content, setContent] = useState("");

    const { data: pageData, isLoading } = useQuery({
        queryKey: ["static_content", activeTab],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("static_content")
                .select("*")
                .eq("key", activeTab)
                .single();

            if (error && error.code !== "PGRST116") throw error; // PGRST116 is "no rows returns" which might happen if not initialized
            return data;
        },
    });

    useEffect(() => {
        if (pageData) {
            setContent(pageData.content_ar || "");
        } else {
            // Reset if no data found (though migration inserts defaults)
            setContent("");
        }
    }, [pageData]);

    const mutation = useMutation({
        mutationFn: async (newContent: string) => {
            const { error } = await supabase
                .from("static_content")
                .upsert({
                    key: activeTab,
                    content_ar: newContent,
                    title_ar: PAGES.find((p) => p.key === activeTab)?.label || "",
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;
        },
        onSuccess: () => {
            toast({
                title: "تم الحفظ",
                description: "تم تحديث محتوى الصفحة بنجاح",
            });
            queryClient.invalidateQueries({ queryKey: ["static_content"] });
        },
        onError: (error) => {
            console.error("Error saving content:", error);
            toast({
                title: "خطأ",
                description: "حدث خطأ أثناء حفظ التغييرات",
                variant: "destructive",
            });
        },
    });

    const handleSave = () => {
        mutation.mutate(content);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">إدارة الصفحات الثابتة</h2>

            <Tabs defaultValue={PAGES[0].key} onValueChange={setActiveTab} dir="rtl">
                <TabsList className="w-full justify-start">
                    {PAGES.map((page) => (
                        <TabsTrigger key={page.key} value={page.key}>
                            {page.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {PAGES.map((page) => (
                    <TabsContent key={page.key} value={page.key} className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>تعديل محتوى: {page.label}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid w-full gap-1.5">
                                            <Textarea
                                                placeholder="اكتب المحتوى هنا... (يمكنك استخدام HTML بسيط)"
                                                className="min-h-[300px] font-mono text-sm"
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                                dir="rtl"
                                            />
                                            <p className="text-sm text-muted-foreground">
                                                ملاحظة: يمكنك استخدام وسوم HTML مثل &lt;ul&gt;, &lt;li&gt;, &lt;b&gt;, &lt;h1&gt; لتنسيق النص.
                                            </p>
                                        </div>
                                        <Button onClick={handleSave} disabled={mutation.isPending}>
                                            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            <Save className="mr-2 h-4 w-4" />
                                            حفظ التغييرات
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
