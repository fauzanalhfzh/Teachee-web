import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { loadNotes, persistNotes } from '../../../utils/studentDashboardUtils';

const PersonalNotesCard = ({ studentEmail }) => {
  const [notes, setNotes] = useState([]);
  const [draft, setDraft] = useState('');
  const [savedHint, setSavedHint] = useState(false);

  useEffect(() => {
    setNotes(loadNotes(studentEmail));
  }, [studentEmail]);

  useEffect(() => {
    if (!studentEmail) return;
    const timer = setTimeout(() => {
      persistNotes(studentEmail, notes);
      if (notes.length > 0 || draft) {
        setSavedHint(true);
        setTimeout(() => setSavedHint(false), 1500);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [notes, draft, studentEmail]);

  const addNote = () => {
    const text = draft.trim();
    if (!text) return;
    setNotes((prev) => [{ id: Date.now(), text, createdAt: new Date().toISOString() }, ...prev].slice(0, 8));
    setDraft('');
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Catatan Saya</h3>
        {savedHint && <span className="text-xs text-primary font-medium">Tersimpan</span>}
      </div>

      <div className="space-y-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Tulis catatan singkat..."
          rows={3}
          className="w-full resize-none px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="button"
          onClick={addNote}
          className="w-full py-2.5 rounded-xl border border-dashed border-gray-300 text-sm font-medium text-gray-600 hover:border-primary hover:text-primary transition-colors"
        >
          Tambah Catatan
        </button>
      </div>

      {notes.length > 0 && (
        <ul className="mt-4 space-y-2 max-h-40 overflow-y-auto">
          {notes.map((note) => (
            <li key={note.id} className="px-3 py-2 rounded-xl bg-gray-50 text-sm text-gray-700">
              {note.text}
            </li>
          ))}
        </ul>
      )}
    </motion.section>
  );
};

export default PersonalNotesCard;
