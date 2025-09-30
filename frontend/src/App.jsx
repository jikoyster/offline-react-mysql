import React, { useEffect, useState } from 'react';
import { saveOutbox, getAllOutbox } from './idb';
import { trySync } from './sync';
import { fetchNotes } from './api';

export default function App() {
  const [text, setText] = useState('');
  const [notes, setNotes] = useState([]);
  const [online, setOnline] = useState(navigator.onLine);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register( new URL('../public/service-worker.js', import.meta.url) ).catch(console.error);
    }

    const onOnline = async () => {
      setOnline(true);
      setStatus('Online — attempting sync...');
      const res = await trySync();
      setStatus(res.synced ? `Synced ${res.synced} items` : (res.error ? `Sync error: ${res.error}` : 'Nothing to sync'));
      loadRemoteNotes();
    };
    const onOffline = () => { setOnline(false); setStatus('Offline'); };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    if (navigator.onLine) loadRemoteNotes(); else loadLocalPreview();

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  async function loadRemoteNotes() {
    try {
      const data = await fetchNotes();
      setNotes(data.notes || data || []);
      setStatus('Fetched remote notes');
    } catch (err) {
      console.warn(err);
      setStatus('Failed to load remote notes!');
      loadLocalPreview(); 
    }
  }

  async function loadLocalPreview() {
    const out = await getAllOutbox();
    setNotes(out.map(o => ({ text: o.payload.text, local: true, createdAt: o.createdAt })));
  }

  async function addNote() {
    if (!text.trim()) return;
    const item = { type: 'note:create', payload: { text }, createdAt: new Date().toISOString() };
    await saveOutbox(item);
    setText('');
    setStatus('Saved locally');
    if (navigator.onLine) {
      setStatus('Online — attempting sync...');
      const res = await trySync();
      setStatus(res.synced ? `Synced ${res.synced} items` : 'Sync pending');
      loadRemoteNotes();
    } else {
      loadLocalPreview();
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Offline Sync Demo</h1>
      <div>Status: {online ? 'Online' : 'Offline'} — {status}</div>

      <div style={{ marginTop: 16 }}>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={4} cols={40} placeholder="Type a note..."></textarea>
        <br />
        <button onClick={addNote} style={{ marginTop: 8 }}>Save Note</button>
      </div>

      <h2 style={{ marginTop: 20 }}>Notes</h2>
      <ul>
        {notes.map((n, i) => (
          <li key={i}>{n.text} {n.local ? '(local)' : ''}</li>
        ))}
      </ul>
    </div>
  );
}