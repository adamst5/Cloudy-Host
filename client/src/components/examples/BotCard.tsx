import BotCard from '../BotCard';

export default function BotCardExample() {
  return (
    <div className="max-w-md space-y-4 p-4">
      <BotCard
        name="Discord Bot"
        mainFile="bot.js"
        status="running"
        lastActivity="2 minutos atrás"
      />
      <BotCard
        name="Telegram Bot"
        mainFile="index.py"
        status="stopped"
        lastActivity="1 hora atrás"
      />
      <BotCard
        name="WhatsApp Bot"
        mainFile="server.js"
        status="starting"
        lastActivity="agora"
      />
      <BotCard
        name="Twitter Bot"
        mainFile="main.py"
        status="error"
        lastActivity="5 minutos atrás"
      />
    </div>
  );
}