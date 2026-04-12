import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      {icon && <div className="text-zinc-600 mb-3">{icon}</div>}
      <p className="text-sm font-medium text-zinc-400">{title}</p>
      {description && (
        <p className="text-xs text-zinc-600 mt-1 max-w-[200px]">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
