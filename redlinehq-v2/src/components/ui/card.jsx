import { cn } from "../../lib/utils";
export const Card = ({ className, ...p }) => (
  <div className={cn("rounded-[22px] border border-line bg-gradient-to-b from-white/[0.05] to-white/[0.01] backdrop-blur-sm", className)} {...p} />
);
export const CardHeader = ({ className, ...p }) => <div className={cn("flex items-center justify-between gap-3 p-6 pb-0", className)} {...p} />;
export const CardContent = ({ className, ...p }) => <div className={cn("p-6", className)} {...p} />;
export const CardFooter = ({ className, ...p }) => <div className={cn("mt-auto flex items-center justify-between p-6 pt-0", className)} {...p} />;
