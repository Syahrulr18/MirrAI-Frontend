import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../components/ui";
import api from "../lib/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from "recharts";
import { TrendingDown, Eye, Flame, BarChart3 } from "lucide-react";

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

interface TrendData {
  id: string;
  date: string;
  fillerWords: number;
  eyeContactPercent: number;
}

interface ConsistencyData {
  date: string;
  practiced: boolean;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CustomTooltip = ({ active, payload, label, suffix }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1E1E1E] border-3 border-neutral rounded-neu px-3 py-2 shadow-neu-sm">
      <p className="text-xs font-bold text-neutral/60 dark:text-white/50 uppercase tracking-wider mb-1">{label}</p>
      <p className="font-mono text-lg font-bold text-neutral dark:text-white">
        {payload[0].value}{suffix || ""}
      </p>
    </div>
  );
};

export default function ProgressAnalyticsPage() {
  const { t, i18n } = useTranslation("common");
  const lang = i18n.language;

  const { data: trends = [], isLoading: isLoadingTrends } = useQuery<TrendData[]>({
    queryKey: ["analytics", "trends"],
    queryFn: async () => {
      const res = await api.get("/api/analytics/trends");
      return res.data.data;
    }
  });

  const { data: consistencyResponse, isLoading: isLoadingConsistency } = useQuery<{
    data: ConsistencyData[];
    meta?: { year: number; month: number; daysInMonth: number };
  }>({
    queryKey: ["analytics", "consistency"],
    queryFn: async () => {
      const res = await api.get("/api/analytics/consistency");
      return res.data;
    }
  });

  // Always fallback to generating current month days locally if API data is empty
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth();
  const totalDaysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();

  const consistency = (consistencyResponse?.data && consistencyResponse.data.length > 0)
    ? consistencyResponse.data
    : Array.from({ length: totalDaysInMonth }, (_, i) => {
        const d = i + 1;
        const dateStr = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        return { date: dateStr, practiced: false };
      });

  const chartData = trends.map((item, index) => ({
    ...item,
    name: `Session ${index + 1}`
  }));

  // Summary stats
  const latestFillerWords = chartData.length > 0 ? chartData[chartData.length - 1].fillerWords : 0;
  const latestEyeContact = chartData.length > 0 ? chartData[chartData.length - 1].eyeContactPercent : 0;
  const totalPracticedDays = consistency.filter(d => d.practiced).length;

  // Calculate day-of-week offset for the 1st of the current month (0 = Mon, 6 = Sun)
  const firstDateStr = consistency[0]?.date;
  const startDayOffset = firstDateStr
    ? (new Date(firstDateStr + "T00:00:00").getDay() + 6) % 7
    : 0;

  // Get current month name formatted
  const currentMonthName = now.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
    month: "long",
    year: "numeric"
  });

  return (
    <motion.div {...pageTransition}>
      <main className="max-w-content mx-auto px-app-gap pt-8 pb-20 md:pb-8 space-y-8">

        {/* Page Header */}
        <motion.div {...fadeInUp}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-neu bg-tertiary/10 border-2 border-neutral flex items-center justify-center">
              <BarChart3 size={20} className="text-tertiary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral dark:text-white">
                {lang === "id" ? "Analitik Progres" : "Progress Analytics"}
              </h1>
              <p className="text-sm text-neutral/50 dark:text-white/40">
                {lang === "id" ? "Pantau perkembangan latihanmu" : "Track your speaking improvement over time"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Summary Stats Row */}
        <motion.div {...fadeInUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-neu bg-secondary/10 border-2 border-neutral flex-shrink-0 flex items-center justify-center">
              <TrendingDown size={22} className="text-secondary" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral/50 dark:text-white/40">
                {lang === "id" ? "Filler Terakhir" : "Latest Fillers"}
              </p>
              <p className="font-mono text-2xl font-bold text-neutral dark:text-white">{latestFillerWords}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-neu bg-tertiary/10 border-2 border-neutral flex-shrink-0 flex items-center justify-center">
              <Eye size={22} className="text-tertiary" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral/50 dark:text-white/40">
                {lang === "id" ? "Kontak Mata" : "Eye Contact"}
              </p>
              <p className="font-mono text-2xl font-bold text-neutral dark:text-white">{latestEyeContact}%</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-neu bg-success/10 border-2 border-neutral flex-shrink-0 flex items-center justify-center">
              <Flame size={22} className="text-success" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral/50 dark:text-white/40">
                {lang === "id" ? "Hari Aktif Bulan Ini" : "Active Days This Month"}
              </p>
              <p className="font-mono text-2xl font-bold text-neutral dark:text-white">
                {totalPracticedDays}
                <span className="text-sm text-neutral/40 dark:text-white/30 font-sans ml-1">
                  /{totalDaysInMonth}
                </span>
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Filler Word Chart */}
          <motion.div {...fadeInUp}>
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-secondary border-2 border-neutral" />
                <h3 className="font-bold text-neutral dark:text-white">
                  {lang === "id" ? "Tren Kata Pengisi" : "Filler Word Trend"}
                </h3>
              </div>
              <div className="h-56 md:h-64">
                {isLoadingTrends ? (
                  <div className="w-full h-full rounded-neu border-2 border-neutral/10 bg-neutral/5 dark:bg-white/5 animate-pulse" />
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="fillerGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF5252" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#FF5252" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => val.replace("Session ", "S")}
                      />
                      <YAxis tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }} axisLine={false} tickLine={false} width={30} />
                      <Tooltip content={<CustomTooltip suffix="" />} />
                      <Area type="monotone" dataKey="fillerWords" stroke="#FF5252" strokeWidth={3} fill="url(#fillerGradient)" activeDot={{ r: 6, strokeWidth: 2, stroke: "#1A1A1A" }} name="Filler Words" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full rounded-neu border-2 border-neutral/10 bg-neutral/5 dark:bg-white/5 flex items-center justify-center">
                    <p className="text-neutral/30 dark:text-white/20 font-semibold text-sm">
                      {lang === "id" ? "Belum ada data latihan" : "No practice data yet"}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Eye Contact Chart */}
          <motion.div {...fadeInUp}>
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-tertiary border-2 border-neutral" />
                <h3 className="font-bold text-neutral dark:text-white">
                  {lang === "id" ? "Tren Kontak Mata" : "Eye Contact Trend"}
                </h3>
              </div>
              <div className="h-56 md:h-64">
                {isLoadingTrends ? (
                  <div className="w-full h-full rounded-neu border-2 border-neutral/10 bg-neutral/5 dark:bg-white/5 animate-pulse" />
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="eyeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2196F3" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#2196F3" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => val.replace("Session ", "S")}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
                        axisLine={false}
                        tickLine={false}
                        domain={[0, 100]}
                        tickFormatter={(val) => `${val}%`}
                        width={40}
                      />
                      <Tooltip content={<CustomTooltip suffix="%" />} />
                      <Area type="monotone" dataKey="eyeContactPercent" stroke="#2196F3" strokeWidth={3} fill="url(#eyeGradient)" activeDot={{ r: 6, strokeWidth: 2, stroke: "#1A1A1A" }} name="Eye Contact" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full rounded-neu border-2 border-neutral/10 bg-neutral/5 dark:bg-white/5 flex items-center justify-center">
                    <p className="text-neutral/30 dark:text-white/20 font-semibold text-sm">
                      {lang === "id" ? "Belum ada data latihan" : "No practice data yet"}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Practice Consistency Heatmap (Monthly) */}
        <motion.div {...fadeInUp}>
          <Card>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success border-2 border-neutral" />
                <h3 className="font-bold text-neutral dark:text-white">
                  {lang === "id" ? "Konsistensi Latihan" : "Practice Consistency"}
                </h3>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral/60 dark:text-white/50 bg-neutral/5 dark:bg-white/10 px-3 py-1 rounded-neu border-2 border-neutral/10">
                {currentMonthName}
              </p>
            </div>

            {/* Day labels row (Mon - Sun) */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {(lang === "id" ? ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"] : DAY_LABELS).map((day) => (
                <div key={day} className="text-center text-xs font-bold uppercase tracking-wider text-neutral/40 dark:text-white/30">
                  {day}
                </div>
              ))}
            </div>

            {/* Heatmap grid with offset for 1st day of month */}
            <div className="grid grid-cols-7 gap-2">
              {isLoadingConsistency ? (
                Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-neu border-2 border-neutral/10 bg-neutral/10 dark:bg-white/10 animate-pulse" />
                ))
              ) : (
                <>
                  {/* Empty offset squares for days before 1st of month */}
                  {Array.from({ length: startDayOffset }).map((_, i) => (
                    <div key={`offset-${i}`} className="aspect-square rounded-neu border-2 border-transparent" />
                  ))}

                  {/* Month days */}
                  {consistency.map((day, i) => {
                    const dateObj = new Date(day.date + "T00:00:00");
                    const dayNum = dateObj.getDate();
                    return (
                      <div
                        key={i}
                        title={day.date}
                        className={`aspect-square rounded-neu border-2 flex items-center justify-center transition-all duration-200 ${
                          day.practiced
                            ? "border-neutral bg-primary shadow-[2px_2px_0_#1A1A1A]"
                            : "border-neutral/15 bg-neutral/5 dark:bg-white/5"
                        }`}
                      >
                        <span className={`font-mono text-xs font-bold ${
                          day.practiced
                            ? "text-neutral"
                            : "text-neutral/25 dark:text-white/20"
                        }`}>
                          {dayNum}
                        </span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t-2 border-neutral/10 dark:border-white/10">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-sm border-2 border-neutral bg-primary shadow-[1px_1px_0_#1A1A1A]" />
                <span className="text-xs font-semibold text-neutral/60 dark:text-white/50">
                  {lang === "id" ? "Berlatih" : "Practiced"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-sm border-2 border-neutral/15 bg-neutral/5 dark:bg-white/5" />
                <span className="text-xs font-semibold text-neutral/60 dark:text-white/50">
                  {lang === "id" ? "Tidak Berlatih" : "No Practice"}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

      </main>
    </motion.div>
  );
}
