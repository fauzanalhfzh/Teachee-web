import React from 'react';

const StudentGradingResult = ({
  score,
  total,
  percentage,
  xpEarned,
  passed80,
  practiceSummary,
  onContinue,
  onLearnAgain,
}) => {
  const safeTotal = Math.max(1, total || 0);
  const computedPercentage = typeof percentage === 'number' ? percentage : Math.round((score / safeTotal) * 100);
  const reached80 = typeof passed80 === 'boolean' ? passed80 : computedPercentage >= 80;
  const passed = computedPercentage >= 70;

  return (
    <main className="w-full min-h-[calc(100dvh-4rem)] p-6 md:p-8 flex items-center justify-center">
      <div className="glass-panel max-w-lg w-full rounded-[32px] p-8 md:p-10 border-2 border-primary-container/20 shadow-ambient-tier-2 bg-white text-center animate-scale-up">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed/30 text-primary text-label-sm font-bold mb-6">
          <span className="material-symbols-outlined text-base">grading</span>
          Hasil Penilaian
        </span>

        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${passed ? 'bg-primary-fixed/40' : 'bg-error-container'}`}>
          <span className="material-symbols-outlined text-4xl text-primary">{passed ? 'emoji_events' : 'refresh'}</span>
        </div>

        <h2 className="font-headline-md text-2xl text-primary font-bold mb-2">
          {reached80 ? 'Selamat, Quiz Tuntas Dengan Nilai Bagus!' : passed ? 'Hebat! Tugas Selesai' : 'Coba Lagi Ya!'}
        </h2>
        <p className="text-on-surface-variant mb-6">
          {reached80
            ? 'Nilai quiz kamu di atas 80. Performa belajar kamu sudah sangat baik.'
            : passed
              ? 'Selamat, kamu telah menyelesaikan tugas dengan baik!'
              : 'Jangan menyerah ya, kamu pasti bisa lebih baik lagi!'}
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-surface-container">
            <p className="text-label-sm text-outline font-bold">Benar</p>
            <p className="text-2xl font-black text-primary">{score}/{total}</p>
          </div>
          <div className="p-4 rounded-2xl bg-surface-container">
            <p className="text-label-sm text-outline font-bold">Nilai</p>
            <p className="text-2xl font-black text-primary">{computedPercentage}%</p>
          </div>
          <div className="p-4 rounded-2xl bg-secondary-fixed/30">
            <p className="text-label-sm text-outline font-bold">XP</p>
            <p className="text-2xl font-black text-secondary">+{xpEarned}</p>
          </div>
        </div>

        {practiceSummary && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-6 text-left">
            <p className="text-sm font-bold text-amber-800 mb-1">Rekap Latihan</p>
            <p className="text-sm text-amber-800">
              Benar {practiceSummary.score}/{practiceSummary.total || 0}
              {practiceSummary.total > 0 ? ` (${practiceSummary.percentage}%)` : ''}
            </p>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-primary-fixed/15 border border-primary/10 mb-8 text-left">
          <p className="text-sm font-bold text-primary mb-1">Catatan dari Guru</p>
          <p className="text-sm text-on-surface-variant">
            {reached80
              ? 'Selamat sudah menuntaskan pembelajaran dan quiz. Kamu bisa lanjut ke modul berikutnya atau ulang belajar untuk makin mantap.'
              : passed
                ? 'Nilai kamu sudah mencapai batas tuntas. Teruslah rajin belajar agar semakin mahir!'
                : `Kamu menjawab benar ${score} dari ${total} soal. Pelajari kembali materi yang belum dikuasai, lalu coba lagi ya.`}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onLearnAgain}
            className="w-full py-4 border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 active:scale-95 transition-all"
          >
            Belajar Lagi
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-ambient-tier-3 active:scale-95 transition-all"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </main>
  );
};

export default StudentGradingResult;
