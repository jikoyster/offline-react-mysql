import { getAllOutbox, clearOutbox } from './idb';
import { sendBatch } from './api';

export async function trySync() {
  const out = await getAllOutbox();
  if (out.length === 0) return { synced: 0 };
  const items = out.map((o) => ({ localId: o.localId, type: o.type, payload: o.payload, createdAt: o.createdAt }));
  try {
    const result = await sendBatch(items);
    const syncedIds = result.syncedLocalIds || out.map(o => o.localId);
    await clearOutbox(syncedIds);
    return { synced: syncedIds.length };
  } catch (err) {
    console.warn('Sync failed', err);
    return { synced: 0, error: err.message };
  }
}