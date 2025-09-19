import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Activity, 
  Bot as BotIcon, 
  Play, 
  Square, 
  AlertCircle, 
  Upload,
  Plus,
  Loader2
} from "lucide-react";
import BotCard from "./BotCard";
import UploadZone from "./UploadZone";
import LogViewer from "./LogViewer";
import { type BotStatus } from "@shared/schema";
import { botApi } from "@/lib/api";
import { type Bot } from "@shared/schema";

interface DashboardProps {
  view?: "dashboard" | "upload" | "logs";
  selectedBotId?: string;
  onViewChange?: (view: string) => void;
}

type BotWithActivity = Bot & {
  lastActivity: string;
};

export default function Dashboard({ 
  view = "dashboard", 
  selectedBotId,
  onViewChange 
}: DashboardProps) {
  const [bots, setBots] = useState<BotWithActivity[]>([]);
  const [selectedBot, setSelectedBot] = useState<BotWithActivity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const runningCount = bots.filter(bot => bot.status === 'running').length;
  const stoppedCount = bots.filter(bot => bot.status === 'stopped').length;
  const errorCount = bots.filter(bot => bot.status === 'error').length;
  const unresponsiveCount = bots.filter(bot => bot.status === 'unresponsive').length;

  // Load bots from API
  const loadBots = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      else setIsRefreshing(true);
      
      const botsData = await botApi.getAllBots();
      setBots(botsData as BotWithActivity[]);
    } catch (error) {
      console.error('Failed to load bots:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao carregar bots",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load bots on component mount
  useEffect(() => {
    loadBots();
  }, []);

  // Refresh bots periodically
  useEffect(() => {
    const interval = setInterval(() => {
      loadBots(false); // Refresh without loading state
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleUpload = async (file: File, botName: string, mainFile: string) => {
    try {
      const response = await botApi.uploadBot(file, botName, mainFile);
      
      toast({
        title: "Sucesso",
        description: `Bot "${botName}" foi hospedado com sucesso!`,
      });
      
      // Refresh bots list and go to dashboard
      await loadBots();
      onViewChange?.("dashboard");
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Erro no Upload",
        description: error instanceof Error ? error.message : "Falha ao hospedar bot",
        variant: "destructive",
      });
    }
  };

  const handleBotAction = async (botId: string, action: 'start' | 'stop' | 'delete' | 'logs') => {
    if (action === 'logs') {
      const bot = bots.find(b => b.id === botId);
      if (bot) {
        setSelectedBot(bot);
        onViewChange?.("logs");
      }
      return;
    }

    try {
      let response;
      let successMessage;

      switch (action) {
        case 'start':
          // Optimistically update UI
          setBots(prev => prev.map(bot => 
            bot.id === botId 
              ? { ...bot, status: 'starting' as BotStatus }
              : bot
          ));
          response = await botApi.startBot(botId);
          successMessage = "Bot iniciado com sucesso";
          break;

        case 'stop':
          response = await botApi.stopBot(botId);
          successMessage = "Bot parado com sucesso";
          break;

        case 'delete':
          response = await botApi.deleteBot(botId);
          successMessage = "Bot excluído com sucesso";
          break;
      }

      if (response?.success !== false) {
        toast({
          title: "Sucesso",
          description: successMessage,
        });
        
        // Refresh bots list to get current status
        await loadBots(false);
      }
    } catch (error) {
      console.error(`Bot action ${action} failed:`, error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : `Falha ao ${action === 'start' ? 'iniciar' : action === 'stop' ? 'parar' : 'excluir'} bot`,
        variant: "destructive",
      });
      
      // Refresh to get current state
      await loadBots(false);
    }
  };

  if (view === "logs" && selectedBot) {
    return (
      <div className="h-full">
        <LogViewer 
          botId={selectedBot.id}
          botName={selectedBot.name}
          onClose={() => {
            setSelectedBot(null);
            onViewChange?.("dashboard");
          }}
        />
      </div>
    );
  }

  if (view === "upload") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Hospedar Novo Bot</h1>
          <p className="text-muted-foreground">
            Faça upload do seu bot em formato .zip e configure o arquivo principal
          </p>
        </div>
        
        <div className="max-w-2xl">
          <UploadZone onUpload={handleUpload} />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instruções</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
              <p>Comprima todos os arquivos do seu bot em um arquivo .zip</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
              <p>Certifique-se de que todas as dependências estão incluídas</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
              <p>Especifique o arquivo principal que será executado (ex: bot.js, index.py)</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">4</span>
              <p>O bot será extraído e executado automaticamente após o upload</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Gerencie todos os seus bots hospedados
          </p>
        </div>
        
        <Button 
          onClick={() => onViewChange?.("upload")}
          data-testid="button-upload-new"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Bot
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BotIcon className="h-4 w-4" />
              Total de Bots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bots.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Bots hospedados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Play className="h-4 w-4 text-green-400" />
              Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{runningCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Bots rodando
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Square className="h-4 w-4 text-gray-400" />
              Parados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">{stoppedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Bots inativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              Com Erro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{errorCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Precisam atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bots List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Seus Bots</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadBots(false)}
            disabled={isRefreshing}
            data-testid="button-refresh-bots"
          >
            {isRefreshing ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
            ) : (
              <Activity className="h-3 w-3 mr-1.5" />
            )}
            Atualizar
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Carregando bots...</span>
          </div>
        ) : bots.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BotIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Nenhum bot hospedado</h3>
              <p className="text-muted-foreground mb-6">
                Comece fazendo upload do seu primeiro bot
              </p>
              <Button onClick={() => onViewChange?.("upload")}>
                <Upload className="h-4 w-4 mr-2" />
                Hospedar Primeiro Bot
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {bots.map((bot) => (
              <BotCard
                key={bot.id}
                name={bot.name}
                mainFile={bot.mainFile}
                status={bot.status}
                lastActivity={bot.lastActivity}
                onStart={() => handleBotAction(bot.id, 'start')}
                onStop={() => handleBotAction(bot.id, 'stop')}
                onViewLogs={() => handleBotAction(bot.id, 'logs')}
                onDelete={() => handleBotAction(bot.id, 'delete')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}