import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { User, Moon, Sun, Globe } from "lucide-react";
import { Card, Button } from "../components/ui";
import { useTheme } from "../app/ThemeProvider";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabase";

const pageTransition = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.2 },
};

export default function ProfilePage() {
  const { t, i18n } = useTranslation("common");
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuthStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <motion.div {...pageTransition}>
      <main className="max-w-md mx-auto px-app-gap pt-8 pb-20 md:pb-8 space-y-6">
        {/* Profile card */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-neu border-3 border-neutral bg-primary/10 flex items-center justify-center overflow-hidden">
              <User size={28} className="text-neutral dark:text-white" />
            </div>
            <div className="overflow-hidden">
              <h2 className="font-bold text-xl text-neutral dark:text-white truncate">
                {user?.displayName || "User"}
              </h2>
              <p className="text-neutral/50 dark:text-white/40 truncate text-sm">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
        </Card>

        {/* Theme toggle */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon size={20} className="text-neutral dark:text-white" /> : <Sun size={20} className="text-neutral" />}
              <span className="font-semibold text-neutral dark:text-white">
                {theme === "dark" ? t("theme.dark") : t("theme.light")}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              Toggle
            </Button>
          </div>
        </Card>

        {/* Language switcher */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-neutral dark:text-white" />
              <span className="font-semibold text-neutral dark:text-white">
                {t(`language.${i18n.language}`)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={i18n.language === "en" ? "primary" : "ghost"}
                size="sm"
                onClick={() => i18n.changeLanguage("en")}
              >
                EN
              </Button>
              <Button
                variant={i18n.language === "id" ? "primary" : "ghost"}
                size="sm"
                onClick={() => i18n.changeLanguage("id")}
              >
                ID
              </Button>
            </div>
          </div>
        </Card>

        <Button variant="secondary" fullWidth onClick={handleLogout}>
          {t("buttons.logout")}
        </Button>
      </main>
    </motion.div>
  );
}
