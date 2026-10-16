import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LoginView } from "./LoginView";
import { RegisterView } from "./RegisterView";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
  onAuthSuccess?: (user: { email: string; name?: string }) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
  onAuthSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  const handleSuccess = (user: { email: string; name?: string }) => {
    toast.success(`Welcome to Dialed Cloud, ${user.name || "Rider"}!`, {
      description: "Cloud database sync ready for V2.",
    });
    if (onAuthSuccess) onAuthSuccess(user);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-[#111111] border border-zinc-800 rounded-3xl shadow-2xl">
        <DialogTitle className="sr-only">
          {mode === "login" ? "Sign In to Dialed" : "Create Dialed Account"}
        </DialogTitle>
        <div className="p-6 sm:p-8">
          {mode === "login" ? (
            <LoginView
              onSuccess={handleSuccess}
              onSwitchToRegister={() => setMode("register")}
              onContinueAsGuest={onClose}
            />
          ) : (
            <RegisterView
              onSuccess={handleSuccess}
              onSwitchToLogin={() => setMode("login")}
              onContinueAsGuest={onClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
