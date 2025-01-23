import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit2, Save, X, Notebook } from 'lucide-react';

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const savedNotes = localStorage.getItem('worklife-notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('worklife-notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    if (newNote.trim()) {
      const newNoteObj = {
        id: Date.now(),
        text: newNote,
        date: new Date().toISOString(),
        color: getRandomColor()
      };
      setNotes(prev => [newNoteObj, ...prev]);
      setNewNote('');
    }
  };

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const startEditing = (note) => {
    setEditingId(note.id);
    setEditText(note.text);
  };

  const saveEdit = () => {
    if (editText.trim()) {
      setNotes(prev => prev.map(note => 
        note.id === editingId 
          ? { ...note, text: editText }
          : note
      ));
      setEditingId(null);
    }
  };

  const getRandomColor = () => {
    const colors = [
      { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-800' },
      { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' },
      { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
      { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
      { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' }
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Notes Input Section */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="w-full">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addNote()}
              placeholder="Add a new note..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 
                         focus:ring-2 focus:ring-purple-300 focus:border-transparent 
                         transition-all duration-200 outline-none"
            />
          </div>
          <button
            onClick={addNote}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-400 to-purple-600 
                       text-white px-4 py-2 rounded-lg hover:opacity-90 
                       transition-opacity flex items-center justify-center space-x-2 text-sm"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Note
          </button>
        </div>
      </div>

      {/* Empty State */}
      {notes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <Notebook className="mx-auto w-16 h-16 text-purple-300 mb-4" />
          <p className="text-gray-500 text-sm">No notes yet. Start by adding a new note!</p>
        </div>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {notes.map(note => (
          <div
            key={note.id}
            className={`${note.color.bg} ${note.color.border} ${note.color.text} 
                        border rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md 
                        transition-shadow relative`}
          >
            {editingId === note.id ? (
              <div className="space-y-3">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2 text-sm rounded border border-gray-300 
                             focus:ring-2 focus:ring-purple-300 
                             focus:border-transparent resize-none"
                  rows="3"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={saveEdit}
                    className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Save className="w-4 h-4 text-green-600" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm whitespace-pre-wrap break-words pr-8">{note.text}</p>
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      onClick={() => startEditing(note)}
                      className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(note.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesPage;