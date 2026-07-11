import React from 'react';

const StudentTaskSummary = ({ task, onClose, onPracticeAgain }) => {
  if (!task) {
    return null;
  }

  const score = task.score ?? 0;
  const total = task.total ?? task.soal ?? 0;
  const percentage = total ? Math.round((score / total) * 100) : 0;
  const durationMinutes = task.durationMinutes ?? 0;
  const reward = task.rewardLabel || `+${task.xp ?? 0} Koin`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg glass-panel rounded-[32px] p-8 md:p-10 border-2 border-primary-container/20 shadow-ambient-tier-2 bg-white animate-scale-up">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed/30 text-primary text-label-sm font-bold mb-3">
              <span className="material-symbols-outlined text-base">preview</span>
              Quiz Summary
            </span>
            <h2 className="font-headline-md text-2xl text-primary font-bold">Ringkasan Tugas</h2>
            <p className="text-on-surface-variant text-sm mt-1">{task.title}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-surface-container text-primary transition-colors" aria-label="Tutup ringkasan">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-surface-container">
            <p className="text-label-sm text-outline font-bold">Nilai</p>
            <p className="text-2xl font-black text-primary">{score}/{total}</p>
          </div>
          <div className="p-4 rounded-2xl bg-surface-container">
            <p className="text-label-sm text-outline font-bold">Persentase</p>
            <p className="text-2xl font-black text-primary">{percentage}%</p>
          </div>
          <div className="p-4 rounded-2xl bg-secondary-fixed/30">
            <p className="text-label-sm text-outline font-bold">Reward</p>
            <p className="text-2xl font-black text-secondary">{reward}</p>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-primary-fixed/10 border border-primary/10">
            <span className="text-sm font-semibold text-primary">Waktu pengerjaan</span>
            <span className="text-sm font-bold text-on-surface-variant">{durationMinutes ? `${durationMinutes} menit` : 'Belum tersedia'}</span>
          </div>
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-primary-fixed/10 border border-primary/10">
            <span className="text-sm font-semibold text-primary">Status</span>
            <span className="text-sm font-bold text-on-surface-variant">{task.status === 'selesai' ? 'Selesai' : 'Draft'}</span>
          </div>
          {task.completedAt ? (
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-primary-fixed/10 border border-primary/10">
              <span className="text-sm font-semibold text-primary">Diselesaikan</span>
              <span className="text-sm font-bold text-on-surface-variant">{new Date(task.completedAt).toLocaleString('id-ID')}</span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-2xl border border-primary/20 text-primary font-bold hover:bg-primary-fixed/20 transition-all"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={onPracticeAgain}
            className="flex-1 px-6 py-3 rounded-2xl bg-primary text-white font-bold shadow-ambient-tier-3 hover:bg-primary-container transition-all"
          >
            Kerjakan Ulang (Latihan)
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentTaskSummary;