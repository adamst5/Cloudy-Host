import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiDiscord } from "react-icons/si";
import cloudyHostLogo from "@assets/stock_images/cloud_hosting_icon_l_b1e1ce30.jpg";

export default function LoginPage() {
  const handleDiscordLogin = () => {
    window.location.href = '/auth/discord';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img 
              src={cloudyHostLogo} 
              alt="Cloudy Host Logo" 
              className="h-16 w-16 rounded-lg object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold">Cloudy Host</h1>
          <p className="text-muted-foreground mt-2">
            Hospede seus bots Discord com facilidade
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Faça Login</CardTitle>
            <CardDescription>
              Entre com sua conta Discord para começar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleDiscordLogin}
              className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
              size="lg"
              data-testid="button-discord-login"
            >
              <SiDiscord className="h-5 w-5 mr-2" />
              Continuar com Discord
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Ao fazer login, você concorda com nossos termos de serviço</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Precisa de ajuda? <a href="https://discord.gg/WeNyPD57sW" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Entre em contato</a>
          </p>
        </div>
      </div>
    </div>
  );
}