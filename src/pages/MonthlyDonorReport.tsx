import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Heart,
  TrendingDown,
  TrendingUp,
  Calendar,
  PieChart,
  BarChart3,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  ComposedChart,
  Area,
  AreaChart
} from "recharts";

const MonthlyDonorReport = () => {
  const { data: monthlyData, isLoading, error } = useQuery({
    queryKey: ["monthly-donor-report"],
    queryFn: async () => {
      // Get all cases with their lifecycle status and creation date
      const { data: allCases, error: casesError } = await supabase
        .from("cases")
        .select("id, created_at, lifecycle_status, updated_at, title_ar, title")
        .order("created_at", { ascending: false });

      if (casesError) throw casesError;

      // Get all donation handovers for spending data
      const { data: handovers, error: handoversError } = await supabase
        .from("donation_handovers")
        .select("handover_amount, handover_date")
        .order("handover_date", { ascending: false });

      if (handoversError) throw handoversError;

      // Get legacy redeemed donations
      const { data: legacyDonations, error: legacyError } = await supabase
        .from("donations")
        .select("amount, confirmed_at")
        .eq("status", "redeemed")
        .not("confirmed_at", "is", null)
        .order("confirmed_at", { ascending: false });

      if (legacyError) throw legacyError;

      // Get last 12 months of data
      const months: {
        [key: string]: {
          month: string;
          monthNum: number;
          year: number;
          newCases: number;
          droppedCases: number;
          completedCases: number;
          droppedByReason: { [key: string]: number };
          totalSpending: number;
          handoverCount: number;
        }
      } = {};

      const arabicMonths = [
        "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
      ];

      // Initialize last 12 months
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months[monthKey] = {
          month: arabicMonths[date.getMonth()],
          monthNum: date.getMonth() + 1,
          year: date.getFullYear(),
          newCases: 0,
          droppedCases: 0,
          completedCases: 0,
          droppedByReason: {},
          totalSpending: 0,
          handoverCount: 0,
        };
      }

      // Process cases
      allCases?.forEach(caseItem => {
        const createdDate = new Date(caseItem.created_at);
        const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;

        if (months[monthKey]) {
          months[monthKey].newCases++;
        }

        // Check if case was dropped or completed this month
        const updatedDate = new Date(caseItem.updated_at || caseItem.created_at);
        const updatedMonthKey = `${updatedDate.getFullYear()}-${String(updatedDate.getMonth() + 1).padStart(2, '0')}`;

        if (months[updatedMonthKey]) {
          if (caseItem.lifecycle_status === 'removed' ||
            caseItem.lifecycle_status === 'parked' ||
            caseItem.lifecycle_status === 'under_more_investigation') {
            months[updatedMonthKey].droppedCases++;
            const reason = caseItem.lifecycle_status;
            months[updatedMonthKey].droppedByReason[reason] =
              (months[updatedMonthKey].droppedByReason[reason] || 0) + 1;
          } else if (caseItem.lifecycle_status === 'completed') {
            months[updatedMonthKey].completedCases++;
          }
        }
      });

      // Process handovers
      handovers?.forEach(handover => {
        const handoverDate = new Date(handover.handover_date);
        const monthKey = `${handoverDate.getFullYear()}-${String(handoverDate.getMonth() + 1).padStart(2, '0')}`;

        if (months[monthKey]) {
          months[monthKey].totalSpending += Number(handover.handover_amount || 0);
          months[monthKey].handoverCount++;
        }
      });

      // Process legacy donations
      legacyDonations?.forEach(donation => {
        if (donation.confirmed_at) {
          const confirmedDate = new Date(donation.confirmed_at);
          const monthKey = `${confirmedDate.getFullYear()}-${String(confirmedDate.getMonth() + 1).padStart(2, '0')}`;

          if (months[monthKey]) {
            months[monthKey].totalSpending += Number(donation.amount || 0);
          }
        }
      });

      // Convert to array and format
      const monthlyArray = Object.values(months).map(m => ({
        ...m,
        monthLabel: `${m.month} ${m.year}`,
        droppedReasons: Object.entries(m.droppedByReason).map(([reason, count]) => ({
          reason: getReasonLabel(reason),
          count
        }))
      }));

      // Calculate totals
      const totals = {
        totalNewCases: monthlyArray.reduce((sum, m) => sum + m.newCases, 0),
        totalDroppedCases: monthlyArray.reduce((sum, m) => sum + m.droppedCases, 0),
        totalCompletedCases: monthlyArray.reduce((sum, m) => sum + m.completedCases, 0),
        totalSpending: monthlyArray.reduce((sum, m) => sum + m.totalSpending, 0),
      };

      return {
        monthlyData: monthlyArray,
        totals
      };
    },
  });

  const getReasonLabel = (reason: string): string => {
    const labels: { [key: string]: string } = {
      'removed': 'تم الإزالة',
      'parked': 'مؤجلة',
      'under_more_investigation': 'تحت المزيد من التحقيق',
      'completed': 'مكتملة'
    };
    return labels[reason] || reason;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="animate-pulse text-lg text-muted-foreground">جاري تحميل التقرير...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">خطأ في تحميل التقرير</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              حدث خطأ أثناء محاولة تحميل بيانات التقرير. يرجى المحاولة مرة أخرى.
            </p>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "خطأ غير معروف"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const reportData = monthlyData || { monthlyData: [], totals: { totalNewCases: 0, totalDroppedCases: 0, totalCompletedCases: 0, totalSpending: 0 } };
  const { monthlyData: monthlyReportData, totals } = reportData;

  // Prepare chart data
  const casesChartData = monthlyReportData.map(m => ({
    month: m.month,
    "حالات جديدة": m.newCases,
    "حالات متوقفة": m.droppedCases,
    "حالات مكتملة": m.completedCases,
  }));

  const spendingChartData = monthlyReportData.map(m => ({
    month: m.month,
    "المصروفات": Math.round(m.totalSpending),
  }));

  // Aggregate dropped cases by reason
  const droppedReasonsData: { [key: string]: number } = {};
  monthlyReportData.forEach(m => {
    m.droppedReasons.forEach(r => {
      droppedReasonsData[r.reason] = (droppedReasonsData[r.reason] || 0) + r.count;
    });
  });

  const droppedReasonsChartData = Object.entries(droppedReasonsData).map(([reason, count]) => ({
    name: reason,
    value: count,
    color: getReasonColor(reason)
  }));

  const getReasonColor = (reason: string): string => {
    const colors: { [key: string]: string } = {
      'تم الإزالة': '#ef4444',
      'مؤجلة': '#f59e0b',
      'تحت المزيد من التحقيق': '#3b82f6',
      'مكتملة': '#10b981'
    };
    return colors[reason] || '#6b7280';
  };

  const summaryMetrics = [
    {
      icon: TrendingUp,
      label: "إجمالي الحالات الجديدة",
      value: totals.totalNewCases,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: TrendingDown,
      label: "إجمالي الحالات المتوقفة",
      value: totals.totalDroppedCases,
      color: "from-red-500 to-rose-500",
      bgColor: "bg-red-500/10",
    },
    {
      icon: CheckCircle,
      label: "إجمالي الحالات المكتملة",
      value: totals.totalCompletedCases,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: DollarSign,
      label: "إجمالي المصروفات",
      value: `${Math.round(totals.totalSpending).toLocaleString()} جنيه`,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8 sm:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 space-y-4">
          <div className="inline-block">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-charity bg-clip-text text-transparent mb-2">
              التقرير الشهري للمتبرعين
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            تقرير شامل عن حالة البرنامج والمصروفات الشهرية (آخر 12 شهر)
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>آخر تحديث: {new Date().toLocaleDateString("ar-EG", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long"
            })}</span>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {summaryMetrics.map((metric, index) => (
            <Card
              key={index}
              className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute top-0 left-0 w-32 h-32 opacity-10">
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} rounded-full blur-2xl`} />
              </div>

              <div className="p-4 sm:p-6 relative">
                <div className={`inline-flex p-2 sm:p-3 rounded-xl ${metric.bgColor} mb-3 sm:mb-4`}>
                  <metric.icon className={`h-5 w-5 sm:h-6 sm:w-6 bg-gradient-to-br ${metric.color} bg-clip-text text-transparent`} />
                </div>

                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {metric.value}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Cases Over Time */}
          <Card className="p-4 sm:p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <BarChart3 className="h-5 w-5 text-primary" />
                تطور الحالات الشهري
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="h-[300px] sm:h-[350px]">
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={casesChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="حالات جديدة" fill="#3b82f6" />
                      <Bar dataKey="حالات متوقفة" fill="#ef4444" />
                      <Bar dataKey="حالات مكتملة" fill="#10b981" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Spending */}
          <Card className="p-4 sm:p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <DollarSign className="h-5 w-5 text-primary" />
                المصروفات الشهرية
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="h-[300px] sm:h-[350px]">
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={spendingChartData}>
                      <defs>
                        <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="المصروفات"
                        stroke="#f59e0b"
                        fillOpacity={1}
                        fill="url(#colorSpending)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dropped Cases Reasons */}
        {droppedReasonsChartData.length > 0 && (
          <Card className="p-4 sm:p-6 mb-8 sm:mb-12">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <AlertCircle className="h-5 w-5 text-primary" />
                أسباب توقف الحالات
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="h-[300px] sm:h-[350px]">
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={droppedReasonsChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {droppedReasonsChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RechartsPie>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monthly Details Table */}
        <Card className="p-4 sm:p-6 mb-8 sm:mb-12">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Calendar className="h-5 w-5 text-primary" />
              التفاصيل الشهرية
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-3 font-semibold">الشهر</th>
                    <th className="text-right p-3 font-semibold">حالات جديدة</th>
                    <th className="text-right p-3 font-semibold">حالات متوقفة</th>
                    <th className="text-right p-3 font-semibold">حالات مكتملة</th>
                    <th className="text-right p-3 font-semibold">المصروفات (جنيه)</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyReportData.map((month, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{month.monthLabel}</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 text-blue-600">
                          <TrendingUp className="h-4 w-4" />
                          {month.newCases}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <TrendingDown className="h-4 w-4" />
                          {month.droppedCases}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          {month.completedCases}
                        </span>
                      </td>
                      <td className="p-3 text-center font-semibold">
                        {Math.round(month.totalSpending).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Thank You Message */}
        <Card className="p-6 sm:p-8 text-center bg-gradient-to-br from-primary/10 to-charity/10 border-primary/20">
          <Heart className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold mb-3">شكراً لدعمكم الكريم</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            نلتزم بالشفافية الكاملة في عرض جميع البيانات والمصروفات.
            كل جنيه يتم إنفاقه بعناية لضمان تحقيق أقصى أثر إيجابي على حياة العائلات المحتاجة.
          </p>
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs sm:text-sm text-muted-foreground">
              جميع البيانات مستخرجة مباشرة من قاعدة البيانات وتخضع للمراجعة الدورية
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MonthlyDonorReport;

