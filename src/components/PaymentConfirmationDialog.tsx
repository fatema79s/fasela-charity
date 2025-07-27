import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, ExternalLink, CreditCard, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentCode: string;
  amount: number; // Final calculated amount from the main page
  caseTitle: string;
  onConfirm: (donorName: string) => void; // Only need donor name now
}

export const PaymentConfirmationDialog = ({
  open,
  onOpenChange,
  paymentCode,
  amount,
  caseTitle,
  onConfirm,
}: PaymentConfirmationDialogProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1); // 1: donor info, 2: payment instructions
  const [donorName, setDonorName] = useState("");

  const copyPaymentCode = () => {
    navigator.clipboard.writeText(paymentCode);
    toast({
      title: "تم النسخ",
      description: "تم نسخ كود الدفع بنجاح",
    });
  };

  const handleNext = () => {
    if (!donorName.trim()) {
      toast({
        title: "مطلوب",
        description: "يرجى إدخال الاسم",
        variant: "destructive"
      });
      return;
    }
    setStep(2);
  };

  const handleConfirm = () => {
    onConfirm(donorName);
  };

  const resetDialog = () => {
    setStep(1);
    setDonorName("");
  };

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {step === 1 ? "بيانات المتبرع" : "تأكيد الدفع"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? "يرجى إدخال اسمك الكريم"
              : "يرجى اتباع التعليمات التالية لإتمام عملية التبرع"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 1 ? (
            <>
              {/* معلومات المتبرع */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="donor-name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    الاسم الكريم
                  </Label>
                  <Input
                    id="donor-name"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="أدخل اسمك الكريم"
                    className="text-right"
                  />
                </div>

                <div className="bg-accent/30 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">ملخص التبرع:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>الحالة:</span>
                      <span className="font-medium">{caseTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>المتبرع:</span>
                      <span className="font-medium">{donorName || "غير محدد"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>المبلغ:</span>
                      <span className="font-medium text-primary">{amount.toLocaleString()} جنيه</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* تعليمات الدفع */}
              <div className="bg-accent/30 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">ملخص التبرع:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>المتبرع:</span>
                    <span className="font-medium">{donorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الحالة:</span>
                    <span className="font-medium">{caseTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>المبلغ:</span>
                    <span className="font-medium text-primary">{amount.toLocaleString()} جنيه</span>
                  </div>
                </div>
              </div>

              <div className="border-2 border-primary/20 bg-primary/5 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 text-primary">مهم جداً - كود الدفع:</h4>
                
                <div className="bg-background p-3 rounded-md border mb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-lg font-mono">
                      {paymentCode}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyPaymentCode}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-sm space-y-2">
                  <p className="text-destructive font-medium">
                    ⚠️ يجب كتابة الكود "{paymentCode}" في خانة البيان عند الدفع
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>هذا الكود ضروري لربط تبرعك بهذه الحالة</li>
                    <li>بدون هذا الكود لن نتمكن من تحديد الحالة المُراد التبرع لها</li>
                    <li>تأكد من كتابة الكود بشكل صحيح</li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ سيتم تسجيل تبرعك ومراجعته من قبل الإدارة بعد إتمام الدفع
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                إلغاء
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!donorName.trim()}
                className="w-full sm:w-auto"
              >
                متابعة
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                رجوع
              </Button>
              <Button variant="outline" onClick={handleClose}>
                إلغاء
              </Button>
              <Button 
                onClick={handleConfirm}
                className="w-full sm:w-auto"
              >
                <ExternalLink className="w-4 h-4 ml-2" />
                المتابعة للدفع
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};