import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2, Loader2, ShieldAlert } from "lucide-react";
import { deleteUserAccount } from "@/lib/accountService";
import { toast } from "sonner";

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail?: string | null;
  onAccountDeleted: () => void;
}

export function DeleteAccountDialog({
  isOpen,
  onClose,
  userId,
  userEmail,
  onAccountDeleted,
}: DeleteAccountDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isConfirmed = confirmText.trim() === "DELETE" && isAcknowledged;

  const handleClose = () => {
    if (isDeleting) return;
    setConfirmText("");
    setIsAcknowledged(false);
    setErrorMessage(null);
    onClose();
  };

  const handleDelete = async () => {
    if (!isConfirmed || isDeleting) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const result = await deleteUserAccount(userId);
      toast.success("Account deleted", {
        description: result.message || "Your profile and fleet data have been permanently wiped.",
      });
      handleClose();
      onAccountDeleted();
    } catch (err: any) {
      console.error("[DeleteAccountDialog] Failed to delete account:", err);
      const msg = err?.message || "An unexpected error occurred while deleting your account. Please try again.";
      setErrorMessage(msg);
      toast.error("Deletion failed", { description: msg });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md bg-[#111111] border border-red-900/50 text-zinc-100 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(239,68,68,0.15)]">
        {/* Header with Danger Emblem */}
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-950/80 border border-red-500/40 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black tracking-tight text-white font-sans">
                Delete Account
              </DialogTitle>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span>Permanent & Irreversible</span>
              </div>
            </div>
          </div>

          <DialogDescription className="text-xs text-zinc-400 leading-relaxed pt-1">
            You are about to permanently delete your Dialed Setup OS account
            {userEmail ? (
              <>
                {" "}
                (<span className="text-zinc-200 font-semibold">{userEmail}</span>)
              </>
            ) : null}
            .
          </DialogDescription>
        </DialogHeader>

        {/* Warning Callout Box */}
        <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-900/40 text-[11px] text-zinc-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-red-400 uppercase tracking-wider text-[10px]">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>The following data will be wiped immediately:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li>Your entire bicycle fleet & custom component specs</li>
            <li>All suspension sag and tire pressure baseline calculations</li>
            <li>Your rider biometric weight and height profile</li>
            <li>Authentication credentials (frees email for re-registration)</li>
          </ul>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Step 1: Explicit Typing Input */}
        <div className="space-y-2 pt-1">
          <Label
            htmlFor="delete-confirm-input"
            className="text-xs font-semibold text-zinc-300 flex items-center justify-between"
          >
            <span>
              Type <strong className="text-red-400 font-mono">DELETE</strong> to confirm:
            </span>
            {confirmText.trim() === "DELETE" && (
              <span className="text-[10px] font-mono font-bold text-lime-400">
                VERIFIED
              </span>
            )}
          </Label>
          <Input
            id="delete-confirm-input"
            type="text"
            placeholder="Type DELETE"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={isDeleting}
            className="h-10 bg-zinc-900 border-zinc-800 rounded-xl font-mono text-sm uppercase placeholder:normal-case placeholder:text-zinc-600 focus-visible:ring-red-500 text-white"
          />
        </div>

        {/* Step 2: Explicit Checkbox Confirmation */}
        <label className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isAcknowledged}
            onChange={(e) => setIsAcknowledged(e.target.checked)}
            disabled={isDeleting}
            className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-red-500 focus:ring-red-500/30 cursor-pointer accent-red-500"
          />
          <span className="text-xs text-zinc-300 leading-snug">
            I understand that my fleet and suspension setups cannot be recovered after deletion.
          </span>
        </label>

        {/* Action Buttons */}
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isDeleting}
            className="h-10 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-850 rounded-xl"
          >
            Cancel & Keep Account
          </Button>

          <Button
            type="button"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="h-10 text-xs font-extrabold bg-red-600 hover:bg-red-500 text-white rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.3)] border-none transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Deleting Everything...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Permanently Delete Account</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteAccountDialog;
