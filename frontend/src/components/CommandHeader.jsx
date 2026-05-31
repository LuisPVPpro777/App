import { useNow } from "@/hooks/useNow";
import { motion } from "framer-motion";
import { Flame, Activity } from "lucide-react";

const dateFR = (d) =>
  d
    .toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();

export const CommandHeader = ({ completion, completedCount, total, streak, weeklyAvg }) => {
  const now = useNow(1000);
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  const pct = Math.round(completion * 100);
  const weeklyPct = Math.round(weeklyAvg * 100);
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const dash = circ * completion;

  return (
    <header
      data-testid="command-header"
      className="surface surface-corner relative overflow-hidden"
    >
      <div className="scan-line" />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 md:p-8">
        {/* LEFT: identity */}
        <div className="md:col-span-5 flex flex-col justify-between">
          <div>
            <div className="overline" data-testid="header-overline">
              PROTOCOLE / V1.0 / PRIVATE
            </div>
            <h1
              className="font-display uppercase text-4xl sm:text-5xl lg:text-6xl tracking-tighter mt-2 leading-[0.95]"
              data-testid="header-title"
            >
              SUMMER<br />
              <span className="text-[#CCFF00]">BUILD</span> PROTOCOL
            </h1>
            <p className="mt-3 text-sm text-zinc-400 max-w-sm">
              Discipline militaire. Précision quotidienne. Aucune dérive tolérée.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#CCFF00] rounded-full blink" />
            <span className="text-xs text-zinc-500 tabular tracking-wider">
              SYSTÈME EN LIGNE — {dateFR(now)}
            </span>
          </div>
        </div>

        {/* MIDDLE: clock */}
        <div className="md:col-span-4 flex flex-col items-start md:items-center justify-center border-l-0 md:border-l md:border-r border-[#27272a] md:px-6">
          <div className="overline mb-2">HEURE LOCALE</div>
          <div
            className="font-display tabular text-6xl sm:text-7xl tracking-tighter leading-none"
            data-testid="header-clock"
          >
            <span>{hh}</span>
            <span className="text-[#CCFF00] mx-1 blink">:</span>
            <span>{mm}</span>
            <span className="text-zinc-600 text-3xl align-top ml-1">{ss}</span>
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs uppercase tracking-widest text-zinc-500">
            <span className="flex items-center gap-1.5" data-testid="streak-badge">
              <Flame className="w-3.5 h-3.5 text-[#FF3B30]" />
              <span className="tabular text-zinc-200">{streak}</span>
              <span>j streak</span>
            </span>
            <span className="w-px h-3 bg-zinc-700" />
            <span className="flex items-center gap-1.5" data-testid="weekly-badge">
              <Activity className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span className="tabular text-zinc-200">{weeklyPct}%</span>
              <span>/ 7j</span>
            </span>
          </div>
        </div>

        {/* RIGHT: progress ring */}
        <div className="md:col-span-3 flex items-center justify-center md:justify-end">
          <div className="relative" data-testid="progress-ring">
            <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke="#27272a"
                strokeWidth="3"
                fill="none"
              />
              <motion.circle
                cx="70"
                cy="70"
                r={radius}
                stroke="#CCFF00"
                strokeWidth="3"
                fill="none"
                strokeLinecap="square"
                strokeDasharray={`${dash} ${circ}`}
                initial={false}
                animate={{ strokeDasharray: `${dash} ${circ}` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-display tabular text-4xl text-white leading-none" data-testid="progress-pct">
                {pct}
                <span className="text-xl text-zinc-500">%</span>
              </div>
              <div className="text-[10px] tracking-[0.25em] text-zinc-500 mt-1">
                {completedCount}/{total} TASKS
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CommandHeader;
