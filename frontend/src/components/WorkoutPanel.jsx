import { useEffect, useRef, useState } from "react";
import { HOME_WORKOUT } from "@/lib/protocolData";
import { Dumbbell, Play, Pause, RotateCcw } from "lucide-react";

const TOTAL_SECONDS = 15 * 60;

const fmt = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

export const WorkoutPanel = () => {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(ref.current);
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [running]);

  const pct = 1 - secondsLeft / TOTAL_SECONDS;

  return (
    <section
      className="surface surface-corner relative overflow-hidden"
      data-testid="workout-panel"
    >
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "url('https://static.prod-images.emergentagent.com/jobs/b743beb1-6172-456d-8a5a-b3a22ce19b13/images/eac8e77e32ba12a2dfc1f05cfd3551de17f747093ecfc2aa15217315abae063b.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative">
        <div className="px-6 pt-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Dumbbell className="w-5 h-5 text-[#CCFF00] mt-1" />
            <div>
              <div className="overline">SECTION / 03</div>
              <h2 className="font-display uppercase text-2xl sm:text-3xl tracking-tight mt-1">
                {HOME_WORKOUT.title}
              </h2>
              <div className="mt-1 flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500">
                <span>{HOME_WORKOUT.duration}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                <span className="text-[#CCFF00]">FOCUS · {HOME_WORKOUT.focus}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="overline">TIMER</div>
            <div
              className="font-display tabular text-4xl sm:text-5xl leading-none tracking-tighter mt-1 text-white"
              data-testid="workout-timer"
            >
              {fmt(secondsLeft)}
            </div>
          </div>
        </div>

        {/* progress bar */}
        <div className="mx-6 mt-5 h-[3px] bg-[#27272a]">
          <div
            className="h-full bg-[#CCFF00] transition-all"
            style={{ width: `${pct * 100}%` }}
          />
        </div>

        {/* controls */}
        <div className="px-6 mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            data-testid="workout-start-pause-btn"
            className="flex items-center gap-2 px-4 py-2 bg-[#CCFF00] text-black font-display uppercase tracking-wider text-sm hover:bg-white transition-colors"
          >
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {running ? "Pause" : secondsLeft === TOTAL_SECONDS ? "Démarrer" : "Reprendre"}
          </button>
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setSecondsLeft(TOTAL_SECONDS);
            }}
            data-testid="workout-reset-btn"
            className="flex items-center gap-2 px-4 py-2 border border-[#27272a] hover:border-zinc-500 text-zinc-300 font-display uppercase tracking-wider text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* blocks */}
        <ol className="mt-6 border-t border-[#1f1f22] divide-y divide-[#1f1f22]">
          {HOME_WORKOUT.blocks.map((b, i) => (
            <li
              key={b.id}
              data-testid={`workout-block-${b.id}`}
              className="px-6 py-4 grid grid-cols-[40px_90px_1fr] items-center gap-4"
            >
              <span className="font-display tabular text-xl text-zinc-700">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <div className="font-display uppercase tracking-tight text-base text-white">
                  {b.label}
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#CCFF00]">
                  {b.duration}
                </div>
              </div>
              <p className="text-sm text-zinc-400 leading-snug">{b.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default WorkoutPanel;
