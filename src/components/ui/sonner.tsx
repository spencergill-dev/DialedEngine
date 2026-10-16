import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-zinc-900 group-[.toaster]:text-zinc-100 group-[.toaster]:border-zinc-800/80 group-[.toaster]:shadow-2xl group-[.toaster]:font-sans text-xs",
          description: "group-[.toast]:text-zinc-400 text-[11px]",
          actionButton:
            "group-[.toast]:bg-lime-500 group-[.toast]:text-zinc-950 font-semibold text-xs",
          cancelButton:
            "group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-300 text-xs",
          success: "group-[.toaster]:border-lime-500/30",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
