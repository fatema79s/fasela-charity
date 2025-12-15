import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Phone, AlertCircle, CheckCircle2,
  ArrowRight, Clock, FileText, User
} from "lucide-react";

interface FollowupAction {
  id: string;
  title: string;
  description: string | null;
  action_date: string;
  status: string;
  requires_case_action: boolean;
  requires_volunteer_action: boolean;
}

export default function CaseFollowups() {
  const { toast } = useToast();
  const [step, setStep] = useState<"phone" | "followups">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [caseId, setCaseId] = useState<string | null>(null);
  const [caseName, setCaseName] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Check phone number and get case
  const handleVerifyPhone = async () => {
    if (phoneNumber.length < 8) return;
    
    setIsVerifying(true);
    try {
      const { data, error } = await supabase
        .from("cases")
        .select("id, title_ar")
        .eq("contact_phone", phoneNumber)
        .single();

      if (error || !data) {
        toast({
          title: "رقم غير صحيح",
          description: "لم نجد هذا الرقم في سجلاتنا. يرجى التأكد والمحاولة مرة أخرى.",
          variant: "destructive",
        });
        return;
      }

      setCaseId(data.id);
      setCaseName(data.title_ar || "");
      setStep("followups");
    } catch (err) {
      toast({
        title: "حدث خطأ",
        description: "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Fetch pending followups that require case action
  const { data: followups, isLoading: isLoadingFollowups } = useQuery({
    queryKey: ["case_followups", caseId],
    queryFn: async () => {
      if (!caseId) return [];
      const { data, error } = await supabase
        .from("followup_actions")
        .select("id, title, description, action_date, status, requires_case_action, requires_volunteer_action")
        .eq("case_id", caseId)
        .eq("status", "pending")
        .eq("requires_case_action", true)
        .order("action_date", { ascending: true });
      
      if (error) throw error;
      return data as FollowupAction[];
    },
    enabled: !!caseId,
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const pendingCount = followups?.length || 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-right" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden min-h-[600px] relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-500" />

        <AnimatePresence mode="wait">
          {/* STEP 1: PHONE VERIFICATION */}
          {step === "phone" && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="p-8 flex flex-col h-full justify-center space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="w-10 h-10 text-amber-600" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800">أهلاً بك</h1>
                <p className="text-slate-500 text-lg">
                  أدخلي رقم الجوال المسجل لمعرفة المتطلبات المطلوبة منك
                </p>
              </div>

              <Input
                placeholder="05XXXXXXXX"
                className="text-center text-3xl p-8 rounded-2xl border-2 border-slate-200 focus:border-amber-500 focus:ring-0 tracking-widest"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                type="tel"
              />

              <Button
                size="lg"
                className="w-full h-16 text-xl rounded-2xl bg-amber-600 hover:bg-amber-700"
                onClick={handleVerifyPhone}
                disabled={isVerifying || phoneNumber.length < 8}
              >
                {isVerifying ? <Loader2 className="animate-spin" /> : "التــالي"}
              </Button>
            </motion.div>
          )}

          {/* STEP 2: SHOW FOLLOWUPS */}
          {step === "followups" && (
            <motion.div
              key="followups"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="p-6 h-full flex flex-col"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">أهلاً {caseName}</h2>
                <p className="text-slate-500 mt-2">
                  {pendingCount > 0 
                    ? `عندك ${pendingCount} مهمة مطلوبة منك`
                    : "ما عندك أي مهام حالياً"
                  }
                </p>
              </div>

              {/* Loading State */}
              {isLoadingFollowups && (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="animate-spin w-10 h-10 text-amber-500" />
                </div>
              )}

              {/* No Followups */}
              {!isLoadingFollowups && pendingCount === 0 && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-6"
                >
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">ممتاز!</h3>
                  <p className="text-slate-500 text-lg">
                    ما عندك أي متطلبات حالياً
                  </p>
                  <p className="text-slate-400 mt-2">
                    كل شيء تمام، راح نتواصل معك لو احتجنا أي شيء
                  </p>
                </motion.div>
              )}

              {/* Followups List */}
              {!isLoadingFollowups && pendingCount > 0 && (
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {/* Info Banner */}
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-amber-800 font-medium text-lg">مهم جداً</p>
                        <p className="text-amber-700 mt-1">
                          هذه المهام مطلوبة منك حتى نقدر نكمل خدمتك. يرجى إكمالها في أقرب وقت.
                        </p>
                      </div>
                    </div>
                  </div>

                  {followups?.map((followup, index) => (
                    <motion.div
                      key={followup.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border-2 border-slate-100 rounded-2xl p-5 hover:border-amber-200 transition-all"
                    >
                      {/* Task Number */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                          {index + 1}
                        </span>
                        <h3 className="font-bold text-xl text-slate-800">{followup.title}</h3>
                      </div>

                      {/* Description */}
                      {followup.description && (
                        <div className="bg-slate-50 rounded-xl p-4 mb-3">
                          <div className="flex items-start gap-2">
                            <FileText className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
                            <p className="text-slate-600 text-lg leading-relaxed">
                              {followup.description}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Date */}
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="w-5 h-5" />
                        <span className="text-base">التاريخ: {formatDate(followup.action_date)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="mt-auto pt-4 border-t border-slate-100">
                <p className="text-center text-slate-400 mb-4">
                  لو عندك أي استفسار تواصلي معنا
                </p>
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => {
                    setStep("phone");
                    setPhoneNumber("");
                    setCaseId(null);
                  }}
                >
                  <ArrowRight className="ml-2 w-4 h-4" /> خروج / تغيير الرقم
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
