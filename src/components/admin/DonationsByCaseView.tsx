import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, User, Calendar, CreditCard } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Donation {
  id: string;
  case_id: string;
  donor_name: string | null;
  donor_email: string | null;
  amount: number;
  months_pledged: number;
  payment_code: string;
  status: string;
  donation_type: string;
  payment_reference: string | null;
  admin_notes: string | null;
  created_at: string;
  confirmed_at: string | null;
}

interface CaseWithDonations {
  id: string;
  title: string;
  title_ar: string;
  monthly_cost: number;
  total_secured_money: number;
  months_covered: number;
  status: string;
  donations: Donation[];
}

export const DonationsByCaseView = () => {
  const [openCases, setOpenCases] = useState<Set<string>>(new Set());

  const { data: casesWithDonations, isLoading } = useQuery({
    queryKey: ["donations-by-case"],
    queryFn: async () => {
      // First get all cases
      const { data: cases, error: casesError } = await supabase
        .from("cases")
        .select("id, title, title_ar, monthly_cost, total_secured_money, months_covered, status")
        .eq("is_published", true)
        .order("title_ar");

      if (casesError) throw casesError;

      // Then get all donations for these cases
      const { data: donations, error: donationsError } = await supabase
        .from("donations")
        .select("*")
        .in("case_id", cases.map(c => c.id))
        .order("created_at", { ascending: false });

      if (donationsError) throw donationsError;

      // Group donations by case
      const casesWithDonations: CaseWithDonations[] = cases.map(caseItem => ({
        ...caseItem,
        donations: donations.filter(d => d.case_id === caseItem.id)
      }));

      return casesWithDonations;
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">في الانتظار</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700">مؤكد</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700">ملغي</Badge>;
      case 'redeemed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">تم التسليم</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDonationStats = (donations: Donation[]) => {
    const stats = {
      total: donations.length,
      pending: donations.filter(d => d.status === 'pending').length,
      confirmed: donations.filter(d => d.status === 'confirmed').length,
      redeemed: donations.filter(d => d.status === 'redeemed').length,
      cancelled: donations.filter(d => d.status === 'cancelled').length,
      totalAmount: donations.reduce((sum, d) => sum + d.amount, 0),
      confirmedAmount: donations.filter(d => d.status === 'confirmed').reduce((sum, d) => sum + d.amount, 0),
      redeemedAmount: donations.filter(d => d.status === 'redeemed').reduce((sum, d) => sum + d.amount, 0),
    };
    return stats;
  };

  if (isLoading) {
    return <div className="text-center py-8">جار التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">التبرعات حسب الحالة</h2>
          <div className="mt-2 p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
            <div className="text-lg font-bold text-primary">
              إجمالي التبرعات المسلمة: {casesWithDonations?.reduce((total, caseItem) => 
                total + getDonationStats(caseItem.donations).redeemedAmount, 0)?.toLocaleString() || 0} جنيه
            </div>
            <div className="text-sm text-muted-foreground">
              من {casesWithDonations?.reduce((total, caseItem) => 
                total + getDonationStats(caseItem.donations).redeemed, 0) || 0} تبرع مسلم
            </div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {casesWithDonations?.length || 0} حالة
        </div>
      </div>

      <div className="space-y-4">
        {casesWithDonations?.map((caseItem) => {
          const stats = getDonationStats(caseItem.donations);
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
                          <div className="text-sm font-medium">
                            {stats.total} تبرع
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {stats.confirmedAmount.toLocaleString()} ج.م مؤكد
                          </div>
                        </div>
                        <ChevronDown 
                          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                        />
                      </div>
                    </div>
                    
                    {stats.total > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {stats.pending > 0 && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            في الانتظار: {stats.pending}
                          </Badge>
                        )}
                        {stats.confirmed > 0 && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            مؤكد: {stats.confirmed}
                          </Badge>
                        )}
                        {stats.redeemed > 0 && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            مسلم: {stats.redeemed}
                          </Badge>
                        )}
                        {stats.cancelled > 0 && (
                          <Badge variant="outline" className="bg-red-50 text-red-700">
                            ملغي: {stats.cancelled}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {caseItem.donations.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        لا توجد تبرعات لهذه الحالة
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-right">المتبرع</TableHead>
                              <TableHead className="text-right">المبلغ</TableHead>
                              <TableHead className="text-right">النوع</TableHead>
                              <TableHead className="text-right">كود الدفع</TableHead>
                              <TableHead className="text-right">الحالة</TableHead>
                              <TableHead className="text-right">تاريخ التبرع</TableHead>
                              <TableHead className="text-right">تاريخ التأكيد</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {caseItem.donations.map((donation) => (
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
                                  <div className="font-medium">
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
                                  <div className="flex items-center gap-1">
                                    <CreditCard className="w-3 h-3" />
                                    <span className="font-mono text-sm">
                                      {donation.payment_code}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(donation.status)}
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
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
};