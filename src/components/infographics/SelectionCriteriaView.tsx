
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";

interface SelectionItem {
    id: string;
    title: string;
    description: string;
    icon: string;
}

interface SelectionCriteriaViewProps {
    items: SelectionItem[];
}

export const SelectionCriteriaView = ({ items }: SelectionCriteriaViewProps) => {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white py-16 px-4 rtl relative overflow-hidden" dir="rtl">

            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-indigo-500/20 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto space-y-20 relative z-10">

                {/* Header */}
                <div className="text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block"
                    >
                        <span className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1 rounded-full text-sm font-medium text-blue-200">
                            شفافية ومصداقية
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-purple-200 tracking-tight"
                    >
                        معايير الاستحقاق
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed"
                    >
                        نتبع منهجية دقيقة في دراسة الحالات لضمان وصول أموال الزكاة والصدقات لمستحقيها
                    </motion.p>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items?.map((item, index) => {
                        const Icon = (LucideIcons as any)[item.icon] || LucideIcons.CheckCircle;
                        // Make some items span larger if desired, for now uniform grid but styled beautifully
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative z-10 flex flex-col items-start gap-4">
                                    <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-white group-hover:text-blue-200 transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-slate-400 leading-relaxed text-lg">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Decorative number */}
                                <div className="absolute -bottom-4 -left-4 text-9xl font-bold text-white/5 pointer-events-none group-hover:text-white/10 transition-colors">
                                    {index + 1}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Bottom CTA / Trust Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="relative bg-gradient-to-r from-blue-600 to-violet-600 rounded-3xl p-1 md:p-1 overflow-hidden"
                >
                    <div className="bg-[#0f172a] rounded-[22px] p-8 md:p-12 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/10 to-violet-500/10" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8">
                            <LucideIcons.ShieldCheck className="w-20 h-20 text-emerald-400 shrink-0" />
                            <div className="text-right">
                                <h2 className="text-3xl font-bold text-white mb-2">رقابة ومتابعة دورية</h2>
                                <p className="text-slate-300 text-lg max-w-2xl">
                                    نقوم بتحديث بيانات الأسر بشكل دوري (كل 6 أشهر) للتأكد من استمرار حاجتهم للدعم، مما يضمن كفاءة توزيع الموارد.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};
