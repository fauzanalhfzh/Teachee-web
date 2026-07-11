const PLACEHOLDER_OPTION_PATTERN = /^Pernyataan\s+[A-D]\s+tentang\s+/i;
const PLACEHOLDER_CONCEPT_PATTERN = /^(Konsep|Definisi)\s+[A-C]\b/i;

export const stripAnswerMarker = (text) => {
  let result = String(text || '').trim();
  if (!result) return '';

  result = result
    .replace(/\s*[\(\[]\s*(Benar|Salah|Correct|True|False|Jawaban\s+Benar)\s*[\)\]]\s*/gi, ' ')
    .replace(/\s*[-–—]\s*(Benar|Salah)\s*$/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return result;
};

/** Remove leading "A. " / "B)" style labels so UI can add its own letter once. */
export const stripOptionLetterPrefix = (text) => {
  let result = stripAnswerMarker(text);
  if (!result) return '';

  result = result
    .replace(/^[A-Z]\s*[.)]\s*/i, '')
    .replace(/^[A-Z]\s*[-–—]\s*/i, '')
    .trim();

  return result;
};

export const hasBlankPrompt = (text = '') => /_{2,}|\[\s*\]|\(\s*\)|\.{3,}/.test(String(text || ''));

export const isEssayLikeType = (type = '') => (
  ['essay', 'fill_blank', 'fill-blank', 'short_answer', 'short-answer', 'text', 'open_ended', 'open-ended'].includes(
    String(type || '').toLowerCase().trim(),
  )
);

export const isTrueFalseLikeType = (type = '') => (
  ['true_false', 'true-false', 'truefalse', 'boolean', 'benar_salah', 'benar-salah'].includes(
    String(type || '').toLowerCase().trim(),
  )
);

/** Options that are only letter placeholders (A/B/C/D). */
export const isLetterOnlyOptions = (options = []) => {
  if (!Array.isArray(options) || options.length === 0) return false;
  const cleaned = options
    .map((opt) => stripOptionLetterPrefix(String(opt)))
    .filter(Boolean);
  if (cleaned.length === 0) return true;
  return cleaned.every((opt) => /^[A-D]$/i.test(opt.trim()));
};

export const hasTrueFalseOptions = (options = []) => {
  if (!Array.isArray(options) || options.length < 2) return false;
  const normalized = options.map((opt) => stripOptionLetterPrefix(String(opt)).toLowerCase());
  const hasTrue = normalized.some((opt) => ['benar', 'true', 'ya', 'yes'].includes(opt));
  const hasFalse = normalized.some((opt) => ['salah', 'false', 'tidak', 'no'].includes(opt));
  return hasTrue && hasFalse;
};

export const isMatchingLikeType = (type = '') => (
  ['matching', 'match', 'pairing', 'pasangan'].includes(String(type || '').toLowerCase().trim())
);

export const hasMatchingPrompt = (text = '') => (
  /pasangkan|cocokkan|pasangan|matching|match\s+the|pasangan\s+kan/i.test(String(text || ''))
);

export const isOrderingLikeType = (type = '') => (
  ['ordering', 'order', 'sequence', 'arrange', 'urutan', 'susun'].includes(String(type || '').toLowerCase().trim())
);

export const hasOrderingPrompt = (text = '') => (
  /urutkan|susun|urutan|langkah-langkah|ordering|sequence|arrange\s+the/i.test(String(text || ''))
);

export const isQuizOrderingQuestion = (question = {}) => {
  const type = question?.question_type || question?.type || question?.exercise_type || question?.answer_type || '';
  if (isOrderingLikeType(type)) return true;
  if (question?.isOrdering) return true;

  const text = question?.text || question?.question_text || question?.question || question?.prompt || '';
  if (hasOrderingPrompt(text)) return true;

  return false;
};

export const isQuizMatchingQuestion = (question = {}) => {
  if (isQuizOrderingQuestion(question)) return false;

  const type = question?.question_type || question?.type || question?.exercise_type || question?.answer_type || '';
  if (isMatchingLikeType(type)) return true;
  if (question?.isMatching) return true;

  const text = question?.text || question?.question_text || question?.question || question?.prompt || '';
  if (hasMatchingPrompt(text)) return true;

  if (Array.isArray(question?.matchingLeft) && question.matchingLeft.length > 0
    && Array.isArray(question?.matchingRight) && question.matchingRight.length > 0) {
    return true;
  }

  return false;
};

