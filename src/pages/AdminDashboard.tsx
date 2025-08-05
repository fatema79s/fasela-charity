import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, LogOut, FileText, Users, BarChart3, CreditCard, Home, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import CaseForm from "@/components/admin/CaseForm";
import CasesList from "@/components/admin/CasesList";
import ReportForm from "@/components/admin/ReportForm";
import ReportsList from "@/components/admin/ReportsList";
import { DonationsManagement } from "@/components/admin/DonationsManagement";

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate("/auth");
        } else {
          checkUserRole(session.user.id);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session?.user) {
        navigate("/auth");
      } else {
        checkUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.error("Error checking user role:", error);
        return;
      }

      const hasAdminRole = data?.some(role => role.role === "admin") || false;
      setIsAdmin(hasAdminRole || false);
      
      if (!hasAdminRole) {
        toast({
          title: "غير مخول",
          description: "ليس لديك صلاحية للوصول إلى لوحة التحكم",
          variant: "destructive",
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Error checking user role:", error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
      });
    } else {
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل الخروج بنجاح",
      });
      navigate("/auth");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl">جار التحميل...</div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-primary" />
                <span className="text-xl font-bold">فَسِيلَة خير</span>
              </div>
              <nav className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/" className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    الرئيسية
                  </Link>
                </Button>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <h1 className="text-lg font-semibold">لوحة تحكم المتطوعين</h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Button variant="outline" onClick={handleSignOut} className="text-sm">
                <LogOut className="w-4 h-4 ml-2" />
                خروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1">
            <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">نظرة عامة</span>
              <span className="sm:hidden">عامة</span>
            </TabsTrigger>
            <TabsTrigger value="cases" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">إدارة الحالات</span>
              <span className="sm:hidden">الحالات</span>
            </TabsTrigger>
            <TabsTrigger value="donations" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">التبرعات</span>
              <span className="sm:hidden">تبرعات</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">التقارير</span>
              <span className="sm:hidden">تقارير</span>
            </TabsTrigger>
            <TabsTrigger value="add-case" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm col-span-2 sm:col-span-1">
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">إضافة حالة</span>
              <span className="sm:hidden">إضافة</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <StatsOverview />
          </TabsContent>

          <TabsContent value="cases">
            <CasesList />
          </TabsContent>

          <TabsContent value="donations">
            <DonationsManagement />
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">التقارير الشهرية</h2>
                <ReportForm />
              </div>
              <ReportsList />
            </div>
          </TabsContent>

          <TabsContent value="add-case">
            <div className="max-w-2xl">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">إضافة حالة جديدة</h2>
              <CaseForm />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const StatsOverview = () => {
  const { data: cases } = useQuery({
    queryKey: ["admin-cases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("*");
      if (error) throw error;
      return data;
    }
  });

  const { data: donations } = useQuery({
    queryKey: ["admin-donations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*");
      if (error) throw error;
      return data;
    }
  });

  const { data: reports } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("monthly_reports")
        .select("*")
        .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
      if (error) throw error;
      return data;
    }
  });

  const totalCases = cases?.length || 0;
  const activeCases = cases?.filter(c => c.status === 'active').length || 0;
  const totalDonations = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
  const monthlyReports = reports?.length || 0;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الحالات</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCases}</div>
          <p className="text-xs text-muted-foreground">جميع الحالات المسجلة</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الحالات النشطة</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCases}</div>
          <p className="text-xs text-muted-foreground">{totalCases > 0 ? Math.round((activeCases / totalCases) * 100) : 0}% من إجمالي الحالات</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي التبرعات</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDonations.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">جنيه مصري</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">التقارير هذا الشهر</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{monthlyReports}</div>
          <p className="text-xs text-muted-foreground">تقرير شهري</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;