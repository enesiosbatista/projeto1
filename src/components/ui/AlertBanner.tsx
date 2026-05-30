import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";

interface Props {
  message: string;
  type: "warning" | "info" | "success";
  onDismiss: () => void;
}

const typeConfig = {
  warning: {
    cls: "bg-amber-950/40 border-amber-800 text-amber-300",
    Icon: AlertTriangle,
  },
  info: {
    cls: "bg-cyan-950/40 border-cyan-800 text-cyan-300",
    Icon: Info,
  },
  success: {
    cls: "bg-green-950/40 border-green-800 text-green-300",
    Icon: CheckCircle,
  },
};

export function AlertBanner({ message, type, onDismiss }: Props) {
  const config = typeConfig[type];
  const Icon = config.Icon;

  return (
    <div
      className={`relative flex items-center gap-3 rounded-xl border px-4 py-3 text-sm mb-3 ${config.cls}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="pr-6">{message}</span>
      <button
        onClick={onDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-current opacity-50 hover:opacity-100 cursor-pointer"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