export const isQuizTrueFalseQuestion = (question = {}) => {
  if (isQuizOrderingQuestion(question)) return false;
  if (isQuizMatchingQuestion(question)) return false;

  const type = question?.question_type || question?.type || question?.exercise_type || question?.answer_type || '';
  if (isTrueFalseLikeType(type)) return true;
  if (isEssayLikeType(type)) return false;
  if (isMatchingLikeType(type)) return false;
  if (isOrderingLikeType(type)) return false;

  const text = question?.text || question?.question_text || question?.question || question?.prompt || '';
  if (hasBlankPrompt(text)) return false;
  if (hasMatchingPrompt(text)) return false;
  if (hasOrderingPrompt(text)) return false;

  const options = Array.isArray(question?.options) ? question.options : [];
  if (hasTrueFalseOptions(options)) return true;

  // Statement + placeholder A/B/C/D (or empty options) → Benar/Salah
  if (isLetterOnlyOptions(options) || options.length === 0) {
    return true;
  }

  return false;
};

export const isQuizEssayQuestion = (question = {}) => {
  if (isQuizOrderingQuestion(question)) return false;
  if (isQuizMatchingQuestion(question)) return false;
  if (isQuizTrueFalseQuestion(question)) return false;

  const type = question?.question_type || question?.type || question?.exercise_type || question?.answer_type || '';
  if (isEssayLikeType(type)) return true;

  const text = question?.text || question?.question_text || question?.question || question?.prompt || '';
  if (hasBlankPrompt(text)) return true;

  return false;
};

export const TRUE_FALSE_OPTIONS = ['Benar', 'Salah'];

export const parseRawOptions = (rawOptions) => {
  if (rawOptions === null || rawOptions === undefined) return [];
  if (Array.isArray(rawOptions)) return rawOptions;
  if (typeof rawOptions === 'object') return rawOptions;
  if (typeof rawOptions === 'string') {
    const trimmed = rawOptions.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) || (parsed && typeof parsed === 'object')) return parsed;
    } catch {
      // fall through
    }
    return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

export const isPlaceholderOptionText = (text) => {
  const value = String(text || '').trim();
  if (!value) return false;
  return PLACEHOLDER_OPTION_PATTERN.test(value)
    || PLACEHOLDER_CONCEPT_PATTERN.test(value)
    || /^Definisi\s+[A-C]$/i.test(value);
};

export const isPlaceholderOptions = (options = []) => {
  if (!Array.isArray(options) || options.length === 0) return false;
  const hits = options.filter((opt) => isPlaceholderOptionText(opt)).length;
  return hits >= Math.max(2, Math.ceil(options.length * 0.5));
};

export const cleanOptionsForDisplay = (options = []) => (
  Array.isArray(options)
    ? options.map((opt) => stripOptionLetterPrefix(String(opt))).filter(Boolean)
    : []
);

const extractMatchingFromQuestionText = (questionText = '') => {
  const source = String(questionText || '').trim();
  if (!source) {
    return { stemText: '', matchingLeft: [], matchingRight: [] };
  }

  const normalized = source.replace(/\s+/g, ' ').trim();
  let leftMatches = [];
  let rightMatches = [];
  let stemText = source;

  const definitionSplit = normalized.match(/\bDefinisi\s*:/i);
  if (definitionSplit) {
    const splitIndex = definitionSplit.index;
    const leftChunk = normalized.slice(0, splitIndex).trim();
    const rightChunk = normalized.slice(splitIndex + definitionSplit[0].length).trim();

    leftMatches = [...leftChunk.matchAll(/(?:^|\s)(\d+)\.\s*(.+?)(?=\s+\d+\.\s+|$)/g)];
    rightMatches = [...rightChunk.matchAll(/(?:^|\s)([A-Z])\.\s*(.+?)(?=\s+[A-Z]\.\s+|$)/g)];
    stemText = stripAnswerMarker(leftChunk.replace(/(?:^|\s)\d+\.\s*[^\d]+?(?=\s+\d+\.|$)/g, '')).trim();
  } else {
    leftMatches = [...normalized.matchAll(/(?:^|\s)(\d+)\.\s*(.+?)(?=\s+\d+\.\s+|\s+[A-Z]\.\s+|$)/g)];
    rightMatches = [...normalized.matchAll(/(?:^|\s)([A-Z])\.\s*(.+?)(?=\s+[A-Z]\.\s+|\s+\d+\.\s+|$)/g)];
    stemText = stripAnswerMarker(
      normalized
        .replace(/(?:^|\s)\d+\.\s*(.+?)(?=\s+\d+\.\s+|\s+[A-Z]\.\s+|$)/g, '')
        .replace(/(?:^|\s)[A-Z]\.\s*(.+?)(?=\s+[A-Z]\.\s+|\s+\d+\.\s+|$)/g, '')
    ).trim();
  }

  const matchingLeft = leftMatches
    .map((match) => stripAnswerMarker(match[2]))
    .map((item) => item.trim())
    .filter(Boolean);

  const matchingRight = rightMatches
    .map((match) => stripAnswerMarker(match[2]))
    .map((item) => item.trim())
    .filter(Boolean);

  if (matchingLeft.length === 0 || matchingRight.length === 0) {
    return { stemText: source, matchingLeft: [], matchingRight: [] };
  }

  return {
    stemText: stemText || 'Pasangkan item kiri ke definisi yang tepat.',
    matchingLeft,
    matchingRight,
  };
};

