import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Card } from "../components/ui";
import { SkeletonChart } from "../components/loading/SkeletonBlock";

const pageTransition = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.2 },
};

export default function ProgressAnalyticsPage() {
  const { t } = useTranslation("common");

  return (
    <motion.div {...pageTransition}>
      <main className="max-w-content mx-auto px-app-gap pt-8 pb-20 md:pb-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-bold text-neutral dark:text-white mb-4">Filler Word Trend</h3>
            <div className="aspect-[2/1] bg-neutral/5 dark:bg-white/5 rounded-neu border-2 border-neutral/10 flex items-center justify-center">
              <p className="text-neutral/30 dark:text-white/20">Chart will appear here</p>
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-neutral dark:text-white mb-4">Eye Contact Trend</h3>
            <div className="aspect-[2/1] bg-neutral/5 dark:bg-white/5 rounded-neu border-2 border-neutral/10 flex items-center justify-center">
              <p className="text-neutral/30 dark:text-white/20">Chart will appear here</p>
            </div>
          </Card>
        </div>

        <Card>
          <h3 className="font-bold text-neutral dark:text-white mb-4">Practice Consistency</h3>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-sm border-2 border-neutral/10 bg-neutral/5 dark:bg-white/5"
              />
            ))}
          </div>
        </Card>
      </main>
    </motion.div>
  );
}
