const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type Row = Record<string, any>;

async function request(path: string, options?: RequestInit) {
  const res = await fetch(API_URL + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.message ?? `Request failed (${res.status})`);
  return body;
}

// Accepts either [..] or { data: [..] } as list response
export async function list(path: string): Promise<Row[]> {
  const body = await request(path);
  return Array.isArray(body) ? body : body?.data ?? [];
}

export const create = (path: string, data: Row) =>
  request(path, { method: "POST", body: JSON.stringify(data) });

export const update = (path: string, id: number, data: Row) =>
  request(`${path}/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const remove = (path: string, id: number) =>
  request(`${path}/${id}`, { method: "DELETE" });
