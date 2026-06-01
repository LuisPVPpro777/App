import { useCallback, useEffect, useState } from "react";
import { DAILY_CHECKLIST } from "@/lib/protocolData";

const STORAGE_KEY = "protocole-summer-build:v1";

const todayStr = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const yesterdayStr = (d = new Date()) => {
  const y = new Date(d);
  y.setDate(y.getDate() - 1);
  return todayStr(y);
};

const emptyChecks = () =>
  Object.fromEntries(DAILY_CHECKLIST.map((t) => [t.id, false]));

const defaultState = () => ({
  date: todayStr(),
  checks: emptyChecks(),
  streak: 0,
  bestStreak: 0,
  history: {},
});

const computeCompletion = (checks) => {
  const total = DAILY_CHECKLIST.length;
  const done = Object.values(checks).filter(Boolean).length;
  return total === 0 ? 0 : done / total;
};

const loadStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {
      ...defaultState(),
      ...parsed,
      checks: { ...emptyChecks(), ...(parsed.checks || {}) },
      history: parsed.history || {},
    };
  } catch {
    return defaultState();
  }
};

const saveStore = (s) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore quota errors
  }
};

const applyDayReset = (state) => {
  const today = todayStr();
  if (state.date === today) return state;
  const prevCompletion = computeCompletion(state.checks);
  const newHistory = {
    ...state.history,
    [state.date]: {
      completion: prevCompletion,
      checks: state.checks,
    },
  };
  const wasYesterday = state.date === yesterdayStr();
  let newStreak = 0;
  if (wasYesterday && prevCompletion === 1) {
    newStreak = (state.streak || 0) + 1;
  }
  return {
    ...state,
    date: today,
    checks: emptyChecks(),
    streak: newStreak,
    bestStreak: Math.max(state.bestStreak || 0, newStreak),
    history: newHistory,
  };
};

export const useProtocolStore = () => {
  const [store, setStore] = useState(defaultState);
  const [hydrated, setHydrated] = useState(false);

  // initial load + midnight reset
  useEffect(() => {
    const initial = loadStore();
    const reset = applyDayReset(initial);
    saveStore(reset);
    setStore(reset);
    setHydrated(true);
  }, []);

  // toggle a single checklist item
  const toggle = useCallback((id) => {
    setStore((prev) => {
      const next = {
        ...prev,
        checks: { ...prev.checks, [id]: !prev.checks[id] },
      };
      saveStore(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setStore((prev) => {
      const next = { ...prev, checks: emptyChecks() };
      saveStore(next);
      return next;
    });
  }, []);

  const completion = computeCompletion(store.checks);
  const completedCount = Object.values(store.checks).filter(Boolean).length;
  const total = DAILY_CHECKLIST.length;

  const last7 = (() => {
    const out = [];
    const d = new Date();
    for (let i = 6; i >= 0; i--) {
      const dd = new Date(d);
      dd.setDate(dd.getDate() - i);
      const key = todayStr(dd);
      const isToday = key === store.date;
      const val = isToday ? completion : store.history?.[key]?.completion ?? 0;
      out.push({ date: key, value: val, isToday });
    }
    return out;
  })();

  const weeklyAvg =
    last7.reduce((acc, d) => acc + d.value, 0) / last7.length;

  return {
    hydrated,
    date: store.date,
    checks: store.checks,
    streak: store.streak,
    bestStreak: store.bestStreak,
    completion,
    completedCount,
    total,
    last7,
    weeklyAvg,
    toggle,
    reset,
  };
};
