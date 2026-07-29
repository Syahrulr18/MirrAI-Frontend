import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  ArrowRight,
  Search,
  X,
  GraduationCap,
  Briefcase,
  Mic,
  Presentation,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { Card, Button, Chip } from "../components/ui";
import api from "../lib/api";

const pageTransition = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.2 },
};

interface ScriptTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
  language: string;
}

const categoryConfig: Record<
  string,
  { icon: typeof FileText; color: string; bgColor: string }
> = {
  self_introduction: {
    icon: Mic,
    color: "text-tertiary",
    bgColor: "bg-tertiary/10",
  },
  graduation_speech: {
    icon: GraduationCap,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  elevator_pitch: {
    icon: Briefcase,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  project_presentation: {
    icon: Presentation,
    color: "text-tertiary",
    bgColor: "bg-tertiary/10",
  },
  thesis_defense: {
    icon: BookOpen,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  public_speech: {
    icon: Sparkles,
    color: "text-success",
    bgColor: "bg-success/10",
  },
};

const categoryLabels: Record<string, { en: string; id: string }> = {
  self_introduction: { en: "Self Introduction", id: "Perkenalan Diri" },
  graduation_speech: { en: "Graduation Speech", id: "Pidato Kelulusan" },
  elevator_pitch: { en: "Elevator Pitch", id: "Elevator Pitch" },
  project_presentation: {
    en: "Project Presentation",
    id: "Presentasi Proyek",
  },
  thesis_defense: { en: "Thesis Defense", id: "Sidang Skripsi" },
  public_speech: { en: "Public Speech", id: "Pidato Publik" },
};

const categoryDescriptions: Record<string, { en: string; id: string }> = {
  self_introduction: { en: "Introduce yourself confidently", id: "Perkenalkan diri dengan percaya diri" },
  graduation_speech: { en: "Inspire your fellow graduates", id: "Inspirasi teman-teman seangkatan" },
  elevator_pitch: { en: "Sell your idea in 30 seconds", id: "Jual idemu dalam 30 detik" },
  project_presentation: { en: "Present your work clearly", id: "Sajikan hasil kerjamu dengan jelas" },
  thesis_defense: { en: "Defend your research gracefully", id: "Pertahankan penelitianmu dengan tenang" },
  public_speech: { en: "Engage your audience effectively", id: "Pikat perhatian penontonmu" },
};


export default function ScriptTemplatesPage() {
  const { t, i18n } = useTranslation("common");
  const navigate = useNavigate();
  const lang = i18n.language;

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: scripts = [], isLoading } = useQuery<ScriptTemplate[]>({
    queryKey: ["scripts", lang],
    queryFn: async () => {
      const res = await api.get("/api/scripts", {
        params: { language: lang },
      });
      return res.data.data;
    },
  });

  // Get unique categories from actual data
  const categories = [...new Set(scripts.map((s) => s.category))];

  // Filter by selected category
  const filtered = selectedCategory
    ? scripts.filter((s) => s.category === selectedCategory)
    : scripts;

  const handleUseScript = (scriptId: string) => {
    const script = scripts.find((s) => s.id === scriptId);
    if (script) {
      navigate("/script-writer", { state: { title: script.title, content: script.content } });
    }
  };

  const handleEditScript = (script: ScriptTemplate) => {
    navigate("/script-writer", { state: { title: script.title, content: script.content } });
  };

  return (
    <motion.div {...pageTransition}>
      <main className="max-w-content mx-auto px-app-gap pt-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral dark:text-white mb-2">
            {lang === "id" ? "Template Naskah" : "Script Templates"}
          </h1>
          <p className="text-neutral/60 dark:text-white/50">
            {lang === "id"
              ? "Pilih naskah dan langsung mulai latihan"
              : "Pick a script and start practicing right away"}
          </p>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Chip
            active={selectedCategory === null}
            onClick={() => setSelectedCategory(null)}
          >
            {lang === "id" ? "Semua" : "All"}
          </Chip>
          {categories.map((cat) => (
            <Chip
              key={cat}
              active={selectedCategory === cat}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat ? null : cat)
              }
            >
              {categoryLabels[cat]?.[lang as "en" | "id"] ||
                cat.replace(/_/g, " ")}
            </Chip>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="border-3 border-neutral/20 rounded-neu p-6 animate-pulse"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-neu bg-neutral/10" />
                  <div className="flex-1">
                    <div className="h-5 w-3/4 bg-neutral/10 rounded mb-2" />
                    <div className="h-3 w-1/2 bg-neutral/10 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scripts Grid */}
        {!isLoading && (
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Left Column */}
            <div className="flex flex-col gap-6 w-full sm:w-1/2">
              <AnimatePresence mode="popLayout">
                {filtered.filter((_, i) => i % 2 === 0).map((script, i) => {
                  const config = categoryConfig[script.category] || {
                    icon: FileText,
                    color: "text-neutral dark:text-white",
                    bgColor: "bg-neutral/10",
                  };
                  const Icon = config.icon;
                  const isExpanded = expandedId === script.id;

                  return (
                    <motion.div
                      key={script.id}
                      className="w-full"
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                    >
                      <Card
                        clickable
                        className="h-full"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : script.id)
                        }
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-4 min-w-0">
                            <div
                              className={`w-12 h-12 rounded-neu ${config.bgColor} border-2 border-neutral flex-shrink-0 flex items-center justify-center`}
                            >
                              <Icon size={22} className={config.color} />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-neutral dark:text-white truncate">
                                {script.title}
                              </h3>
                              <p className="text-sm text-neutral/50 dark:text-white/40 mt-0.5 line-clamp-1">
                                {categoryDescriptions[script.category]?.[
                                  lang as "en" | "id"
                                ] || "A helpful template for your speech"}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            rightIcon={<ArrowRight size={16} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUseScript(script.id);
                            }}
                          >
                            {lang === "id" ? "Pakai" : "Use"}
                          </Button>
                        </div>

                        {/* Expandable Preview */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 pt-4 border-t-2 border-neutral/10 dark:border-white/10">
                                <pre className="text-sm text-neutral/70 dark:text-white/60 whitespace-pre-wrap font-sans leading-relaxed max-h-60 overflow-y-auto">
                                  {script.content}
                                </pre>
                                <div className="mt-4 flex gap-2">
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    rightIcon={<ArrowRight size={16} />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUseScript(script.id);
                                    }}
                                  >
                                    {lang === "id"
                                      ? "Pakai untuk Latihan"
                                      : "Use for Practice"}
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditScript(script);
                                    }}
                                  >
                                    {lang === "id" ? "Edit Naskah" : "Edit Script"}
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6 w-full sm:w-1/2">
              <AnimatePresence mode="popLayout">
                {filtered.filter((_, i) => i % 2 === 1).map((script, i) => {
                  const config = categoryConfig[script.category] || {
                    icon: FileText,
                    color: "text-neutral dark:text-white",
                    bgColor: "bg-neutral/10",
                  };
                  const Icon = config.icon;
                  const isExpanded = expandedId === script.id;

                  return (
                    <motion.div
                      key={script.id}
                      className="w-full"
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: (i + 0.5) * 0.05, duration: 0.3 }}
                    >
                      <Card
                        clickable
                        className="h-full"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : script.id)
                        }
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-4 min-w-0">
                            <div
                              className={`w-12 h-12 rounded-neu ${config.bgColor} border-2 border-neutral flex-shrink-0 flex items-center justify-center`}
                            >
                              <Icon size={22} className={config.color} />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-neutral dark:text-white truncate">
                                {script.title}
                              </h3>
                              <p className="text-sm text-neutral/50 dark:text-white/40 mt-0.5 line-clamp-1">
                                {categoryDescriptions[script.category]?.[
                                  lang as "en" | "id"
                                ] || "A helpful template for your speech"}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            rightIcon={<ArrowRight size={16} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUseScript(script.id);
                            }}
                          >
                            {lang === "id" ? "Pakai" : "Use"}
                          </Button>
                        </div>

                        {/* Expandable Preview */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 pt-4 border-t-2 border-neutral/10 dark:border-white/10">
                                <pre className="text-sm text-neutral/70 dark:text-white/60 whitespace-pre-wrap font-sans leading-relaxed max-h-60 overflow-y-auto">
                                  {script.content}
                                </pre>
                                <div className="mt-4 flex gap-2">
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    rightIcon={<ArrowRight size={16} />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUseScript(script.id);
                                    }}
                                  >
                                    {lang === "id"
                                      ? "Pakai untuk Latihan"
                                      : "Use for Practice"}
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditScript(script);
                                    }}
                                  >
                                    {lang === "id" ? "Edit Naskah" : "Edit Script"}
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filtered.length === 0 && (
          <Card className="text-center py-12">
            <FileText
              size={48}
              className="text-neutral/20 dark:text-white/20 mx-auto mb-4"
            />
            <p className="text-neutral/50 dark:text-white/40 font-semibold">
              {lang === "id"
                ? "Belum ada template untuk kategori ini"
                : "No templates found for this category"}
            </p>
          </Card>
        )}
      </main>
    </motion.div>
  );
}
