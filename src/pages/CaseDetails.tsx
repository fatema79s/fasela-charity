import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FamilyProfile } from "@/components/FamilyProfile";
import { MonthlyNeeds } from "@/components/MonthlyNeeds";
import { DonationSection } from "@/components/DonationSection";
import { MonthlyUpdates } from "@/components/MonthlyUpdates";
import { Heart, Shield, Eye, Users, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CaseDetails = () => {
  const { id } = useParams();
  
  const { data: caseData, isLoading } = useQuery({
    queryKey: ["case", id],
    queryFn: async () => {
      if (!id) throw new Error("Case ID is required");
      
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("id", id)
        .eq("is_published", true)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // استعلام للحصول على الاحتياجات الشهرية
  const { data: monthlyNeedsData } = useQuery({
    queryKey: ["monthly-needs", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("monthly_needs")
        .select("*")
        .eq("case_id", id)
        .order("amount", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // استعلام للحصول على التقارير الشهرية
  const { data: monthlyReportsData } = useQuery({
    queryKey: ["monthly-reports", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("monthly_reports")
        .select("*")
        .eq("case_id", id)
        .order("report_date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // بيانات العائلة من قاعدة البيانات فقط
  const familyData = {
    familyName: caseData?.title_ar || caseData?.title || "",
    location: caseData?.city || "",
    familySize: 0, // سيتم إخفاء هذا إذا لم تكن هناك بيانات
    members: [], // لا توجد أعضاء مُحددين - يجب إضافة جدول منفصل لأعضاء العائلة
    story: caseData?.description_ar || caseData?.description || "",
    image: caseData?.photo_url || "/images/default-case-image.jpg"
  };

  // الاحتياجات الشهرية من قاعدة البيانات فقط
  const monthlyNeeds = monthlyNeedsData?.map((need) => ({
    category: need.category,
    amount: Number(need.amount),
    description: need.description || "",
    icon: <Heart className="w-5 h-5 text-white" />,
    color: need.color || "bg-blue-500"
  })) || [];

  const totalMonthlyNeed = caseData?.monthly_cost || 0;

  // التحديثات الشهرية من قاعدة البيانات فقط
  const monthlyUpdates = monthlyReportsData?.map((report) => ({
    id: report.id,
    date: new Date(report.report_date).toLocaleDateString('ar-SA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    title: report.title,
    description: report.description || "",
    status: report.status as "completed" | "pending",
    category: report.category as "food" | "housing" | "general",
    images: Array.isArray(report.images) ? report.images.map(img => String(img)) : []
  })) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl">جار التحميل...</div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">الحالة غير موجودة</h2>
          <Button asChild>
            <Link to="/cases">العودة إلى قائمة الحالات</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* الرأس */}
      <div className="gradient-hero text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="sm" asChild className="text-white border-white hover:bg-white hover:text-primary">
              <Link to="/cases">
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة إلى القائمة
              </Link>
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {caseData.title_ar || caseData.title}
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
              {caseData.short_description_ar || caseData.short_description}
            </p>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* العمود الأيسر - معلومات العائلة */}
          <div className="lg:col-span-2 space-y-8">
            <FamilyProfile {...familyData} />
            <MonthlyNeeds totalMonthlyNeed={totalMonthlyNeed} needs={monthlyNeeds} />
            <MonthlyUpdates updates={monthlyUpdates} />
          </div>

          {/* العمود الأيمن - قسم التبرع */}
          <div className="space-y-6">
            <DonationSection 
              monthlyNeed={totalMonthlyNeed} 
              caseStatus={caseData.status}
              monthsCovered={caseData.months_covered}
              monthsNeeded={caseData.months_needed}
              paymentCode={caseData.payment_code}
              caseTitle={caseData.title_ar || caseData.title}
              caseId={caseData.id}
            />
            
            {/* معلومات إضافية */}
            <Card className="p-6 shadow-soft">
              <h4 className="font-semibold mb-4">لماذا تختار كفالة الأسر؟</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 mt-0.5 text-primary" />
                  <span>شفافية كاملة في استخدام التبرعات</span>
                </div>
                <div className="flex items-start gap-2">
                  <Eye className="w-4 h-4 mt-0.5 text-primary" />
                  <span>تقارير شهرية مفصلة بالصور</span>
                </div>
                <div className="flex items-start gap-2">
                  <Heart className="w-4 h-4 mt-0.5 text-primary" />
                  <span>أثر مباشر وملموس على حياة الأسرة</span>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 mt-0.5 text-primary" />
                  <span>متابعة مستمرة من قبل فريقنا</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;