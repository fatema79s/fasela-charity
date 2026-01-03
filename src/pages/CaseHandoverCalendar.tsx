import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, ChevronLeft, ChevronRight, Edit2, Plus, Search } from "lucide-react";
import { format } from "date-fns";
import AdminHeader from "@/components/admin/AdminHeader";

interface HandoverData {
  id?: string;
  amount: number;
  date: string;
  notes?: string;
  is_report_checkpoint?: boolean;
  report_image_url?: string;
}

interface CaseHandovers {
  caseId: string;
  caseTitle: string;
  caseTitleAr: string;
  monthlyCost: number;
  handoversByMonth: Record<string, HandoverData[]>;
}

interface Donation {
  id: string;
  donor_name: string;
  amount: number;
  total_handed_over: number;
  remaining: number;
}

export default function CaseHandoverCalendar() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    caseId: string;
    caseTitle: string;
    caseTitleAr: string;
    monthlyCost: number;
    month: number;
    year: number;
    existingHandover?: HandoverData;
  } | null>(null);
  const [editForm, setEditForm] = useState({
    amount: "",
    notes: "",
    selectedDonationId: "",
    isReportCheckpoint: false
  });
  const [availableDonations, setAvailableDonations] = useState<Donation[]>([]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const { data: casesWithHandovers, isLoading } = useQuery({
    queryKey: ["case-handover-calendar", selectedYear],
    queryFn: async () => {
      const { data: cases, error: casesError } = await supabase
        .from("cases")
        .select("id, title, title_ar, monthly_cost")
        .eq("is_published", true)
        .order("title");

      if (casesError) throw casesError;

      const startDate = new Date(selectedYear, 0, 1);
      const endDate = new Date(selectedYear, 11, 31, 23, 59, 59);

      const { data: handovers, error: handoversError } = await supabase
        .from("donation_handovers")
        .select("id, case_id, handover_amount, handover_date, handover_notes, is_report_checkpoint, report_image_url")
        .gte("handover_date", startDate.toISOString())
        .lte("handover_date", endDate.toISOString());

      if (handoversError) throw handoversError;

      const result: CaseHandovers[] = cases.map(caseItem => {
        const caseHandovers = handovers.filter(h => h.case_id === caseItem.id);
        const handoversByMonth: Record<string, HandoverData[]> = {};

        caseHandovers.forEach(handover => {
          const date = new Date(handover.handover_date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

          if (!handoversByMonth[monthKey]) {
            handoversByMonth[monthKey] = [];
          }

          handoversByMonth[monthKey].push({
            id: handover.id,
            amount: handover.handover_amount,
            date: handover.handover_date,
            notes: handover.handover_notes || undefined,
            is_report_checkpoint: handover.is_report_checkpoint || false,
            report_image_url: handover.report_image_url || undefined,
          });
        });

        return {
          caseId: caseItem.id,
          caseTitle: caseItem.title,
          caseTitleAr: caseItem.title_ar || caseItem.title,
          monthlyCost: caseItem.monthly_cost || 0,
          handoversByMonth,
        };
      });

      return result;
    },
  });

  // Fetch available donations when dialog opens
  const fetchAvailableDonations = async (caseId: string) => {
    const { data, error } = await supabase
      .from("donations")
      .select("id, donor_name, amount, total_handed_over")
      .eq("case_id", caseId)
      .eq("status", "confirmed")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل التبرعات المتاحة",
        variant: "destructive",
      });
      return [];
    }

    return (data || []).map(d => ({
      id: d.id,
      donor_name: d.donor_name || "متبرع مجهول",
      amount: Number(d.amount),
      total_handed_over: Number(d.total_handed_over || 0),
      remaining: Number(d.amount) - Number(d.total_handed_over || 0),
    })).filter(d => d.remaining > 0);
  };


  const [reportFile, setReportFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReportFile(e.target.files[0]);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (data: {
      caseId: string;
      donationId: string;
      month: number;
      year: number;
      amount: number;
      notes?: string;
      handoverId?: string;
      isReportCheckpoint: boolean;
      reportFile?: File | null;
    }) => {
      const handoverDate = new Date(data.year, data.month, 15);
      const preciseAmount = Number(Number(data.amount).toFixed(2));
      let reportImageUrl = null;

      if (data.isReportCheckpoint && data.reportFile) {
        setIsUploading(true);
        const fileExt = data.reportFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `reports/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('case-images')
          .upload(filePath, data.reportFile);

        if (uploadError) {
          setIsUploading(false);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('case-images')
          .getPublicUrl(filePath);

        reportImageUrl = publicUrl;
        setIsUploading(false);
      }

      if (data.handoverId) {
        const updateData: any = {
          handover_amount: preciseAmount,
          handover_notes: data.notes,
          donation_id: data.donationId,
          is_report_checkpoint: data.isReportCheckpoint,
          updated_at: new Date().toISOString(),
        };

        if (reportImageUrl) {
          updateData.report_image_url = reportImageUrl;
        }

        const { error } = await supabase
          .from("donation_handovers")
          .update(updateData)
          .eq("id", data.handoverId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("donation_handovers")
          .insert({
            case_id: data.caseId,
            donation_id: data.donationId,
            handover_amount: preciseAmount,
            handover_date: handoverDate.toISOString(),
            handover_notes: data.notes,
            is_report_checkpoint: data.isReportCheckpoint,
            report_image_url: reportImageUrl,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-handover-calendar"] });
      toast({
        title: "نجح",
        description: "تم حفظ التسليم بنجاح",
      });
      setEditDialog(null);
      setEditForm({ amount: "", notes: "", selectedDonationId: "", isReportCheckpoint: false });
      setReportFile(null);
      setAvailableDonations([]);
    },
    onError: (error: Error) => {
      setIsUploading(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openEditDialog = async (
    caseId: string,
    caseTitle: string,
    caseTitleAr: string,
    monthlyCost: number,
    month: number,
    existingHandovers?: HandoverData[]
  ) => {
    const existingHandover = existingHandovers?.[0];

    // Fetch available donations
    const donations = await fetchAvailableDonations(caseId);
    setAvailableDonations(donations);

    setEditForm({
      amount: existingHandover?.amount.toString() || monthlyCost.toString(),
      notes: existingHandover?.notes || "",
      selectedDonationId: "",
      isReportCheckpoint: existingHandover?.is_report_checkpoint || false,
    });

    setEditDialog({
      open: true,
      caseId,
      caseTitle,
      caseTitleAr,
      monthlyCost,
      month,
      year: selectedYear,
      existingHandover,
    });
  };

  const handleSave = () => {
    if (!editDialog) return;

    const amount = parseFloat(editForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "مبلغ غير صالح",
        description: "الرجاء إدخال مبلغ صحيح",
        variant: "destructive",
      });
      return;
    }

    if (!editForm.selectedDonationId) {
      toast({
        title: "تبرع غير محدد",
        description: "الرجاء اختيار التبرع الذي سيتم الخصم منه",
        variant: "destructive",
      });
      return;
    }

    const selectedDonation = availableDonations.find(d => d.id === editForm.selectedDonationId);
    if (selectedDonation && amount > selectedDonation.remaining) {
      toast({
        title: "مبلغ غير صالح",
        description: `المبلغ المتبقي في التبرع: ${selectedDonation.remaining.toFixed(2)} جنيه`,
        variant: "destructive",
      });
      return;
    }

    if (editForm.isReportCheckpoint && !reportFile && !editDialog.existingHandover?.report_image_url) {
      toast({
        title: "صورة التقرير مطلوبة",
        description: "لقد قمت بتحديد نقطة مراجعة التقرير، يرجى رفع صورة التقرير",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate({
      caseId: editDialog.caseId,
      donationId: editForm.selectedDonationId,
      month: editDialog.month,
      year: editDialog.year,
      amount,
      notes: editForm.notes,
      handoverId: editDialog.existingHandover?.id,
      isReportCheckpoint: editForm.isReportCheckpoint,
      reportFile: reportFile,
    });
  };

  // ... (getMonthTotal and filteredCases remain same)

  return (
    <AdminHeader title="تقويم التسليم الشهري">
      {/* ... (Header content remains same) */}

      {/* ... (Cases grid remains same) */}

      <Dialog open={editDialog?.open || false} onOpenChange={(open) => {
        if (!open) {
          setEditDialog(null);
          setAvailableDonations([]);
          setEditForm({ amount: "", notes: "", selectedDonationId: "", isReportCheckpoint: false });
          setReportFile(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editDialog?.existingHandover ? "تعديل" : "إضافة"} تسليم شهري
            </DialogTitle>
            <DialogDescription className="space-y-1">
              <div className="font-semibold">{editDialog?.caseTitleAr}</div>
              <div className="text-sm">{months[editDialog?.month || 0]} {editDialog?.year}</div>
              <div className="text-sm">التكلفة الشهرية: {editDialog?.monthlyCost.toLocaleString()} جنيه</div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* ... (Donation select and Amount input remain same) */}

            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات (اختياري)</Label>
              <Textarea
                id="notes"
                placeholder="أضف أي ملاحظات عن هذا التسليم"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                id="reportCheckpoint"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={editForm.isReportCheckpoint}
                onChange={(e) => setEditForm({ ...editForm, isReportCheckpoint: e.target.checked })}
              />
              <Label htmlFor="reportCheckpoint" className="cursor-pointer">
                تحديد كنقطة تقرير (يتطلب رفع صورة)
              </Label>
            </div>

            {editForm.isReportCheckpoint && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="reportImage">صورة التقرير *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="reportImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                </div>
                {editDialog?.existingHandover?.report_image_url && (
                  <div className="text-sm text-green-600">
                    يوجد صورة تقرير محفوظة بالفعل. قم بالرفع لاستبدالها.
                  </div>
                )}
              </div>
            )}

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditDialog(null);
              setAvailableDonations([]);
            }}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending || isUploading}>
              {isUploading ? "جاري الرفع..." : saveMutation.isPending ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminHeader>
  );
}

