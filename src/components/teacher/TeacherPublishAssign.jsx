import React, { useState } from 'react';

const TeacherPublishAssign = ({ criteria, draftQuiz, quizTitle, questionCount, backendStatus, isSaving, onPublish, onBack }) => {
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [judul, setJudul] = useState(quizTitle || criteria?.prompt || 'Tugas Baru');

  return (
    <main className="w-full min-h-[calc(100dvh-4rem)] p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed/40 text-primary text-label-sm font-bold mb-3">
            <span className="material-symbols-outlined text-base">publish</span>
            Langkah 4 · Publish & Assign
          </span>
          <h1 className="font-headline-md text-2xl text-primary font-bold">Terbitkan Tugas ke Kelas</h1>
          <p className="text-on-surface-variant mt-2">Tugas akan disimpan ke database dan dikirim ke siswa.</p>
        </div>

        <div className="glass-panel rounded-[32px] p-6 md:p-8 border-2 border-primary-container/20 shadow-ambient-tier-2 bg-white space-y-5">
          <label className="flex flex-col gap-2">
            <span className="font-label-md text-primary font-bold">Judul Tugas</span>
            <input value={judul} onChange={(e) => setJudul(e.target.value)} className="px-4 py-3 rounded-xl border border-outline-variant bg-surface outline-none focus:ring-2 focus:ring-primary/30" />
          </label>

          {backendStatus ? <p className="rounded-2xl border border-primary/20 bg-primary-fixed/10 px-4 py-3 text-sm text-primary font-semibold">{backendStatus}</p> : null}

          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-container-low">
            <div>
              <p className="text-label-sm text-outline font-bold">Topik</p>
              <p className="font-bold text-primary">{draftQuiz?.topic || criteria?.prompt?.slice(0, 40) || '-'}</p>
            </div>
            <div>
              <p className="text-label-sm text-outline font-bold">Jumlah Soal</p>
              <p className="font-bold text-primary">{questionCount} soal</p>
            </div>
            <div>
              <p className="text-label-sm text-outline font-bold">Mata Pelajaran</p>
              <p className="font-bold text-primary">{draftQuiz?.subject || 'Umum'}</p>
            </div>
            <div>
              <p className="text-label-sm text-outline font-bold">Status Draft</p>
              <p className="font-bold text-primary">{draftQuiz ? 'Tersimpan' : 'Belum tersimpan'}</p>
            </div>
          </div>

          <label className="flex flex-col gap-2">
            <span className="font-label-md text-primary font-bold">Deadline</span>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="px-4 py-3 rounded-xl border border-outline-variant bg-surface outline-none focus:ring-2 focus:ring-primary/30" />
          </label>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="button" onClick={onBack} className="px-6 py-3 rounded-xl border-2 border-outline-variant text-on-surface-variant font-bold hover:bg-surface-container transition-all">
              Kembali
            </button>
            <button
              type="button"
              onClick={() => onPublish({ judul, deadline, kelas: criteria?.kelas })}
              disabled={isSaving}
              className="flex-1 px-8 py-4 bg-secondary-container text-on-secondary-container font-bold rounded-2xl shadow-ambient-tier-3 hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span className="material-symbols-outlined">rocket_launch</span>
              {isSaving ? 'Menyimpan...' : 'Publish Tugas'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TeacherPublishAssign;
