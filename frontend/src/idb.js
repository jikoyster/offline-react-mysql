import { openDB } from 'idb';

export const DB_NAME = 'offline-sync-db';
export const DB_VERSION = 1;
export const STORE_NAME = 'outbox';

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'localId', autoIncrement: true });
      }
    }
  });
}

export async function saveOutbox(item) {
  const db = await getDB();
  await db.add(STORE_NAME, item);
}

export async function getAllOutbox() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function clearOutbox(ids = []) {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  if (ids.length === 0) {
    await store.clear();
  } else {
    for (const id of ids) await store.delete(id);
  }
  await tx.done;
}