import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { 
  Search, 
  Users, 
  Heart, 
  CheckCircle, 
  Home, 
  FileSearch,
  Calendar,
  DollarSign,
  Palette,
  Laptop,
  ShoppingBag,
  ClipboardCheck,
  GraduationCap,
  Wrench,
  ArrowDown,
  Sparkles,
  MapPin,
  HandHeart
} from "lucide-react";

const pipelineSteps = [
  {
    id: 1,
    title: "ترشيح الحالات",
    description: "عن طريق الدليل في المنطقة بيرشح حالات محتاجة للدعم",
    icon: Search,
    color: "bg-blue-500",
    phase: "الاكتشاف"
  },
  {
    id: 2,
    title: "المقابلة الأولية",
    description: "مقابلة الحالة في مركز الدليل والاستماع لتفاصيل حياتها ورؤية الأطفال",
    icon: Users,
    color: "bg-indigo-500",
    phase: "الاكتشاف"
  },
  {
    id: 3,
    title: "إخراج الزكاة",
    description: "إخراج زكاة المال للحالات المستحقة لغرض الزكاة ثم تأليف قلوبهم تجاه فسيلة",
    icon: Heart,
    color: "bg-pink-500",
    phase: "التقييم"
  },
  {
    id: 4,
    title: "اصطفاء الحالات",
    description: "اختيار الحالات المطابقة لمواصفات الاختيار المحددة",
    icon: CheckCircle,
    color: "bg-emerald-500",
    phase: "التقييم"
  },
  {
    id: 5,
    title: "الزيارة الميدانية",
    description: "زيارة ميدانية مع الموظفة أو بشكل منفرد لجمع باقي التفاصيل",
    icon: Home,
    color: "bg-teal-500",
    phase: "التحقق"
  },
  {
    id: 6,
    title: "البحث الميداني",
    description: "بعض الحالات تحتاج بحث ميداني إضافي لمطابقة التفاصيل",
    icon: FileSearch,
    color: "bg-cyan-500",
    phase: "التحقق"
  },
  {
    id: 7,
    title: "الدخول في الشهريات",
    description: "إدخال الحالة في نظام الكفالة الشهرية",
    icon: Calendar,
    color: "bg-primary",
    phase: "الكفالة"
  },
  {
    id: 8,
    title: "الكفالة الشهرية",
    description: "التكفل بحوالي ١٥٠٠-٢٠٠٠ جنيه شهرياً لكل أسرة",
    icon: DollarSign,
    color: "bg-amber-500",
    phase: "الكفالة"
  },
  {
    id: 9,
    title: "جمع هوايات الأطفال",
    description: "اكتشاف ودعم هوايات الأطفال من رسم وشعر وغيرها",
    icon: Palette,
    color: "bg-purple-500",
    phase: "التنمية"
  },
  {
    id: 10,
    title: "دعم تقني",
    description: "دعم الأطفال بأجهزة لاب توب للتعليم والتطوير",
    icon: Laptop,
    color: "bg-slate-600",
    phase: "التنمية"
  },
  {
    id: 11,
    title: "أدوات الهوايات",
    description: "شراء الأدوات اللازمة لهوايات الأطفال",
    icon: ShoppingBag,
    color: "bg-rose-500",
    phase: "التنمية"
  },
  {
    id: 12,
    title: "المتابعة الدورية",
    description: "متابعة كل شهرين إلى ٣ شهور لتحديد بقاء الأسرة في الكفالة",
    icon: ClipboardCheck,
    color: "bg-orange-500",
    phase: "المتابعة"
  },
  {
    id: 13,
    title: "الدورات التعليمية",
    description: "بدء الدورات التعليمية للأطفال مع المنظمات المتضامنة أونلاين",
    icon: GraduationCap,
    color: "bg-blue-600",
    phase: "التنمية"
  },
  {
    id: 14,
    title: "تفاصيل المنزل",
    description: "التكفل بتفاصيل المنزل من علاج أو أثاث أو غيره",
    icon: Wrench,
    color: "bg-stone-500",
    phase: "الدعم"
  }
];

