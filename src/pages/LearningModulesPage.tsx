import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Wind,
  PresentationIcon,
  ListOrdered,
  PersonStanding,
  AlertTriangle,
  MessageCircleWarning,
  ArrowLeft,
  Clock,
  X,
} from "lucide-react";
import { Card, Button, Chip } from "../components/ui";
import api from "../lib/api";

const pageTransition = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.2 },
};

interface LearningArticle {
  id: string;
  title: string;
  topic: string;
  language: string;
  contentUrl?: string;
  body?: string;
}

const topicConfig: Record<
  string,
  { icon: typeof BookOpen; color: string; bgColor: string }
> = {
  breathing: {
    icon: Wind,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  opening: {
    icon: PresentationIcon,
    color: "text-tertiary",
    bgColor: "bg-tertiary/10",
  },
  rule_of_three: {
    icon: ListOrdered,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  body_language: {
    icon: PersonStanding,
    color: "text-tertiary",
    bgColor: "bg-tertiary/10",
  },
  stage_fright: {
    icon: AlertTriangle,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  filler_words: {
    icon: MessageCircleWarning,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
};

const topicLabels: Record<string, { en: string; id: string }> = {
  breathing: { en: "Breathing", id: "Pernapasan" },
  opening: { en: "Opening", id: "Pembukaan" },
  rule_of_three: { en: "Rule of Three", id: "Aturan Tiga" },
  body_language: { en: "Body Language", id: "Bahasa Tubuh" },
  stage_fright: { en: "Stage Fright", id: "Demam Panggung" },
  filler_words: { en: "Filler Words", id: "Kata Pengisi" },
};

// Simple markdown renderer for article body
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={`list-${elements.length}`}
          className="list-disc list-inside space-y-1 mb-4 text-neutral/80 dark:text-white/70"
        >
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      const header = tableRows[0];
      const body = tableRows.slice(2); // skip separator row
      elements.push(
        <div key={`table-${elements.length}`} className="overflow-x-auto mb-4">
          <table className="w-full border-3 border-neutral rounded-neu text-sm">
            <thead>
              <tr className="bg-neutral/5 dark:bg-white/5">
                {header.map((cell, i) => (
                  <th
                    key={i}
                    className="px-3 py-2 text-left font-bold text-neutral dark:text-white border-b-2 border-neutral/20"
                  >
                    {cell.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, ri) => (
                <tr key={ri} className="border-b border-neutral/10">
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-3 py-2 text-neutral/70 dark:text-white/60"
                    >
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table detection
    if (line.includes("|") && line.trim().startsWith("|")) {
      if (!inTable) {
        flushList();
        inTable = true;
      }
      const cells = line.split("|").filter((c) => c.trim() !== "");
      if (!line.match(/^\|[\s-|]+\|$/)) {
        // Skip separator rows like |---|---|
        tableRows.push(cells);
      } else {
        tableRows.push(cells); // keep separator for index calc
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Headings
    if (line.startsWith("# ")) {
      flushList();
      elements.push(
        <h1
          key={i}
          className="text-2xl font-bold text-neutral dark:text-white mt-6 mb-3"
        >
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h2
          key={i}
          className="text-xl font-bold text-neutral dark:text-white mt-6 mb-2"
        >
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3
          key={i}
          className="text-lg font-bold text-neutral dark:text-white mt-4 mb-2"
        >
          {line.slice(4)}
        </h3>
      );
    }
    // List items
    else if (line.match(/^[-*]\s/)) {
      inList = true;
      const content = line.replace(/^[-*]\s/, "");
      listItems.push(
        <li key={`li-${i}`}>
          <span
            dangerouslySetInnerHTML={{
              __html: content
                .replace(/\*\*(.+?)\*\*/g, '<strong class="text-neutral dark:text-white">$1</strong>'),
            }}
          />
        </li>
      );
    }
    // Numbered list
    else if (line.match(/^\d+\.\s/)) {
      flushList();
      const content = line.replace(/^\d+\.\s/, "");
      elements.push(
        <p
          key={i}
          className="text-neutral/80 dark:text-white/70 mb-1 ml-4"
          dangerouslySetInnerHTML={{
            __html: `${line.match(/^\d+/)?.[0]}. ${content
              .replace(/\*\*(.+?)\*\*/g, '<strong class="text-neutral dark:text-white">$1</strong>')}`,
          }}
        />
      );
    }
    // Empty line
    else if (line.trim() === "") {
      flushList();
    }
    // Regular paragraph
    else {
      flushList();
      elements.push(
        <p
          key={i}
          className="text-neutral/80 dark:text-white/70 mb-3 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: line
              .replace(/\*\*(.+?)\*\*/g, '<strong class="text-neutral dark:text-white">$1</strong>')
              .replace(/\*(.+?)\*/g, "<em>$1</em>"),
          }}
        />
      );
    }
  }

  flushList();
  flushTable();

  return elements;
}

export default function LearningModulesPage() {
  const { i18n } = useTranslation("common");
  const lang = i18n.language;

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null
  );

  // Fetch article list
  const { data: articles = [], isLoading } = useQuery<LearningArticle[]>({
    queryKey: ["learning", lang],
    queryFn: async () => {
      const res = await api.get("/api/learning", {
        params: { language: lang },
      });
      return res.data.data;
    },
  });

  // Fetch single article detail
  const { data: articleDetail, isLoading: isLoadingDetail } =
    useQuery<LearningArticle>({
      queryKey: ["learning", selectedArticleId],
      queryFn: async () => {
        const res = await api.get(`/api/learning/${selectedArticleId}`);
        return res.data.data;
      },
      enabled: !!selectedArticleId,
    });

  const topics = [...new Set(articles.map((a) => a.topic))];

  const filtered = selectedTopic
    ? articles.filter((a) => a.topic === selectedTopic)
    : articles;

  // ─── Article Detail View ─────────────────────────────────
  if (selectedArticleId) {
    return (
      <motion.div {...pageTransition}>
        <main className="max-w-3xl mx-auto px-app-gap pt-8 pb-20 md:pb-8">
          <button
            onClick={() => setSelectedArticleId(null)}
            className="flex items-center gap-1.5 text-sm text-neutral/60 dark:text-white/50 hover:text-neutral dark:hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            {lang === "id" ? "Kembali ke Modul" : "Back to Modules"}
          </button>

          {isLoadingDetail ? (
            <Card>
              <div className="animate-pulse space-y-4">
                <div className="h-8 w-3/4 bg-neutral/10 rounded" />
                <div className="h-4 w-1/2 bg-neutral/10 rounded" />
                <div className="h-4 w-full bg-neutral/10 rounded" />
                <div className="h-4 w-full bg-neutral/10 rounded" />
                <div className="h-4 w-2/3 bg-neutral/10 rounded" />
              </div>
            </Card>
          ) : articleDetail?.body ? (
            <Card>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-neutral/10 dark:border-white/10">
                {(() => {
                  const config = topicConfig[articleDetail.topic] || {
                    icon: BookOpen,
                    color: "text-neutral dark:text-white",
                    bgColor: "bg-neutral/10",
                  };
                  const Icon = config.icon;
                  return (
                    <div
                      className={`w-10 h-10 rounded-neu ${config.bgColor} border-2 border-neutral flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon size={20} className={config.color} />
                    </div>
                  );
                })()}
                <div>
                  <p className="text-xs text-neutral/50 dark:text-white/40 label-caps">
                    {topicLabels[articleDetail.topic]?.[lang as "en" | "id"] ||
                      articleDetail.topic.replace(/_/g, " ")}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-neutral/40 dark:text-white/30 mt-0.5">
                    <Clock size={12} />
                    <span>
                      {Math.ceil(articleDetail.body.split(" ").length / 200)}{" "}
                      min read
                    </span>
                  </div>
                </div>
              </div>
              <div className="prose-neu">
                {renderMarkdown(articleDetail.body)}
              </div>
            </Card>
          ) : (
            <Card className="text-center py-12">
              <BookOpen
                size={48}
                className="text-neutral/20 dark:text-white/20 mx-auto mb-4"
              />
              <p className="text-neutral/50 dark:text-white/40 font-semibold">
                {lang === "id"
                  ? "Artikel tidak ditemukan"
                  : "Article not found"}
              </p>
            </Card>
          )}
        </main>
      </motion.div>
    );
  }

  // ─── Article List View ───────────────────────────────────
  return (
    <motion.div {...pageTransition}>
      <main className="max-w-content mx-auto px-app-gap pt-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral dark:text-white mb-2">
            {lang === "id" ? "Modul Pembelajaran" : "Learning Modules"}
          </h1>
          <p className="text-neutral/60 dark:text-white/50">
            {lang === "id"
              ? "Pelajari teknik public speaking dari dasar"
              : "Master public speaking techniques from the basics"}
          </p>
        </div>

        {/* Topic Filter Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Chip
            active={selectedTopic === null}
            onClick={() => setSelectedTopic(null)}
          >
            {lang === "id" ? "Semua" : "All"}
          </Chip>
          {topics.map((topic) => (
            <Chip
              key={topic}
              active={selectedTopic === topic}
              onClick={() =>
                setSelectedTopic(selectedTopic === topic ? null : topic)
              }
            >
              {topicLabels[topic]?.[lang as "en" | "id"] ||
                topic.replace(/_/g, " ")}
            </Chip>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="border-3 border-neutral/20 rounded-neu p-6 animate-pulse"
              >
                <div className="w-12 h-12 rounded-neu bg-neutral/10 mb-4" />
                <div className="h-5 w-3/4 bg-neutral/10 rounded mb-2" />
                <div className="h-3 w-1/2 bg-neutral/10 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Articles Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((article, i) => {
                const config = topicConfig[article.topic] || {
                  icon: BookOpen,
                  color: "text-neutral dark:text-white",
                  bgColor: "bg-neutral/10",
                };
                const Icon = config.icon;

                return (
                  <motion.div
                    key={article.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    <Card
                      clickable
                      className="h-full"
                      onClick={() => setSelectedArticleId(article.id)}
                    >
                      <div
                        className={`w-12 h-12 rounded-neu ${config.bgColor} border-2 border-neutral flex items-center justify-center mb-4`}
                      >
                        <Icon size={22} className={config.color} />
                      </div>
                      <h3 className="font-bold text-neutral dark:text-white mb-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-neutral/50 dark:text-white/40 label-caps">
                        {topicLabels[article.topic]?.[lang as "en" | "id"] ||
                          article.topic.replace(/_/g, " ")}
                      </p>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filtered.length === 0 && (
          <Card className="text-center py-12">
            <BookOpen
              size={48}
              className="text-neutral/20 dark:text-white/20 mx-auto mb-4"
            />
            <p className="text-neutral/50 dark:text-white/40 font-semibold">
              {lang === "id"
                ? "Belum ada modul untuk topik ini"
                : "No modules found for this topic"}
            </p>
          </Card>
        )}
      </main>
    </motion.div>
  );
}
