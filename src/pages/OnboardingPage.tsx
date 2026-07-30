import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Hand } from "lucide-react";
import { Button, Input, Card } from "../components/ui";
import { useAuthStore } from "../store/authStore";
import api from "../lib/api";
import { Footer } from "../components/layout/Footer";

const pageTransition = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.2 },
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, setUser, setNeedsOnboarding } = useAuthStore();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await api.patch("/api/users/me", {
        displayName: displayName.trim(),
      });

      setUser({
        id: data.data.id,
        email: data.data.email,
        displayName: data.data.displayName,
      });
      setNeedsOnboarding(false);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      // Even if backend fails, let user proceed with local data
      setUser({
        id: user?.id || "",
        email: user?.email || "",
        displayName: displayName.trim(),
      });
      setNeedsOnboarding(false);
      navigate("/dashboard", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow skipping — use email prefix as display name
    const fallbackName = user?.email?.split("@")[0] || "User";
    setUser({
      id: user?.id || "",
      email: user?.email || "",
      displayName: fallbackName,
    });
    setNeedsOnboarding(false);
    navigate("/dashboard", { replace: true });
  };

  return (
    <motion.div
      {...pageTransition}
      className="min-h-[100dvh] bg-surface dark:bg-surface-dark flex flex-col"
    >
      <main className="flex-grow flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral dark:text-white mb-4">
              MirrAI
            </h1>
            <div className="w-16 h-16 rounded-full bg-primary/20 border-3 border-neutral mx-auto mb-4 flex items-center justify-center text-primary">
              <Hand size={32} strokeWidth={2.5} className="animate-bounce" />
            </div>
            <h2 className="text-xl font-bold text-neutral dark:text-white mb-1">
              Welcome! Let's set up your profile
            </h2>
            <p className="text-neutral/60 dark:text-white/50 text-sm">
              Tell us what to call you
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-secondary/10 border-2 border-secondary rounded-neu text-secondary text-sm font-semibold">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSave}>
            <Input
              label="Email"
              type="email"
              value={user?.email || ""}
              disabled
              helperText="From your Google account"
            />
            <Input
              label="Name"
              type="text"
              placeholder="How should we call you?"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              disabled={loading}
            />

            <Button variant="primary" fullWidth type="submit" isLoading={loading}>
              Continue to Dashboard →
            </Button>
          </form>

          <button
            onClick={handleSkip}
            className="mt-3 w-full text-center text-sm text-neutral/50 dark:text-white/40 hover:text-neutral dark:hover:text-white transition-colors"
          >
            Skip for now
          </button>
        </Card>
      </main>
      <Footer />
    </motion.div>
  );
}
