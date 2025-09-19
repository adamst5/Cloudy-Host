import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

import { type BotStatus } from "@shared/schema";

interface BotStatusBadgeProps {
  status: BotStatus;
  className?: string;
}

const statusConfig = {
  running: {
    label: "Rodando",
    className: "bg-green-500/10 text-green-400 hover:bg-green-500/20",
    dotClassName: "text-green-400",
  },
  stopped: {
    label: "Parado",
    className: "bg-gray-500/10 text-gray-400 hover:bg-gray-500/20",
    dotClassName: "text-gray-400",
  },
  starting: {
    label: "Iniciando",
    className: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20",
    dotClassName: "text-blue-400 animate-pulse",
  },
  error: {
    label: "Erro",
    className: "bg-red-500/10 text-red-400 hover:bg-red-500/20",
    dotClassName: "text-red-400",
  },
  unresponsive: {
    label: "Não Responsivo",
    className: "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20",
    dotClassName: "text-orange-400 animate-pulse",
  },
};

export default function BotStatusBadge({ status, className }: BotStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge 
      variant="outline" 
      className={cn("gap-1.5 px-2 py-1", config.className, className)}
      data-testid={`badge-status-${status}`}
    >
      <Circle className={cn("h-2 w-2 fill-current", config.dotClassName)} />
      <span className="text-xs font-medium">{config.label}</span>
    </Badge>
  );
}