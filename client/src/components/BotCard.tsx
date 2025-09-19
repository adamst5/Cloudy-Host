import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, FileText, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BotStatusBadge, { type BotStatus } from "./BotStatusBadge";

interface BotCardProps {
  name: string;
  mainFile: string;
  status: BotStatus;
  lastActivity?: string;
  onStart?: () => void;
  onStop?: () => void;
  onViewLogs?: () => void;
  onDelete?: () => void;
}

export default function BotCard({
  name,
  mainFile,
  status,
  lastActivity,
  onStart,
  onStop,
  onViewLogs,
  onDelete,
}: BotCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: () => void) => {
    setIsLoading(true);
    try {
      action();
      // Simulate async action
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsLoading(false);
    }
  };

  const canStart = status === "stopped" || status === "error";
  const canStop = status === "running" || status === "starting";

  return (
    <Card 
      className="hover-elevate transition-all duration-200"
      data-testid={`card-bot-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-medium text-foreground" data-testid={`text-bot-name-${name}`}>
              {name}
            </h3>
            <p className="text-sm text-muted-foreground font-mono">
              {mainFile}
            </p>
            {lastActivity && (
              <p className="text-xs text-muted-foreground">
                Última atividade: {lastActivity}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <BotStatusBadge status={status} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  data-testid={`button-bot-menu-${name}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={onViewLogs}
                  data-testid={`button-view-logs-${name}`}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Logs
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="text-destructive"
                  data-testid={`button-delete-bot-${name}`}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          {canStart && (
            <Button
              variant="default"
              size="sm"
              onClick={() => handleAction(onStart || (() => console.log('Start bot:', name)))}
              disabled={isLoading}
              data-testid={`button-start-${name}`}
            >
              <Play className="h-3 w-3 mr-1.5" />
              Iniciar
            </Button>
          )}
          {canStop && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleAction(onStop || (() => console.log('Stop bot:', name)))}
              disabled={isLoading}
              data-testid={`button-stop-${name}`}
            >
              <Square className="h-3 w-3 mr-1.5" />
              Parar
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onViewLogs || (() => console.log('View logs for:', name))}
            data-testid={`button-logs-${name}`}
          >
            <FileText className="h-3 w-3 mr-1.5" />
            Logs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}