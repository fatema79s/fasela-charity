
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-16 px-4 rtl" dir="rtl">
            <div className="max-w-6xl mx-auto space-y-16">

                {/* Header */}
                <div className="text-center space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-extrabold text-blue-900 tracking-tight"
                    >
                        كيف نختار الحالات؟
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-blue-600/80 max-w-2xl mx-auto"
                    >
                        معايير دقيقة وشفافة لضمان وصول المساعدة لمن يستحقها بالفعل
                    </motion.p>
                </div>

                {/* Infographic Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-1/2 left-0 w-full h-2 bg-blue-100 -z-10 rounded-full" />

                    {items?.map((item, index) => {
                        const Icon = (LucideIcons as any)[item.icon] || LucideIcons.CheckCircle;
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-8 rounded-3xl shadow-xl border border-blue-50 relative group hover:scale-105 transition-transform duration-300"
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 rounded-2xl shadow-lg group-hover:shadow-blue-200 transition-shadow">
                                    <Icon className="w-8 h-8" />
                                </div>

                                <div className="mt-8 text-center space-y-4">
                                    <h3 className="text-2xl font-bold text-gray-800">{item.title}</h3>
                                    <p className="text-gray-600 leading-relaxed min-h-[80px]">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Number Badge */}
                                <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-yellow-900 font-bold w-12 h-12 flex items-center justify-center rounded-full shadow-md text-xl">
                                    {index + 1}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Trust Badge at bottom */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="text-center bg-blue-900 text-white p-8 rounded-3xl shadow-2xl mt-16 max-w-4xl mx-auto"
                >
                    <LucideIcons.ShieldCheck className="w-16 h-16 mx-auto mb-4 text-green-400" />
                    <h2 className="text-2xl font-bold mb-2">رقابة ومتابعة مستمرة</h2>
                    <p className="text-blue-100">
                        نقوم بمراجعة دورية لجميع الحالات للتأكد من استمرار استحقاقها للدعم وتحديث بياناتها الاجتماعية والاقتصادية.
                    </p>
                </motion.div>

            </div>
        </div>
    );
};
