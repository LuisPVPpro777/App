import { useState } from "react";
import { useProtocolStore } from "@/hooks/useProtocolStore";
import { useAutoTheme } from "@/hooks/useAutoTheme";
import { useAgenda } from "@/hooks/useAgenda";
import CommandHeader from "@/components/CommandHeader";
import DailyChecklist from "@/components/DailyChecklist";
import InvariantRules from "@/components/InvariantRules";
import WorkoutPanel from "@/components/WorkoutPanel";
import StatsPanel from "@/components/StatsPanel";
import Agenda from "@/components/Agenda";
import GymAlert from "@/components/GymAlert";
import TodayMission from "@/components/TodayMission";
import ShareWeekModal from "@/components/ShareWeekModal";
import { Sun, Moon, HardDrive } from "lucide-react";

const Footer = ({ theme }) => (
  <footer
    className="mt-10 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px] uppercase tracking-[0.25em] text-zinc-600 px-1"
    data-testid="footer"
  >
    <div>
      <span className="text-[#CCFF00]">▍</span> PROTOCOLE / 100% LOCAL · HORS-LIGNE
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <span
        className="flex items-center gap-1.5"
        data-testid="storage-indicator"
        style={{ color: "#CCFF00" }}
      >
        <HardDrive className="w-3 h-3" />
        Stockage local · sans wifi
      </span>
      <span className="w-1 h-1 rounded-full bg-zinc-700" />
      <span className="flex items-center gap-1.5" data-testid="theme-indicator">
        {theme === "light" ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
        Mode {theme === "light" ? "Clair" : "Sombre"} · auto 09:40→18:00
      </span>
    </div>
  </footer>
);

export default function Dashboard() {
  const store = useProtocolStore();
  const agenda = useAgenda();
  const theme = useAutoTheme();
  const [shareOpen, setShareOpen] = useState(false);

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
    <>
      <GymAlert sessions={agenda.sessions} />
      <ShareWeekModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        sessions={agenda.sessions}
        crossfitDays={agenda.crossfitDays}
        maisonDays={agenda.maisonDays}
        streak={store.streak}
        weeklyAvg={store.weeklyAvg}
        completion={store.completion}
      />
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

        <div className="mt-6">
          <TodayMission
            sessions={agenda.sessions}
            crossfitDays={agenda.crossfitDays}
            maisonDays={agenda.maisonDays}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <DailyChecklist
              checks={store.checks}
              completion={store.completion}
              toggle={store.toggle}
              reset={store.reset}
            />
            <InvariantRules />
          </div>

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

        <div className="mt-6">
          <Agenda
            sessions={agenda.sessions}
            crossfitDays={agenda.crossfitDays}
            maisonDays={agenda.maisonDays}
            toggleSession={agenda.toggleSession}
            clearWeek={agenda.clearWeek}
            onShare={() => setShareOpen(true)}
          />
        </div>

        <Footer theme={theme} />
      </main>
    </>
  );
}
