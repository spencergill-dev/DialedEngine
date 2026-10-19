import DialedEngine from "@/components/DialedEngine";
import { AuthProvider } from "@/context/AuthContext";

export function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-[100dvh] w-full max-w-full bg-[#111111] text-zinc-100 selection:bg-lime-500/20 selection:text-lime-300 relative overflow-x-hidden">
        {/* Ambient Atmospheric Depth (Subtle Top-Center Radial Glow at 5% Opacity) */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-0">
          <div
            aria-hidden="true"
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1000px] h-[360px] sm:h-[420px] rounded-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-lime-400/[0.05] via-emerald-500/[0.015] to-transparent blur-[100px]"
          />
        </div>

        <DialedEngine />
      </div>
    </AuthProvider>
  );
}

export default App;
