import { cn } from "@/lib/utils";

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "warning" | "critical" | "normal";
};

export function Alert({ className, variant = "normal", ...props }: AlertProps) {
  const variantClass =
    variant === "critical"
      ? "border-red-500/40 bg-red-500/10 text-red-100"
      : variant === "warning"
        ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-100"
        : "border-emerald-500/40 bg-emerald-500/10 text-emerald-100";

  return <div className={cn("rounded-md border p-3 text-sm", variantClass, className)} {...props} />;
}
