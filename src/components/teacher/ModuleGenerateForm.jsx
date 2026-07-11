import React, { useMemo, useState } from 'react';
import {
  EXERCISE_LIMITS,
  EXERCISE_TYPE_OPTIONS,
  QUIZ_LIMITS,
  SECTION_LIMITS,
  normalizeGenerateDraft,
  setGenerateDraftCount,
  updateGenerateDraftItem,
} from '../../utils/moduleGenerateDraft';

const CountStepper = ({ label, value, min, max, onChange }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
    <div>
      <p className="text-sm font-medium text-gray-800">{label}</p>
      <p className="text-xs text-gray-500">{min}–{max} item</p>
    </div>
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        aria-label={`Kurangi ${label}`}
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-bold text-gray-900">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        aria-label={`Tambah ${label}`}
      >
        +
      </button>
    </div>
  </div>
);

const SectionEditor = ({ draft, onChange }) => (
  <div className="space-y-3">
    <CountStepper
      label="Jumlah Section"
      value={draft.sectionOutlines.length}
      min={SECTION_LIMITS.min}
      max={SECTION_LIMITS.max}
      onChange={(count) => onChange(setGenerateDraftCount(draft, 'sections', count))}
    />
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
      {draft.sectionOutlines.map((section, index) => (
        <div key={`section-outline-${index}`} className="rounded-xl border border-gray-200 bg-white p-3 space-y-2">
          <p className="text-xs font-semibold text-gray-500">Section {index + 1}</p>
          <input
            type="text"
            value={section.title}
            onChange={(e) => onChange(updateGenerateDraftItem(draft, 'sectionOutlines', index, 'title', e.target.value))}
            placeholder="Judul section (opsional)"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
          <textarea
            value={section.hint}
            onChange={(e) => onChange(updateGenerateDraftItem(draft, 'sectionOutlines', index, 'hint', e.target.value))}
            rows={2}
            placeholder="Fokus materi, poin penting, atau instruksi untuk AI"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      ))}
    </div>
  </div>
);

const ExerciseEditor = ({ draft, onChange }) => (
  <div className="space-y-3">
    <CountStepper
      label="Jumlah Latihan"
      value={draft.exerciseOutlines.length}
      min={EXERCISE_LIMITS.min}
      max={EXERCISE_LIMITS.max}
      onChange={(count) => onChange(setGenerateDraftCount(draft, 'exercises', count))}
    />
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
      {draft.exerciseOutlines.map((exercise, index) => (
        <div key={`exercise-outline-${index}`} className="rounded-xl border border-gray-200 bg-white p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-gray-500">Latihan {index + 1}</p>
            <select
              value={exercise.exercise_type}
              onChange={(e) => onChange(updateGenerateDraftItem(draft, 'exerciseOutlines', index, 'exercise_type', e.target.value))}
              className="rounded-lg border border-gray-200 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-primary/20"
            >
              {EXERCISE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <textarea
            value={exercise.hint}
            onChange={(e) => onChange(updateGenerateDraftItem(draft, 'exerciseOutlines', index, 'hint', e.target.value))}
            rows={2}
            placeholder="Petunjuk soal latihan untuk AI (opsional)"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      ))}
    </div>
  </div>
);

const QuizEditor = ({ draft, onChange }) => (
  <div className="space-y-3">
    <CountStepper
      label="Jumlah Soal Quiz"
      value={draft.quizOutlines.length}
      min={QUIZ_LIMITS.min}
      max={QUIZ_LIMITS.max}
      onChange={(count) => onChange(setGenerateDraftCount(draft, 'quiz', count))}
    />
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
      {draft.quizOutlines.map((quiz, index) => (
        <div key={`quiz-outline-${index}`} className="rounded-xl border border-gray-200 bg-white p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-gray-500">Quiz {index + 1}</p>
            <label className="flex items-center gap-2 text-xs text-gray-500">
              Opsi
              <select
                value={quiz.optionsCount}
                onChange={(e) => onChange(updateGenerateDraftItem(draft, 'quizOutlines', index, 'optionsCount', Number(e.target.value)))}
                className="rounded-lg border border-gray-200 px-2 py-1 outline-none focus:ring-2 focus:ring-primary/20"
              >
                {[3, 4, 5].map((count) => (
                  <option key={count} value={count}>{count}</option>
                ))}
              </select>
            </label>
          </div>
          <textarea
            value={quiz.hint}
            onChange={(e) => onChange(updateGenerateDraftItem(draft, 'quizOutlines', index, 'hint', e.target.value))}
            rows={2}
            placeholder="Topik atau petunjuk soal quiz (opsional)"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      ))}
    </div>
  </div>
);

const TABS = [
  { id: 'sections', label: 'Section', icon: 'menu_book' },
  { id: 'exercises', label: 'Latihan', icon: 'edit_note' },
  { id: 'quiz', label: 'Quiz', icon: 'quiz' },
];

const ModuleGenerateForm = ({
  draft,
  onChange,
  onSubmit,
  loading = false,
  error = null,
}) => {
  const [activeTab, setActiveTab] = useState('sections');
  const normalizedDraft = useMemo(() => normalizeGenerateDraft(draft), [draft]);

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Topik / Prompt Utama</span>
        <textarea
          value={normalizedDraft.prompt}
          onChange={(e) => onChange({ ...normalizedDraft, prompt: e.target.value })}
          rows={3}
          placeholder="Contoh: Hardware dan Software pada Informatika untuk kelas 10"
          className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none resize-none focus:ring-2 focus:ring-primary/20"
          required
        />
      </label>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
        <p className="text-sm font-semibold text-gray-800 mb-1">Kustomisasi Sebelum Generate</p>
        <p className="text-xs text-gray-500 mb-3">
          Atur jumlah dan petunjuk section, latihan, serta quiz. AI akan mengikuti struktur ini saat generate.
        </p>

        <div className="flex gap-2 mb-3 overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = tab.id === 'sections'
              ? normalizedDraft.sectionOutlines.length
              : tab.id === 'exercises'
                ? normalizedDraft.exerciseOutlines.length
                : normalizedDraft.quizOutlines.length;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-md text-xs ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {activeTab === 'sections' && (
          <SectionEditor draft={normalizedDraft} onChange={onChange} />
        )}
        {activeTab === 'exercises' && (
          <ExerciseEditor draft={normalizedDraft} onChange={onChange} />
        )}
        {activeTab === 'quiz' && (
          <QuizEditor draft={normalizedDraft} onChange={onChange} />
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        className="w-full px-4 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
        disabled={loading}
      >
        {loading ? 'Sedang generate modul AI...' : 'Generate Modul AI'}
      </button>
    </form>
  );
};

export default ModuleGenerateForm;
