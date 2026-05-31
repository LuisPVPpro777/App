import { useProtocolStore } from "@/hooks/useProtocolStore";
import CommandHeader from "@/components/CommandHeader";
import DailyChecklist from "@/components/DailyChecklist";
import InvariantRules from "@/components/InvariantRules";
import WorkoutPanel from "@/components/WorkoutPanel";
import StatsPanel from "@/components/StatsPanel";

const Footer = () => (
  <footer
    className="mt-10 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px] uppercase tracking-[0.25em] text-zinc-600 px-1"
    data-testid="footer"
  >
    <div>
      <span className="text-[#CCFF00]">▍</span> PROTOCOLE / LOCAL / SANS COMPTE
    </div>
    <div>
      Données stockées sur cet appareil uniquement · Reset auto à minuit
    </div>
  </footer>
);

export default function Dashboard() {
  const store = useProtocolStore();

  if (!store.hydrated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-zinc-500 text-xs tracking-widest uppercase"
        data-testid="loading-state"
      >
        Initialisation du protocole<span className="blink">_</span>
      </div>
    );
  }

  return (
    <main
      className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10"
      data-testid="dashboard-root"
    >
      <CommandHeader
        completion={store.completion}
        completedCount={store.completedCount}
        total={store.total}
        streak={store.streak}
        weeklyAvg={store.weeklyAvg}
      />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column - Checklist takes priority */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <DailyChecklist
            checks={store.checks}
            completion={store.completion}
            toggle={store.toggle}
            reset={store.reset}
          />
          <InvariantRules />
        </div>

        {/* Right column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <StatsPanel
            streak={store.streak}
            bestStreak={store.bestStreak}
            completion={store.completion}
            weeklyAvg={store.weeklyAvg}
            last7={store.last7}
          />
          <WorkoutPanel />
        </div>
      </div>

      <Footer />
    </main>
  );
}
