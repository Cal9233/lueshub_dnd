import React, { useState } from 'react';
import Button from '../Button/Button';
import './Notes.css';

const Notes = ({ notes = [], onChange }) => {
  const [notesData, setNotesData] = useState(notes);
  const [editingNote, setEditingNote] = useState(null);
  const [editorContent, setEditorContent] = useState('');

  const updateNotes = (newNotes) => {
    setNotesData(newNotes);
    onChange(newNotes);
  };

  const addCategory = () => {
    const newNotes = [...notesData, {
      title: 'New Section',
      isOpen: true,
      notes: []
    }];
    updateNotes(newNotes);
  };

  const addNote = (categoryIndex) => {
    const newNotes = [...notesData];
    if (!newNotes[categoryIndex].notes) {
      newNotes[categoryIndex].notes = [];
    }
    newNotes[categoryIndex].notes.push({
      title: 'New Note',
      content: ''
    });
    updateNotes(newNotes);
  };

  const updateCategoryTitle = (categoryIndex, title) => {
    const newNotes = [...notesData];
    newNotes[categoryIndex].title = title;
    updateNotes(newNotes);
  };

  const toggleCategory = (categoryIndex) => {
    const newNotes = [...notesData];
    newNotes[categoryIndex].isOpen = !newNotes[categoryIndex].isOpen;
    updateNotes(newNotes);
  };

  const deleteCategory = (categoryIndex) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      const newNotes = notesData.filter((_, index) => index !== categoryIndex);
      updateNotes(newNotes);
    }
  };

  const updateNoteTitle = (categoryIndex, noteIndex, title) => {
    const newNotes = [...notesData];
    newNotes[categoryIndex].notes[noteIndex].title = title;
    updateNotes(newNotes);
  };

  const openNoteEditor = (categoryIndex, noteIndex) => {
    setEditingNote({ categoryIndex, noteIndex });
    setEditorContent(notesData[categoryIndex].notes[noteIndex].content || '');
  };

  const saveNoteContent = () => {
    if (editingNote) {
      const newNotes = [...notesData];
      newNotes[editingNote.categoryIndex].notes[editingNote.noteIndex].content = editorContent;
      updateNotes(newNotes);
      setEditingNote(null);
      setEditorContent('');
    }
  };

  const deleteNote = (categoryIndex, noteIndex) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      const newNotes = [...notesData];
      newNotes[categoryIndex].notes.splice(noteIndex, 1);
      updateNotes(newNotes);
    }
  };

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h3>Notes & Journal</h3>
        <Button onClick={addCategory} size="small">
          <i className="fas fa-plus"></i> Add Section
        </Button>
      </div>

      <div className="note-categories-container">
        {notesData.length === 0 ? (
          <div className="empty-notes">
            No notes yet. Add a section to get started!
          </div>
        ) : (
          notesData.map((category, catIndex) => (
            <div key={catIndex} className="note-category">
              <div className="note-category-header">
                <input
                  type="text"
                  className="note-category-title-input"
                  value={category.title}
                  onChange={(e) => updateCategoryTitle(catIndex, e.target.value)}
                />
                <div className="note-category-actions">
                  <Button size="small" onClick={() => toggleCategory(catIndex)}>
                    <i className={`fas fa-chevron-${category.isOpen ? 'up' : 'down'}`}></i>
                  </Button>
                  <Button size="small" variant="primary" onClick={() => addNote(catIndex)}>
                    <i className="fas fa-plus"></i>
                  </Button>
                  <Button size="small" variant="danger" onClick={() => deleteCategory(catIndex)}>
                    <i className="fas fa-trash"></i>
                  </Button>
                </div>
              </div>

              {category.isOpen && (
                <div className="note-category-content">
                  {category.notes && category.notes.length > 0 ? (
                    category.notes.map((note, noteIndex) => (
                      <div key={noteIndex} className="note-item">
                        <div className="note-header">
                          <input
                            type="text"
                            className="note-title-input"
                            value={note.title}
                            onChange={(e) => updateNoteTitle(catIndex, noteIndex, e.target.value)}
                          />
                          <div className="note-actions">
                            <Button size="small" onClick={() => openNoteEditor(catIndex, noteIndex)}>
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button size="small" variant="danger" onClick={() => deleteNote(catIndex, noteIndex)}>
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                        </div>
                        <div className="note-content" dangerouslySetInnerHTML={{ __html: note.content || '' }}></div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-note">No notes in this section yet.</div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Note Editor Modal */}
      {editingNote && (
        <div className="note-editor-modal">
          <div className="note-editor-content">
            <div className="note-editor-header">
              <h4>Edit Note</h4>
              <Button size="small" onClick={() => setEditingNote(null)}>
                <i className="fas fa-times"></i>
              </Button>
            </div>
            <textarea
              className="note-editor-textarea"
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              placeholder="Write your note here..."
              rows="10"
            />
            <div className="note-editor-actions">
              <Button variant="secondary" onClick={() => setEditingNote(null)}>Cancel</Button>
              <Button variant="primary" onClick={saveNoteContent}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;