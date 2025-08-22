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
  const [donorName, setDonorName] = useState("");

  // Safe amount with fallback to prevent undefined errors
  const safeAmount = amount && typeof amount === 'number' && !isNaN(amount) ? amount : 500;

  const copyPaymentCode = () => {
    navigator.clipboard.writeText(paymentCode);
    toast({
      title: "تم النسخ",
      description: "تم نسخ كود الدفع بنجاح",
    });
  };

  const handleConfirm = () => {
    if (!donorName.trim()) {
      toast({
        title: "مطلوب",
        description: "يرجى إدخال الاسم",
        variant: "destructive"
      });
      return;
    }
    onConfirm(donorName);
  };

  const resetDialog = () => {
    setDonorName("");
  };

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  // Reset form data when dialog opens to prevent caching
  const handleOpenChange = (open: boolean) => {
    if (open) {
      resetDialog();
    } else {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-4" dir="rtl">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="w-5 h-5" />
            تأكيد التبرع
          </DialogTitle>
          <DialogDescription className="text-sm">
            أدخل بياناتك واتبع تعليمات الدفع
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
          {/* معلومات المتبرع */}
          <div className="space-y-2">
            <Label htmlFor="donor-name" className="flex items-center gap-2 text-sm font-medium">
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

          {/* ملخص التبرع */}
          <div className="bg-accent/30 p-3 rounded-lg">
            <h4 className="font-semibold mb-2 text-sm">ملخص التبرع:</h4>
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
                <span className="font-medium text-primary">{safeAmount.toLocaleString()} جنيه</span>
              </div>
            </div>
          </div>

          {/* تعليمات الدفع */}
          <div className="border-2 border-primary/20 bg-primary/5 p-3 rounded-lg">
            <h4 className="font-semibold mb-2 text-primary text-sm">مهم جداً - كود الدفع:</h4>
            
            <div className="bg-background p-3 rounded-md border mb-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-lg font-mono px-3 py-1">
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
                ⚠️ اكتب الكود "{paymentCode}" في خانة البيان
              </p>
              <p className="text-muted-foreground">
                ضروري لربط تبرعك بهذه الحالة
              </p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 p-2 rounded">
            <p className="text-sm text-green-800">
              ✅ سيتم مراجعة التبرع من الإدارة وتأكيده
            </p>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 pt-3 border-t gap-2">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            إلغاء
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!donorName.trim()}
            className="flex-1"
          >
            <ExternalLink className="w-4 h-4 ml-1" />
            المتابعة للدفع
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};