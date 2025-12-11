
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { Copy, ExternalLink, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FundingItem {
    id: string;
    title: string;
    description: string;
    details: string;
    actionLabel: string;
}

interface FundingChannelsViewProps {
    items: FundingItem[];
}

export const FundingChannelsView = ({ items }: FundingChannelsViewProps) => {
    const { toast } = useToast();

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "تم النسخ",
            description: "تم نسخ التفاصيل إلى الحافظة بنجاح"
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 py-16 px-4 rtl" dir="rtl">
            <div className="max-w-5xl mx-auto space-y-12">

                {/* Hero Section */}
                <div className="bg-gradient-to-r from-primary to-indigo-800 rounded-3xl p-8 md:p-16 text-white text-center shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">قنوات التبرع والدعم</h1>
                        <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto mb-8">
                            مساهمتك تصل كاملة لمستحقيها عبر قنوات رسمية وموثوقة. اختر الطريقة الأنسب لك.
                        </p>
                    </motion.div>
                </div>

                {/* Channels List */}
                <div className="grid gap-6">
                    {items?.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.15 }}
                            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                        >
                            <div className="flex flex-col md:flex-row items-center p-6 md:p-8 gap-6 md:gap-8">
                                <div className="bg-primary/5 p-6 rounded-2xl group-hover:bg-primary/10 transition-colors">
                                    <LucideIcons.CreditCard className="w-10 h-10 text-primary" />
                                </div>

                                <div className="flex-1 text-center md:text-right space-y-2">
                                    <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
                                    <p className="text-gray-600 font-medium">{item.description}</p>
                                    <div className="flex items-center justify-center md:justify-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2">
                                        <code className="font-mono text-lg text-primary font-bold tracking-wider">{item.details}</code>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 w-full md:w-auto">
                                    <Button size="lg" className="w-full gap-2 text-lg" onClick={() => handleCopy(item.details)}>
                                        <Copy className="w-4 h-4" />
                                        {item.actionLabel || "نسخ الرقم"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Note */}
                <div className="text-center text-gray-500 mt-16">
                    <p>جميع التبرعات تخضع للرقابة المالية وتصرف في مصارفها الشرعية بدقة وأمانة.</p>
                </div>

            </div>
        </div>
    );
};
