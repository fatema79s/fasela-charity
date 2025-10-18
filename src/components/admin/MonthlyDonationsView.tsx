import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

interface MonthlyDonationData {
  month: string;
  displayMonth: string;
  totalDonations: number;
  totalHandedOver: number;
  readyToHandover: number;
  confirmedCount: number;
}

export const MonthlyDonationsView = () => {
  const { data: monthlyData, isLoading } = useQuery({
    queryKey: ["monthly-donations"],
    queryFn: async () => {
      // Fetch all confirmed donations
      const { data: donations, error: donationsError } = await supabase
        .from("donations")
        .select("id, amount, confirmed_at, total_handed_over")
        .eq("status", "confirmed")
        .order("confirmed_at", { ascending: false });

      if (donationsError) throw donationsError;

      // Group by month
      const monthlyGroups: { [key: string]: MonthlyDonationData } = {};

      donations?.forEach((donation) => {
        if (!donation.confirmed_at) return;

        const date = parseISO(donation.confirmed_at);
        const monthKey = format(date, "yyyy-MM");
        const displayMonth = format(date, "MMMM yyyy", { locale: ar });

        if (!monthlyGroups[monthKey]) {
          monthlyGroups[monthKey] = {
            month: monthKey,
            displayMonth,
            totalDonations: 0,
            totalHandedOver: 0,
            readyToHandover: 0,
            confirmedCount: 0,
          };
        }

        const amount = parseFloat(donation.amount.toString());
        const handedOver = parseFloat((donation.total_handed_over || 0).toString());
        const remaining = amount - handedOver;

        monthlyGroups[monthKey].totalDonations += amount;
        monthlyGroups[monthKey].totalHandedOver += handedOver;
        monthlyGroups[monthKey].readyToHandover += remaining;
        monthlyGroups[monthKey].confirmedCount += 1;
      });

      // Convert to array and sort by month descending
      return Object.values(monthlyGroups).sort((a, b) => 
        b.month.localeCompare(a.month)
      );
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!monthlyData || monthlyData.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          لا توجد تبرعات مؤكدة
        </CardContent>
      </Card>
    );
  }

  // Calculate totals
  const totals = monthlyData.reduce(
    (acc, month) => ({
      totalDonations: acc.totalDonations + month.totalDonations,
      totalHandedOver: acc.totalHandedOver + month.totalHandedOver,
      readyToHandover: acc.readyToHandover + month.readyToHandover,
      confirmedCount: acc.confirmedCount + month.confirmedCount,
    }),
    { totalDonations: 0, totalHandedOver: 0, readyToHandover: 0, confirmedCount: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl">ملخص التبرعات الشهرية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">إجمالي التبرعات</p>
              <p className="text-2xl font-bold text-primary">
                {totals.totalDonations.toFixed(2)} ج.م
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">تم التسليم</p>
              <p className="text-2xl font-bold text-green-600">
                {totals.totalHandedOver.toFixed(2)} ج.م
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">جاهز للتسليم</p>
              <p className="text-2xl font-bold text-orange-600">
                {totals.readyToHandover.toFixed(2)} ج.م
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">عدد التبرعات</p>
              <p className="text-2xl font-bold">{totals.confirmedCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">التفصيل الشهري</h3>
        {monthlyData.map((month) => {
          const handoverPercentage = (month.totalHandedOver / month.totalDonations) * 100;
          
          return (
            <Card key={month.month} className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center justify-between">
                  <span>{month.displayMonth}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {month.confirmedCount} تبرع
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">نسبة التسليم</span>
                      <span className="font-medium">{handoverPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300"
                        style={{ width: `${handoverPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Amounts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="bg-primary/5 rounded-lg p-3 space-y-1">
                      <p className="text-xs text-muted-foreground">إجمالي التبرعات</p>
                      <p className="text-lg font-bold text-primary">
                        {month.totalDonations.toFixed(2)} ج.م
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 space-y-1">
                      <p className="text-xs text-muted-foreground">تم التسليم</p>
                      <p className="text-lg font-bold text-green-700">
                        {month.totalHandedOver.toFixed(2)} ج.م
                      </p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3 space-y-1">
                      <p className="text-xs text-muted-foreground">جاهز للتسليم</p>
                      <p className="text-lg font-bold text-orange-700">
                        {month.readyToHandover.toFixed(2)} ج.م
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
