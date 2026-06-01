import { useCallback, useEffect, useState } from "react";
import { mondayOf, isoDate, computeMaisonDays } from "@/lib/agendaLogic";

const STORAGE_KEY = "protocole-summer-build:agenda:v1";

const emptyState = () => ({
  weekStart: isoDate(mondayOf()),
  sessions: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
});

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    return {
      weekStart: parsed.weekStart || isoDate(mondayOf()),
      sessions: parsed.sessions || emptyState().sessions,
    };
  } catch {
    return emptyState();
  }
};

const save = (s) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
};

export const useAgenda = () => {
  const [state, setState] = useState(emptyState);

  // load + weekly reset
  useEffect(() => {
    const initial = load();
    const currentWeek = isoDate(mondayOf());
    if (initial.weekStart !== currentWeek) {
      const next = { weekStart: currentWeek, sessions: emptyState().sessions };
      save(next);
      setState(next);
    } else {
      setState(initial);
    }
  }, []);

  const toggleSession = useCallback((dayIdx, slotIdx) => {
    setState((prev) => {
      const dayList = prev.sessions[dayIdx] || [];
      const exists = dayList.includes(slotIdx);
      let next;
      if (exists) {
        next = dayList.filter((s) => s !== slotIdx);
      } else {
        const cleared = dayList.filter((s) => Math.abs(s - slotIdx) >= 2);
        next = [...cleared, slotIdx].sort((a, b) => a - b);
      }
      const sessions = { ...prev.sessions, [dayIdx]: next };
      const updated = { ...prev, sessions };
      save(updated);
      return updated;
    });
  }, []);

  const clearWeek = useCallback(() => {
    const next = { weekStart: isoDate(mondayOf()), sessions: emptyState().sessions };
    save(next);
    setState(next);
  }, []);

  const crossfitDays = Array.from({ length: 7 }, (_, i) =>
    (state.sessions[i] || []).length > 0
  );
  const maisonDays = computeMaisonDays(crossfitDays);

  return {
    weekStart: state.weekStart,
    sessions: state.sessions,
    crossfitDays,
    maisonDays,
    toggleSession,
    clearWeek,
  };
};
