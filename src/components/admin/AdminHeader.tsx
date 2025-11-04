import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  FileText, 
  Users, 
  CreditCard, 
  Home, 
  Calendar, 
  CheckSquare,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
      <div className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Button variant="outline" size="sm" asChild>
                  <Link to={backTo}>
                    <ArrowRight className="h-4 w-4 ml-2" />
                    {backLabel}
                  </Link>
                </Button>
              )}
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h1>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:block text-sm text-muted-foreground">
                مرحباً، {user?.email}
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 ml-2" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
                <span className="sm:hidden">خروج</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              <Link
                to="/admin"
                className={cn(
                  "flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all rounded-t-lg whitespace-nowrap",
                  isActiveTab("/admin") && !isActiveTab("/admin/cases") && !isActiveTab("/admin/donation-audit") && !isActiveTab("/admin/monthly-donations") && !isActiveTab("/admin/followups") && !isActiveTab("/admin/reports")
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Home className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">الرئيسية</span>
              </Link>
              
              <Link
                to="/admin/cases"
                className={cn(
                  "flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all rounded-t-lg whitespace-nowrap",
                  isActiveTab("/admin/cases")
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Users className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">الحالات</span>
              </Link>
              
              <Link
                to="/admin/donation-audit"
                className={cn(
                  "flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all rounded-t-lg whitespace-nowrap",
                  isActiveTab("/admin/donation-audit")
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <CreditCard className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">مراجعة التبرعات</span>
              </Link>
              
              <Link
                to="/admin/monthly-donations"
                className={cn(
                  "flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all rounded-t-lg whitespace-nowrap",
                  isActiveTab("/admin/monthly-donations")
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">التبرعات الشهرية</span>
              </Link>
              
              <Link
                to="/admin/followups"
                className={cn(
                  "flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all rounded-t-lg whitespace-nowrap",
                  isActiveTab("/admin/followups")
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <CheckSquare className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">المتابعات</span>
              </Link>
              
              <Link
                to="/admin/reports"
                className={cn(
                  "flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all rounded-t-lg whitespace-nowrap",
                  isActiveTab("/admin/reports")
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">التقارير</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-4 sm:py-6">
        {children}
      </div>
    </div>
  );
}
