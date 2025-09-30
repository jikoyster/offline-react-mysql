export const API_BASE = 'http://localhost:5000';

export async function sendBatch(items) {
  const res = await fetch(`${API_BASE}/sync/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
  if (!res.ok) throw new Error('Sync failed');
  return res.json();
}

export async function fetchNotes() {
  const res = await fetch(`${API_BASE}/api/notes`);
  if (!res.ok) throw new Error('Fetch notes failed');
  return res.json();
}