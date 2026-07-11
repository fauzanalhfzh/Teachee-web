import React from 'react';

const TeacherReviewDraft = ({ criteria, questions: questionsProp = [], backendStatus, onPublish, onRegenerate, onRegenerateQuestion, onDeleteQuestion, onUpdateQuestion, isSaving }) => {
  const questions = questionsProp;

  const updateQuestionField = (questionId, field, value) => {
    onUpdateQuestion?.(questionId, { [field]: value });
  };

  const updateQuestionOption = (questionId, optionIndex, value) => {
    const currentQuestion = questions.find((question) => question.id === questionId);
    const nextOptions = [...(currentQuestion?.options || [])];
    nextOptions[optionIndex] = value;
    onUpdateQuestion?.(questionId, { options: nextOptions });
  };

  return (
    <main className="w-full min-h-[calc(100dvh-4rem)] p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed/50 text-secondary text-label-sm font-bold mb-3">
              <span className="material-symbols-outlined text-base">fact_check</span>
              Langkah 3 · Review Draft
            </span>
            <h1 className="font-headline-md text-2xl text-primary font-bold">Review & Edit Soal</h1>
            <p className="text-on-surface-variant mt-1">{criteria?.mataPelajaran} · {criteria?.topik} · {questions.length} soal</p>
            {backendStatus ? <p className="text-sm text-primary font-semibold mt-2">{backendStatus}</p> : null}
          </div>
          <button type="button" onClick={onRegenerate} className="px-5 py-2.5 rounded-xl border-2 border-primary/20 text-primary font-bold hover:bg-primary-fixed/20 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">refresh</span>
            Regenerate
          </button>
        </div>

        <div className="space-y-4 mb-8">
          {questions.map((q, index) => (
            <div key={q.id} className="glass-panel rounded-2xl p-5 border border-primary-container/15 bg-white shadow-ambient-tier-1">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-bold text-primary">Soal {index + 1}</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onRegenerateQuestion?.(q.id)}
                    disabled={isSaving}
                    className="p-2 rounded-lg hover:bg-primary-fixed/20 text-primary disabled:opacity-50"
                    title="Regenerate Soal"
                  >
                    <span className="material-symbols-outlined text-lg">refresh</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteQuestion?.(q.id)}
                    disabled={isSaving}
                    className="p-2 rounded-lg hover:bg-error-container text-error disabled:opacity-50"
                    title="Hapus Soal"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
              <label className="block mb-3">
                <span className="text-sm font-semibold text-primary mb-2 block">Pertanyaan</span>
                <textarea
                  value={q.text}
                  onChange={(event) => updateQuestionField(q.id, 'text', event.target.value)}
                  rows={3}
                  disabled={isSaving}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface focus:ring-2 focus:ring-primary/30 outline-none resize-none disabled:opacity-60"
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                {(q.options || []).map((opt, i) => {
                  const optionLetter = String.fromCharCode(65 + i);
                  const isCorrect = optionLetter === q.answer;

                  return (
                    <label
                      key={`${q.id}-${i}`}
                      className={`rounded-xl border p-3 text-sm transition-all ${isCorrect ? 'bg-primary-fixed/20 border-primary/30' : 'bg-surface-container border-transparent'}`}
                    >
                      <span className="block text-xs font-bold text-primary mb-2">{optionLetter}</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(event) => updateQuestionOption(q.id, i, event.target.value)}
                        disabled={isSaving}
                        className="w-full bg-transparent outline-none text-on-surface disabled:opacity-60"
                      />
                    </label>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary px-3 py-2 rounded-lg bg-primary-fixed/20 border border-primary/20 w-fit">
                  <span className="material-symbols-outlined text-base">auto_awesome</span>
                  Jawaban benar otomatis: {q.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onPublish}
          disabled={questions.length === 0}
          className="px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-ambient-tier-3 hover:bg-primary-container active:scale-95 transition-all flex items-center gap-2 disabled:opacity-40"
        >
          Lanjut ke Publish
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </main>
  );
};

export default TeacherReviewDraft;
