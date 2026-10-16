import DialedEngine from "@/components/DialedEngine";

export function App() {
  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#111111] text-zinc-100 selection:bg-lime-500/20 selection:text-lime-300 relative overflow-hidden">
      {/* Ambient Atmospheric Depth (Subtle Top-Center Radial Glow at 5% Opacity) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1000px] h-[360px] sm:h-[420px] rounded-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-lime-400/[0.05] via-emerald-500/[0.015] to-transparent blur-[100px] -z-0"
      />

      <DialedEngine />
    </div>
  );
}

export default App;
