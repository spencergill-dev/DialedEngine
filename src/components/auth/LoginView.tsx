import { useState } from "react";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface LoginViewProps {
  onSuccess?: () => void;
  onContinueAsGuest?: () => void;
  initialMode?: "signin" | "signup";
}

export function LoginView({
  onSuccess,
  onContinueAsGuest,
  initialMode = "signin",
}: LoginViewProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    if (mode === "signup" && password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (!isSupabaseConfigured) {
      toast.warning("Supabase credentials not configured in .env.local", {
        description: "Continuing in local mode.",
      });
      onSuccess?.();
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          setErrorMessage(error.message);
          toast.error(error.message);
          return;
        }

        const riderName =
          data.user?.user_metadata?.first_name ||
          data.user?.user_metadata?.name ||
          cleanEmail.split("@")[0] ||
          "Rider";

        toast.success(`Welcome back, ${riderName}!`, {
          description: "Syncing fleet and setup calibrations...",
        });

        onSuccess?.();
      } else {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              first_name: name.trim() || undefined,
            },
          },
        });

        if (error) {
          setErrorMessage(error.message);
          toast.error(error.message);
          return;
        }

        if (data.session) {
          toast.success("Account created successfully!", {
            description: "Opening your garage...",
          });
          onSuccess?.();
        } else {
          toast.info("Account registration initiated!", {
            description: "Please check your email to verify your account, or sign in.",
          });
          setMode("signin");
        }
      }
    } catch (err: any) {
      console.error("[LoginView] Auth error:", err);
      const msg = err?.message || "An unexpected error occurred during authentication.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-zinc-100 flex flex-col justify-center items-center px-4 py-8 sm:py-12 font-sans selection:bg-lime-500/25 selection:text-lime-300 relative overflow-hidden">
      {/* Ambient Radial Atmospheric Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] sm:w-[750px] h-[300px] sm:h-[400px] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-lime-400/[0.07] via-emerald-500/[0.02] to-transparent blur-[90px] -z-0"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-sm space-y-6 relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="flex justify-center mb-2">
            <img
              src="/logo.png"
              alt="Dialed Engine"
              className="h-11 w-auto object-contain rounded-xl shadow-lg ring-1 ring-white/10"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[10px] font-sans font-semibold tracking-wider text-zinc-300 uppercase shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400 shadow-[0_0_8px_#a3e635]" />
            DIALED SETUP OS
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white font-sans">
            {mode === "signin" ? "Sign in to your Garage" : "Create your Setup OS"}
          </h1>

          <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
            {mode === "signin"
              ? "Access your telemetry baselines, fleet hardware, and deterministic tire pressure calibrations."
              : "Calibrate tire pressures, suspension dynamics, and sync your bicycle fleet across devices."}
          </p>
        </div>

        {/* Mode Segmented Switcher */}
        <div className="grid grid-cols-2 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === "signin"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === "signup"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Card */}
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-md shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-950/60 border border-red-900/70 text-red-200 text-xs font-sans leading-relaxed"
              >
                {errorMessage}
              </motion.div>
            )}

            <AnimatePresence mode="popLayout">
              {mode === "signup" && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1.5"
                >
                  <Label htmlFor="auth-name" className="text-xs font-semibold text-zinc-300">
                    Rider Name or Handle
                  </Label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                    <Input
                      id="auth-name"
                      type="text"
                      autoComplete="name"
                      placeholder="e.g. Spencer"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                      className="h-11 pl-9 bg-zinc-950/80 border-none ring-1 ring-white/10 focus-visible:ring-lime-400 text-base md:text-sm placeholder:text-zinc-600 rounded-xl"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <Label htmlFor="auth-email" className="text-xs font-semibold text-zinc-300">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                <Input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="rider@dialedengine.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-11 pl-9 bg-zinc-950/80 border-none ring-1 ring-white/10 focus-visible:ring-lime-400 text-base md:text-sm placeholder:text-zinc-600 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="auth-password" className="text-xs font-semibold text-zinc-300">
                  Password
                </Label>
                {mode === "signin" && (
                  <button
                    type="button"
                    className="text-[11px] text-zinc-400 hover:text-white transition-colors"
                    onClick={() => {
                      if (!email.trim()) {
                        toast.info("Please enter your email address first.");
                        return;
                      }
                      supabase.auth.resetPasswordForEmail(email.trim()).then(({ error }) => {
                        if (error) toast.error(error.message);
                        else toast.success("Password reset email sent!");
                      });
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                <Input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-11 pl-9 pr-10 bg-zinc-950/80 border-none ring-1 ring-white/10 focus-visible:ring-lime-400 text-base md:text-sm placeholder:text-zinc-600 rounded-xl font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl text-xs shadow-lg transition-all border-none flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-800" />
                  <span>{mode === "signin" ? "Authenticating..." : "Creating Account..."}</span>
                </>
              ) : (
                <>
                  <span>{mode === "signin" ? "Sign In to Garage" : "Create Account & Enter"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Guest / Offline Mode Fallback */}
        {onContinueAsGuest && (
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1.5"
            >
              <span>Continue in local preview mode</span>
              <span>→</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default LoginView;
