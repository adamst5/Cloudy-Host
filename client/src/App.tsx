import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import Dashboard from "@/components/Dashboard";
import LoginPage from "@/components/LoginPage";
import UserProfile from "@/components/UserProfile";
import PricingPage from "@/components/PricingPage";

type View = "dashboard" | "upload" | "logs" | "settings" | "help";

function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark", !isDark);
    console.log('Theme toggled:', !isDark ? 'dark' : 'light');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      data-testid="button-theme-toggle"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

function Router({ currentView, onViewChange }: { currentView: View; onViewChange: (view: string) => void }) {
  return (
    <Switch>
      <Route path="/dashboard">
        <Dashboard view="dashboard" onViewChange={onViewChange} />
      </Route>
      <Route path="/upload">
        <Dashboard view="upload" onViewChange={onViewChange} />
      </Route>
      <Route path="/logs/:botId?">
        {(params) => (
          <Dashboard 
            view="logs" 
            selectedBotId={params.botId}
            onViewChange={onViewChange} 
          />
        )}
      </Route>
      <Route path="/settings">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Configurações</h1>
            <p className="text-muted-foreground">
              Configure sua plataforma de hospedagem de bots
            </p>
          </div>
          <div className="max-w-2xl space-y-6">
            <div className="bg-muted/30 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium mb-2">Configurações em Desenvolvimento</h3>
              <p className="text-muted-foreground">
                Esta seção será implementada na versão completa da aplicação
              </p>
            </div>
          </div>
        </div>
      </Route>
      <Route path="/pricing">
        <PricingPage />
      </Route>
      <Route path="/help">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Ajuda</h1>
            <p className="text-muted-foreground">
              Guias e documentação para usar a plataforma
            </p>
          </div>
          <div className="max-w-4xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-medium mb-3">Como Hospedar um Bot</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Prepare seu bot em formato .zip</li>
                  <li>• Inclua todas as dependências necessárias</li>
                  <li>• Especifique o arquivo principal</li>
                  <li>• Faça o upload via interface</li>
                </ul>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-medium mb-3">Gerenciamento de Bots</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Inicie/pare bots individualmente</li>
                  <li>• Visualize logs em tempo real</li>
                  <li>• Monitore status e atividade</li>
                  <li>• Gerencie múltiplos bots</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Route>
      <Route path="/login-failed">
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-destructive">Falha na Autenticação</h1>
            <p className="text-muted-foreground">Não foi possível fazer login com Discord.</p>
            <Button onClick={() => window.location.href = '/'}>Tentar Novamente</Button>
          </div>
        </div>
      </Route>
      <Route>
        <Dashboard view="dashboard" onViewChange={onViewChange} />
      </Route>
    </Switch>
  );
}

function App() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/auth/user');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Set dark mode by default
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add("dark");
  }

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  const handleNavigation = (view: string) => {
    setCurrentView(view as View);
    // Simple client-side routing
    window.history.pushState({}, '', `/${view}`);
  };

  const handleUploadBot = () => {
    setCurrentView("upload");
    window.history.pushState({}, '', '/upload');
  };

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-4 bg-muted rounded w-32"></div>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LoginPage />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full bg-background">
            <AppSidebar 
              selectedBotId={currentView}
              onSelectBot={handleNavigation}
              onUploadBot={handleUploadBot}
            />
            <div className="flex flex-col flex-1">
              <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <div className="flex items-center gap-4">
                  <UserProfile />
                  <ThemeToggle />
                </div>
              </header>
              <main className="flex-1 overflow-auto">
                <div className="p-6">
                  <Router 
                    currentView={currentView} 
                    onViewChange={handleNavigation} 
                  />
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;