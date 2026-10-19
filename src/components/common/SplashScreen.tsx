import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  isHydrating: boolean;
  onFinish?: () => void;
  cyclistImageUrl?: string;
  minDurationMs?: number;
}

const HYDRATION_STAGES = [
  { progress: 18, label: "BOOTING TELEMETRY KERNEL..." },
  { progress: 42, label: "CALIBRATING TIRE DYNAMICS & SAG..." },
  { progress: 74, label: "SYNCING CLOUD HARDWARE FLEET..." },
  { progress: 95, label: "FINALIZING SETUP OS..." },
  { progress: 100, label: "TELEMETRY ENGINE READY" },
];

export function SplashScreen({
  isHydrating,
  onFinish,
  cyclistImageUrl,
  minDurationMs = 1200,
}: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [canExit, setCanExit] = useState(false);

  // Smoothly fade out the HTML-level static splash screen once React is mounted
  useEffect(() => {
    const staticEl = document.getElementById("static-splash");
    if (staticEl) {
      staticEl.classList.add("splash-hidden");
      const timer = setTimeout(() => {
        staticEl.remove();
      }, 550);
      return () => clearTimeout(timer);
    }
  }, []);

  // Progressive animation of the loading bar
  useEffect(() => {
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const timeRatio = Math.min(elapsed / minDurationMs, 1);

      // Smooth simulated progress that accelerates as hydration resolves
      if (isHydrating) {
        // Cap at 88% until actual hydration completes
        const targetProgress = Math.min(Math.round(timeRatio * 85), 88);
        setProgress((prev) => Math.max(prev, targetProgress));
      } else {
        // Hydration finished - rapidly finish to 100%
        setProgress(100);
        setTimeout(() => {
          setCanExit(true);
          setTimeout(() => {
            onFinish?.();
          }, 600);
        }, 350);
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isHydrating, minDurationMs, onFinish]);

  // Update stage label based on current progress percentage
  useEffect(() => {
    const foundStage = [...HYDRATION_STAGES]
      .reverse()
      .find((s) => progress >= s.progress);
    if (foundStage) {
      setStageIndex(HYDRATION_STAGES.indexOf(foundStage));
    }
  }, [progress]);

  return (
    <AnimatePresence>
      {(!canExit || isHydrating) && (
        <motion.div
          key="native-splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.015 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] bg-[#050505] text-zinc-100 flex flex-col justify-between items-center p-6 sm:p-12 overflow-hidden selection:bg-lime-500/25 selection:text-lime-300 pointer-events-auto"
        >
          {/* ======================================================== */}
          {/* 1. High-Res Cyclist Background Placeholder & Dark Vignette */}
          {/* ======================================================== */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* High-res cyclist photo placeholder layer */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 scale-105 transition-transform duration-1000 ease-out"
              style={{
                backgroundImage: cyclistImageUrl
                  ? `url(${cyclistImageUrl})`
                  : undefined,
              }}
            >
              {!cyclistImageUrl && (
                /* Native abstract geometric cyclist terrain backdrop */
                <div className="w-full h-full bg-[radial-gradient(circle_at_50%_35%,_rgba(39,39,42,0.5)_0%,_rgba(9,9,11,0.95)_70%,_#050505_100%)] opacity-80" />
              )}
            </div>

            {/* Deep Vignette & Contrast Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/90" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#050505_80%)]" />

            {/* High-Tech Ambient Lime Aura */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[750px] h-[350px] sm:h-[450px] bg-lime-500/[0.08] rounded-full blur-[120px]" />
          </div>

          {/* ======================================================== */}
          {/* 2. Top Header Status Indicator */}
          {/* ======================================================== */}
          <div className="relative z-10 w-full max-w-sm flex items-center justify-between pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950/80 border border-zinc-800/80 text-[10px] font-mono font-bold tracking-wider text-zinc-300 uppercase shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 shadow-[0_0_8px_#a3e635] animate-ping" />
              <span>SETUP OS • V2.0</span>
            </div>

            <div className="text-[10px] font-mono font-medium text-zinc-400">
              {progress < 100 ? "CONNECTING" : "ONLINE"}
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3. Center Brand Emblem */}
          {/* ======================================================== */}
          <div className="relative z-10 flex flex-col items-center text-center my-auto">
            {/* Glowing Logo Frame */}
            <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
              {/* Outer SVG Telemetry Ring */}
              <svg
                className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite]"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="#27272a"
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="#a3e635"
                  strokeWidth="2"
                  strokeDasharray="24 260"
                  strokeLinecap="round"
                />
              </svg>

              {/* Inner Pulsing Ring */}
              <div className="absolute inset-2 rounded-full border border-lime-500/20 shadow-[0_0_30px_rgba(163,230,53,0.12)] animate-pulse" />

              {/* Logo Card */}
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-16 h-16 rounded-2xl bg-zinc-950/95 border border-zinc-800 p-2.5 shadow-2xl flex items-center justify-center"
              >
                <img
                  src="/logo.png"
                  alt="Dialed Engine"
                  className="w-full h-full object-contain rounded-xl"
                />
              </motion.div>
            </div>

            {/* Brand Title */}
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-sans uppercase">
              DIALED
            </h1>
            <p className="text-xs sm:text-sm font-medium tracking-wide text-zinc-400 mt-1 uppercase">
              Precision Cycling Telemetry
            </p>
          </div>

          {/* ======================================================== */}
          {/* 4. Bottom Sleek Progress Bar & Hydration Stages */}
          {/* ======================================================== */}
          <div className="relative z-10 w-full max-w-sm space-y-3 pb-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400 text-[11px] truncate pr-2">
                {HYDRATION_STAGES[stageIndex]?.label}
              </span>
              <span className="text-lime-400 font-bold shrink-0">
                {progress}%
              </span>
            </div>

            {/* Horizontal Progress Bar Track */}
            <div className="w-full h-1.5 bg-zinc-900/90 rounded-full overflow-hidden border border-zinc-800/80 relative">
              <motion.div
                className="h-full bg-gradient-to-r from-lime-500 via-lime-400 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(163,230,53,0.5)]"
                style={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.15 }}
              />
            </div>

            {/* Sub-label telemetry specs */}
            <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-zinc-400">
              <span>SUSPENSION SAG • TIRE PSI</span>
              <span>CALIBRATED</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SplashScreen;
