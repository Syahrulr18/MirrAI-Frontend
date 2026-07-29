import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Flame, TrendingUp, BookOpen, Play, ArrowRight, FileText } from "lucide-react";
import { Card, Button } from "../components/ui";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

const pageTransition = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.2 },
};

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.42, ease: "easeOut" } },
};

export default function DashboardPage() {
  const { t, i18n } = useTranslation("common");
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const lang = i18n.language;

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await api.get("/api/gamification/stats");
      return res.data.data;
    },
  });

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return lang === "id" ? "Selamat Pagi" : "Good Morning";
    if (hour < 17) return lang === "id" ? "Selamat Siang" : "Good Afternoon";
    return lang === "id" ? "Selamat Malam" : "Good Evening";
  })();

  return (
    <motion.div {...pageTransition}>
      <main className="max-w-content mx-auto px-app-gap pt-8 pb-20 md:pb-8">
        {/* Greeting */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-neutral dark:text-white mb-1">
            {greeting}, {user?.displayName || "Speaker"}!
          </h1>
          <p className="text-neutral/60 dark:text-white/50">
            {lang === "id"
              ? "Siap meningkatkan kemampuan public speaking Anda?"
              : "Ready to level up your public speaking?"}
          </p>
        </motion.div>

        {/* Quick stats */}
        <motion.div
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <motion.div variants={fadeInUp}>
            <Card clickable>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-neu bg-warning/20 border-2 border-neutral flex items-center justify-center">
                  <Flame size={24} className="text-warning" />
                </div>
                <div>
                  <p className="label-caps text-neutral/50 dark:text-white/40">Streak</p>
                  <p className="mono-display text-2xl text-neutral dark:text-white">
                    {stats?.currentStreak ?? 0}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card clickable>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-neu bg-tertiary/20 border-2 border-neutral flex items-center justify-center">
                  <TrendingUp size={24} className="text-tertiary" />
                </div>
                <div>
                  <p className="label-caps text-neutral/50 dark:text-white/40">
                    {lang === "id" ? "Skor" : "Avg Score"}
                  </p>
                  <p className="mono-display text-2xl text-neutral dark:text-white">
                    {stats?.avgScore ?? "--"}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card clickable onClick={() => navigate("/progress")}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-neu bg-success/20 border-2 border-neutral flex items-center justify-center">
                  <Play size={24} className="text-success" />
                </div>
                <div>
                  <p className="label-caps text-neutral/50 dark:text-white/40">
                    {lang === "id" ? "Sesi" : "Sessions"}
                  </p>
                  <p className="mono-display text-2xl text-neutral dark:text-white">
                    {stats?.totalSessions ?? 0}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card clickable onClick={() => navigate("/learning")}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-neu bg-primary/20 border-2 border-neutral flex items-center justify-center">
                  <BookOpen size={24} className="text-neutral dark:text-white" />
                </div>
                <div>
                  <p className="label-caps text-neutral/50 dark:text-white/40">
                    {lang === "id" ? "Modul" : "Modules"}
                  </p>
                  <p className="mono-display text-2xl text-neutral dark:text-white">6</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          {/* Start Practice CTA */}
          <Card className="bg-primary/5 dark:bg-primary/10 border-primary/50 py-10 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 border-3 border-neutral flex items-center justify-center mb-4">
              <Play size={28} className="text-neutral dark:text-white" />
            </div>
            <h2 className="text-xl font-bold text-neutral dark:text-white mb-2">
              {lang === "id" ? "Mulai Latihan Baru" : "Start a New Practice"}
            </h2>
            <p className="text-neutral/60 dark:text-white/50 mb-4 text-sm">
              {lang === "id"
                ? "Pilih mode, atur durasi, dan mulai latihan"
                : "Choose a mode, set duration, and start practicing"}
            </p>
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight size={18} />}
              onClick={() => navigate("/practice/setup")}
            >
              {t("buttons.startPractice")}
            </Button>
          </Card>

          {/* Browse Templates */}
          <Card className="bg-tertiary/5 dark:bg-tertiary/10 border-tertiary/50 py-10 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-tertiary/20 border-3 border-neutral flex items-center justify-center mb-4">
              <FileText size={28} className="text-neutral dark:text-white" />
            </div>
            <h2 className="text-xl font-bold text-neutral dark:text-white mb-2">
              {lang === "id" ? "Jelajahi Template" : "Browse Templates"}
            </h2>
            <p className="text-neutral/60 dark:text-white/50 mb-4 text-sm">
              {lang === "id"
                ? "Gunakan template naskah untuk latihan terarah"
                : "Use script templates for guided practice"}
            </p>
            <Button
              variant="secondary"
              size="lg"
              rightIcon={<ArrowRight size={18} />}
              onClick={() => navigate("/templates")}
            >
              {lang === "id" ? "Lihat Template" : "View Templates"}
            </Button>
          </Card>
        </motion.div>

        {/* Tip of the day */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate">
          <Card>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-neu bg-success/20 border-2 border-neutral flex items-center justify-center flex-shrink-0">
                <BookOpen size={18} className="text-success" />
              </div>
              <div>
                <h3 className="font-bold text-neutral dark:text-white mb-1">
                  {lang === "id" ? "Tips Hari Ini" : "Tip of the Day"}
                </h3>
                <p className="text-sm text-neutral/70 dark:text-white/60 leading-relaxed">
                  {lang === "id"
                    ? "Gunakan aturan 4-7-8 sebelum presentasi: tarik napas 4 detik, tahan 7 detik, hembuskan 8 detik. Ini membantu menenangkan saraf dan menstabilkan suara Anda."
                    : "Use the 4-7-8 rule before a presentation: breathe in for 4 seconds, hold for 7 seconds, breathe out for 8 seconds. This calms your nerves and stabilizes your voice."}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  rightIcon={<ArrowRight size={14} />}
                  onClick={() => navigate("/learning")}
                >
                  {lang === "id" ? "Pelajari Lebih Lanjut" : "Learn More"}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>
    </motion.div>
  );
}