const phases = [
  { name: "الاكتشاف", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Search },
  { name: "التقييم", color: "bg-pink-100 text-pink-700 border-pink-200", icon: Heart },
  { name: "التحقق", color: "bg-teal-100 text-teal-700 border-teal-200", icon: FileSearch },
  { name: "الكفالة", color: "bg-green-100 text-green-700 border-green-200", icon: HandHeart },
  { name: "التنمية", color: "bg-purple-100 text-purple-700 border-purple-200", icon: GraduationCap },
  { name: "المتابعة", color: "bg-orange-100 text-orange-700 border-orange-200", icon: ClipboardCheck },
  { name: "الدعم", color: "bg-stone-100 text-stone-700 border-stone-200", icon: Wrench },
];

const CasePipeline = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <div className="gradient-hero text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-32 h-32 border-2 border-white rounded-full" />
          <div className="absolute bottom-10 left-10 w-24 h-24 border-2 border-white rounded-full" />
          <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-white rounded-full" />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">رحلة الكفالة الكاملة</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            رحلة الحالة من الاكتشاف إلى الكفالة
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            نتبع منهجية دقيقة ومتكاملة لضمان وصول الدعم للأسر المستحقة
            <br />
            وتحقيق أثر مستدام في حياتهم
          </p>
        </div>
      </div>

      {/* Phase Legend */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <Card className="shadow-xl border-0">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">مراحل الرحلة</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {phases.map((phase) => (
                <div
                  key={phase.name}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${phase.color} text-sm font-medium`}
                >
                  <phase.icon className="w-4 h-4" />
                  {phase.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Steps */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {pipelineSteps.map((step, index) => {
            const phaseInfo = phases.find(p => p.name === step.phase);
            const isLast = index === pipelineSteps.length - 1;
            
            return (
              <div key={step.id} className="relative">
                {/* Connection Line */}
                {!isLast && (
                  <div className="absolute right-[39px] top-[80px] w-[2px] h-16 bg-gradient-to-b from-border to-transparent" />
                )}
                
                <div className="flex gap-6 mb-8 group">
                  {/* Step Number & Icon */}
                  <div className="flex-shrink-0 relative">
                    <div className={`w-20 h-20 rounded-2xl ${step.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className="w-9 h-9 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full border-2 border-border flex items-center justify-center text-sm font-bold text-foreground shadow-sm">
                      {step.id}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <Card className="flex-1 border-0 shadow-md hover:shadow-xl transition-shadow duration-300 group-hover:border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-foreground">
                          {step.title}
                        </h3>
                        {phaseInfo && (
                          <Badge variant="outline" className={phaseInfo.color}>
                            {step.phase}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Arrow for mobile */}
                {!isLast && (
                  <div className="flex justify-center mb-4 md:hidden">
                    <ArrowDown className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              ملخص الرحلة
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">٦ خطوات</h3>
                  <p className="text-muted-foreground">للاكتشاف والتحقق</p>
                </CardContent>
              </Card>
              
              <Card className="text-center border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HandHeart className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">١٥٠٠-٢٠٠٠ جنيه</h3>
                  <p className="text-muted-foreground">كفالة شهرية لكل أسرة</p>
                </CardContent>
              </Card>
              
              <Card className="text-center border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">تنمية شاملة</h3>
                  <p className="text-muted-foreground">تعليم وهوايات ودعم تقني</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="container mx-auto px-4 py-16">
        <Card className="gradient-hero text-white border-0 overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
          <CardContent className="p-12 text-center relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              كن جزءاً من هذه الرحلة
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
              ساهم معنا في دعم الأسر المحتاجة وتغيير حياتهم للأفضل
            </p>
            <a
              href="/cases"
              className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-bold hover:bg-white/90 transition-colors shadow-lg"
            >
              <Heart className="w-5 h-5" />
              تصفح الحالات وابدأ الكفالة
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CasePipeline;
