import { useCallback, useEffect, useRef, useState } from "react";
import { mondayOf, isoDate, computeMaisonDays } from "@/lib/agendaLogic";
import { fetchSync, pushSync } from "@/lib/syncApi";

const STORAGE_KEY = "protocole-summer-build:agenda:v1";
const SYNC_KEY = "agenda";
const POLL_MS = 5000;
const DEBOUNCE_MS = 350;

const emptyState = () => ({
  weekStart: isoDate(mondayOf()),
  sessions: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
});

const loadLocal = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      weekStart: parsed.weekStart || isoDate(mondayOf()),
      sessions: parsed.sessions || emptyState().sessions,
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

const applyWeeklyReset = (state) => {
  const currentWeek = isoDate(mondayOf());
  if (state.weekStart === currentWeek) return state;
  return { weekStart: currentWeek, sessions: emptyState().sessions };
};

// Normalize sessions object — server might return string keys, ensure 0-6 keys
const normalizeSessions = (s) => {
  const out = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  if (!s) return out;
  for (let i = 0; i < 7; i++) {
    const v = s[i] ?? s[String(i)];
    out[i] = Array.isArray(v) ? [...v].sort((a, b) => a - b) : [];
  }
  return out;
};

export const useAgenda = () => {
  const [state, setState] = useState(emptyState);
  const [hydrated, setHydrated] = useState(false);
  const lastServerUpdatedAt = useRef(null);
  const skipNextSave = useRef(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const local = loadLocal() || emptyState();
      const localReset = applyWeeklyReset({
        ...local,
        sessions: normalizeSessions(local.sessions),
      });
      if (!cancelled) {
        skipNextSave.current = true;
        setState(localReset);
        setHydrated(true);
      }
      try {
        const remote = await fetchSync(SYNC_KEY);
        if (cancelled) return;
        if (remote?.data) {
          const merged = applyWeeklyReset({
            weekStart: remote.data.weekStart || isoDate(mondayOf()),
            sessions: normalizeSessions(remote.data.sessions),
          });
          skipNextSave.current = true;
          setState(merged);
          saveLocal(merged);
          lastServerUpdatedAt.current = remote.updated_at;
        } else {
          await pushSync(SYNC_KEY, localReset);
          const after = await fetchSync(SYNC_KEY);
          lastServerUpdatedAt.current = after?.updated_at || null;
        }
      } catch {
        // offline — keep local
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  // Save (debounced) to server + local on every change
  useEffect(() => {
    if (!hydrated) return;
    saveLocal(state);
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await pushSync(SYNC_KEY, state);
        lastServerUpdatedAt.current =
          res?.updated_at || lastServerUpdatedAt.current;
      } catch {
        // offline
      }
    }, DEBOUNCE_MS);
  }, [state, hydrated]);

  // Poll for remote updates
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
          const merged = applyWeeklyReset({
            weekStart: remote.data.weekStart || isoDate(mondayOf()),
            sessions: normalizeSessions(remote.data.sessions),
          });
          skipNextSave.current = true;
          setState(merged);
          saveLocal(merged);
          lastServerUpdatedAt.current = remote.updated_at;
        }
      } catch {
        // offline
      }
    };
    const id = setInterval(tick, POLL_MS);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [hydrated]);

  const toggleSession = useCallback((dayIdx, slotIdx) => {
    setState((prev) => {
      const dayList = prev.sessions[dayIdx] || [];
      const exists = dayList.includes(slotIdx);
      let next;
      if (exists) {
        next = dayList.filter((s) => s !== slotIdx);
      } else {
        // Remove any overlapping session (its start within 1 slot of new slot)
        const cleared = dayList.filter((s) => Math.abs(s - slotIdx) >= 2);
        next = [...cleared, slotIdx].sort((a, b) => a - b);
      }
      const sessions = { ...prev.sessions, [dayIdx]: next };
      return { ...prev, sessions };
    });
  }, []);

  const clearWeek = useCallback(() => {
    setState({ weekStart: isoDate(mondayOf()), sessions: emptyState().sessions });
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
