import { AgentContextPanel } from "@/features/agent-context/AgentContextPanel";
import { BookingFlow } from "@/features/booking/components/BookingFlow";

export function BookingFlowRoute() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <BookingFlow />
      <AgentContextPanel />
    </div>
  );
}
