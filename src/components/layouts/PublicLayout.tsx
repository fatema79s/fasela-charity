import { Outlet } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Heart } from "lucide-react";

const PublicLayout = () => {
    return (
        <div className="min-h-screen bg-background font-cairo">
            {/* Standardized Navigation Header */}
            <header className="gradient-hero text-white py-4 shadow-md z-50 relative">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                <Heart className="w-6 h-6 text-white" fill="white" />
                            </div>
                            <span className="text-xl font-bold text-white">فَسِيلَة خير</span>
                        </div>
                        <Navigation />
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <main>
                <Outlet />
            </main>

            {/* Optional: Standard Footer could go here */}
        </div>
    );
};

export default PublicLayout;
