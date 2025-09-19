import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { 
  Bot as BotIcon, 
  Upload, 
  Activity, 
  Settings, 
  HelpCircle,
  Server,
  Plus
} from "lucide-react";
import BotStatusBadge, { type BotStatus } from "./BotStatusBadge";
import { Badge } from "@/components/ui/badge";
import { botApi } from "@/lib/api";
import { type Bot } from "@shared/schema";

interface AppSidebarProps {
  selectedBotId?: string;
  onSelectBot?: (botId: string) => void;
  onUploadBot?: () => void;
}

type BotWithActivity = Bot & {
  lastActivity: string;
};

const navigationItems = [
  {
    title: "Dashboard",
    icon: Activity,
    id: "dashboard",
  },
  {
    title: "Upload Bot",
    icon: Upload,
    id: "upload",
  },
  {
    title: "Configurações",
    icon: Settings,
    id: "settings",
  },
  {
    title: "Ajuda",
    icon: HelpCircle,
    id: "help",
  },
];

export default function AppSidebar({ 
  selectedBotId = "dashboard",
  onSelectBot,
  onUploadBot
}: AppSidebarProps) {
  const [selectedNav, setSelectedNav] = useState(selectedBotId);
  const [bots, setBots] = useState<BotWithActivity[]>([]);

  // Load bots from API
  const loadBots = async () => {
    try {
      const botsData = await botApi.getAllBots();
      setBots(botsData as BotWithActivity[]);
    } catch (error) {
      console.error('Failed to load bots for sidebar:', error);
    }
  };

  useEffect(() => {
    loadBots();
    
    // Refresh sidebar bots every 10 seconds
    const interval = setInterval(loadBots, 10000);
    return () => clearInterval(interval);
  }, []);

  const runningBotsCount = bots.filter(bot => bot.status === 'running').length;
  const totalBotsCount = bots.length;

  const handleNavClick = (id: string) => {
    setSelectedNav(id);
    if (id === "upload") {
      onUploadBot?.();
    } else {
      onSelectBot?.(id);
    }
    console.log('Navigation clicked:', id);
  };

  const handleBotClick = (botId: string) => {
    setSelectedNav(botId);
    onSelectBot?.(botId);
    console.log('Bot selected:', botId);
  };

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-md">
            <Server className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-sidebar-foreground">
              Cloudy Host
            </h2>
            <p className="text-xs text-sidebar-foreground/70">
              Hosting Local
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={selectedNav === item.id}
                    data-testid={`nav-${item.id}`}
                  >
                    <button onClick={() => handleNavClick(item.id)}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Meus Bots ({totalBotsCount})</span>
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              {runningBotsCount} rodando
            </Badge>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {bots.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <BotIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground mb-3">
                  Nenhum bot hospedado
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleNavClick("upload")}
                  data-testid="button-first-upload"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Hospedar Bot
                </Button>
              </div>
            ) : (
              <SidebarMenu>
                {bots.map((bot) => (
                  <SidebarMenuItem key={bot.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={selectedNav === bot.id}
                      data-testid={`nav-bot-${bot.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <button 
                        onClick={() => handleBotClick(bot.id)}
                        className="flex items-center justify-between w-full"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <BotIcon className="h-3 w-3 shrink-0" />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">
                              {bot.name}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {bot.mainFile}
                            </div>
                          </div>
                        </div>
                        <BotStatusBadge status={bot.status} className="ml-2" />
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="space-y-2 text-xs text-sidebar-foreground/70">
          <div className="flex justify-between">
            <span>Status do Sistema:</span>
            <span className="text-green-400">Online</span>
          </div>
          <div className="flex justify-between">
            <span>Versão:</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}