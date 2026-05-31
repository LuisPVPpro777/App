import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Check, Clock, RotateCcw } from "lucide-react";
import { DAILY_CHECKLIST, computeActiveTaskId } from "@/lib/protocolData";

const fireConfetti = () => {
  const duration = 1200;
  const end = Date.now() + duration;
  const colors = ["#CCFF00", "#F4F4F5", "#FF3B30"];
  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
      shapes: ["square"],
      scalar: 0.9,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
      shapes: ["square"],
      scalar: 0.9,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
};

export const DailyChecklist = ({ checks, completion, toggle, reset }) => {
  const [activeId, setActiveId] = useState(() => computeActiveTaskId());
  const [celebrated, setCelebrated] = useState(false);

  // recompute active task every 30 sec
  useEffect(() => {
    const id = setInterval(() => setActiveId(computeActiveTaskId()), 30 * 1000);
    return () => clearInterval(id);
  }, []);

  // celebrate at 100%
  useEffect(() => {
    if (completion === 1 && !celebrated) {
      fireConfetti();
      toast.success("Mission accomplie. Discipline = 100%.", {
        description: "Le streak monte. Reste affûté pour demain.",
      });
      setCelebrated(true);
    }
    if (completion < 1 && celebrated) setCelebrated(false);
  }, [completion, celebrated]);

  const tasks = useMemo(() => DAILY_CHECKLIST, []);

  return (
    <section
      className="surface surface-corner relative"
      data-testid="daily-checklist"
    >
      <div className="flex items-center justify-between px-6 pt-6">
        <div>
          <div className="overline">SECTION / 01</div>
          <h2 className="font-display uppercase text-2xl sm:text-3xl tracking-tight mt-1">
            Checklist Quotidienne
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            reset();
            toast("Checklist réinitialisée.", { description: "Repars à zéro." });
          }}
          data-testid="reset-checklist-btn"
          className="group flex items-center gap-2 px-3 py-2 border border-[#27272a] hover:border-[#CCFF00] hover:text-[#CCFF00] text-xs uppercase tracking-widest text-zinc-400 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 transition-transform group-hover:-rotate-180" />
          Reset
        </button>
      </div>

      <ul className="mt-6 divide-y divide-[#1f1f22] border-t border-[#1f1f22]">
        {tasks.map((task, idx) => {
          const done = !!checks[task.id];
          const isActive = activeId === task.id && !done;
          return (
            <li
              key={task.id}
              data-testid={`task-row-${task.id}`}
              className={`relative group transition-colors ${
                isActive
                  ? "bg-[rgba(204,255,0,0.06)]"
                  : "hover:bg-[#141417]"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#CCFF00] pulse-volt" />
              )}
              <button
                type="button"
                onClick={() => toggle(task.id)}
                data-testid={`task-toggle-${task.id}`}
                className="w-full flex items-stretch gap-5 px-6 py-5 text-left"
              >
                {/* Index + time column */}
                <div className="flex flex-col items-start min-w-[72px]">
                  <span className="overline text-[10px]">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`font-display tabular text-xl mt-1 ${
                      isActive ? "text-[#CCFF00]" : "text-zinc-200"
                    }`}
                  >
                    {task.time}
                  </span>
                  {isActive && (
                    <span className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#CCFF00]">
                      <Clock className="w-3 h-3" />
                      En cours
                    </span>
                  )}
                </div>

                {/* Title + detail */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-display uppercase tracking-tight text-lg sm:text-xl transition-all ${
                      done
                        ? "text-zinc-500 line-through decoration-[#CCFF00] decoration-2"
                        : "text-white"
                    }`}
                  >
                    {task.title}
                  </div>
                  <p
                    className={`mt-1 text-sm leading-snug ${
                      done ? "text-zinc-600" : "text-zinc-400"
                    }`}
                  >
                    {task.detail}
                  </p>
                </div>

                {/* Checkbox */}
                <div className="flex items-center">
                  <motion.span
                    whileTap={{ scale: 0.85 }}
                    className={`relative w-9 h-9 border-2 flex items-center justify-center transition-colors ${
                      done
                        ? "bg-[#CCFF00] border-[#CCFF00]"
                        : isActive
                        ? "border-[#CCFF00]"
                        : "border-[#3f3f46] group-hover:border-zinc-300"
                    }`}
                    data-testid={`task-checkbox-${task.id}`}
                  >
                    <AnimatePresence>
                      {done && (
                        <motion.span
                          key="check"
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 18 }}
                          className="flex"
                        >
                          <Check className="w-5 h-5 text-black" strokeWidth={3} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default DailyChecklist;
