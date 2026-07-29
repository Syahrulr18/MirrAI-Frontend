import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Moon, Sun, LogOut, LayoutDashboard, LineChart, BookOpen, FileText, User } from "lucide-react";
import { useTheme } from "../../app/ThemeProvider";
import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../lib/supabase";
import { Footer } from "./Footer";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation("common");
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuthStore();

  const isPracticeRoom = location.pathname.includes("/practice/room");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const navItems = [
    { label: t("nav.dashboard"), path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: t("nav.progress"), path: "/progress", icon: <LineChart size={20} /> },
    { label: t("nav.learning"), path: "/learning", icon: <BookOpen size={20} /> },
    { label: t("nav.templates"), path: "/templates", icon: <FileText size={20} /> },
    { label: "Writer", path: "/script-writer", icon: <FileText size={20} /> },
    { label: t("nav.profile"), path: "/profile", icon: <User size={20} /> },
  ];

  if (isPracticeRoom) {
    return <>{children}</>; // No shell in practice room (full screen focus)
  }

  return (
    <div className="min-h-[100dvh] bg-transparent pb-16 md:pb-0 flex flex-col">
      {/* Desktop Header */}
      <header className="sticky top-0 z-sticky-nav bg-white/95 dark:bg-surface-dark/95 backdrop-blur-sm border-b-3 border-neutral shadow-sm">
        <div className="max-w-content mx-auto px-app-gap flex items-center justify-between h-16">
          <div 
            className="cursor-pointer select-none flex items-center"
            onClick={() => navigate("/dashboard")}
          >
            <img src="/logo_MirrAI.svg" alt="MirrAI Logo" className="h-8 dark:invert" />
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`text-sm transition-colors ${
                    isActive 
                      ? "font-semibold text-neutral dark:text-white border-l-3 border-primary pl-2" 
                      : "text-neutral/60 dark:text-white/50 hover:text-neutral dark:hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            
            <div className="flex items-center ml-4 border-l-2 border-neutral/10 dark:border-white/10 pl-4 gap-3">
              <select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="p-1.5 px-2 rounded-neu border-2 border-neutral/30 hover:border-neutral transition-all duration-150 focus-neu bg-transparent text-sm font-bold text-neutral dark:text-white dark:border-white/30 dark:hover:border-white cursor-pointer"
                aria-label="Change language"
              >
                <option value="en" className="text-neutral">EN</option>
                <option value="id" className="text-neutral">ID</option>
              </select>

              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-neu border-2 border-neutral/30 hover:border-neutral hover:bg-neutral/5 transition-all duration-150 focus-neu dark:border-white/30 dark:hover:border-white dark:hover:bg-white/5 text-neutral dark:text-white"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-neu border-2 border-error/50 hover:border-error hover:bg-error/10 transition-all duration-150 focus-neu text-error dark:text-error"
                aria-label="Log out"
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      <Footer />

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-sticky-nav bg-white dark:bg-card-dark border-t-3 border-neutral shadow-[0_-4px_0_rgba(26,26,26,0.1)] flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? "text-primary dark:text-primary" : "text-neutral/50 dark:text-white/40"
              }`}
            >
              <div className={`${isActive ? "animate-bounce" : ""}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
