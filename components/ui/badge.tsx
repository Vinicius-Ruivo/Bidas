import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold", {
  variants: {
    variant: {
      normal: "bg-emerald-500/20 text-emerald-300",
      warning: "bg-yellow-500/20 text-yellow-300",
      critical: "bg-red-500/20 text-red-300",
    },
  },
  defaultVariants: {
    variant: "normal",
  },
});

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
