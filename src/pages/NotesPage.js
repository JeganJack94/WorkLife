import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit2, Save, X } from 'lucide-react';

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
      'bg-pink-100 border-pink-300',
      'bg-purple-100 border-purple-300',
      'bg-blue-100 border-blue-300',
      'bg-green-100 border-green-300',
      'bg-yellow-100 border-yellow-300'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addNote()}
            placeholder="Add a new note..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 
                       focus:ring-[#CE93D8] focus:border-transparent transition-all duration-200 
                       outline-none"
          />
          <button
            onClick={addNote}
            className="bg-gradient-to-r from-[#CE93D8] to-[#8E24AA] text-white px-6 py-2 
                       rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add Note</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map(note => (
          <div
            key={note.id}
            className={`${note.color} border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow`}
          >
            {editingId === note.id ? (
              <div className="space-y-3">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2 rounded border border-gray-300 focus:ring-2 
                           focus:ring-[#CE93D8] focus:border-transparent resize-none"
                  rows="3"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={saveEdit}
                    className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Save className="w-4 h-4 text-green-600" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <p className="text-gray-700 whitespace-pre-wrap break-words">{note.text}</p>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => startEditing(note)}
                      className="p-2 rounded-lg hover:bg-white/50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-2 rounded-lg hover:bg-white/50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(note.date).toLocaleDateString('en-US', {
                    year: 'numeric',
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