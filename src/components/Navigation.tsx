import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Heart, Settings, Users, Home, Route, Menu, X, Sparkles, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const Navigation = () => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            checkUserRole(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        checkUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (!error && data?.role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const navLinks = [
    { to: "/", icon: Home, label: "الرئيسية" },
    { to: "/fasela50", icon: Sparkles, label: "فسيلة ٥٠" },
    { to: "/case-pipeline", icon: Route, label: "رحلة الكفالة" },
  ];

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      try { queryClient.clear(); } catch (e) {}
      navigate('/auth');
      toast({ title: 'تم تسجيل الخروج', description: 'تم تسجيل الخروج بنجاح' });
    } catch (error: any) {
      console.error('Error signing out', error);
      toast({ title: 'خطأ أثناء تسجيل الخروج', description: error?.message || 'فشل في تسجيل الخروج', variant: 'destructive' });
    }
  }

  const NavLink = ({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) => (
    <Link
      to={to}
      onClick={() => setIsMobileMenuOpen(false)}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
        isActive(to)
          ? 'bg-white text-primary font-bold shadow-sm scale-105'
          : 'text-white/90 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </Link>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-full border border-white/20 shadow-lg">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
              isActive(link.to)
                ? 'bg-white text-primary font-bold shadow-sm scale-105'
                : 'text-white/90 hover:bg-white/10 hover:text-white'
            }`}
          >
            <link.icon className="w-4 h-4" />
            <span>{link.label}</span>
          </Link>
        ))}

        {!user && (
          <Link
            to="/auth"
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
              isActive('/auth')
                ? 'bg-white text-primary font-bold shadow-sm scale-105'
                : 'text-white/90 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>تسجيل الدخول</span>
          </Link>
        )}

        {user && isAdmin && (
          <Link
            to="/admin"
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
              isActive('/admin')
                ? 'bg-white text-primary font-bold shadow-sm scale-105'
                : 'text-white/90 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>لوحة التحكم</span>
          </Link>
        )}

        {user && (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-white/90 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        )}
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white"
      >
        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-primary to-primary/90 z-50 transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white">القائمة</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <NavLink key={link.to} {...link} />
            ))}

            {!user && (
              <NavLink to="/auth" icon={Users} label="تسجيل الدخول" />
            )}

            {user && isAdmin && (
              <NavLink to="/admin" icon={Settings} label="لوحة التحكم" />
            )}

            {user && (
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleSignOut(); }}
                className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-white"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navigation;