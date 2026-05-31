import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { isNowInSession } from "@/lib/agendaLogic";

const fmt = (mins) => {
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
};

export const GymAlert = ({ sessions }) => {
  const [snoozedUntil, setSnoozedUntil] = useState(0);
  const [info, setInfo] = useState({ active: false });

  useEffect(() => {
    const check = () => {
      const now = new Date();
      if (now.getTime() < snoozedUntil) return;
      const result = isNowInSession(sessions, now);
      setInfo(result);
    };
    check();
    const id = setInterval(check, 30 * 1000);
    return () => clearInterval(id);
  }, [sessions, snoozedUntil]);

  if (!info.active) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center px-4"
      data-testid="gym-alert"
      role="alertdialog"
      aria-modal="true"
    >
      <div className="relative max-w-lg w-full bg-[#0a0a0c] border-2 border-[#FF3B30] p-8 surface-corner">
        <div className="absolute -top-3 left-6 px-2 py-0.5 bg-[#FF3B30] text-black text-[10px] tracking-[0.3em] uppercase font-bold">
          ALERTE / PROTOCOLE
        </div>
        <AlertTriangle className="w-10 h-10 text-[#FF3B30]" />
        <h2 className="font-display uppercase text-4xl sm:text-5xl tracking-tighter mt-4 text-white leading-[0.95]">
          TU DEVRAIS<br />
          <span className="text-[#FF3B30]">ÊTRE AU FITNESS</span>
        </h2>
        <p className="mt-4 text-zinc-300 leading-relaxed">
          Une séance CrossFit est planifiée maintenant ({fmt(info.startMin)} → {fmt(info.endMin)}).
          Aucune dérive tolérée. Ferme cet onglet et bouge.
        </p>
        <button
          type="button"
          onClick={() => {
            // Snooze for the remainder of this session
            const now = new Date();
            const todayMidnight = new Date(now);
            todayMidnight.setHours(0, 0, 0, 0);
            const endMs = todayMidnight.getTime() + info.endMin * 60 * 1000;
            setSnoozedUntil(endMs);
            setInfo({ active: false });
          }}
          data-testid="gym-alert-continue-btn"
          className="mt-8 w-full flex items-center justify-center gap-3 px-6 py-5 bg-[#FF3B30] hover:bg-[#ff5347] text-white font-display uppercase tracking-wider text-lg transition-colors"
        >
          J'AI COMPRIS — CONTINUER
          <ArrowRight className="w-5 h-5" />
        </button>
        <p className="mt-3 text-[10px] uppercase tracking-widest text-zinc-600 text-center">
          Cette alerte reviendra à la prochaine séance planifiée
        </p>
      </div>
    </div>,
    document.body
  );
};

export default GymAlert;
