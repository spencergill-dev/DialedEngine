import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LoginView } from "./LoginView";
import { useAuth } from "@/context/AuthContext";

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
  const { user } = useAuth();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-[#111111] border border-zinc-800 rounded-3xl shadow-2xl">
        <DialogTitle className="sr-only">
          {initialMode === "login" ? "Sign In to Dialed" : "Create Dialed Account"}
        </DialogTitle>
        <div className="p-6 sm:p-8">
          <LoginView
            onSuccess={() => {
              if (onAuthSuccess && user) {
                onAuthSuccess({
                  email: user.email || "",
                  name: user.user_metadata?.first_name || user.email?.split("@")[0],
                });
              }
              onClose();
            }}
            initialMode={initialMode === "login" ? "signin" : "signup"}
            onContinueAsGuest={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
