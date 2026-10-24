import { useEffect, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'note-pad-notes'
const now = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)

function App() {
  const [notes, setNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch (error) {
      console.error('Unable to load notes.', error)
      return []
    }
  })
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [dateTime, setDateTime] = useState(now)
  const [editingId, setEditingId] = useState(null)
  const [openNote, setOpenNote] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
    } catch (error) {
      console.error('Unable to save notes.', error)
    }
  }, [notes])

  useEffect(() => {
    if (!openNote) return

    function closeOnEscape(event) {
      if (event.key === 'Escape') setOpenNote(null)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [openNote])

  function clearForm() {
    setTitle('')
    setContent('')
    setDateTime(now())
    setEditingId(null)
  }

  function saveNote(event) {
    event.preventDefault()
    const note = { title: title.trim(), content: content.trim(), dateTime }
    if (!note.title || !note.content) return

    if (editingId) {
      setNotes(notes.map((item) => item.id === editingId ? { ...item, ...note } : item))
    } else {
      setNotes([{ id: crypto.randomUUID(), ...note }, ...notes])
    }
    clearForm()
  }

  function editNote(note) {
    setOpenNote(null)
    setTitle(note.title)
    setContent(note.content)
    setDateTime(note.dateTime)
    setEditingId(note.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function deleteNote(id) {
    setNotes(notes.filter((note) => note.id !== id))
    if (editingId === id) clearForm()
    if (openNote?.id === id) setOpenNote(null)
  }

  return (
    <main className="app">
      <header>
        <h1>My Notes</h1>
        <p>A simple place to keep your thoughts.</p>
      </header>

      <form className="note-form" onSubmit={saveNote}>
        <h2>{editingId ? 'Edit note' : 'Add a note'}</h2>
        <input
          aria-label="Note title"
          maxLength={90}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
          required
          value={title}
        />
        <textarea
          aria-label="Note content"
          maxLength={5000}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write your note..."
          required
          rows={4}
          value={content}
        />
        <div className="form-footer">
          <label>
            Date &amp; time
            <input
              aria-label="Date and time"
              onChange={(event) => setDateTime(event.target.value)}
              required
              type="datetime-local"
              value={dateTime}
            />
          </label>
          <div>
            {editingId && <button className="cancel" onClick={clearForm} type="button">Cancel</button>}
            <button className="save" type="submit">{editingId ? 'Save' : 'Add note'}</button>
          </div>
        </div>
      </form>

      <section className="notes">
        <h2>Your notes <span>{notes.length}</span></h2>
        {notes.length === 0 ? (
          <p className="empty">No notes yet. Add your first one above.</p>
        ) : notes.map((note) => (
          <article className="note" key={note.id}>
            <div className="note-heading">
              <button className="note-date" onClick={() => setOpenNote(note)} type="button">
                {new Date(note.dateTime).toLocaleString()}
              </button>
              <div className="actions">
                <button aria-label={`Edit ${note.title}`} onClick={() => editNote(note)} title="Edit" type="button">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5 4 4M4 20l4-.8L19 8a2.5 2.5 0 0 0-3.5-3.5L4.5 15.5 4 20Z" /></svg>
                </button>
                <button aria-label={`Delete ${note.title}`} onClick={() => deleteNote(note.id)} title="Delete" type="button">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
                </button>
              </div>
            </div>
            <button className="note-open" onClick={() => setOpenNote(note)} type="button">
              <span className="note-title">{note.title}</span>
              <span className="note-preview">{note.content}</span>
            </button>
          </article>
        ))}
      </section>

      {openNote && (
        <div className="note-overlay" onClick={() => setOpenNote(null)}>
          <article
            aria-labelledby="full-note-title"
            aria-modal="true"
            className="full-note"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="note-heading">
              <p className="full-note-date">{new Date(openNote.dateTime).toLocaleString()}</p>
              <button aria-label="Close note" className="close-note" onClick={() => setOpenNote(null)} type="button">
                ×
              </button>
            </div>
            <h2 id="full-note-title">{openNote.title}</h2>
            <p className="full-note-content">{openNote.content}</p>
            <button className="save" onClick={() => editNote(openNote)} type="button">Edit note</button>
          </article>
        </div>
      )}
    </main>
  )
}

export default App
