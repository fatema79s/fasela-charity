import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LogOut, 
  FileText, 
  Users, 
  BarChart3, 
  CreditCard, 
  Home, 
  Heart, 
  Calendar, 
  CheckSquare,
  ArrowLeft,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminHeaderProps {
  title?: string;
  showBackButton?: boolean;
  backTo?: string;
  backLabel?: string;
  children?: React.ReactNode;
}

export default function AdminHeader({ 
  title = "لوحة التحكم", 
  showBackButton = false,
  backTo = "/admin",
  backLabel = "العودة للوحة التحكم",
  children 
}: AdminHeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
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
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!isAdmin) {
    return null;
  }

  const isActiveTab = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Button variant="outline" asChild>
                  <Link to={backTo}>
                    <ArrowLeft className="h-4 w-4 ml-2" />
                    {backLabel}
                  </Link>
                </Button>
              )}
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                مرحباً، {user?.email}
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 ml-2" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <Tabs value={location.pathname} className="w-full">
            <TabsList className="grid w-full grid-cols-6 lg:grid-cols-9 h-auto p-1 bg-gray-100">
              <TabsTrigger 
                value="/admin" 
                asChild
                className={`flex flex-col sm:flex-row items-center gap-1 text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 ${
                  isActiveTab("/admin") ? "bg-white shadow-sm" : ""
                }`}
              >
                <Link to="/admin">
                  <Home className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">الرئيسية</span>
                  <span className="sm:hidden text-[10px] leading-tight">رئيسية</span>
                </Link>
              </TabsTrigger>
              
              <TabsTrigger 
                value="/admin/cases" 
                asChild
                className={`flex flex-col sm:flex-row items-center gap-1 text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 ${
                  isActiveTab("/admin/cases") ? "bg-white shadow-sm" : ""
                }`}
              >
                <Link to="/admin/cases">
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">الحالات</span>
                  <span className="sm:hidden text-[10px] leading-tight">حالات</span>
                </Link>
              </TabsTrigger>
              
              <TabsTrigger 
                value="/admin/donation-audit" 
                asChild
                className={`flex flex-col sm:flex-row items-center gap-1 text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 ${
                  isActiveTab("/admin/donation-audit") ? "bg-white shadow-sm" : ""
                }`}
              >
                <Link to="/admin/donation-audit">
                  <CreditCard className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">مراجعة التبرعات</span>
                  <span className="sm:hidden text-[10px] leading-tight">تبرعات</span>
                </Link>
              </TabsTrigger>
              
              <TabsTrigger 
                value="/admin/monthly-donations" 
                asChild
                className={`flex flex-col sm:flex-row items-center gap-1 text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 ${
                  isActiveTab("/admin/monthly-donations") ? "bg-white shadow-sm" : ""
                }`}
              >
                <Link to="/admin/monthly-donations">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">التبرعات الشهرية</span>
                  <span className="sm:hidden text-[10px] leading-tight">شهرية</span>
                </Link>
              </TabsTrigger>
              
              <TabsTrigger 
                value="/admin/followups" 
                asChild
                className={`flex flex-col sm:flex-row items-center gap-1 text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 ${
                  isActiveTab("/admin/followups") ? "bg-white shadow-sm" : ""
                }`}
              >
                <Link to="/admin/followups">
                  <CheckSquare className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">المتابعات</span>
                  <span className="sm:hidden text-[10px] leading-tight">متابعات</span>
                </Link>
              </TabsTrigger>
              
              <TabsTrigger 
                value="/admin/reports" 
                asChild
                className={`flex flex-col sm:flex-row items-center gap-1 text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 ${
                  isActiveTab("/admin/reports") ? "bg-white shadow-sm" : ""
                }`}
              >
                <Link to="/admin/reports">
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">التقارير</span>
                  <span className="sm:hidden text-[10px] leading-tight">تقارير</span>
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
}
