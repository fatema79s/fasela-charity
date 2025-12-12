import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Settings, Users, Home, Route } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

const Navigation = () => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    // Set up auth state listener
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

    // Check for existing session
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

  return (
    <nav className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-full border border-white/20 shadow-lg">
      <Link
        to="/"
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${isActive('/')
            ? 'bg-white text-primary font-bold shadow-sm scale-105'
            : 'text-white/90 hover:bg-white/10 hover:text-white'
          }`}
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">الرئيسية</span>
      </Link>

      <Link
        to="/case-pipeline"
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${isActive('/case-pipeline')
            ? 'bg-white text-primary font-bold shadow-sm scale-105'
            : 'text-white/90 hover:bg-white/10 hover:text-white'
          }`}
      >
        <Route className="w-4 h-4" />
        <span className="hidden sm:inline">رحلة الكفالة</span>
      </Link>

      {!user && (
        <Link
          to="/auth"
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${isActive('/auth')
              ? 'bg-white text-primary font-bold shadow-sm scale-105'
              : 'text-white/90 hover:bg-white/10 hover:text-white'
            }`}
        >
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">تسجيل الدخول</span>
        </Link>
      )}

      {user && isAdmin && (
        <Link
          to="/admin"
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${isActive('/admin')
              ? 'bg-white text-primary font-bold shadow-sm scale-105'
              : 'text-white/90 hover:bg-white/10 hover:text-white'
            }`}
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">لوحة التحكم</span>
        </Link>
      )}
    </nav>
  );
};

export default Navigation;