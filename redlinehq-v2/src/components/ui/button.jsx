import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

// shadcn/ui-style button, themed for Redline
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-hot disabled:opacity-60 [&_svg]:size-4",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-b from-red-hot to-red text-white shadow-[0_10px_30px_-12px_rgb(255_40_48/0.6),inset_0_1px_0_rgb(255_255_255/0.25)] hover:-translate-y-px",
        outline: "border border-line-2 bg-white/5 text-ink hover:border-cyber",
        ghost: "text-muted hover:bg-white/5 hover:text-ink",
      },
      size: { default: "h-12 px-6 text-[15px]", sm: "h-9 px-3 text-sm", icon: "size-10" },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);
export function Button({ className, variant, size, asChild, ...props }) {
  const Comp = props.href ? "a" : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
