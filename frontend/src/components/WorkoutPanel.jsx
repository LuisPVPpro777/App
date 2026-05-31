import { useState } from "react";
import { HOME_WORKOUT } from "@/lib/protocolData";
import { Dumbbell, Play, Sparkles } from "lucide-react";
import WorkoutSession from "@/components/WorkoutSession";

export const WorkoutPanel = () => {
  const [sessionOpen, setSessionOpen] = useState(false);

  return (
    <section
      className="surface surface-corner relative overflow-hidden"
      data-testid="workout-panel"
    >
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
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

        {/* launch focus mode */}
        <div className="px-6 py-6 border-t border-[#1f1f22]">
          <button
            type="button"
            onClick={() => setSessionOpen(true)}
            data-testid="launch-session-btn"
            className="group w-full flex items-center justify-between gap-4 px-5 py-4 bg-[#CCFF00] hover:bg-white text-black font-display uppercase tracking-wider transition-colors"
          >
            <span className="flex items-center gap-3">
              <Play className="w-5 h-5" />
              <span className="text-lg">Démarrer la séance</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-xs tracking-[0.25em] opacity-70 group-hover:opacity-100">
              <Sparkles className="w-3.5 h-3.5" />
              FOCUS MODE
            </span>
          </button>
          <p className="mt-2 text-[11px] text-zinc-500 tracking-wide">
            Plein écran · chrono ascendant · tuto images · alerte rouge si dépassement.
          </p>
        </div>
      </div>

      <WorkoutSession open={sessionOpen} onClose={() => setSessionOpen(false)} />
    </section>
  );
};

export default WorkoutPanel;
