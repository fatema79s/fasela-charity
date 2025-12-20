import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Phone, AlertCircle, CheckCircle2,
  ArrowRight, Clock, FileText, User, Upload, X, Check
} from "lucide-react";

interface FollowupAction {
  id: string;
  title: string;
  description: string | null;
  action_date: string;
  status: string;
  requires_case_action: boolean;
  requires_volunteer_action: boolean;
  answer_type: "multi_choice" | "photo_upload" | "text_area" | null;
  answer_options: string[];
  answer_text: string | null;
  answer_photos: string[] | null;
  answer_multi_choice: string | null;
  answered_at: string | null;
}

export default function CaseFollowups() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"phone" | "followups">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [caseId, setCaseId] = useState<string | null>(null);
  const [caseName, setCaseName] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [taskAnswers, setTaskAnswers] = useState<{ [key: string]: any }>({});
  const [uploadedPhotos, setUploadedPhotos] = useState<{ [key: string]: string[] }>({});

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
        .select("id, title, description, action_date, status, requires_case_action, requires_volunteer_action, answer_type, answer_options, answer_text, answer_photos, answer_multi_choice, answered_at")
        .eq("case_id", caseId)
        .eq("status", "pending")
        .eq("requires_case_action", true)
        .order("action_date", { ascending: true });
      
      if (error) throw error;
      
      // Parse JSON fields if they're strings
      const parsedData = (data || []).map((item: any) => {
        if (item.answer_options && typeof item.answer_options === 'string') {
          try {
            item.answer_options = JSON.parse(item.answer_options);
          } catch (e) {
            item.answer_options = [];
          }
        }
        if (item.answer_photos && typeof item.answer_photos === 'string') {
          try {
            item.answer_photos = JSON.parse(item.answer_photos);
          } catch (e) {
            item.answer_photos = [];
          }
        }
        return item;
      });
      
      return parsedData as FollowupAction[];
    },
    enabled: !!caseId,
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async ({ taskId, answer }: { taskId: string; answer: any }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("يجب تسجيل الدخول أولاً");

      const updateData: any = {
        answered_at: new Date().toISOString(),
        answered_by: userData.user.id,
      };

      if (answer.type === "text_area") {
        updateData.answer_text = answer.text;
      } else if (answer.type === "multi_choice") {
        updateData.answer_multi_choice = answer.choice;
      } else if (answer.type === "photo_upload") {
        updateData.answer_photos = answer.photos;
      }

      const { error } = await supabase
        .from("followup_actions")
        .update(updateData)
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "تم إرسال الإجابة",
        description: "شكراً لك، تم حفظ إجابتك بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["case_followups", caseId] });
      setTaskAnswers({});
      setUploadedPhotos({});
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: "فشل إرسال الإجابة: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handlePhotoUpload = async (taskId: string, file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `task_${taskId}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('case-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('case-images')
        .getPublicUrl(fileName);

      const currentPhotos = uploadedPhotos[taskId] || [];
      setUploadedPhotos({
        ...uploadedPhotos,
        [taskId]: [...currentPhotos, publicUrl]
      });

      toast({
        title: "تم رفع الصورة",
        description: "تم رفع الصورة بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل رفع الصورة: " + error.message,
        variant: "destructive",
      });
    }
  };

  const removePhoto = (taskId: string, index: number) => {
    const currentPhotos = uploadedPhotos[taskId] || [];
    setUploadedPhotos({
      ...uploadedPhotos,
      [taskId]: currentPhotos.filter((_, i) => i !== index)
    });
  };

  const handleSubmitAnswer = (task: FollowupAction) => {
    const answer = taskAnswers[task.id];
    if (!answer) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال الإجابة",
        variant: "destructive",
      });
      return;
    }

    if (task.answer_type === "multi_choice" && !answer.choice) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار خيار",
        variant: "destructive",
      });
      return;
    }

    if (task.answer_type === "photo_upload" && (!uploadedPhotos[task.id] || uploadedPhotos[task.id].length === 0)) {
      toast({
        title: "خطأ",
        description: "يرجى رفع صورة واحدة على الأقل",
        variant: "destructive",
      });
      return;
    }

    submitAnswerMutation.mutate({
      taskId: task.id,
      answer: {
        type: task.answer_type,
        text: answer.text,
        choice: answer.choice,
        photos: uploadedPhotos[task.id] || [],
      }
    });
  };

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

                  {followups?.map((followup, index) => {
                    const isAnswered = !!followup.answered_at;
                    return (
                      <motion.div
                        key={followup.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-white border-2 rounded-2xl p-5 transition-all ${
                          isAnswered 
                            ? "border-green-200 bg-green-50/30" 
                            : "border-slate-100 hover:border-amber-200"
                        }`}
                      >
                        {/* Task Number */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${
                            isAnswered ? "bg-green-500 text-white" : "bg-amber-500 text-white"
                          }`}>
                            {isAnswered ? <Check className="w-5 h-5" /> : index + 1}
                          </span>
                          <h3 className="font-bold text-xl text-slate-800">{followup.title}</h3>
                          {isAnswered && (
                            <span className="text-sm text-green-600 font-medium">✓ تم الإجابة</span>
                          )}
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
                        <div className="flex items-center gap-2 text-slate-500 mb-4">
                          <Clock className="w-5 h-5" />
                          <span className="text-base">التاريخ: {formatDate(followup.action_date)}</span>
                        </div>

                        {/* Answer Form */}
                        {!isAnswered && followup.answer_type && (
                          <div className="space-y-4 mt-4 pt-4 border-t border-slate-200">
                            {followup.answer_type === "text_area" && (
                              <div className="space-y-2">
                                <Label>الإجابة</Label>
                                <Textarea
                                  placeholder="اكتب إجابتك هنا..."
                                  rows={4}
                                  value={taskAnswers[followup.id]?.text || ""}
                                  onChange={(e) => {
                                    setTaskAnswers({
                                      ...taskAnswers,
                                      [followup.id]: { ...taskAnswers[followup.id], text: e.target.value }
                                    });
                                  }}
                                  className="resize-none"
                                />
                              </div>
                            )}

                            {followup.answer_type === "multi_choice" && followup.answer_options && (
                              <div className="space-y-2">
                                <Label>اختر الإجابة</Label>
                                <RadioGroup
                                  value={taskAnswers[followup.id]?.choice || ""}
                                  onValueChange={(value) => {
                                    setTaskAnswers({
                                      ...taskAnswers,
                                      [followup.id]: { ...taskAnswers[followup.id], choice: value }
                                    });
                                  }}
                                >
                                  {followup.answer_options.map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center space-x-2 space-y-0">
                                      <RadioGroupItem value={option} id={`option-${followup.id}-${optIndex}`} />
                                      <Label htmlFor={`option-${followup.id}-${optIndex}`} className="font-normal cursor-pointer">
                                        {option}
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </div>
                            )}

                            {followup.answer_type === "photo_upload" && (
                              <div className="space-y-2">
                                <Label>رفع الصور</Label>
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handlePhotoUpload(followup.id, file);
                                      }}
                                      className="hidden"
                                      id={`photo-upload-${followup.id}`}
                                    />
                                    <Label
                                      htmlFor={`photo-upload-${followup.id}`}
                                      className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-slate-50"
                                    >
                                      <Upload className="w-4 h-4" />
                                      رفع صورة
                                    </Label>
                                  </div>
                                  {uploadedPhotos[followup.id] && uploadedPhotos[followup.id].length > 0 && (
                                    <div className="grid grid-cols-2 gap-2">
                                      {uploadedPhotos[followup.id].map((photo, photoIndex) => (
                                        <div key={photoIndex} className="relative">
                                          <img
                                            src={photo}
                                            alt={`Uploaded ${photoIndex + 1}`}
                                            className="w-full h-24 object-cover rounded-lg"
                                          />
                                          <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 left-1 h-6 w-6"
                                            onClick={() => removePhoto(followup.id, photoIndex)}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            <Button
                              onClick={() => handleSubmitAnswer(followup)}
                              disabled={submitAnswerMutation.isPending}
                              className="w-full bg-amber-600 hover:bg-amber-700"
                            >
                              {submitAnswerMutation.isPending ? (
                                <Loader2 className="animate-spin ml-2" />
                              ) : (
                                <Check className="ml-2" />
                              )}
                              إرسال الإجابة
                            </Button>
                          </div>
                        )}

                        {/* Show Answer if Already Answered */}
                        {isAnswered && (
                          <div className="mt-4 pt-4 border-t border-green-200">
                            {followup.answer_type === "text_area" && followup.answer_text && (
                              <div className="bg-green-50 rounded-lg p-3">
                                <p className="text-sm font-medium text-green-900 mb-1">إجابتك:</p>
                                <p className="text-green-800 whitespace-pre-wrap">{followup.answer_text}</p>
                              </div>
                            )}
                            {followup.answer_type === "multi_choice" && followup.answer_multi_choice && (
                              <div className="bg-green-50 rounded-lg p-3">
                                <p className="text-sm font-medium text-green-900 mb-1">إجابتك:</p>
                                <p className="text-green-800">{followup.answer_multi_choice}</p>
                              </div>
                            )}
                            {followup.answer_type === "photo_upload" && followup.answer_photos && followup.answer_photos.length > 0 && (
                              <div className="bg-green-50 rounded-lg p-3">
                                <p className="text-sm font-medium text-green-900 mb-2">الصور المرفوعة:</p>
                                <div className="grid grid-cols-2 gap-2">
                                  {followup.answer_photos.map((photo, photoIndex) => (
                                    <img
                                      key={photoIndex}
                                      src={photo}
                                      alt={`Answer ${photoIndex + 1}`}
                                      className="w-full h-24 object-cover rounded-lg"
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
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
