import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { Eye, Shield, MessageCircleWarning, Gauge, Moon, Sun, Camera, CameraOff, FileEdit } from "lucide-react";
import { Button } from "../components/ui";
import { useTheme } from "../app/ThemeProvider";
import { Footer } from "../components/layout/Footer";
import { useFaceLandmarker } from "../hooks/useFaceLandmarker";
import { usePoseLandmarker } from "../hooks/usePoseLandmarker";
import { useHandLandmarker } from "../hooks/useHandLandmarker";

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
  { icon: FileEdit, key: "scriptTemplate" },
] as const;

export default function LandingPage() {
  const { t, i18n } = useTranslation(["landing", "common"]);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Camera & AI State for Landing Page Preview
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isEyeContactGood, setIsEyeContactGood] = useState(true);
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { isLoaded: isFaceReady, detectFrame: detectFace } = useFaceLandmarker();
  const { isLoaded: isPoseReady, detectFrame: detectPose } = usePoseLandmarker();
  const { isLoaded: isHandReady, detectFrame: detectHand } = useHandLandmarker();

  useEffect(() => {
    if (!isCameraActive || !isFaceReady || !isPoseReady || !isHandReady) return;

    let animId: number;
    let lastTime = 0;
    let cachedHands: any[] = [];
    let cachedPose: any[] = [];

    const loop = (now: number) => {
      if (now - lastTime >= 80) { // ~12 fps for smooth skeleton
        lastTime = now;
        const video = webcamRef.current?.video;
        const canvas = canvasRef.current;

        if (video && video.readyState >= 2) {
          if (canvas) {
            const vw = video.videoWidth || 640;
            const vh = video.videoHeight || 480;
            if (canvas.width !== vw || canvas.height !== vh) {
              canvas.width = vw;
              canvas.height = vh;
            }
          }

          // 1. Detect Eye Contact
          const faceRes = detectFace(video, now);
          if (faceRes) setIsEyeContactGood(faceRes.isEyeContactGood);

          // 2. Detect Pose (Shoulders)
          const poseRes = detectPose(video, now);
          if (poseRes && poseRes.landmarks) cachedPose = poseRes.landmarks;

          // 3. Detect Hands
          const handRes = detectHand(video, now);
          if (handRes && handRes.landmarks) cachedHands = handRes.landmarks;

          // Render Skeleton
          if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);

              // A. Draw Shoulder & Arm Posture Skeleton
              if (cachedPose.length > 0) {
                ctx.strokeStyle = "#00E676"; // Neon success green
                ctx.lineWidth = 4;
                ctx.lineCap = "round";

                const armLines = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16]];
                ctx.beginPath();
                for (const [sIdx, eIdx] of armLines) {
                  const a = cachedPose[sIdx];
                  const b = cachedPose[eIdx];
                  if (a && b && (a.visibility === undefined || a.visibility > 0.3)) {
                    ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
                    ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
                  }
                }
                ctx.stroke();

                const shoulderNodes = [11, 12, 13, 14];
                for (const idx of shoulderNodes) {
                  const pt = cachedPose[idx];
                  if (pt && (pt.visibility === undefined || pt.visibility > 0.3)) {
                    ctx.beginPath();
                    ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 7, 0, Math.PI * 2);
                    ctx.fillStyle = "#FFEB3B";
                    ctx.fill();
                    ctx.strokeStyle = "#1A1A1A";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                  }
                }
              }

              // B. Draw Hand Skeletons
              if (cachedHands.length > 0) {
                for (const hand of cachedHands) {
                  // Connection logic (inlined for simplicity since HAND_CONNECTIONS is imported)
                  ctx.strokeStyle = "#FFEB3B";
                  ctx.lineWidth = 3;
                  ctx.lineCap = "round";
                  ctx.beginPath();
                  // A simplified version of HAND_CONNECTIONS if not imported, but let's assume we import it.
                  
                  // For safety, defining connections here to avoid missing import errors
                  const connections = [
                    [0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],
                    [5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],
                    [13,17],[0,17],[17,18],[18,19],[19,20]
                  ];
                  
                  for (const [si, ei] of connections) {
                    const a = hand[si];
                    const b = hand[ei];
                    if (a && b) {
                      ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
                      ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
                    }
                  }
                  ctx.stroke();

                  // Joint nodes
                  for (let i = 0; i < hand.length; i++) {
                    const pt = hand[i];
                    const cx = pt.x * canvas.width;
                    const cy = pt.y * canvas.height;
                    const isFingertip = [4, 8, 12, 16, 20].includes(i);

                    ctx.beginPath();
                    ctx.arc(cx, cy, isFingertip ? 6 : 4, 0, Math.PI * 2);
                    ctx.fillStyle = isFingertip ? "#FFEB3B" : "#00E676";
                    ctx.fill();
                    ctx.strokeStyle = "#1A1A1A";
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                  }
                }
              }
            }
          }
        }
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isCameraActive, isFaceReady, isPoseReady, isHandReady, detectFace, detectPose, detectHand]);

  return (
    <motion.div {...pageTransition} className="min-h-[100dvh] bg-transparent flex flex-col">
      {/* ─── Navbar ───────────────────────────────────────── */}
      <nav className="sticky top-0 z-sticky-nav bg-white/95 dark:bg-surface-dark/95 backdrop-blur-sm border-b-3 border-neutral">
        <div className="max-w-content mx-auto px-app-gap flex items-center justify-between h-16">
          <div className="flex items-center select-none">
            <img src="/logo_MirrAI.svg" alt="MirrAI Logo" className="h-8 dark:invert" />
          </div>
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
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 dark:via-white/3 dark:to-white/8 pointer-events-none z-10" />

                {isCameraActive ? (
                  <>
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      muted={true}
                      mirrored={true}
                      className="w-full h-full object-cover"
                      videoConstraints={{ facingMode: "user" }}
                    />
                    
                    {/* Skeleton Overlay */}
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
                      style={{ transform: "scaleX(-1)" }}
                    />
                    
                    {/* Live Errors Only UI */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-20 pointer-events-none">
                      <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center backdrop-blur-sm transition-colors duration-300 ${isEyeContactGood ? "border-success bg-success/20 text-success" : "border-secondary bg-secondary/20 text-secondary"}`}>
                        {isEyeContactGood ? <Eye size={40} /> : <Eye size={40} className="animate-pulse" />}
                      </div>
                      <div className="mt-4 px-4 py-2 bg-neutral/80 text-white rounded-full font-bold text-sm tracking-wide">
                        {isEyeContactGood ? "Eye Contact: Perfect" : "Warning: Look at camera!"}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setIsCameraActive(false)}
                      className="absolute top-4 right-4 z-30 p-2 bg-neutral/80 text-white rounded-full hover:bg-neutral transition-colors"
                    >
                      <CameraOff size={20} />
                    </button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8 bg-surface dark:bg-surface-dark overflow-hidden">
                    {/* Background decorative elements */}
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                      className="absolute -top-16 -right-16 w-48 h-48 border-[6px] border-primary/20 dark:border-primary/10 rounded-full border-dashed pointer-events-none"
                    />
                    <motion.div 
                      animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }} 
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute bottom-8 left-8 w-12 h-12 bg-secondary/20 border-4 border-secondary/40 rounded-neu pointer-events-none"
                    />

                    {/* Camera Icon */}
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                      className="w-24 h-24 rounded-full border-4 border-neutral bg-primary shadow-neu flex items-center justify-center z-10 cursor-pointer"
                      onClick={() => setIsCameraActive(true)}
                    >
                      <Camera size={40} className="text-neutral" />
                    </motion.div>
                    
                    {/* Text */}
                    <div className="text-center z-10 space-y-1">
                      <h3 className="font-bold text-xl text-neutral dark:text-white">Live AI Vision</h3>
                      <p className="text-sm text-neutral/70 dark:text-white/70 max-w-[260px] mx-auto font-medium">
                        Experience real-time eye contact and posture detection right in your browser.
                      </p>
                    </div>

                    {/* Button */}
                    <div className="z-10 mt-2">
                      <Button 
                        variant="primary" 
                        onClick={() => setIsCameraActive(true)}
                      >
                        Try Live Preview
                      </Button>
                    </div>

                    {/* Privacy Badge */}
                    <div className="flex items-center gap-2 mt-4 px-3 py-1.5 bg-neutral/5 dark:bg-white/5 border-2 border-neutral/20 dark:border-white/20 rounded-full z-10">
                      <Shield size={14} className="text-success" />
                      <span className="text-[11px] font-bold tracking-wider uppercase text-neutral/70 dark:text-white/70">
                        100% Private &bull; No Recording
                      </span>
                    </div>
                  </div>
                )}
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
