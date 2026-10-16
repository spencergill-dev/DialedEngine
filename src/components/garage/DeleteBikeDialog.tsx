import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Bike } from "@/types/cycling";

interface DeleteBikeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bike: Bike | null;
  onConfirmDelete: (id: string) => void;
}

export function DeleteBikeDialog({
  open,
  onOpenChange,
  bike,
  onConfirmDelete,
}: DeleteBikeDialogProps) {
  if (!bike) return null;

  const displayName =
    bike.brand === "Custom"
      ? `${bike.customBrand || "Custom Bike"} ${bike.model}`
      : `${bike.brand} ${bike.model}`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#111111] border border-zinc-800/50 text-zinc-100">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-bold text-white">
            Remove {displayName}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-zinc-400">
            This will permanently remove this bike configuration, including its tire specifications, tubeless status, and suspension profiles from your garage fleet. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-2">
          <AlertDialogCancel className="text-xs bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-none">
            Keep Bike
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirmDelete(bike.id)}
            className="text-xs bg-red-600 hover:bg-red-500 text-white font-bold border-none"
          >
            Delete Bike
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
