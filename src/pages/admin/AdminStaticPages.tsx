
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Plus, Trash2, GripVertical } from "lucide-react";

const PAGES = [
    { key: "selection_criteria", label: "معايير الاختيار" },
    { key: "funding_channels", label: "قنوات الدعم" },
];

// Types for JSON structures
type SelectionItem = {
    id: string;
    title: string;
    description: string;
    icon: string;
};

type FundingItem = {
    id: string;
    title: string;
    description: string;
    details: string; // Account number, link, etc.
    actionLabel: string;
};

export default function AdminStaticPages() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState(PAGES[0].key);

    // State for structured data
    const [selectionItems, setSelectionItems] = useState<SelectionItem[]>([]);
    const [fundingItems, setFundingItems] = useState<FundingItem[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const { data: pageData, isLoading: isQueryLoading } = useQuery({
        queryKey: ["static_content", activeTab],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("static_content")
                .select("*")
                .eq("key", activeTab)
                .single();

            if (error && error.code !== "PGRST116") throw error;
            return data;
        },
    });

    useEffect(() => {
        if (pageData?.content_ar) {
            try {
                const parsed = JSON.parse(pageData.content_ar);
                if (activeTab === "selection_criteria") {
                    setSelectionItems(Array.isArray(parsed) ? parsed : []);
                } else {
                    setFundingItems(Array.isArray(parsed) ? parsed : []);
                }
            } catch (e) {
                console.error("Failed to parse JSON content, might be old HTML format", e);
                // Fallback or empty if migration needed, but for now we start fresh if invalid JSON
                if (activeTab === "selection_criteria") setSelectionItems([]);
                else setFundingItems([]);
            }
        } else {
            if (activeTab === "selection_criteria") setSelectionItems([]);
            else setFundingItems([]);
        }
        setIsLoadingData(false);
    }, [pageData, activeTab]);

    const mutation = useMutation({
        mutationFn: async () => {
            let contentToSave = "";
            if (activeTab === "selection_criteria") {
                contentToSave = JSON.stringify(selectionItems);
            } else {
                contentToSave = JSON.stringify(fundingItems);
            }

            const { error } = await supabase
                .from("static_content")
                .upsert({
                    key: activeTab,
                    content_ar: contentToSave,
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

    // --- Handlers for Selection Criteria ---
    const addSelectionItem = () => {
        setSelectionItems([...selectionItems, { id: crypto.randomUUID(), title: "", description: "", icon: "CheckCircle" }]);
    };

    const removeSelectionItem = (id: string) => {
        setSelectionItems(selectionItems.filter(item => item.id !== id));
    };

    const updateSelectionItem = (id: string, field: keyof SelectionItem, value: string) => {
        setSelectionItems(selectionItems.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    // --- Handlers for Funding Channels ---
    const addFundingItem = () => {
        setFundingItems([...fundingItems, { id: crypto.randomUUID(), title: "", description: "", details: "", actionLabel: "تبرع الآن" }]);
    };

    const removeFundingItem = (id: string) => {
        setFundingItems(fundingItems.filter(item => item.id !== id));
    };

    const updateFundingItem = (id: string, field: keyof FundingItem, value: string) => {
        setFundingItems(fundingItems.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">إدارة الصفحات الثابتة (Infographic)</h2>

            <Tabs defaultValue={PAGES[0].key} onValueChange={setActiveTab} dir="rtl">
                <TabsList className="w-full justify-start">
                    {PAGES.map((page) => (
                        <TabsTrigger key={page.key} value={page.key}>
                            {page.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* Selection Criteria Form */}
                <TabsContent value="selection_criteria" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>معايير الاختيار</CardTitle>
                            <CardDescription>أضف المعايير التي تظهر في صفحة "كيف نختار الحالات"</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {(isQueryLoading || isLoadingData) ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        {selectionItems.map((item, index) => (
                                            <div key={item.id} className="flex gap-4 items-start border p-4 rounded-lg bg-card hover:bg-accent/5 transition-colors">
                                                <div className="mt-2 text-muted-foreground"><GripVertical className="w-4 h-4 cursor-move" /></div>
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="العنوان (مثال: اليتيم)"
                                                            value={item.title}
                                                            onChange={(e) => updateSelectionItem(item.id, 'title', e.target.value)}
                                                        />
                                                        {/* Note: Icon selection could be a dropdown, keeping text for simplicity now */}
                                                        <Input
                                                            placeholder="اسم الشعار (مثال: User, Heart)"
                                                            className="w-1/3"
                                                            value={item.icon}
                                                            onChange={(e) => updateSelectionItem(item.id, 'icon', e.target.value)}
                                                        />
                                                    </div>
                                                    <Textarea
                                                        placeholder="الوصف التفصيلي للمعيار..."
                                                        value={item.description}
                                                        onChange={(e) => updateSelectionItem(item.id, 'description', e.target.value)}
                                                    />
                                                </div>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => removeSelectionItem(item.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    <Button variant="outline" onClick={addSelectionItem} className="w-full border-dashed">
                                        <Plus className="mr-2 h-4 w-4" /> إضافة معيار جديد
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Funding Channels Form */}
                <TabsContent value="funding_channels" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>قنوات الدعم</CardTitle>
                            <CardDescription>أضف طرق التبرع المتاحة للعرض بشكل بطاقات</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {(isQueryLoading || isLoadingData) ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        {fundingItems.map((item) => (
                                            <div key={item.id} className="flex gap-4 items-start border p-4 rounded-lg bg-card hover:bg-accent/5 transition-colors">
                                                <div className="mt-2 text-muted-foreground"><GripVertical className="w-4 h-4 cursor-move" /></div>
                                                <div className="flex-1 space-y-3">
                                                    <Input
                                                        placeholder="عنوان القناة (مثال: التحويل البنكي)"
                                                        value={item.title}
                                                        onChange={(e) => updateFundingItem(item.id, 'title', e.target.value)}
                                                    />
                                                    <Textarea
                                                        placeholder="وصف بسيط..."
                                                        value={item.description}
                                                        onChange={(e) => updateFundingItem(item.id, 'description', e.target.value)}
                                                    />
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="التفاصيل (رقم حساب، رابط، الخ)"
                                                            value={item.details}
                                                            onChange={(e) => updateFundingItem(item.id, 'details', e.target.value)}
                                                        />
                                                        <Input
                                                            placeholder="نص الزر (مثال: نسخ الرقم)"
                                                            className="w-1/3"
                                                            value={item.actionLabel}
                                                            onChange={(e) => updateFundingItem(item.id, 'actionLabel', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => removeFundingItem(item.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="outline" onClick={addFundingItem} className="w-full border-dashed">
                                        <Plus className="mr-2 h-4 w-4" /> إضافة قناة دعم جديدة
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <div className="flex justify-end pt-4">
                    <Button size="lg" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        حفظ التغييرات
                    </Button>
                </div>
            </Tabs>
        </div>
    );
}
