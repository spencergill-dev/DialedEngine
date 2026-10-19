import { useState } from "react";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Check,
} from "lucide-react";
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

interface AuthBannerMessage {
  title: string;
  message: string;
}

function formatAuthError(error: any): AuthBannerMessage {
  const rawMessage = error?.message || (typeof error === "string" ? error : "An unexpected error occurred.");
  const lower = rawMessage.toLowerCase();
  const code = (error?.code || "").toLowerCase();
  const status = error?.status;

  if (
    lower.includes("already registered") ||
    lower.includes("user already exists") ||
    code.includes("user_already_exists")
  ) {
    return {
      title: "Account Already Exists",
      message: "An account with this email address already exists. Switch to the 'Sign In' tab above to log into your account.",
    };
  }

  if (
    lower.includes("rate limit") ||
    lower.includes("over_email_send_rate_limit") ||
    lower.includes("too many requests") ||
    status === 429
  ) {
    return {
      title: "Too Many Attempts (Rate Limited)",
      message: "Supabase rate limiting is active. For security, repeated requests are throttled. Please wait 60 seconds before trying again.",
    };
  }

  if (
    lower.includes("password should be at least") ||
    lower.includes("weak_password") ||
    lower.includes("at least 6 characters")
  ) {
    return {
      title: "Password Too Weak",
      message: "Password must be at least 6 characters long. For security, please include a mix of letters and numbers.",
    };
  }

  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid_credentials")
  ) {
    return {
      title: "Invalid Credentials",
      message: "Incorrect email or password. Please verify your credentials and try again, or use 'Forgot password?'.",
    };
  }

  if (lower.includes("email not confirmed") || lower.includes("email_not_confirmed")) {
    return {
      title: "Email Verification Required",
      message: "Please check your email inbox and click the verification link before signing in.",
    };
  }

  return {
    title: "Authentication Failed",
    message: rawMessage,
  };
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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<AuthBannerMessage | null>(null);
  const [infoBanner, setInfoBanner] = useState<AuthBannerMessage | null>(null);

  const cleanEmail = email.trim();
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const isSignupValid =
    mode === "signup" &&
    cleanEmail.length > 0 &&
    password.length >= 6 &&
    confirmPassword.length > 0 &&
    passwordsMatch;

  const isSigninValid =
    mode === "signin" &&
    cleanEmail.length > 0 &&
    password.length > 0;

  const isSubmitDisabled = isLoading || (mode === "signup" ? !isSignupValid : !isSigninValid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setInfoBanner(null);

    if (!cleanEmail || !password) {
      setAuthError({
        title: "Required Fields Missing",
        message: "Please enter both an email address and a password.",
      });
      return;
    }

    if (mode === "signup") {
      if (password.length < 6) {
        setAuthError({
          title: "Password Too Short",
          message: "Password must be at least 6 characters long.",
        });
        return;
      }

      if (password !== confirmPassword) {
        setAuthError({
          title: "Passwords Do Not Match",
          message: "The confirmation password does not match the chosen password. Please retype to ensure they match.",
        });
        return;
      }
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
          const formatted = formatAuthError(error);
          setAuthError(formatted);
          toast.error(formatted.title, { description: formatted.message });
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
          const formatted = formatAuthError(error);
          setAuthError(formatted);
          toast.error(formatted.title, { description: formatted.message });
          return;
        }

        if (data.session) {
          toast.success("Account created successfully!", {
            description: "Opening your garage...",
          });
          onSuccess?.();
        } else {
          // Email confirmation is required by Supabase auth configuration
          setInfoBanner({
            title: "Verification Email Sent",
            message: `We dispatched a confirmation link to ${cleanEmail}. Please check your inbox (and spam folder) to activate your account, then sign in.`,
          });
          toast.info("Account registration initiated!", {
            description: "Please check your email to verify your account.",
          });
          setMode("signin");
          setPassword("");
          setConfirmPassword("");
        }
      }
    } catch (err: any) {
      console.error("[LoginView] Auth error:", err);
      const formatted = formatAuthError(err);
      setAuthError(formatted);
      toast.error(formatted.title, { description: formatted.message });
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
              setAuthError(null);
              setConfirmPassword("");
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
              setAuthError(null);
              setConfirmPassword("");
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
            {/* High-Visibility Error Banner */}
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs font-sans shadow-lg shadow-red-950/40 space-y-1"
              >
                <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider text-[11px]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError.title}</span>
                </div>
                <p className="text-red-200/90 leading-relaxed pl-6 text-[11px]">
                  {authError.message}
                </p>
              </motion.div>
            )}

            {/* High-Visibility Info / Verification Banner */}
            {infoBanner && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs font-sans shadow-lg space-y-1"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{infoBanner.title}</span>
                </div>
                <p className="text-emerald-200/90 leading-relaxed pl-6 text-[11px]">
                  {infoBanner.message}
                </p>
              </motion.div>
            )}

            {/* Name Field (Sign Up Only) */}
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
                      onChange={(e) => {
                        setName(e.target.value);
                        if (authError) setAuthError(null);
                      }}
                      disabled={isLoading}
                      className="h-11 pl-9 bg-zinc-950/80 border-none ring-1 ring-white/10 focus-visible:ring-lime-400 text-base md:text-sm placeholder:text-zinc-600 rounded-xl"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  disabled={isLoading}
                  className="h-11 pl-9 bg-zinc-950/80 border-none ring-1 ring-white/10 focus-visible:ring-lime-400 text-base md:text-sm placeholder:text-zinc-600 rounded-xl"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="auth-password" className="text-xs font-semibold text-zinc-300">
                  Password
                </Label>
                {mode === "signin" && (
                  <button
                    type="button"
                    className="text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    onClick={() => {
                      if (!cleanEmail) {
                        toast.info("Please enter your email address first.");
                        return;
                      }
                      supabase.auth.resetPasswordForEmail(cleanEmail).then(({ error }) => {
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
                  placeholder={mode === "signup" ? "At least 6 characters" : "••••••••••••"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  disabled={isLoading}
                  className="h-11 pl-9 pr-10 bg-zinc-950/80 border-none ring-1 ring-white/10 focus-visible:ring-lime-400 text-base md:text-sm placeholder:text-zinc-600 rounded-xl font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Sign Up Only) */}
            <AnimatePresence mode="popLayout">
              {mode === "signup" && (
                <motion.div
                  key="confirm-password-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auth-confirm-password" className="text-xs font-semibold text-zinc-300">
                      Confirm Password
                    </Label>
                    {passwordsMatch && (
                      <span className="text-[10px] font-bold text-lime-400 flex items-center gap-1 font-mono">
                        <Check className="w-3 h-3" />
                        MATCH
                      </span>
                    )}
                    {passwordsMismatch && (
                      <span className="text-[10px] font-medium text-amber-400 font-mono">
                        MISMATCH
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                    <Input
                      id="auth-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (authError) setAuthError(null);
                      }}
                      disabled={isLoading}
                      className={`h-11 pl-9 pr-10 bg-zinc-950/80 border-none ring-1 text-base md:text-sm placeholder:text-zinc-600 rounded-xl font-mono transition-colors ${
                        passwordsMatch
                          ? "ring-lime-500/50 focus-visible:ring-lime-400"
                          : passwordsMismatch
                          ? "ring-amber-500/50 focus-visible:ring-amber-400"
                          : "ring-white/10 focus-visible:ring-lime-400"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Action Button */}
            <div className="pt-2 space-y-2">
              <Button
                type="submit"
                disabled={isSubmitDisabled}
                className={`w-full h-11 font-bold rounded-xl text-xs shadow-lg transition-all border-none flex items-center justify-center gap-2 cursor-pointer ${
                  mode === "signup"
                    ? "bg-lime-400 hover:bg-lime-300 text-black shadow-[0_0_20px_rgba(163,230,53,0.25)]"
                    : "bg-white text-black hover:bg-zinc-200"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>{mode === "signin" ? "Authenticating..." : "Creating Account..."}</span>
                  </>
                ) : (
                  <>
                    <span>{mode === "signin" ? "Sign In to Garage" : "Create Account & Enter"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              {/* Helpful inline state messaging for signup requirements */}
              {mode === "signup" && !isSignupValid && (
                <div className="text-center text-[10px] text-zinc-500 font-medium leading-tight">
                  {!cleanEmail ? (
                    <span>Enter your email to get started</span>
                  ) : password.length < 6 ? (
                    <span>Password must be at least 6 characters</span>
                  ) : !confirmPassword ? (
                    <span>Confirm your password to enable account creation</span>
                  ) : !passwordsMatch ? (
                    <span className="text-amber-400/90">Passwords must match completely</span>
                  ) : null}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Guest / Offline Mode Fallback */}
        {onContinueAsGuest && (
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
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
