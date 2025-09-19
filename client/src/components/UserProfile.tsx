import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Crown } from "lucide-react";
import { subscriptionPlans, type User, type SubscriptionPlan } from "@shared/schema";

interface UserProfileProps {
  onLogout?: () => void;
}

export default function UserProfile({ onLogout }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/auth/user');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // User not authenticated, redirect to login
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/auth/logout', { method: 'GET' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleUpgrade = () => {
    window.open('https://discord.gg/WeNyPD57sW', '_blank');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-10 w-10 bg-muted rounded-full"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return null;
  }

  const currentPlan = subscriptionPlans[user.subscription as SubscriptionPlan];
  const avatarUrl = user.avatar 
    ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`
    : undefined;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatarUrl} alt={user.username} />
            <AvatarFallback className="bg-[#5865F2] text-white">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-base">
              {user.username}
              {user.discriminator && <span className="text-muted-foreground">#{user.discriminator}</span>}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Plano Atual</span>
            <Badge variant={user.subscription === 'free' ? 'secondary' : 'default'}>
              {currentPlan.name}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            <div>Bots: {user.maxBots} máximo</div>
            <div>RAM: {currentPlan.ram} | CPU: {currentPlan.vcpu} vCPU</div>
          </div>
        </div>

        {user.subscription === 'free' && (
          <Button 
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-[#5865F2] to-[#7289DA] hover:from-[#4752C4] to-[#677BC4] text-white"
            data-testid="button-upgrade-plan"
          >
            <Crown className="h-4 w-4 mr-2" />
            Fazer Upgrade
          </Button>
        )}

        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full"
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </CardContent>
    </Card>
  );
}