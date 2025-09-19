import BotStatusBadge from '../BotStatusBadge';

export default function BotStatusBadgeExample() {
  return (
    <div className="flex flex-wrap gap-2 p-4">
      <BotStatusBadge status="running" />
      <BotStatusBadge status="stopped" />
      <BotStatusBadge status="starting" />
      <BotStatusBadge status="error" />
    </div>
  );
}