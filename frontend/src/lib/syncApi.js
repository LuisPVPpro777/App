// Cloud sync API client (singleton state for personal protocol)
// Backend exposes:  GET / PUT  /api/sync/{key}

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const fetchSync = async (key) => {
  const res = await fetch(`${API_BASE}/sync/${key}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`sync get failed: ${res.status}`);
  return res.json();
};

export const pushSync = async (key, data) => {
  const res = await fetch(`${API_BASE}/sync/${key}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) throw new Error(`sync put failed: ${res.status}`);
  return res.json();
};
