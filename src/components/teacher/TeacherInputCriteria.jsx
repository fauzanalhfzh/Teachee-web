import React, { useState } from 'react';

const TeacherInputCriteria = ({ onGenerate, errorMessage, isSyncing }) => {
  const [prompt, setPrompt] = useState('');

  return (
    <main className="w-full min-h-[calc(100dvh-4rem)] p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed/30 text-primary text-label-sm font-bold mb-3">
            <span className="material-symbols-outlined text-base">edit_note</span>
            Langkah 1 · Input Kriteria
          </span>
          <h1 className="font-headline-md text-2xl text-primary font-bold">Buat Tugas dengan AI</h1>
          <p className="text-on-surface-variant mt-2">Deskripsikan soal yang ingin dibuat. AI Agent akan generate draft otomatis.</p>
        </div>

        <div className="glass-panel rounded-[32px] p-6 md:p-8 border-2 border-primary-container/20 shadow-ambient-tier-2 bg-white space-y-5">
          <label className="flex flex-col gap-2">
            <span className="font-label-md text-primary font-bold">Prompt</span>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              placeholder="Contoh: Buat 5 soal pilihan ganda Matematika tentang Bentuk Akar untuk kelas VII, tingkat kesulitan sedang."
              className="px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:ring-2 focus:ring-primary/30 outline-none resize-none"
            />
          </label>

          {errorMessage ? (
            <div className="rounded-2xl border border-error/30 bg-error-container/30 px-4 py-3 text-sm text-error font-semibold">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => onGenerate({ prompt })}
            disabled={isSyncing || !prompt.trim()}
            className="w-full md:w-auto px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-ambient-tier-3 hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <span className="material-symbols-outlined">auto_awesome</span>
            {isSyncing ? 'Menyinkronkan...' : 'Generate Soal dengan AI'}
          </button>
        </div>
      </div>
    </main>
  );
};

export default TeacherInputCriteria;
