import { AppShell } from "@/components/layout";
import { OnboardingTour } from "@/components/onboarding-tour";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      {children}
      <OnboardingTour />
    </AppShell>
  );
}
