import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Terminal, 
  Trash2, 
  Download, 
  Search, 
  Pause, 
  Play, 
  X,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { botApi } from "@/lib/api";

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

interface LogViewerProps {
  botId: string;
  botName: string;
  isAutoScroll?: boolean;
  onClose?: () => void;
  className?: string;
}

const levelColors = {
  info: 'text-blue-400',
  warn: 'text-yellow-400', 
  error: 'text-red-400',
  debug: 'text-gray-400',
};

const levelLabels = {
  info: 'INFO',
  warn: 'WARN',
  error: 'ERROR',
  debug: 'DEBUG',
};

export default function LogViewer({ 
  botId,
  botName, 
  isAutoScroll = true,
  onClose,
  className 
}: LogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPaused, setIsPaused] = useState(!isAutoScroll);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load logs from API
  const loadLogs = async () => {
    try {
      const logsData = await botApi.getBotLogs(botId);
      setLogs(logsData);
    } catch (error) {
      console.error('Failed to load logs:', error);
      // Don't show toast for logs - it might spam the user
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadLogs();
  }, [botId]);

  // Auto-refresh logs every 2 seconds if not paused
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(loadLogs, 2000);
    return () => clearInterval(interval);
  }, [isPaused, botId]);

  useEffect(() => {
    const filtered = logs.filter(log =>
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.level.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLogs(filtered);
  }, [logs, searchTerm]);

  useEffect(() => {
    if (!isPaused && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredLogs, isPaused]);

  const clearLogs = async () => {
    try {
      await botApi.clearBotLogs(botId);
      setLogs([]);
      toast({
        title: "Sucesso",
        description: "Logs limpos com sucesso",
      });
    } catch (error) {
      console.error('Failed to clear logs:', error);
      toast({
        title: "Erro",
        description: "Falha ao limpar logs",
        variant: "destructive",
      });
    }
  };

  const downloadLogs = () => {
    const logContent = logs
      .map(log => `[${log.timestamp}] [${levelLabels[log.level]}] ${log.message}`)
      .join('\n');
    
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${botName.toLowerCase().replace(/\s+/g, '-')}-logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            <h3 className="font-medium text-foreground">
              Logs - {botName}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsPaused(!isPaused)}
              data-testid="button-toggle-autoscroll"
            >
              {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={downloadLogs}
              data-testid="button-download-logs"
            >
              <Download className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={clearLogs}
              data-testid="button-clear-logs"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClose}
                data-testid="button-close-logs"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar nos logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-8"
            data-testid="input-search-logs"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea 
          className="h-full px-6 pb-6" 
          ref={scrollAreaRef}
          data-testid="area-logs"
        >
          <div className="bg-card-foreground/5 rounded-md p-4 font-mono text-xs space-y-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-muted-foreground">Carregando logs...</span>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                {searchTerm ? 'Nenhum log encontrado para a busca' : 'Nenhum log disponível'}
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-start gap-3 py-0.5"
                  data-testid={`log-entry-${log.id}`}
                >
                  <span className="text-muted-foreground shrink-0 w-20">
                    {log.timestamp.split(' ')[1]}
                  </span>
                  <span 
                    className={cn(
                      "shrink-0 w-12 font-medium",
                      levelColors[log.level]
                    )}
                  >
                    {levelLabels[log.level]}
                  </span>
                  <span className="text-foreground/90 break-all">
                    {log.message}
                  </span>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}