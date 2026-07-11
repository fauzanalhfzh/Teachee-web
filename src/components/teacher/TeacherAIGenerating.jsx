import React, { useEffect, useState } from 'react';

const TeacherAIGenerating = ({ criteria }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => (prev + 1) % 3);
    }, 900);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <main className="w-full min-h-[calc(100dvh-4rem)] p-6 md:p-8 flex items-center justify-center">
      <div className="glass-panel max-w-lg w-full rounded-[32px] p-10 border-2 border-primary-container/20 shadow-ambient-tier-2 bg-white text-center animate-scale-up">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-fixed/40 text-tertiary text-label-sm font-bold mb-6">
          <span className="material-symbols-outlined text-base">auto_awesome</span>
          Langkah 2 · AI Agent
        </span>

        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-primary-fixed/30 animate-ping opacity-40" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-ambient-tier-3">
            <span className="material-symbols-outlined text-4xl text-white animate-pulse">psychology</span>
          </div>
        </div>

        <h2 className="font-headline-md text-xl text-primary font-bold mb-2">Menyusun Draft Soal...</h2>
        <p className="text-on-surface-variant text-sm mb-6">
          AI Agent sedang generate {criteria?.jumlahSoal || 5} soal {criteria?.topik || 'Bentuk Akar'} untuk kelas {criteria?.kelas || 'VII-A'}.
        </p>

        <div className="space-y-2 text-left mb-6">
          {['Menganalisis kriteria...', 'Menyusun pertanyaan...', 'Memvalidasi jawaban...'].map((text, i) => {
            const isActive = i === phase;
            return (
              <div key={text} className={`flex items-center gap-3 text-sm transition-all ${isActive ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}>
                <span className={`material-symbols-outlined text-lg ${isActive ? 'animate-pulse text-primary' : 'text-outline'}`}>
                  {isActive ? 'progress_activity' : 'check_circle'}
                </span>
                {text}
              </div>
            );
          })}
        </div>

        <button type="button" onClick={() => {}} className="text-sm text-outline transition-colors pointer-events-none opacity-60">
          Simulasi gagal → ulang input
        </button>
      </div>
    </main>
  );
};

export default TeacherAIGenerating;
