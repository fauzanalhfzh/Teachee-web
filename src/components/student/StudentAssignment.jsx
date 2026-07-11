import React, { useState } from 'react';
import { stripOptionLetterPrefix } from '../../utils/exerciseNormalize';

const StudentAssignment = ({ task, onSubmit, onBack, practiceMode = false }) => {
  const questions = task?.questions || [];
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const q = questions[current] || { id: null, text: 'Tidak ada soal', options: [] };
  const progress = questions.length ? ((Object.keys(answers).length) / questions.length) * 100 : 0;

  const selectAnswer = (optionIndex) => {
    setAnswers((a) => ({ ...a, [q.id]: optionIndex }));
  };

  const handleNext = () => {
    if (current < questions.length - 1) setCurrent((c) => c + 1);
    else onSubmit(answers, task);
  };

  return (
    <main className="w-full min-h-[calc(100dvh-4rem)] p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-primary font-bold mb-6 hover:opacity-70">
          <span className="material-symbols-outlined">arrow_back</span>
          Kembali
        </button>

        <div className="mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed/30 text-primary text-label-sm font-bold mb-3">
            <span className="material-symbols-outlined text-base">edit</span>
            {practiceMode ? 'Latihan Ulang' : 'Langkah 6 · Mengerjakan Tugas'}
          </span>
          <h1 className="font-headline-md text-xl text-primary font-bold">{task?.title || 'Tugas Bentuk Akar'}</h1>
          <p className="text-on-surface-variant text-sm">Soal {current + 1} dari {questions.length}{practiceMode ? ' · mode latihan' : ''}</p>
        </div>

        <div className="w-full bg-surface-container h-3 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-primary-container rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="glass-panel rounded-[32px] p-6 md:p-8 border-2 border-primary-container/20 bg-white shadow-ambient-tier-2 mb-6">
          <h2 className="font-bold text-lg text-on-surface mb-6">{q.text}</h2>
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={opt}
                type="button"
                onClick={() => selectAnswer(i)}
                className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-medium transition-all ${
                  answers[q.id] === i
                    ? 'border-primary bg-primary-fixed/20 text-primary font-bold'
                    : 'border-outline-variant/40 hover:border-primary/30'
                }`}
              >
                {String.fromCharCode(65 + i)}. {stripOptionLetterPrefix(opt)}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={answers[q.id] === undefined}
          className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-ambient-tier-3 disabled:opacity-40 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {current < questions.length - 1 ? 'Soal Berikutnya' : (practiceMode ? 'Selesai Latihan' : 'Submit Tugas')}
          <span className="material-symbols-outlined">{current < questions.length - 1 ? 'arrow_forward' : 'send'}</span>
        </button>
      </div>
    </main>
  );
};

export default StudentAssignment;
