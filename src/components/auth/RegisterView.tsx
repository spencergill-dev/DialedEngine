import { useState } from "react";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

interface RegisterViewProps {
  onSuccess?: (user: { email: string; name: string }) => void;
  onSwitchToLogin: () => void;
  onContinueAsGuest?: () => void;
}

export function RegisterView({
  onSuccess,
  onSwitchToLogin,
  onContinueAsGuest,
}: RegisterViewProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter your name or rider handle.");
      return;
    }

    if (!email || !password) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    // Simulate Supabase signUp({ email, password, options: { data: { full_name: name } } })
    setTimeout(() => {
      setIsLoading(false);
      if (onSuccess) {
        onSuccess({ email, name: name.trim() });
      }
    }, 700);
  };

  const handleOAuth = (provider: "google" | "apple") => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onSuccess) {
        onSuccess({
          email: `newrider@${provider}.com`,
          name: provider === "apple" ? "Apple Rider" : "Google Rider",
        });
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#111111] text-zinc-100 flex flex-col justify-center items-center px-4 py-12 font-sans selection:bg-lime-500/25 selection:text-lime-300">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-sm space-y-6"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <img
              src="/logo.png"
              alt="Dialed Engine"
              className="h-10 w-auto object-contain rounded-xl shadow-lg"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-sans font-semibold tracking-wider text-zinc-400 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
            DIALED CLOUD OS
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-sans">
            Create your account
          </h1>
          <p className="text-xs text-zinc-400">
            Back up your bike garage and unlock multi-device setup sync
          </p>
        </div>

        {/* Social Authentication */}
        <div className="space-y-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuth("google")}
            disabled={isLoading}
            className="w-full h-11 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 hover:text-white border border-zinc-800/80 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuth("apple")}
            disabled={isLoading}
            className="w-full h-11 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 hover:text-white border border-zinc-800/80 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.93-.93.04-2.07.62-2.73 1.39-.58.67-1.09 1.76-.95 2.81 1.04.08 2.11-.53 2.74-1.27z" />
            </svg>
            <span>Continue with Apple</span>
          </Button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-zinc-800/80 w-full" />
          <span className="bg-[#111111] px-3 text-[11px] text-zinc-500 font-sans uppercase tracking-wider">
            or register with email
          </span>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-red-300 text-xs font-sans">
              {errorMessage}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="reg-name" className="text-xs font-semibold text-zinc-300">
              Rider Name or Handle
            </Label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
              <Input
                id="reg-name"
                type="text"
                autoComplete="name"
                placeholder="e.g. Spencer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="h-11 pl-9 bg-zinc-900 border-none ring-1 ring-white/10 focus-visible:ring-lime-400 text-base md:text-sm placeholder:text-zinc-600 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg-email" className="text-xs font-semibold text-zinc-300">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
              <Input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder="rider@dialedengine.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-11 pl-9 bg-zinc-900 border-none ring-1 ring-white/10 focus-visible:ring-lime-400 text-base md:text-sm placeholder:text-zinc-600 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg-password" className="text-xs font-semibold text-zinc-300">
              Password
            </Label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
              <Input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-11 pl-9 pr-10 bg-zinc-900 border-none ring-1 ring-white/10 focus-visible:ring-lime-400 text-base md:text-sm placeholder:text-zinc-600 rounded-xl font-mono"
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
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
              <span>Encrypted with Row Level Security (RLS)</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="reg-confirm-password" className="text-xs font-semibold text-zinc-300">
                Confirm Password
              </Label>
              {password.length > 0 && confirmPassword.length > 0 && password === confirmPassword && (
                <span className="text-[10px] font-bold text-lime-400 font-mono">MATCH</span>
              )}
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <span className="text-[10px] font-medium text-amber-400 font-mono">MISMATCH</span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
              <Input
                id="reg-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="h-11 pl-9 pr-10 bg-zinc-900 border-none ring-1 ring-white/10 focus-visible:ring-lime-400 text-base md:text-sm placeholder:text-zinc-600 rounded-xl font-mono"
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
          </div>

          <Button
            type="submit"
            disabled={isLoading || !name.trim() || !email.trim() || password.length < 8 || password !== confirmPassword}
            className="w-full h-11 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl text-xs shadow-lg transition-all border-none flex items-center justify-center gap-2 mt-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Create Dialed Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Footer Navigation */}
        <div className="space-y-3 pt-2 text-center">
          <p className="text-xs text-zinc-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-white hover:text-lime-400 font-semibold underline underline-offset-4 transition-colors"
            >
              Sign in
            </button>
          </p>

          {onContinueAsGuest && (
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors block w-full pt-1"
            >
              Continue in Local / Offline Mode →
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
