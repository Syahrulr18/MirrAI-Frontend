import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Eye, Shield, MessageCircleWarning, Gauge, Moon, Sun } from "lucide-react";
import { Button } from "../components/ui";
import { useTheme } from "../app/ThemeProvider";
import { Footer } from "../components/layout/Footer";

const pageTransition = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.2 },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.08 },
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.42, ease: "easeOut" } },
};

const features = [
  { icon: Eye, key: "eyeContact" },
  { icon: Shield, key: "posture" },
  { icon: MessageCircleWarning, key: "filler" },
  { icon: Gauge, key: "wpm" },
] as const;

export default function LandingPage() {
  const { t, i18n } = useTranslation(["landing", "common"]);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.div {...pageTransition} className="min-h-[100dvh] bg-surface dark:bg-surface-dark flex flex-col">
      {/* ─── Navbar ───────────────────────────────────────── */}
      <nav className="sticky top-0 z-sticky-nav bg-white/95 dark:bg-surface-dark/95 backdrop-blur-sm border-b-3 border-neutral">
        <div className="max-w-content mx-auto px-app-gap flex items-center justify-between h-16">
          <span className="text-2xl font-hero text-neutral dark:text-white select-none">
            MirrAI
          </span>
          <div className="flex items-center gap-3">
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
              className="p-2 rounded-neu border-2 border-neutral/30 hover:border-neutral hover:bg-neutral/5 transition-all duration-150 focus-neu dark:border-white/30 dark:hover:border-white dark:hover:bg-white/5 text-neutral dark:text-white"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/login")}
            >
              {t("common:buttons.login", "Log In")}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/register")}
            >
              {t("common:buttons.register", "Sign Up")}
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* ─── Hero Section ────────────────────────────────── */}
        <section className="max-w-content mx-auto px-app-gap py-section-gap">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy + CTA */}
            <motion.div variants={staggerContainer} initial="initial" animate="animate">
              <motion.h1
                variants={fadeInUp}
                className="text-hero font-hero text-neutral dark:text-white leading-tight mb-4"
              >
                {t("hero.title")}
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="text-lg text-neutral/70 dark:text-white/60 mb-2 font-medium"
              >
                {t("hero.subtitle")}
              </motion.p>
              <motion.div variants={fadeInUp} className="h-1 w-16 bg-primary rounded-full mb-8" />
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate("/register")}
                >
                  {t("hero.cta")}
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {t("hero.secondaryCta")}
                </Button>
              </motion.div>
            </motion.div>

            {/* Right: Camera mirror frame preview */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className="relative"
            >
              <div
                className="
                  aspect-[4/3] rounded-neu-lg border-4 border-neutral
                  bg-gradient-to-br from-neutral/5 to-neutral/10
                  dark:from-white/5 dark:to-white/10
                  shadow-neu-lg overflow-hidden
                  relative
                "
                style={{
                  boxShadow: "inset 0 2px 8px rgba(0,0,0,0.1), 6px 6px 0 #1A1A1A",
                }}
              >
                {/* Mirror-like gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 dark:via-white/3 dark:to-white/8" />

                {/* Mock webcam content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
                  <div className="w-20 h-20 rounded-full border-4 border-success bg-success/10 flex items-center justify-center">
                    <Eye size={32} className="text-success" />
                  </div>
                  <div className="flex gap-3">
                    <div className="card-neu px-3 py-1.5 flex items-center gap-2">
                      <span className="label-caps text-success">WPM</span>
                      <span className="mono-display text-lg">142</span>
                    </div>
                    <div className="card-neu px-3 py-1.5 flex items-center gap-2">
                      <span className="label-caps text-secondary">FILLERS</span>
                      <span className="mono-display text-lg">3</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── Features Zig-Zag ────────────────────────────── */}
        <section id="features" className="max-w-content mx-auto px-app-gap pb-section-gap">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-16 lg:space-y-24"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isReversed = index % 2 === 1;

              return (
                <motion.div
                  key={feature.key}
                  variants={fadeInUp}
                  className={`
                    grid grid-cols-1 lg:grid-cols-5 gap-8 items-center
                    ${isReversed ? "lg:direction-rtl" : ""}
                  `}
                >
                  {/* Icon side */}
                  <div
                    className={`
                      lg:col-span-2 flex justify-center
                      ${isReversed ? "lg:order-2" : "lg:order-1"}
                    `}
                  >
                    <motion.div
                      className="w-32 h-32 border-3 border-neutral rounded-neu shadow-neu
                        bg-primary/10 dark:bg-primary/5 flex items-center justify-center"
                      whileHover={{ x: -2, y: -2, transition: { duration: 0.15 } }}
                    >
                      <Icon size={48} className="text-neutral dark:text-white" strokeWidth={2} />
                    </motion.div>
                  </div>

                  {/* Text side */}
                  <div
                    className={`
                      lg:col-span-3
                      ${isReversed ? "lg:order-1 lg:text-right" : "lg:order-2"}
                    `}
                  >
                    <h2 className="text-2xl font-bold text-neutral dark:text-white mb-3">
                      {t(`features.${feature.key}.title`)}
                    </h2>
                    <p className="text-neutral/70 dark:text-white/60 text-lg leading-relaxed">
                      {t(`features.${feature.key}.description`)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* ─── CTA Bottom ──────────────────────────────────── */}
        <section className="border-t-3 border-neutral bg-primary/5 dark:bg-primary/3">
          <div className="max-w-content mx-auto px-app-gap py-20 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.42 }}
              className="text-3xl font-bold text-neutral dark:text-white mb-6"
            >
              {t("hero.title")}
            </motion.h2>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/register")}
            >
              {t("hero.cta")}
            </Button>
          </div>
        </section>
      </main>

      {/* ─── Footer ──────────────────────────────────────── */}
      <Footer />
    </motion.div>
  );
}
