import { Flame, TrendingUp, Trophy, Target } from "lucide-react";

const dayLabel = (dateStr) => {
  const d = new Date(dateStr + "T12:00:00");
  return d
    .toLocaleDateString("fr-FR", { weekday: "short" })
    .replace(".", "")
    .toUpperCase()
    .slice(0, 3);
};

export const StatsPanel = ({ streak, bestStreak, completion, weeklyAvg, last7 }) => {
  const weeklyPct = Math.round(weeklyAvg * 100);
  const todayPct = Math.round(completion * 100);

  const cells = [
    {
      id: "streak",
      label: "STREAK ACTIF",
      value: streak,
      suffix: " j",
      icon: Flame,
      color: "#FF3B30",
    },
    {
      id: "best",
      label: "RECORD",
      value: bestStreak,
      suffix: " j",
      icon: Trophy,
      color: "#CCFF00",
    },
    {
      id: "today",
      label: "AUJOURD'HUI",
      value: todayPct,
      suffix: "%",
      icon: Target,
      color: "#CCFF00",
    },
    {
      id: "weekly",
      label: "MOYENNE 7J",
      value: weeklyPct,
      suffix: "%",
      icon: TrendingUp,
      color: "#F4F4F5",
    },
  ];

  return (
    <section className="surface surface-corner relative" data-testid="stats-panel">
      <div className="px-6 pt-6">
        <div className="overline">TÉLÉMÉTRIE</div>
        <h2 className="font-display uppercase text-2xl sm:text-3xl tracking-tight mt-1">
          Performance
        </h2>
      </div>

      <div className="mt-6 grid grid-cols-2 border-t border-[#1f1f22]">
        {cells.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={c.id}
              data-testid={`stat-${c.id}`}
              className={`p-5 ${
                idx % 2 === 0 ? "border-r" : ""
              } ${idx < 2 ? "border-b" : ""} border-[#1f1f22]`}
            >
              <div className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] text-zinc-500 uppercase">
                <Icon className="w-3 h-3" style={{ color: c.color }} />
                {c.label}
              </div>
              <div className="mt-2 font-display tabular text-4xl text-white leading-none">
                {c.value}
                <span className="text-xl text-zinc-500">{c.suffix}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Last 7 days bars */}
      <div className="px-6 pt-5 pb-6 border-t border-[#1f1f22]">
        <div className="overline mb-3">DERNIERS 7 JOURS</div>
        <div className="flex items-end gap-2 h-28" data-testid="week-bars">
          {last7.map((d) => {
            const h = d.value > 0 ? Math.max(d.value * 100, 6) : 100;
            const isEmpty = d.value === 0;
            return (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center gap-2"
                data-testid={`week-bar-${d.date}`}
              >
                <div className="w-full h-full flex items-end">
                  <div
                    className={`w-full transition-all ${
                      isEmpty
                        ? "border border-dashed border-[#27272a]"
                        : d.isToday
                        ? "bg-[#CCFF00]"
                        : d.value === 1
                        ? "bg-zinc-200"
                        : "bg-zinc-600"
                    }`}
                    style={{ height: `${h}%` }}
                  />
                </div>
                <span
                  className={`text-[10px] tracking-widest tabular ${
                    d.isToday ? "text-[#CCFF00]" : "text-zinc-600"
                  }`}
                >
                  {dayLabel(d.date)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsPanel;
