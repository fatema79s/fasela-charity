import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportFormData {
  case_id: string;
  title: string;
  description: string;
  report_date: string;
  status: string;
  category: string;
}

const ReportForm = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ReportFormData>();
  const { toast } = useToast();

  const { data: cases } = useQuery({
    queryKey: ["cases-for-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("id, title_ar, title")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const onSubmit = async (data: ReportFormData) => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from("monthly_reports")
        .insert({
          case_id: data.case_id,
          title: data.title,
          description: data.description,
          report_date: data.report_date,
          status: data.status,
          category: data.category,
          images: []
        });

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم إضافة التقرير بنجاح",
      });

      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error creating report:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة التقرير",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 ml-1" />
          إضافة تقرير
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>إضافة تقرير شهري جديد</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>الحالة</Label>
            <Select onValueChange={(value) => setValue("case_id", value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                {cases?.map((caseItem) => (
                  <SelectItem key={caseItem.id} value={caseItem.id}>
                    {caseItem.title_ar || caseItem.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">عنوان التقرير</Label>
            <Input
              id="title"
              {...register("title", { required: "عنوان التقرير مطلوب" })}
              placeholder="زيارة ميدانية وتوزيع المساعدات"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">وصف التقرير</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="تفاصيل الزيارة والأنشطة المنجزة"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="report_date">تاريخ التقرير</Label>
            <Input
              id="report_date"
              type="date"
              {...register("report_date", { required: "تاريخ التقرير مطلوب" })}
            />
            {errors.report_date && (
              <p className="text-sm text-destructive">{errors.report_date.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select onValueChange={(value) => setValue("status", value)} defaultValue="completed">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="pending">قيد التنفيذ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>التصنيف</Label>
              <Select onValueChange={(value) => setValue("category", value)} defaultValue="general">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">طعام</SelectItem>
                  <SelectItem value="housing">سكن</SelectItem>
                  <SelectItem value="general">عام</SelectItem>
                  <SelectItem value="education">تعليم</SelectItem>
                  <SelectItem value="health">صحة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "جار الحفظ..." : "حفظ التقرير"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportForm;