
import { LoadingSpinner } from "./loading-spinner";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ isLoading, message = "Carregando...", className }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className={cn(
      "absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10 rounded-md",
      className
    )}>
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
