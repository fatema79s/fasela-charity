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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, ExternalLink, CreditCard, User, CheckCircle } from "lucide-react";
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
  amount = 500, // Default fallback value
  caseTitle,
  onConfirm,
}: PaymentConfirmationDialogProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1); // 1: donor info, 2: payment instructions, 3: confirm understanding
  const [donorName, setDonorName] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  // Safe amount with fallback to prevent undefined errors
  const safeAmount = amount && typeof amount === 'number' && !isNaN(amount) ? amount : 500;

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

  const handleUnderstandInstructions = () => {
    setStep(3);
  };

  const handleConfirmUnderstanding = () => {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    onConfirm(donorName);
  };

  const resetDialog = () => {
    setStep(1);
    setDonorName("");
    setConfirmed(false);
  };

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  const getDialogTitle = () => {
    switch (step) {
      case 1: return "بيانات المتبرع";
      case 2: return "تعليمات الدفع";
      case 3: return "تأكيد الفهم";
      default: return "تأكيد الدفع";
    }
  };

  const getDialogDescription = () => {
    switch (step) {
      case 1: return "يرجى إدخال اسمك الكريم";
      case 2: return "يرجى قراءة التعليمات بعناية";
      case 3: return "يرجى تأكيد فهمك للتعليمات";
      default: return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-4" dir="rtl">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="w-4 h-4" />
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[55vh] pr-2">
          <div className="space-y-3 pb-2">
          {step === 1 ? (
            <>
              {/* معلومات المتبرع */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="donor-name" className="flex items-center gap-2 text-sm">
                    <User className="w-3 h-3" />
                    الاسم الكريم
                  </Label>
                  <Input
                    id="donor-name"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="أدخل اسمك الكريم"
                    className="text-right h-9"
                  />
                </div>

                <div className="bg-accent/30 p-3 rounded-lg">
                  <h4 className="font-semibold mb-2 text-sm">ملخص التبرع:</h4>
                  <div className="space-y-1 text-xs">
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
                      <span className="font-medium text-primary">{safeAmount.toLocaleString()} جنيه</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : step === 2 ? (
            <>
              {/* تعليمات الدفع */}
              <div className="bg-accent/30 p-3 rounded-lg">
                <h4 className="font-semibold mb-2 text-sm">ملخص التبرع:</h4>
                <div className="space-y-1 text-xs">
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
                    <span className="font-medium text-primary">{safeAmount.toLocaleString()} جنيه</span>
                  </div>
                </div>
              </div>

              <div className="border-2 border-primary/20 bg-primary/5 p-3 rounded-lg">
                <h4 className="font-semibold mb-2 text-primary text-sm">مهم جداً - كود الدفع:</h4>
                
                <div className="bg-background p-2 rounded-md border mb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-sm font-mono">
                      {paymentCode}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyPaymentCode}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="text-xs space-y-2">
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

              <div className="bg-green-50 border border-green-200 p-2 rounded-lg">
                <p className="text-xs text-green-800">
                  ✅ سيتم تسجيل تبرعك ومراجعته من قبل الإدارة بعد إتمام الدفع
                </p>
              </div>
            </>
          ) : (
            <>
              {/* تأكيد الفهم */}
              <div className="bg-accent/30 p-3 rounded-lg">
                <h4 className="font-semibold mb-2 text-sm">ملخص التبرع:</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>المتبرع:</span>
                    <span className="font-medium">{donorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>المبلغ:</span>
                    <span className="font-medium text-primary">{safeAmount.toLocaleString()} جنيه</span>
                  </div>
                  <div className="flex justify-between">
                    <span>كود الدفع:</span>
                    <span className="font-medium font-mono">{paymentCode}</span>
                  </div>
                </div>
              </div>

              {!confirmed ? (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <h4 className="font-semibold mb-2 text-yellow-800 text-sm">تأكيد الفهم:</h4>
                  <p className="text-xs text-yellow-700 mb-2">
                    يرجى التأكد من فهمك للتعليمات التالية قبل المتابعة:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-yellow-700">
                    <li>سأكتب كود الدفع "{paymentCode}" في خانة البيان</li>
                    <li>أفهم أن بدون هذا الكود لن يتم ربط تبرعي بالحالة الصحيحة</li>
                    <li>سأقوم بدفع المبلغ كاملاً: {safeAmount.toLocaleString()} جنيه</li>
                  </ul>
                  <p className="text-xs text-yellow-700 mt-2">
                    اضغط "فهمت التعليمات" للمتابعة
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <p className="text-xs text-green-800 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    ممتاز! يمكنك الآن المتابعة إلى صفحة الدفع
                  </p>
                </div>
              )}
            </>
          )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-shrink-0 pt-2 border-t gap-2">
          {step === 1 ? (
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={handleClose} size="sm" className="flex-1">
                إلغاء
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!donorName.trim()}
                size="sm"
                className="flex-1"
              >
                متابعة
              </Button>
            </div>
          ) : step === 2 ? (
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={() => setStep(1)} size="sm" className="flex-1">
                رجوع
              </Button>
              <Button variant="outline" onClick={handleClose} size="sm" className="flex-1">
                إلغاء
              </Button>
              <Button 
                onClick={handleUnderstandInstructions}
                size="sm"
                className="flex-1"
              >
                فهمت التعليمات
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={() => setStep(2)} size="sm" className="flex-1">
                رجوع
              </Button>
              <Button variant="outline" onClick={handleClose} size="sm" className="flex-1">
                إلغاء
              </Button>
              <Button 
                onClick={handleConfirmUnderstanding}
                size="sm"
                className="flex-1"
                variant={confirmed ? "default" : "outline"}
              >
                {confirmed ? (
                  <>
                    <ExternalLink className="w-3 h-3 ml-1" />
                    المتابعة للدفع
                  </>
                ) : (
                  "فهمت التعليمات"
                )}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};