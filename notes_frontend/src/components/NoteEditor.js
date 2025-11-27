import React, { useEffect, useState } from 'react';

// PUBLIC_INTERFACE
export default function NoteEditor({
  note,
  onChange,
  onSave,
  onDelete,
  saving,
  error,
}) {
  /**
   * Editor pane for a single note: title + content with Save and Delete.
   * note can be null or a draft { id?, title, content }.
   */
  const [local, setLocal] = useState(note || { title: '', content: '' });

  useEffect(() => {
    setLocal(note || { title: '', content: '' });
  }, [note]);

  const onField = (field) => (e) => {
    const next = { ...local, [field]: e.target.value };
    setLocal(next);
    onChange && onChange(next);
  };

  const isNew = !note || !(note.id || note._id);

  return (
    <section className="editor">
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <input
            className="title-input"
            placeholder="Note title"
            value={local.title || ''}
            onChange={onField('title')}
            aria-label="Note title"
          />
        </div>
        <div className="toolbar-actions">
          <button
            className="btn btn-primary"
            onClick={() => onSave(local)}
            disabled={saving}
          >
            {saving ? 'Saving...' : isNew ? 'Create' : 'Save'}
          </button>
          {!isNew && (
            <button
              className="btn btn-danger"
              onClick={onDelete}
              disabled={saving}
            >
              Delete
            </button>
          )}
        </div>
      </div>
      {error && <div className="inline-error" role="alert">{String(error)}</div>}
      <textarea
        className="content-input"
        placeholder="Write your note here..."
        value={local.content || ''}
        onChange={onField('content')}
        aria-label="Note content"
      />
    </section>
  );
}
