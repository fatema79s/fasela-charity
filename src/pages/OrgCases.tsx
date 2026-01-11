import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, Calendar, Users, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function OrgCases() {
  const { orgSlug } = useParams();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: org, isLoading: orgLoading, error: orgError } = useQuery({
    queryKey: ["org-by-slug", orgSlug],
    queryFn: async () => {
      if (!orgSlug) return null;
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("slug", orgSlug)
        .eq("is_active", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!orgSlug,
  });

  const { data: cases, isLoading: casesLoading } = useQuery({
    queryKey: ["org-cases", org?.id, statusFilter],
    queryFn: async () => {
      if (!org?.id) return [];

      // Fetch published cases for this organization
      const { data: casesData, error: casesError } = await supabase
        .from("cases")
        .select("*")
        .eq("organization_id", org.id)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (casesError) throw casesError;

      // Enrich with totals (donations + handovers)
      const casesWithStats = await Promise.all(
        (casesData || []).map(async (caseItem: any) => {
          const [{ data: donations }, { data: handovers }] = await Promise.all([
            supabase.from("donations").select("amount").eq("case_id", caseItem.id).eq("status", "confirmed"),
            supabase.from("donation_handovers").select("handover_amount").eq("case_id", caseItem.id),
          ]);

          const directDonations = donations?.reduce((s: number, d: any) => s + Number(d.amount || 0), 0) || 0;
          const handoverAmounts = handovers?.reduce((s: number, h: any) => s + Number(h.handover_amount || 0), 0) || 0;
          const totalSecured = directDonations + handoverAmounts;

          return {
            ...caseItem,
            total_secured_money: totalSecured,
          };
        })
      );

      // Apply simple status filter if requested
      if (statusFilter !== "all") {
        return casesWithStats.filter((c: any) => c.status === statusFilter);
      }

      return casesWithStats;
    },
    enabled: !!org?.id,
  });

  if (orgLoading || casesLoading) return <div className="min-h-screen">جار التحميل...</div>;
  if (orgError) return <div className="min-h-screen">حدث خطأ: {String(orgError.message || orgError)}</div>;
  if (!org) return <div className="min-h-screen">المنظمة غير موجودة أو غير نشطة</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative gradient-hero text-white py-12 sm:py-16 lg:py-20 overflow-hidden">
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">{org.name}</h1>
          {org.logo_url && <img src={org.logo_url} alt={org.name} className="mx-auto h-24 mb-4" />}
          <p className="text-lg sm:text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            عرض الحالات المنشورة الخاصة بـ {org.name}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={statusFilter === "all" ? "default" : "outline"} className="cursor-pointer" onClick={() => setStatusFilter("all")}>جميع الحالات</Badge>
            <Badge variant={statusFilter === "active" ? "default" : "outline"} className="cursor-pointer" onClick={() => setStatusFilter("active")}>نشطة</Badge>
            <Badge variant={statusFilter === "completed" ? "default" : "outline"} className="cursor-pointer" onClick={() => setStatusFilter("completed")}>مكتملة</Badge>
          </div>
          <div>
            <Link to="/">
              <Button variant="ghost">العودة للصفحة الرئيسية</Button>
            </Link>
          </div>
        </div>

        {(!cases || cases.length === 0) ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-xl font-bold">لا توجد حالات منشورة بعد</h3>
              <p className="text-muted-foreground mt-2">لم يتم نشر أي حالة لهذه المنظمة بعد. حاول زيارة صفحة أخرى.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cases.map((caseItem: any) => {
              const totalNeeded = caseItem.monthly_cost * (caseItem.months_needed || 1);
              const progressValue = totalNeeded > 0 ? Math.min(((caseItem.total_secured_money || 0) / totalNeeded) * 100, 100) : 0;
              return (
                <Link key={caseItem.id} to={`/case/${caseItem.id}`}>
                  <Card className="overflow-hidden cursor-pointer h-full">
                    {caseItem.photo_url ? (
                      <div className="relative h-48 overflow-hidden">
                        <img src={caseItem.photo_url} alt={caseItem.title_ar || caseItem.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="relative h-48 bg-muted flex items-center justify-center">
                        <Heart className="w-16 h-16 text-primary/40" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="text-lg font-bold mb-2 line-clamp-2">{caseItem.title_ar || caseItem.title}</h3>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{caseItem.short_description_ar || caseItem.short_description}</p>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-muted-foreground">المجمع</div>
                        <div className="font-semibold">{(caseItem.total_secured_money || 0).toLocaleString()} ج.م</div>
                      </div>
                      <Progress value={progressValue} className="h-2 mb-3" />
                      <Button variant="outline" className="w-full">عرض التفاصيل <ArrowRight className="w-4 h-4 mr-2" /></Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
