import { Dumbbell, Home, Coffee, ChevronRight } from "lucide-react";
import { dayIndex, slotLabel, slotToMinutes, WEEK_DAYS_LONG } from "@/lib/agendaLogic";

const fmtMin = (m) => {
  const h = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${h}:${mm}`;
};

export const TodayMission = ({ sessions, crossfitDays, maisonDays }) => {
  const today = dayIndex();
  const todaySessions = (sessions[today] || []).slice().sort((a, b) => a - b);
  const hasCrossfit = todaySessions.length > 0;
  const hasMaison = maisonDays[today];
  const dayName = WEEK_DAYS_LONG[today];

  let kind = "rest";
  if (hasCrossfit && hasMaison) kind = "double";
  else if (hasCrossfit) kind = "crossfit";
  else if (hasMaison) kind = "maison";

  const palette = {
    crossfit: { accent: "#CCFF00", icon: Dumbbell, label: "CROSSFIT JOUR" },
    maison: { accent: "#FFFFFF", icon: Home, label: "SÉANCE MAISON" },
    double: { accent: "#FF3B30", icon: Dumbbell, label: "DOUBLE SÉANCE" },
    rest: { accent: "#71717a", icon: Coffee, label: "JOUR DE REPOS" },
  };
  const p = palette[kind];
  const Icon = p.icon;

  return (
    <section
      className="surface relative overflow-hidden"
      data-testid="today-mission"
      style={{ borderTopWidth: 3, borderTopColor: p.accent }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 p-6">
        <div className="flex items-start gap-4">
          <div
            className="flex items-center justify-center w-12 h-12 shrink-0"
            style={{ backgroundColor: p.accent, color: kind === "rest" || kind === "maison" ? "#0a0a0a" : "#000" }}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="overline">
              MISSION · {dayName.toUpperCase()}
            </div>
            <h2
              className="font-display uppercase text-2xl sm:text-3xl tracking-tight mt-1 leading-tight"
              data-testid="mission-label"
            >
              {p.label}
            </h2>
            <div className="mt-2 text-sm text-zinc-400 leading-snug" data-testid="mission-detail">
              {kind === "crossfit" && (
                <>
                  CrossFit prévu :{" "}
                  {todaySessions.map((s, i) => (
                    <span key={s} className="text-[#CCFF00] tabular">
                      {fmtMin(slotToMinutes(s))}–{fmtMin(slotToMinutes(s) + 60)}
                      {i < todaySessions.length - 1 ? " · " : ""}
                    </span>
                  ))}
                  . Ne triche pas l'intensité.
                </>
              )}
              {kind === "maison" && (
                <>
                  Séance Maison à 18:00 — V-Shape, 15 minutes.{" "}
                  <span className="text-zinc-300">Lance le Focus Mode quand tu es prêt.</span>
                </>
              )}
              {kind === "double" && (
                <>
                  CrossFit puis Séance Maison à 18:00. Gros volume — hydrate-toi.
                </>
              )}
              {kind === "rest" && (
                <>
                  Aucun sport planifié. Repos actif, mobilité, alimentation propre.
                </>
              )}
            </div>
          </div>
        </div>

        {/* mini week dots */}
        <div className="hidden sm:flex flex-col items-end justify-center">
          <div className="overline mb-2">SEMAINE</div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 7 }).map((_, i) => {
              const isToday = i === today;
              const c = crossfitDays[i];
              const m = maisonDays[i];
              return (
                <div
                  key={i}
                  className={`relative w-7 h-7 flex items-center justify-center text-[9px] font-display tracking-widest border ${
                    isToday ? "border-[#CCFF00]" : "border-[#27272a]"
                  } ${c ? "bg-[#CCFF00] text-black" : m ? "bg-white text-black" : "text-zinc-500"}`}
                  title={WEEK_DAYS_LONG[i]}
                >
                  {["L", "M", "M", "J", "V", "S", "D"][i]}
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex items-center gap-3 text-[9px] uppercase tracking-widest text-zinc-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#CCFF00]" /> CrossFit</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-white" /> Maison</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TodayMission;
