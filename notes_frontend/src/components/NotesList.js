import React from 'react';

// PUBLIC_INTERFACE
export default function NotesList({ notes, selectedId, onSelect, onNew }) {
  /** Sidebar list of notes with a New button. */
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="app-title">Notes</h1>
        <button className="btn btn-primary" onClick={onNew} aria-label="Create new note">
          + New
        </button>
      </div>
      <div className="notes-list" role="list">
        {notes.length === 0 && (
          <div className="empty">No notes yet. Create your first note.</div>
        )}
        {notes.map((n) => {
          const id = n.id || n._id;
          const isSelected = selectedId === id;
          const updated = n.updatedAt ? new Date(n.updatedAt) : null;
          return (
            <button
              key={id}
              className={`note-list-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(id)}
              role="listitem"
            >
              <div className="note-title">{n.title || 'Untitled'}</div>
              <div className="note-meta">
                {updated ? updated.toLocaleString() : ''}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
