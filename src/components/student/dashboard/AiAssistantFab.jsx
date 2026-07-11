import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SUGGESTIONS = [
  'Jelaskan materi hardware dan software',
  'Apa yang harus saya pelajari hari ini?',
  'Bantu saya memahami soal latihan',
];

const AiAssistantFab = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 'welcome', role: 'assistant', text: 'Hai! Aku asisten belajar Teacherware. Tanyakan apa saja tentang materi kelasmu.' },
  ]);

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', text: trimmed },
      {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: 'Terima kasih atas pertanyaannya. Fitur AI penuh akan segera terhubung — untuk saat ini, coba buka modul belajar dan baca ringkasan materinya terlebih dahulu.',
      },
    ]);
    setInput('');
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 flex items-center gap-3 px-4 py-3 rounded-full bg-primary text-white shadow-lg shadow-primary/20"
        aria-label="Asisten AI"
      >
        <span className="text-xl">🤖</span>
        <span className="text-sm font-semibold hidden sm:inline">Butuh bantuan? Tanya AI</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-36 md:bottom-24 right-4 md:right-8 z-40 w-[min(100vw-2rem,380px)] bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50/60">
              <div>
                <p className="font-semibold text-gray-900">Asisten Belajar</p>
                <p className="text-xs text-gray-500">Tanya tentang materi kelas</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/80">
                <span className="material-symbols-outlined text-gray-500">close</span>
              </button>
            </div>

            <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[90%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'ml-auto bg-primary text-white rounded-br-md'
                      : 'bg-white border border-gray-100 text-gray-700 rounded-bl-md'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-gray-100 space-y-2">
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="px-3 py-1.5 rounded-full bg-gray-100 text-xs text-gray-600 hover:bg-emerald-50 hover:text-primary transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tulis pertanyaanmu..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button type="submit" className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold">
                  Kirim
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiAssistantFab;
