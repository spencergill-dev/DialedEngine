import DialedEngine from "@/components/DialedEngine";

export function App() {
  return (
    <div className="min-h-screen bg-[#111111] text-zinc-100 flex flex-col justify-between selection:bg-lime-500/20 selection:text-lime-300 relative overflow-x-hidden">
      {/* Ambient Atmospheric Depth (Subtle Top-Center Radial Glow at 5% Opacity) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1000px] h-[360px] sm:h-[420px] rounded-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-lime-400/[0.05] via-emerald-500/[0.015] to-transparent blur-[100px] -z-0"
      />

      <DialedEngine />

      <footer className="hidden md:block mt-auto py-8 text-center text-xs text-zinc-400 border-t border-zinc-800/50 font-sans relative z-10">
        <div className="flex items-center justify-center gap-2">
          <span className="font-semibold text-zinc-300">DIALED</span>
          <span>•</span>
          <span>High-Performance Cycling Setup OS</span>
          <span>•</span>
          <span>SRAM AXS & Strava Calibrated</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
