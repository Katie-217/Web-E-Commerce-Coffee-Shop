const BASE_URL = import.meta.env.VITE_API_URL || "";

export async function apiGet(path, params = {}, { signal } = {}) {
  const url = new URL(path, BASE_URL || window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });
  const token = localStorage.getItem("token");
  const res = await fetch(url.toString(), {
    method: "GET",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${text || res.statusText}`);
  }
  return res.json();
}
