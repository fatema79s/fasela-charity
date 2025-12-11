
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { Copy, CreditCard, Wallet, Smartphone, Globe } from "lucide-react";
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

    // Function to get random gradient for card variety
    const getCardStyle = (index: number) => {
        const styles = [
            "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white", // Dark Premium
            "bg-gradient-to-br from-indigo-600 to-blue-700 border-indigo-500 text-white", // Classic Blue
            "bg-gradient-to-br from-emerald-600 to-teal-700 border-emerald-500 text-white", // Trust Green
            "bg-gradient-to-br from-violet-600 to-purple-700 border-violet-500 text-white", // Royal Purple
        ];
        return styles[index % styles.length];
    };

    return (
        <div className="min-h-screen bg-gray-50 py-16 px-4 rtl font-sans" dir="rtl">
            <div className="max-w-5xl mx-auto space-y-16">

                {/* Header */}
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white inline-block px-6 py-2 rounded-full shadow-sm border border-gray-100 text-primary font-bold mb-4"
                    >
                        طرق تبرع آمنة وموثوقة
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
                        محفظة الخير
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                        اختر القناة الأنسب لك للمساهمة. جميع حساباتنا رسمية ومسجلة.
                    </p>
                </div>

                {/* Wallet Cards Layout */}
                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {items?.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, rotateX: -15, y: 50 }}
                            animate={{ opacity: 1, rotateX: 0, y: 0 }}
                            transition={{ delay: index * 0.15, type: "spring" }}
                            whileHover={{ scale: 1.02, rotate: 1 }}
                            className={`relative rounded-[1.5rem] p-8 aspect-[1.6/1] shadow-2xl flex flex-col justify-between overflow-hidden group ${getCardStyle(index)}`}
                        >
                            {/* Card Shine Effect */}
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/20 to-transparent pointer-events-none" />

                            {/* Top Row: Chip & Logo */}
                            <div className="flex justify-between items-start relative z-10">
                                <div className="w-12 h-9 bg-gradient-to-r from-yellow-200 to-yellow-400 rounded-md shadow-sm border border-yellow-500/30 flex items-center justify-center overflow-hidden">
                                    <div className="w-full h-[1px] bg-yellow-600/50 my-0.5" />
                                </div>
                                <LucideIcons.Wifi className="w-8 h-8 opacity-50 rotate-90" />
                            </div>

                            {/* Middle: Details */}
                            <div className="relative z-10 space-y-4 text-center">
                                <div className="font-mono text-2xl md:text-3xl tracking-widest drop-shadow-md">
                                    {item.details}
                                </div>
                                <p className="text-white/80 font-medium text-lg">{item.title}</p>
                            </div>

                            {/* Bottom: Action */}
                            <div className="flex justify-between items-end relative z-10">
                                <div className="text-xs uppercase tracking-wider opacity-75">
                                    <div>اسم الحساب</div>
                                    <div className="font-bold text-sm">جمعية رعاية الأيتام</div>
                                </div>

                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="rounded-full px-6 shadow-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation(); // prevent card click if we add expand later
                                        handleCopy(item.details);
                                    }}
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    {item.actionLabel || "نـسخ"}
                                </Button>
                            </div>

                            {/* Background Icon Watermark */}
                            <div className="absolute -bottom-8 -right-8 opacity-10 rotate-[-15deg]">
                                <LucideIcons.CreditCard className="w-48 h-48" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer info */}
                <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-center md:text-left mt-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-full">
                            <LucideIcons.Lock className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">100% آمن وموثوق</h3>
                            <p className="text-slate-500 text-sm">جميع العمليات مشفرة ومحمية</p>
                        </div>
                    </div>
                    <div className="w-px h-12 bg-gray-200 hidden md:block" />
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <LucideIcons.Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">حسابات رسمية</h3>
                            <p className="text-slate-500 text-sm">تحت إشراف المركز الوطني لتنمية القطاع غير الربحي</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
