const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const SECTION_LIMITS = { min: 2, max: 10, default: 4 };
export const EXERCISE_LIMITS = { min: 3, max: 15, default: 6 };
export const QUIZ_LIMITS = { min: 3, max: 10, default: 5 };

export const EXERCISE_TYPE_OPTIONS = [
  { value: 'multiple_choice', label: 'Pilihan Ganda' },
  { value: 'short_answer', label: 'Jawaban Singkat' },
  { value: 'text', label: 'Esai / Teks' },
];

const resizeList = (list, count, factory) => {
  const next = [...(list || [])];
  while (next.length < count) next.push(factory());
  return next.slice(0, count);
};

export const createEmptySectionOutline = () => ({ title: '', hint: '' });
export const createEmptyExerciseOutline = () => ({ hint: '', exercise_type: 'multiple_choice' });
export const createEmptyQuizOutline = () => ({ hint: '', optionsCount: 4 });

export const createDefaultGenerateDraft = () => ({
  prompt: '',
  sectionOutlines: resizeList([], SECTION_LIMITS.default, createEmptySectionOutline),
  exerciseOutlines: resizeList([], EXERCISE_LIMITS.default, createEmptyExerciseOutline),
  quizOutlines: resizeList([], QUIZ_LIMITS.default, createEmptyQuizOutline),
});

export const normalizeGenerateDraft = (draft = {}) => ({
  prompt: draft.prompt || '',
  sectionOutlines: resizeList(
    draft.sectionOutlines,
    clamp(draft.sectionOutlines?.length || SECTION_LIMITS.default, SECTION_LIMITS.min, SECTION_LIMITS.max),
    createEmptySectionOutline,
  ),
  exerciseOutlines: resizeList(
    draft.exerciseOutlines,
    clamp(draft.exerciseOutlines?.length || EXERCISE_LIMITS.default, EXERCISE_LIMITS.min, EXERCISE_LIMITS.max),
    createEmptyExerciseOutline,
  ),
  quizOutlines: resizeList(
    draft.quizOutlines,
    clamp(draft.quizOutlines?.length || QUIZ_LIMITS.default, QUIZ_LIMITS.min, QUIZ_LIMITS.max),
    createEmptyQuizOutline,
  ),
});

export const setGenerateDraftCount = (draft, key, count) => {
  const normalized = normalizeGenerateDraft(draft);

  if (key === 'sections') {
    const nextCount = clamp(count, SECTION_LIMITS.min, SECTION_LIMITS.max);
    return {
      ...normalized,
      sectionOutlines: resizeList(normalized.sectionOutlines, nextCount, createEmptySectionOutline),
    };
  }

  if (key === 'exercises') {
    const nextCount = clamp(count, EXERCISE_LIMITS.min, EXERCISE_LIMITS.max);
    return {
      ...normalized,
      exerciseOutlines: resizeList(normalized.exerciseOutlines, nextCount, createEmptyExerciseOutline),
    };
  }

  const nextCount = clamp(count, QUIZ_LIMITS.min, QUIZ_LIMITS.max);
  return {
    ...normalized,
    quizOutlines: resizeList(normalized.quizOutlines, nextCount, createEmptyQuizOutline),
  };
};

export const updateGenerateDraftItem = (draft, listKey, index, field, value) => {
  const normalized = normalizeGenerateDraft(draft);
  const list = normalized[listKey].map((item, idx) => (
    idx === index ? { ...item, [field]: value } : item
  ));
  return { ...normalized, [listKey]: list };
};

export const buildEnrichedGenerateTopic = (draft) => {
  const normalized = normalizeGenerateDraft(draft);
  const basePrompt = normalized.prompt.trim();
  if (!basePrompt) return '';

  const sectionLines = normalized.sectionOutlines
    .map((section, index) => {
      const title = section.title.trim();
      const hint = section.hint.trim();
      if (!title && !hint) return null;
      const detail = [title ? `judul "${title}"` : null, hint ? `fokus ${hint}` : null].filter(Boolean).join(', ');
      return `Section ${index + 1}: ${detail}`;
    })
    .filter(Boolean);

  const exerciseLines = normalized.exerciseOutlines
    .map((exercise, index) => {
      const hint = exercise.hint.trim();
      if (!hint) return null;
      return `Latihan ${index + 1} (${exercise.exercise_type}): ${hint}`;
    })
    .filter(Boolean);

  const quizLines = normalized.quizOutlines
    .map((quiz, index) => {
      const hint = quiz.hint.trim();
      if (!hint) return null;
      return `Quiz ${index + 1} (${quiz.optionsCount || 4} opsi): ${hint}`;
    })
    .filter(Boolean);

  const hasCustomHints = sectionLines.length > 0 || exerciseLines.length > 0 || quizLines.length > 0;
  if (!hasCustomHints) {
    return basePrompt;
  }

  const lines = [
    basePrompt,
    '',
    '[[META: Petunjuk untuk AI — JANGAN masukkan teks di bawah ini ke judul modul, judul section, isi materi, latihan, atau quiz]]',
    `Jumlah section: ${normalized.sectionOutlines.length}`,
    `Jumlah latihan: ${normalized.exerciseOutlines.length}`,
    `Jumlah quiz: ${normalized.quizOutlines.length}`,
  ];

  if (sectionLines.length > 0) {
    lines.push('Detail section:', ...sectionLines);
  }
  if (exerciseLines.length > 0) {
    lines.push('Petunjuk latihan:', ...exerciseLines);
  }
  if (quizLines.length > 0) {
    lines.push('Petunjuk quiz:', ...quizLines);
  }

  lines.push(
    'Wajib: setiap opsi pilihan ganda harus pernyataan lengkap dan spesifik tentang topik (bukan template seperti "Pernyataan A tentang ...").',
    'Jangan tulis (Benar) atau (Salah) di teks opsi. Isi field correct_answer untuk setiap latihan.',
  );

  lines.push('[[/META]]');

  return lines.join('\n');
};

export const buildGenerateModuleRequest = (draft, classroomId) => {
  const normalized = normalizeGenerateDraft(draft);
  const displayTopic = normalized.prompt.trim();

  return {
    classroomId,
    topic: buildEnrichedGenerateTopic(normalized),
    displayTopic,
    numSections: normalized.sectionOutlines.length,
    numExercises: normalized.exerciseOutlines.length,
    quizCount: normalized.quizOutlines.length,
    draft: normalized,
  };
};
