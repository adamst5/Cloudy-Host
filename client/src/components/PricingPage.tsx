import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Rocket } from "lucide-react";
import { subscriptionPlans } from "@shared/schema";

const planIcons = {
  free: null,
  basico: <Zap className="h-6 w-6" />,
  pro: <Crown className="h-6 w-6" />,
  ultra: <Rocket className="h-6 w-6" />
};

const planFeatures = {
  free: [
    "1 bot hospedado",
    "1GB RAM",
    "1.5 vCPU",
    "Suporte básico",
    "Auto-restart inteligente",
    "Dashboard de monitoramento"
  ],
  basico: [
    "2 bots hospedados",
    "2GB RAM",
    "2 vCPU", 
    "Suporte por email",
    "Auto-restart inteligente",
    "Dashboard avançado",
    "Logs detalhados"
  ],
  pro: [
    "5 bots hospedados",
    "4GB RAM",
    "3 vCPU",
    "Suporte prioritário",
    "Auto-restart inteligente",
    "Dashboard completo",
    "Analytics avançados",
    "Backups automáticos"
  ],
  ultra: [
    "10 bots hospedados",
    "8GB RAM",
    "4 vCPU",
    "Suporte 24/7",
    "Auto-restart inteligente",
    "Dashboard empresarial",
    "Analytics premium",
    "Backups e restauração",
    "Prioridade máxima"
  ]
};

export default function PricingPage() {
  const handleUpgrade = (plan: string) => {
    window.open('https://discord.gg/WeNyPD57sW', '_blank');
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Escolha seu Plano</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Hospede seus bots Discord com recursos avançados e suporte dedicado
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(subscriptionPlans).map(([planKey, plan]) => (
          <Card 
            key={planKey}
            className={`relative hover-elevate ${
              planKey === 'pro' ? 'border-primary shadow-lg scale-105' : ''
            }`}
          >
            {planKey === 'pro' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  Mais Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full ${
                  planKey === 'free' ? 'bg-muted' : 'bg-primary/10'
                }`}>
                  {planIcons[planKey as keyof typeof planIcons] || (
                    <div className="h-6 w-6 bg-muted-foreground/20 rounded" />
                  )}
                </div>
              </div>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="text-sm">
                Ideal para {planKey === 'free' ? 'iniciantes' : 
                           planKey === 'basico' ? 'desenvolvedores' :
                           planKey === 'pro' ? 'pequenas equipes' : 'empresas'}
              </CardDescription>
              <div className="space-y-2">
                <div className="text-4xl font-bold">{plan.price}</div>
                {planKey !== 'free' && (
                  <div className="text-sm text-muted-foreground">por mês</div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Recursos:</div>
                  <div className="font-medium">{plan.ram} RAM • {plan.vcpu} vCPU</div>
                </div>
              </div>

              <div className="space-y-3">
                {planFeatures[planKey as keyof typeof planFeatures].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleUpgrade(planKey)}
                className={`w-full ${
                  planKey === 'free' 
                    ? 'bg-muted text-muted-foreground hover:bg-muted/80' 
                    : planKey === 'pro'
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
                data-testid={`button-plan-${planKey}`}
              >
                {planKey === 'free' ? 'Plano Atual' : 'Começar Agora'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold">Dúvidas sobre os planos?</h2>
        <p className="text-muted-foreground">
          Entre em contato conosco no Discord para esclarecer suas dúvidas
        </p>
        <Button
          variant="outline"
          onClick={() => window.open('https://discord.gg/WeNyPD57sW', '_blank')}
          data-testid="button-contact-support"
        >
          Falar com Suporte
        </Button>
      </div>
    </div>
  );
}