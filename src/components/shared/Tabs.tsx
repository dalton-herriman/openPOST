import { cn } from "../../lib/utils";

interface TabsProps<T extends string> {
  tabs: { value: T; label: string }[];
  active: T;
  onChange: (value: T) => void;
  className?: string;
}

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  className,
}: TabsProps<T>) {
  return (
    <div className={cn("flex gap-1 border-b border-zinc-800 px-2", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium transition-colors relative",
            active === tab.value
              ? "text-zinc-100"
              : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          {tab.label}
          {active === tab.value && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
          )}
        </button>
      ))}
    </div>
  );
}
