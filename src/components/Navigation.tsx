import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Settings, Users, Home } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="flex items-center gap-6">
      <Link 
        to="/" 
        className={`flex items-center gap-2 text-white/80 hover:text-white transition-colors ${
          isActive('/') ? 'text-white font-medium' : ''
        }`}
      >
        <Home className="w-4 h-4" />
        <span className="hidden md:inline">الرئيسية</span>
      </Link>
      
      <Link 
        to="/cases" 
        className={`flex items-center gap-2 text-white/80 hover:text-white transition-colors ${
          isActive('/cases') ? 'text-white font-medium' : ''
        }`}
      >
        <Users className="w-4 h-4" />
        <span className="hidden md:inline">جميع الحالات</span>
      </Link>
      
      <Link 
        to="/auth" 
        className={`flex items-center gap-2 text-white/80 hover:text-white transition-colors ${
          isActive('/auth') ? 'text-white font-medium' : ''
        }`}
      >
        <Heart className="w-4 h-4" />
        <span className="hidden md:inline">تسجيل الدخول</span>
      </Link>
      
      <Link 
        to="/admin" 
        className={`flex items-center gap-2 text-white/80 hover:text-white transition-colors ${
          isActive('/admin') ? 'text-white font-medium' : ''
        }`}
      >
        <Settings className="w-4 h-4" />
        <span className="hidden md:inline">لوحة التحكم</span>
      </Link>
    </nav>
  );
};

export default Navigation;