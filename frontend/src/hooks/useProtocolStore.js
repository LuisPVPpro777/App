import { useCallback, useEffect, useRef, useState } from "react";
import { DAILY_CHECKLIST } from "@/lib/protocolData";
import { fetchSync, pushSync } from "@/lib/syncApi";

const STORAGE_KEY = "protocole-summer-build:v1";
const SYNC_KEY = "protocol";
const POLL_MS = 5000;
const DEBOUNCE_MS = 350;

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

const loadLocal = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      ...defaultState(),
      ...parsed,
      checks: { ...emptyChecks(), ...(parsed.checks || {}) },
      history: parsed.history || {},
    };
  } catch {
    return null;
  }
};

const saveLocal = (s) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
};

// Apply midnight-reset rules. Returns next state (or same if no reset).
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
  const [syncStatus, setSyncStatus] = useState("idle"); // idle | syncing | online | offline
  const lastServerUpdatedAt = useRef(null);
  const skipNextSave = useRef(false);
  const saveTimer = useRef(null);

  // initial load: local first → then merge with server
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const local = loadLocal() || defaultState();
      const resetLocal = applyDayReset(local);
      if (!cancelled) {
        skipNextSave.current = true; // first hydration: don't push back immediately
        setStore(resetLocal);
        setHydrated(true);
      }

      // Fetch server state
      try {
        const remote = await fetchSync(SYNC_KEY);
        if (cancelled) return;
        if (remote?.data) {
          const merged = applyDayReset({
            ...defaultState(),
            ...remote.data,
            checks: { ...emptyChecks(), ...(remote.data.checks || {}) },
            history: remote.data.history || {},
          });
          // If server is newer than what we just rendered, apply it
          // Compare both `date` and history depth/streak heuristically:
          // simplest = trust server if it exists.
          skipNextSave.current = true;
          setStore(merged);
          saveLocal(merged);
          lastServerUpdatedAt.current = remote.updated_at;
        } else {
          // server has nothing → push local up
          await pushSync(SYNC_KEY, resetLocal);
          const after = await fetchSync(SYNC_KEY);
          lastServerUpdatedAt.current = after?.updated_at || null;
        }
        if (!cancelled) setSyncStatus("online");
      } catch {
        if (!cancelled) setSyncStatus("offline");
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  // Save effect: persist to local + debounced push to server
  useEffect(() => {
    if (!hydrated) return;
    saveLocal(store);
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        setSyncStatus("syncing");
        const res = await pushSync(SYNC_KEY, store);
        lastServerUpdatedAt.current = res?.updated_at || lastServerUpdatedAt.current;
        setSyncStatus("online");
      } catch {
        setSyncStatus("offline");
      }
    }, DEBOUNCE_MS);
  }, [store, hydrated]);

  // Poll for remote updates from other devices
  useEffect(() => {
    if (!hydrated) return;
    let stop = false;
    const tick = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const remote = await fetchSync(SYNC_KEY);
        if (stop) return;
        if (
          remote?.updated_at &&
          remote.updated_at !== lastServerUpdatedAt.current &&
          remote.data
        ) {
          const merged = applyDayReset({
            ...defaultState(),
            ...remote.data,
            checks: { ...emptyChecks(), ...(remote.data.checks || {}) },
            history: remote.data.history || {},
          });
          skipNextSave.current = true;
          setStore(merged);
          saveLocal(merged);
          lastServerUpdatedAt.current = remote.updated_at;
        }
        setSyncStatus("online");
      } catch {
        setSyncStatus("offline");
      }
    };
    const id = setInterval(tick, POLL_MS);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [hydrated]);

  // toggle a single checklist item
  const toggle = useCallback((id) => {
    setStore((prev) => ({
      ...prev,
      checks: { ...prev.checks, [id]: !prev.checks[id] },
    }));
  }, []);

  const reset = useCallback(() => {
    setStore((prev) => ({ ...prev, checks: emptyChecks() }));
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
    syncStatus,
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
