import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  ArrowLeft,
  Users,
  Calendar,
  FileText,
  Heart,
  Edit,
  Save,
  X,
  Info,
} from "lucide-react";
import FollowupActionForm from "@/components/admin/FollowupActionForm";
import FollowupActionsList from "@/components/admin/FollowupActionsList";
import CaseSpecificCalendar from "@/components/admin/CaseSpecificCalendar";
import { KidsInfo } from "@/components/KidsInfo";
import AdminHeader from "@/components/admin/AdminHeader";
import { useToast } from "@/hooks/use-toast";

export default function AdminCaseView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [followupFormOpen, setFollowupFormOpen] = useState(false);
  const [editCaseOpen, setEditCaseOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    title_ar: "",
    description: "",
    monthly_cost: 0,
    is_published: false,
  });

  const { data: caseData, isLoading } = useQuery({
    queryKey: ["admin-case-view", id],
    queryFn: async () => {
      // Fetch case data
      const { data: caseInfo, error: caseError } = await supabase
        .from("cases")
        .select("*")
        .eq("id", id)
        .single();

      if (caseError) throw caseError;

      // Fetch related data separately
      const [kidsData] = await Promise.all([
        supabase.from("case_kids").select("*").eq("case_id", id),
      ]);

      return {
        ...caseInfo,
        case_kids: kidsData.data || [],
      };
    },
    enabled: !!id,
  });

  const updateCaseMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const { error } = await supabase
        .from("cases")
        .update(updatedData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-case-view", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-cases-list"] });
      setEditCaseOpen(false);
      toast({
        title: "تم التحديث",
        description: "تم تحديث بيانات الحالة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحديث بيانات الحالة",
        variant: "destructive",
      });
    },
  });

  const handleEditCase = () => {
    if (caseData) {
      setEditForm({
        title: caseData.title || "",
        title_ar: caseData.title_ar || "",
        description: caseData.description || "",
        monthly_cost: caseData.monthly_cost || 0,
        is_published: caseData.is_published || false,
      });
      setEditCaseOpen(true);
    }
  };

  const handleSaveCase = () => {
    updateCaseMutation.mutate(editForm);
  };

  if (isLoading) {
    return (
      <AdminHeader title="عرض الحالة" showBackButton backTo="/admin/cases" backLabel="العودة لقائمة الحالات">
        <div className="text-center py-8">جار التحميل...</div>
      </AdminHeader>
    );
  }

  if (!caseData) {
    return (
      <AdminHeader title="عرض الحالة" showBackButton backTo="/admin/cases" backLabel="العودة لقائمة الحالات">
        <div className="text-center py-8">
          <p className="text-muted-foreground">الحالة غير موجودة</p>
          <Button asChild className="mt-4">
            <Link to="/admin/cases">العودة لقائمة الحالات</Link>
          </Button>
        </div>
      </AdminHeader>
    );
  }

  return (
    <AdminHeader title="عرض الحالة" showBackButton backTo="/admin/cases" backLabel="العودة لقائمة الحالات">
      {/* Case Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-4xl">💙</div>
            <div>
              <h1 className="text-3xl font-bold text-primary">
                {caseData.title_ar || caseData.title}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={caseData.is_published ? "default" : "secondary"}>
                  {caseData.is_published ? "منشورة" : "غير منشورة"}
                </Badge>
                <Badge variant={caseData.all_donations_handed_over ? "default" : "destructive"}>
                  {caseData.all_donations_handed_over ? "تم تسليم جميع التبرعات" : "لم يتم تسليم جميع التبرعات"}
                </Badge>
              </div>
            </div>
          </div>
          <Button onClick={handleEditCase} variant="outline">
            <Edit className="w-4 h-4 ml-2" />
            تعديل الحالة
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="description" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            الوصف
          </TabsTrigger>
          <TabsTrigger value="followups" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            المتابعات
          </TabsTrigger>
          <TabsTrigger value="handovers" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            التقويم الشهري
          </TabsTrigger>
          <TabsTrigger value="kids" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            الأطفال
          </TabsTrigger>
        </TabsList>

        {/* Description Tab */}
        <TabsContent value="description" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>وصف الحالة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">العنوان (عربي)</Label>
                  <p className="text-lg font-semibold mt-1">{caseData.title_ar || "غير محدد"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">العنوان (إنجليزي)</Label>
                  <p className="text-lg font-semibold mt-1">{caseData.title || "غير محدد"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">الوصف</Label>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                    {caseData.description || "لا يوجد وصف متاح"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">التكلفة الشهرية</Label>
                  <p className="text-lg font-semibold text-primary mt-1">
                    {caseData.monthly_cost?.toLocaleString() || 0} ج.م
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">حالة النشر</Label>
                  <Badge variant={caseData.is_published ? "default" : "secondary"} className="mt-1">
                    {caseData.is_published ? "منشورة" : "غير منشورة"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

          {/* Follow-ups Tab */}
          <TabsContent value="followups" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>متابعات الحالة</CardTitle>
              </CardHeader>
              <CardContent>
                <FollowupActionsList 
                  caseId={id!} 
                  onCreateNew={() => setFollowupFormOpen(true)} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monthly Handovers Tab */}
          <TabsContent value="handovers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>التقويم الشهري للتسليمات</CardTitle>
              </CardHeader>
              <CardContent>
                <CaseSpecificCalendar
                  caseId={id!}
                  caseTitle={caseData.title || ""}
                  caseTitleAr={caseData.title_ar || caseData.title || ""}
                  monthlyCost={caseData.monthly_cost || 0}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kids Tab */}
          <TabsContent value="kids" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>معلومات الأبناء</CardTitle>
              </CardHeader>
              <CardContent>
                {caseData.case_kids && Array.isArray(caseData.case_kids) && caseData.case_kids.length > 0 ? (
                  <KidsInfo kids={caseData.case_kids.map((kid: any) => ({
                    id: kid.id,
                    name: kid.name,
                    age: kid.age,
                    gender: kid.gender as 'male' | 'female',
                    description: kid.description || ""
                  }))} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>لا توجد بيانات عن الأبناء</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Follow-up Form Dialog */}
        <FollowupActionForm
          caseId={id!}
          open={followupFormOpen}
          onOpenChange={setFollowupFormOpen}
        />

        {/* Edit Case Dialog */}
        <Dialog open={editCaseOpen} onOpenChange={setEditCaseOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>تعديل بيانات الحالة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title_ar">العنوان (عربي)</Label>
                <Input
                  id="title_ar"
                  value={editForm.title_ar}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title_ar: e.target.value }))}
                  placeholder="أدخل العنوان بالعربية"
                />
              </div>
              <div>
                <Label htmlFor="title">العنوان (إنجليزي)</Label>
                <Input
                  id="title"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="أدخل العنوان بالإنجليزية"
                />
              </div>
              <div>
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="أدخل وصف الحالة"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="monthly_cost">التكلفة الشهرية</Label>
                <Input
                  id="monthly_cost"
                  type="number"
                  value={editForm.monthly_cost}
                  onChange={(e) => setEditForm(prev => ({ ...prev, monthly_cost: Number(e.target.value) }))}
                  placeholder="أدخل التكلفة الشهرية"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={editForm.is_published}
                  onChange={(e) => setEditForm(prev => ({ ...prev, is_published: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="is_published">منشورة</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditCaseOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleSaveCase} disabled={updateCaseMutation.isPending}>
                {updateCaseMutation.isPending ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminHeader>
    );
  }
