import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import './index.css';
import NotesList from './components/NotesList';
import NoteEditor from './components/NoteEditor';
import { listNotes, createNote, updateNote, deleteNote, getNote, getApiBase } from './api';

// PUBLIC_INTERFACE
function App() {
  /** Main app: two-pane layout with notes sidebar and editor. */
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [current, setCurrent] = useState(null); // current note data (may be draft)
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      const da = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const db = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return db - da;
    });
  }, [notes]);

  // Load notes on mount
  useEffect(() => {
    async function init() {
      setLoading(true);
      setError('');
      try {
        const data = await listNotes();
        setNotes(Array.isArray(data) ? data : []);
        // Select first by default
        if (Array.isArray(data) && data.length > 0) {
          const id0 = data[0].id || data[0]._id;
          setSelectedId(id0);
        } else {
          setSelectedId(null);
        }
      } catch (e) {
        setError(`Failed to load notes from ${getApiBase()}: ${e.message}`);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // When selection changes, fetch the note details (optional; or derive from list)
  useEffect(() => {
    async function loadSelected() {
      if (!selectedId) {
        setCurrent(null);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const n = await getNote(selectedId);
        setCurrent(n);
      } catch (e) {
        setError(`Failed to load note: ${e.message}`);
      } finally {
        setLoading(false);
      }
    }
    loadSelected();
  }, [selectedId]);

  const handleNew = () => {
    setError('');
    const draft = { title: '', content: '' };
    setCurrent(draft);
    setSelectedId(null);
  };

  const handleSelect = (id) => {
    setError('');
    setSelectedId(id);
  };

  const handleChange = (next) => {
    setCurrent(next);
  };

  const handleSave = async (model) => {
    setSaving(true);
    setError('');
    try {
      if (!model.title && !model.content) {
        // prevent creating empty notes
        setError('Cannot save an empty note. Please add a title or content.');
        return;
      }
      if (selectedId) {
        const updated = await updateNote(selectedId, {
          title: model.title || '',
          content: model.content || '',
        });
        // Update list item
        setNotes((prev) =>
          prev.map((n) => {
            const id = n.id || n._id;
            if (id === (updated.id || updated._id)) return updated;
            return n;
          }),
        );
        setCurrent(updated);
      } else {
        const created = await createNote({
          title: model.title || '',
          content: model.content || '',
        });
        setNotes((prev) => [created, ...prev]);
        const newId = created.id || created._id;
        setSelectedId(newId);
        setCurrent(created);
      }
    } catch (e) {
      setError(`Failed to save note: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setSaving(true);
    setError('');
    try {
      await deleteNote(selectedId);
      setNotes((prev) => prev.filter((n) => (n.id || n._id) !== selectedId));
      // Select next available
      const next = sortedNotes.find((n) => (n.id || n._id) !== selectedId);
      const nextId = next ? next.id || next._id : null;
      setSelectedId(nextId);
      setCurrent(next || null);
    } catch (e) {
      setError(`Failed to delete note: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-root" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <header className="topbar">
        <div className="brand">
          <div className="logo-dot" />
          <span>Note Keeper</span>
        </div>
        <div className="endpoint">API: {getApiBase()}</div>
      </header>
      <main className="main">
        <NotesList
          notes={sortedNotes}
          selectedId={selectedId}
          onSelect={handleSelect}
          onNew={handleNew}
        />
        <div className="divider" />
        <div className="editor-container">
          {loading && <div className="inline-info">Loading...</div>}
          {!loading && !current && (
            <div className="placeholder">
              <p>Select a note from the left or create a new one.</p>
            </div>
          )}
          {!loading && current && (
            <NoteEditor
              note={current}
              onChange={handleChange}
              onSave={handleSave}
              onDelete={handleDelete}
              saving={saving}
              error={error}
            />
          )}
          {!loading && !current && error && (
            <div className="inline-error" role="alert">{String(error)}</div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
