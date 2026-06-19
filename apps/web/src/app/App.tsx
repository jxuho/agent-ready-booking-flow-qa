import { AppProviders } from "@/app/providers";
import { AppShell } from "@/app/AppShell";
import { BookingFlowRoute } from "@/routes/BookingFlowRoute";

export function App() {
  return (
    <AppProviders>
      <AppShell>
        <BookingFlowRoute />
      </AppShell>
    </AppProviders>
  );
}
