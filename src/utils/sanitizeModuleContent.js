const INSTRUCTION_DELIMITER = '--- Instruksi Kustom Guru ---';

const INSTRUCTION_LINE_PATTERNS = [
  /^Buat tepat \d+ section materi\.?$/i,
  /^Buat tepat \d+ latihan\.?$/i,
  /^Buat tepat \d+ soal quiz.*$/i,
  /^Detail section:$/i,
  /^Petunjuk latihan:$/i,
  /^Petunjuk quiz:$/i,
  /^Section \d+:/i,
  /^Latihan \d+ /i,
  /^Quiz \d+ /i,
  /^Jumlah section:/i,
  /^Jumlah latihan:/i,
  /^Jumlah quiz:/i,
  /^\[PETUNUK SISTEM/i,
  /^\[\[META:/i,
  /^\[\[\/META\]\]$/i,
];

export const stripTeacherInstructions = (text) => {
  if (!text || typeof text !== 'string') return '';

  let result = text;

  result = result.replace(/\[\[META:[\s\S]*?\[\[\/META\]\]/gi, ' ');
  result = result.replace(/\[\[META:[\s\S]*$/gi, ' ');

  while (result.includes(INSTRUCTION_DELIMITER)) {
    const before = result.split(INSTRUCTION_DELIMITER)[0];
    const after = result.split(INSTRUCTION_DELIMITER).slice(1).join(INSTRUCTION_DELIMITER);
    const continuation = after.replace(/^[\s\S]*?(?=\s+(?:adalah|merupakan|ialah)\b)/i, '').trim();
    result = `${before} ${continuation}`.trim();
    if (result.includes(INSTRUCTION_DELIMITER)) {
      result = result.split(INSTRUCTION_DELIMITER)[0].trim();
    }
  }

  result = result
    .split(/\n/)
    .filter((line) => !INSTRUCTION_LINE_PATTERNS.some((pattern) => pattern.test(line.trim())))
    .join('\n');

  result = result
    .replace(/\bBuat tepat \d+ section materi\.?/gi, '')
    .replace(/\bBuat tepat \d+ latihan\.?/gi, '')
    .replace(/\bBuat tepat \d+ soal quiz[^.]*\.?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.])/g, '$1')
    .replace(/\.\s*\./g, '.')
    .trim();

  return result;
};

export const sanitizeSection = (section) => {
  if (!section || typeof section !== 'object') {
    const cleaned = stripTeacherInstructions(String(section || ''));
    return {
      title: cleaned || 'Section',
      content: cleaned,
    };
  }

  const title = stripTeacherInstructions(section.title || section.name || '');
  const content = stripTeacherInstructions(section.content || section.text || section.description || '');

  return {
    ...section,
    title: title || 'Section',
    content,
  };
};

export const sanitizeExercise = (exercise) => {
  if (!exercise || typeof exercise !== 'object') {
    return { question_text: stripTeacherInstructions(String(exercise || '')) };
  }

  return {
    ...exercise,
    question_text: stripTeacherInstructions(
      exercise.question_text || exercise.question || exercise.text || exercise.prompt || '',
    ),
  };
};

export const sanitizeModuleRecord = (module, cleanTopic = '') => {
  if (!module) return module;

  const topic = stripTeacherInstructions(cleanTopic || module.topic || module.prompt || '');
  const title = stripTeacherInstructions(module.title || topic) || topic || 'Modul AI';

  const sections = (module.sections || []).map((section, index) => {
    const cleaned = sanitizeSection(section);
    return {
      ...(typeof section === 'object' ? section : {}),
      id: section?.id || `section-${index + 1}`,
      title: cleaned.title || `Section ${index + 1}`,
      content: cleaned.content,
    };
  });

  const exercises = (module.exercises || []).map((exercise) => sanitizeExercise(exercise));

  const learningFlow = module.learningFlow || module.learning_flow;
  let sanitizedFlow = learningFlow;

  if (learningFlow) {
    sanitizedFlow = {
      ...learningFlow,
      material: learningFlow.material
        ? {
            ...learningFlow.material,
            title: stripTeacherInstructions(learningFlow.material.title || ''),
            summary: stripTeacherInstructions(learningFlow.material.summary || ''),
            sections: (learningFlow.material.sections || sections).map(sanitizeSection),
            points: (learningFlow.material.points || []).map((p) => stripTeacherInstructions(String(p))).filter(Boolean),
          }
        : undefined,
      practice: learningFlow.practice
        ? {
            ...learningFlow.practice,
            title: stripTeacherInstructions(learningFlow.practice.title || ''),
            prompts: (learningFlow.practice.prompts || []).map((p) => (
              typeof p === 'string' ? stripTeacherInstructions(p) : sanitizeExercise(p)
            )),
          }
        : undefined,
      quiz: learningFlow.quiz
        ? {
            ...learningFlow.quiz,
            title: stripTeacherInstructions(learningFlow.quiz.title || ''),
            questions: (learningFlow.quiz.questions || []).map((q) => ({
              ...q,
              text: stripTeacherInstructions(q?.text || q?.question || ''),
            })),
          }
        : undefined,
    };
  }

  return {
    ...module,
    title,
    topic,
    prompt: topic,
    sections,
    exercises,
    learningFlow: sanitizedFlow,
    learning_flow: sanitizedFlow,
  };
};
