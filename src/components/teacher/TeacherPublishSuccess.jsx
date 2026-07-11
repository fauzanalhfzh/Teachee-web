import React from 'react';

/** Overlay sukses setelah guru publish — singkat */
const TeacherPublishSuccess = ({ assignment, onDone }) => (
  <main className="w-full min-h-[calc(100dvh-4rem)] p-6 md:p-8 flex items-center justify-center">
    <div className="glass-panel max-w-md w-full rounded-[32px] p-10 border-2 border-primary-container/20 bg-white text-center shadow-ambient-tier-2 animate-scale-up">
      <div className="w-20 h-20 mx-auto rounded-full bg-primary-fixed/40 flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-4xl text-primary">check_circle</span>
      </div>
      <h2 className="font-headline-md text-xl text-primary font-bold mb-2">Tugas Berhasil Dipublish!</h2>
      <p className="text-on-surface-variant text-sm mb-2">
        <strong>{assignment?.judul}</strong> disimpan ke DB & assign ke kelas <strong>{assignment?.kelas}</strong>.
      </p>
      <p className="text-label-sm text-outline mb-8">Siswa akan menerima notifikasi tugas.</p>
      <button type="button" onClick={onDone} className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-ambient-tier-3">
        Selesai
      </button>
    </div>
  </main>
);

export default TeacherPublishSuccess;
