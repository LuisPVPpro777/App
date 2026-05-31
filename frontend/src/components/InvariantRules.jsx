import { INVARIANT_RULES } from "@/lib/protocolData";
import { ShieldAlert } from "lucide-react";

export const InvariantRules = () => {
  return (
    <section
      className="surface surface-corner relative"
      data-testid="invariant-rules"
    >
      <div className="px-6 pt-6 flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-[#FF3B30]" />
        <div>
          <div className="overline">SECTION / 02</div>
          <h2 className="font-display uppercase text-2xl sm:text-3xl tracking-tight mt-1">
            Règles Inviolables
          </h2>
        </div>
      </div>

      <ul className="mt-6 border-t border-[#1f1f22] divide-y divide-[#1f1f22]">
        {INVARIANT_RULES.map((r) => (
          <li
            key={r.id}
            data-testid={`rule-${r.id}`}
            className="group grid grid-cols-[56px_1fr] gap-5 px-6 py-5 hover:bg-[#141417] transition-colors"
          >
            <div className="font-display text-3xl tabular text-zinc-700 group-hover:text-[#CCFF00] transition-colors">
              {r.code}
            </div>
            <div>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="font-display uppercase tracking-tight text-lg text-white">
                  {r.title}
                </h3>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#CCFF00] border border-[#CCFF00]/40 px-1.5 py-0.5">
                  {r.spec}
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-400 leading-snug">{r.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default InvariantRules;
