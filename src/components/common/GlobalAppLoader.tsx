import { motion } from "framer-motion";

interface GlobalAppLoaderProps {
  status?: string;
  substatus?: string;
}

export function GlobalAppLoader({
  status = "CALIBRATING TELEMETRY ENGINE",
  substatus = "Syncing cloud hardware fleet & baseline profiles...",
}: GlobalAppLoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-[100dvh] w-full bg-[#111111] text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-lime-500/25 selection:text-lime-300"
    >
      {/* Ambient Atmospheric Radial Depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[750px] h-[350px] sm:h-[450px] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-lime-400/[0.08] via-emerald-500/[0.02] to-transparent blur-[110px] -z-0"
      />

      <div className="relative z-10 flex flex-col items-center max-w-sm text-center">
        {/* Precision High-Tech Animated Emblem */}
        <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
          {/* Subtle Outer Telemetry Orbit Ring */}
          <svg
            className="absolute inset-0 w-full h-full animate-[spin_8s_linear_infinite]"
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
              strokeDasharray="18 280"
              strokeLinecap="round"
            />
          </svg>

          {/* Inner Counter-Rotating Ring */}
          <svg
            className="absolute inset-2 w-20 h-20 animate-[spin_5s_linear_infinite_reverse]"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#18181b"
              strokeWidth="2"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#a3e635"
              strokeWidth="2.5"
              strokeDasharray="12 160"
              strokeLinecap="round"
              className="opacity-70"
            />
          </svg>

          {/* Central Logo Emblem with Gentle Glow */}
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 p-2 shadow-[0_0_25px_rgba(163,230,53,0.15)] flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Dialed"
              className="w-full h-full object-contain rounded-lg animate-pulse"
            />
          </div>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[10px] font-mono font-bold tracking-wider text-zinc-300 uppercase shadow-inner mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-lime-400 shadow-[0_0_8px_#a3e635] animate-ping" />
          <span>DIALED SETUP OS</span>
        </div>

        {/* Dynamic Status Copy */}
        <h2 className="text-sm sm:text-base font-black tracking-tight text-white font-sans uppercase">
          {status}
        </h2>
        <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
          {substatus}
        </p>

        {/* High-Tech Shimmer Progress Track */}
        <div className="w-48 h-1 bg-zinc-900 rounded-full mt-5 overflow-hidden relative border border-zinc-800/80">
          <motion.div
            className="absolute top-0 bottom-0 bg-gradient-to-r from-transparent via-lime-400 to-transparent w-24 rounded-full"
            animate={{
              x: [-100, 200],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default GlobalAppLoader;