const extractOrderingFromQuestionText = (questionText = '') => {
  const source = String(questionText || '').trim();
  if (!source) {
    return { stemText: '', orderingItems: [] };
  }

  const normalized = source.replace(/\s+/g, ' ').trim();
  const orderingMatches = [...normalized.matchAll(/(?:^|\s)(\d+)\.\s*(.+?)(?=\s+\d+\.|$)/g)];

  const orderingItems = orderingMatches
    .map((match) => stripAnswerMarker(match[2]))
    .map((item) => item.trim())
    .filter(Boolean);

  if (orderingItems.length < 2) {
    return { stemText: source, orderingItems: [] };
  }

  const stemText = stripAnswerMarker(normalized.replace(/(?:^|\s)\d+\.\s*.+?(?=\s+\d+\.|$)/g, '')).trim();

  return {
    stemText: stemText || 'Susun item dari kiri ke kanan sesuai urutan yang benar.',
    orderingItems,
  };
};

export const normalizeExerciseForPractice = (exercise, index = 0) => {
  if (typeof exercise === 'string') {
    return {
      id: `exercise-${index + 1}`,
      type: 'text',
      exercise_type: 'text',
      question_text: exercise,
      text: exercise,
      options: [],
      points: null,
    };
  }

  const promptType = String(exercise?.exercise_type || exercise?.type || 'text').toLowerCase();
  const rawOptions = parseRawOptions(exercise?.options || exercise?.choices || exercise?.answers);

  const matchingSource = (
    rawOptions && typeof rawOptions === 'object' && !Array.isArray(rawOptions)
      ? rawOptions
      : Array.isArray(rawOptions) && rawOptions.length === 1 && typeof rawOptions[0] === 'object'
        ? rawOptions[0]
        : null
  );

  const asList = (value) => {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined) return [];
    return [value];
  };

  const rawQuestionText = String(
    exercise?.question_text || exercise?.question || exercise?.text || exercise?.prompt || '',
  ).trim();

  const parsedInlineMatching = extractMatchingFromQuestionText(rawQuestionText);
  const parsedInlineOrdering = extractOrderingFromQuestionText(rawQuestionText);

  const matchingLeft = asList(
    matchingSource?.left || matchingSource?.left_items || matchingSource?.source || matchingSource?.questions,
  ).map((item) => stripAnswerMarker(String(item))).filter(Boolean);

  const matchingRight = asList(
    matchingSource?.right || matchingSource?.right_items || matchingSource?.target || matchingSource?.answers,
  ).map((item) => stripAnswerMarker(String(item))).filter(Boolean);

  const resolvedMatchingLeft = matchingLeft.length > 0 ? matchingLeft : parsedInlineMatching.matchingLeft;
  const resolvedMatchingRight = matchingRight.length > 0 ? matchingRight : parsedInlineMatching.matchingRight;

  const isMatching = promptType === 'matching' || (resolvedMatchingLeft.length > 0 && resolvedMatchingRight.length > 0);
  const isOrdering = ['ordering', 'sequence', 'arrange'].includes(promptType);
  const isTrueFalse = ['true_false', 'truefalse', 'boolean'].includes(promptType);

  // If promptType is matching, and we still don't have matchingLeft/matchingRight,
  // try parsing from options or correctAnswer
  let finalMatchingLeft = resolvedMatchingLeft;
  let finalMatchingRight = resolvedMatchingRight;

  if (isMatching && (finalMatchingLeft.length === 0 || finalMatchingRight.length === 0)) {
    let parsedFromOptionsLeft = [];
    let parsedFromOptionsRight = [];
    if (Array.isArray(rawOptions) && rawOptions.length > 0) {
      rawOptions.forEach((opt) => {
        const text = stripAnswerMarker(String(opt));
        // "VPD: Virtual Private ..." or "VPD - Virtual Private ..."
        const pairParts = text.split(/\s*[:\-—]\s+/);
        if (pairParts.length >= 2 && pairParts[0] && pairParts[1]) {
          parsedFromOptionsLeft.push(pairParts[0].replace(/^[A-Z]\.\s*/i, '').trim());
          parsedFromOptionsRight.push(pairParts.slice(1).join(' - ').trim());
          return;
        }
      });
    }

    let parsedFromAnswerLeft = [];
    let parsedFromAnswerRight = [];
    const answerStr = String(exercise?.correct_answer || exercise?.correctAnswer || exercise?.answer || '');
    if (answerStr) {
      const pairs = answerStr.split(';').map((p) => p.trim()).filter(Boolean);
      pairs.forEach((pair) => {
        const parts = pair.split(/\s*[:\-—=]\s*/);
        if (parts.length >= 2) {
          const left = parts[0].trim();
          const right = parts.slice(1).join('-').trim();
          if (left && right) {
            parsedFromAnswerLeft.push(left);
            parsedFromAnswerRight.push(right);
            return;
          }
        }

        const dotIndex = pair.indexOf('.');
        if (dotIndex > 0 && dotIndex < pair.length - 1) {
          const right = pair.slice(0, dotIndex).trim();
          const left = pair.slice(dotIndex + 1).trim();
          if (left && right) {
            parsedFromAnswerLeft.push(left);
            parsedFromAnswerRight.push(right);
          }
        }
      });
    }

    if (parsedFromOptionsLeft.length > 0 && parsedFromOptionsRight.length > 0) {
      finalMatchingLeft = parsedFromOptionsLeft;
      finalMatchingRight = parsedFromOptionsRight;
    } else if (parsedFromAnswerLeft.length > 0 && parsedFromAnswerRight.length > 0) {
      finalMatchingLeft = parsedFromAnswerLeft;
      finalMatchingRight = parsedFromAnswerRight;
    } else if (finalMatchingLeft.length === 0 && Array.isArray(rawOptions) && rawOptions.length >= 2) {
      // Backend often sends matching as lettered terms only: ["A. VPD", "B. Hosting", ...]
      finalMatchingLeft = rawOptions
        .map((opt) => stripAnswerMarker(String(opt)).replace(/^[A-Z]\.\s*/i, '').trim())
        .filter(Boolean);
    }
  }

  const flatOptions = Array.isArray(rawOptions)
    ? cleanOptionsForDisplay(rawOptions)
    : [];

  const options = (() => {
    if (isMatching) {
      // Keep original options so UI can still build matching columns when right side is missing.
      if (finalMatchingRight.length > 0) return finalMatchingRight;
      if (finalMatchingLeft.length > 0) return finalMatchingLeft;
      return flatOptions;
    }
    if (flatOptions.length > 0) return flatOptions;
    if (isOrdering && parsedInlineOrdering.orderingItems.length > 0) return parsedInlineOrdering.orderingItems;
    if (isTrueFalse) return ['Benar', 'Salah'];
    return flatOptions;
  })();
  const questionText = (() => {
    if (isMatching && parsedInlineMatching.matchingLeft.length > 0) {
      return parsedInlineMatching.stemText;
    }
    if (isOrdering && parsedInlineOrdering.orderingItems.length > 0) {
      return parsedInlineOrdering.stemText;
    }
    return rawQuestionText;
  })();

  return {
    id: exercise?.id || `exercise-${index + 1}`,
    type: exercise?.exercise_type || exercise?.type || 'text',
    exercise_type: exercise?.exercise_type || exercise?.type || 'text',
    text: questionText,
    question_text: questionText,
    options,
    isMatching,
    isOrdering,
    matchingLeft: finalMatchingLeft,
    matchingRight: finalMatchingRight,
    correctAnswer: exercise?.correct_answer ?? exercise?.correctAnswer ?? exercise?.answer ?? null,
    correctOrder: asList(exercise?.correct_order || exercise?.correctOrder || exercise?.answer_order).map(String),
    correctPairs: exercise?.correct_pairs || exercise?.correctPairs || null,
    points: exercise?.points ?? null,
    isPlaceholderOptions: isPlaceholderOptions(options) || isPlaceholderOptions(finalMatchingLeft),
  };
};
