import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";
const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs font-semibold whitespace-nowrap", {
  variants: {
    variant: {
      default: "border-line-2 bg-bg-2 text-[#c3c9cf]",
      red: "border-red-hot/50 bg-red/15 text-white",
    },
  },
  defaultVariants: { variant: "default" },
});
export const Badge = ({ className, variant, ...p }) => <span className={cn(badgeVariants({ variant }), className)} {...p} />;
