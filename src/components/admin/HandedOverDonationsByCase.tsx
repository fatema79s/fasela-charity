import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, User, Calendar, Package } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface HandedOverDonation {
  id: string;
  case_id: string;
  donor_name: string | null;
  donor_email: string | null;
  amount: number;
  months_pledged: number;
  payment_code: string;
  donation_type: string;
  payment_reference: string | null;
  admin_notes: string | null;
  created_at: string;
  confirmed_at: string | null;
}

interface CaseWithHandedOverDonations {
  id: string;
  title: string;
  title_ar: string;
  monthly_cost: number;
  total_secured_money: number;
  months_covered: number;
  status: string;
  handedOverDonations: HandedOverDonation[];
}

export const HandedOverDonationsByCase = () => {
  const [openCases, setOpenCases] = useState<Set<string>>(new Set());

  const { data: casesWithHandedOverDonations, isLoading } = useQuery({
    queryKey: ["handed-over-donations-by-case"],
    queryFn: async () => {
      // First get all cases
      const { data: cases, error: casesError } = await supabase
        .from("cases")
        .select("id, title, title_ar, monthly_cost, total_secured_money, months_covered, status")
        .eq("is_published", true)
        .order("title_ar");

      if (casesError) throw casesError;

      // Then get all handed over (redeemed) donations for these cases
      const { data: handedOverDonations, error: donationsError } = await supabase
        .from("donations")
        .select("*")
        .eq("status", "redeemed")
        .in("case_id", cases.map(c => c.id))
        .order("created_at", { ascending: false });

      if (donationsError) throw donationsError;

      // Group handed over donations by case
      const casesWithHandedOverDonations: CaseWithHandedOverDonations[] = cases.map(caseItem => ({
        ...caseItem,
        handedOverDonations: handedOverDonations.filter(d => d.case_id === caseItem.id)
      })).filter(caseItem => caseItem.handedOverDonations.length > 0); // Only show cases with handed over donations

      return casesWithHandedOverDonations;
    }
  });

  const toggleCase = (caseId: string) => {
    const newOpenCases = new Set(openCases);
    if (newOpenCases.has(caseId)) {
      newOpenCases.delete(caseId);
    } else {
      newOpenCases.add(caseId);
    }
    setOpenCases(newOpenCases);
  };

  const getHandedOverStats = (donations: HandedOverDonation[]) => {
    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
    const totalDonations = donations.length;
    const monthlyDonations = donations.filter(d => d.donation_type === 'monthly').length;
    const customDonations = donations.filter(d => d.donation_type === 'custom').length;
    
    return {
      totalAmount,
      totalDonations,
      monthlyDonations,
      customDonations,
    };
  };

  // Calculate overall totals
  const overallStats = casesWithHandedOverDonations?.reduce((acc, caseItem) => {
    const caseStats = getHandedOverStats(caseItem.handedOverDonations);
    return {
      totalAmount: acc.totalAmount + caseStats.totalAmount,
      totalDonations: acc.totalDonations + caseStats.totalDonations,
      totalCases: acc.totalCases + 1,
    };
  }, { totalAmount: 0, totalDonations: 0, totalCases: 0 }) || { totalAmount: 0, totalDonations: 0, totalCases: 0 };

  if (isLoading) {
    return <div className="text-center py-8">جار التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">التبرعات المسلمة حسب الحالة</h2>
          <div className="mt-2 p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
            <div className="text-lg font-bold text-primary">
              إجمالي التبرعات المسلمة: {overallStats.totalAmount.toLocaleString()} جنيه
            </div>
            <div className="text-sm text-muted-foreground">
              من {overallStats.totalDonations} تبرع مسلم في {overallStats.totalCases} حالة
            </div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {casesWithHandedOverDonations?.length || 0} حالة لديها تبرعات مسلمة
        </div>
      </div>

      <div className="space-y-4">
        {casesWithHandedOverDonations?.map((caseItem) => {
          const stats = getHandedOverStats(caseItem.handedOverDonations);
          const isOpen = openCases.has(caseItem.id);
          
          return (
            <Card key={caseItem.id} className="overflow-hidden">
              <Collapsible>
                <CollapsibleTrigger 
                  className="w-full" 
                  onClick={() => toggleCase(caseItem.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 text-right">
                        <CardTitle className="text-base sm:text-lg">
                          {caseItem.title_ar}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <span>التكلفة الشهرية: {caseItem.monthly_cost?.toLocaleString()} ج.م</span>
                          <span>•</span>
                          <span>المؤمن: {caseItem.total_secured_money?.toLocaleString()} ج.م</span>
                          <span>•</span>
                          <span>الأشهر المغطاة: {caseItem.months_covered || 0}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-primary">
                            {stats.totalAmount.toLocaleString()} ج.م مسلم
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {stats.totalDonations} تبرع مسلم
                          </div>
                        </div>
                        <ChevronDown 
                          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        <Package className="w-3 h-3 ml-1" />
                        مسلم: {stats.totalDonations}
                      </Badge>
                      {stats.monthlyDonations > 0 && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          شهري: {stats.monthlyDonations}
                        </Badge>
                      )}
                      {stats.customDonations > 0 && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          مخصص: {stats.customDonations}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">المتبرع</TableHead>
                            <TableHead className="text-right">المبلغ</TableHead>
                            <TableHead className="text-right">النوع</TableHead>
                            <TableHead className="text-right">كود الدفع</TableHead>
                            <TableHead className="text-right">تاريخ التبرع</TableHead>
                            <TableHead className="text-right">تاريخ التأكيد</TableHead>
                            <TableHead className="text-right">ملاحظات الإدارة</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {caseItem.handedOverDonations.map((donation) => (
                            <TableRow key={donation.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <div>
                                    <div className="font-medium">
                                      {donation.donor_name || 'متبرع مجهول'}
                                    </div>
                                    {donation.donor_email && (
                                      <div className="text-xs text-muted-foreground">
                                        {donation.donor_email}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium text-primary">
                                  {donation.amount.toLocaleString()} ج.م
                                </div>
                                {donation.donation_type === 'monthly' && (
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {donation.months_pledged} شهر
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {donation.donation_type === 'monthly' ? 'شهري' : 'مخصص'}
                              </TableCell>
                              <TableCell>
                                <span className="font-mono text-sm">
                                  {donation.payment_code}
                                </span>
                              </TableCell>
                              <TableCell>
                                {new Date(donation.created_at).toLocaleDateString('ar-SA')}
                              </TableCell>
                              <TableCell>
                                {donation.confirmed_at 
                                  ? new Date(donation.confirmed_at).toLocaleDateString('ar-SA')
                                  : '-'
                                }
                              </TableCell>
                              <TableCell>
                                <div className="text-xs text-muted-foreground max-w-32 truncate">
                                  {donation.admin_notes || '-'}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
        
        {(!casesWithHandedOverDonations || casesWithHandedOverDonations.length === 0) && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">لا توجد تبرعات مسلمة بعد</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};