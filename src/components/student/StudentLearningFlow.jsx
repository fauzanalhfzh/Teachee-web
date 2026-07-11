import React, { useMemo, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  BookOpenText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Lightbulb,
  Lock,
  Pin,
  School,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { normalizeExerciseForPractice, stripAnswerMarker, stripOptionLetterPrefix, isQuizEssayQuestion, isQuizTrueFalseQuestion, isQuizMatchingQuestion, isQuizOrderingQuestion, TRUE_FALSE_OPTIONS } from '../../utils/exerciseNormalize';

const TERM_HINTS = {
  'Sandi Morse': 'Metode komunikasi menggunakan kombinasi titik dan garis.',
  telegraf: 'Perangkat pengirim sinyal listrik untuk komunikasi jarak jauh.',
  titik: 'Sinyal pendek dalam kode Morse.',
  garis: 'Sinyal panjang dalam kode Morse.',
};

const normalizeCompareText = (value) => toDisplayText(value).trim().toLowerCase();

const parseMatchingAnswerMap = (rawAnswer, leftItems) => {
  if (!rawAnswer) return null;

  if (Array.isArray(rawAnswer)) {
    if (rawAnswer.length !== leftItems.length) return null;
    return rawAnswer.reduce((acc, item, idx) => {
      acc[idx] = toDisplayText(item);
      return acc;
    }, {});
  }

  if (typeof rawAnswer !== 'object') {
    return null;
  }

  const map = {};
  leftItems.forEach((leftItem, idx) => {
    const byIndex = rawAnswer[idx] ?? rawAnswer[String(idx)];
    const byText = rawAnswer[leftItem];
    const resolved = byIndex ?? byText;
    if (resolved !== undefined && resolved !== null) {
      map[idx] = toDisplayText(resolved);
    }
  });

  return Object.keys(map).length > 0 ? map : null;
};

const serializeOrderingAnswer = (orderedItems, originalItems) => {
  const base = Array.isArray(originalItems) ? originalItems : [];
  const ordered = Array.isArray(orderedItems) ? orderedItems : [];
  if (ordered.length === 0) return '';

  const used = new Set();
  const sequence = ordered.map((item) => {
    const normalized = normalizeCompareText(item);
    let index = base.findIndex((candidate, candidateIndex) => {
      if (used.has(candidateIndex)) return false;
      return normalizeCompareText(candidate) === normalized;
    });

    if (index < 0) {
      index = base.findIndex((candidate) => normalizeCompareText(candidate) === normalized);
    }

    if (index >= 0) {
      used.add(index);
      return String(index + 1);
    }

    return String(item).trim();
  });

  return sequence.join(';');
};

const extractExerciseSummary = (responseData) => {
  if (!responseData) return null;

  const source = responseData?.data || responseData;
  const results = Array.isArray(source?.results) ? source.results : [];

  if (results.length > 0) {
    const correctCount = results.reduce((count, item) => count + (item?.is_correct ? 1 : 0), 0);
    const total = results.length;

    const rawPercentage = Number(source?.score);
    const percentage = Number.isFinite(rawPercentage)
      ? Math.round(rawPercentage <= 1 ? rawPercentage * 100 : rawPercentage)
      : Math.round((correctCount / Math.max(total, 1)) * 100);

    return {
      score: correctCount,
      total,
      percentage,
      passed: percentage >= 80,
      hasScorable: total > 0,
    };
  }

  const score = source?.score ?? source?.correct_count ?? source?.correct ?? source?.result?.score;
  const total = source?.total ?? source?.total_questions ?? source?.total_count ?? source?.result?.total;

  if (score === undefined || total === undefined) {
    return null;
  }

  const numericScore = Number(score);
  const numericTotal = Number(total);
  const percentage = Number.isFinite(numericScore) && Number.isFinite(numericTotal) && numericTotal > 0
    ? Math.round(numericScore <= 1 ? numericScore * 100 : (numericScore / numericTotal) * 100)
    : 0;

  return {
    score: Number.isFinite(numericScore) ? numericScore : 0,
    total: Number.isFinite(numericTotal) ? numericTotal : 0,
    percentage,
    passed: percentage >= 80,
    hasScorable: Number.isFinite(numericTotal) && numericTotal > 0,
  };
};

const toDisplayText = (value) => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') {
    const commonText = value.text || value.content || value.prompt || value.question || value.question_text || value.description || value.title || value.label || value.name || value.value;
    if (typeof commonText === 'string') return commonText;
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

const wrapTerms = (text) => {
  const source = toDisplayText(text).trim();
  if (!source) return null;

  let nodes = [source];
  Object.entries(TERM_HINTS).forEach(([term, hint]) => {
    nodes = nodes.flatMap((node, index) => {
      if (typeof node !== 'string') {
        return [node];
      }

      const parts = node.split(new RegExp(`(${term})`, 'gi'));
      return parts.map((part, partIndex) => {
        if (part.toLowerCase() === term.toLowerCase()) {
          return (
            <span key={`term-${term}-${index}-${partIndex}`} className="underline decoration-dotted decoration-emerald-500 underline-offset-4" title={hint}>
              {part}
            </span>
          );
        }
        return part;
      });
    });
  });

  return nodes;
};

const enrichMatchingFromMaterial = (terms = [], materialSections = [], seedKey = '') => {
  const left = terms
    .map((opt) => stripOptionLetterPrefix(String(opt)).replace(/^[A-Z]\.\s*/i, '').trim())
    .filter(Boolean);
  if (left.length === 0) {
    return { matchingLeft: [], matchingRight: [], correctPairs: null };
  }

  const fullMaterialText = materialSections
    .map((sec) => `${sec.title || ''}. ${sec.content || ''}`)
    .join(' ');

  const right = left.map((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const patterns = [
      new RegExp(`${escaped}\\s+(?:adalah|merupakan|ialah|yaitu)\\s+([^.!?\\n]+)`, 'i'),
      new RegExp(`([^.!?\\n]*\\b${escaped}\\b[^.!?\\n]*)`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = fullMaterialText.match(pattern);
      if (match) {
        const sentence = String(match[1] || match[0] || '').trim();
        if (sentence && sentence.length > term.length + 3) {
          return /[.!?]$/.test(sentence) ? sentence : `${sentence}.`;
        }
      }
    }

    const matchingSection = materialSections.find(
      (sec) =>
        String(sec.title || '').toLowerCase().includes(term.toLowerCase())
        || String(sec.content || '').toLowerCase().includes(term.toLowerCase()),
    );
    if (matchingSection) {
      const content = String(matchingSection.content || '').trim();
      const sentences = content.split(/[.!?]/).map((s) => s.trim()).filter(Boolean);
      const defSentence = sentences.find(
        (s) =>
          s.toLowerCase().includes(term.toLowerCase())
          || s.toLowerCase().includes('adalah')
          || s.toLowerCase().includes('merupakan'),
      );
      if (defSentence) return `${defSentence}.`;
      if (sentences[0]) return `${sentences[0]}.`;
    }

    return `Definisi terkait: ${term}`;
  });

  const seed = String(seedKey || '').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const shuffledRightWithOrigIndex = right
    .map((text, idx) => ({ text, origIdx: idx }))
    .sort((a, b) => {
      const ha = ((seed + a.origIdx * 17) * 2654435761) % 1000;
      const hb = ((seed + b.origIdx * 17) * 2654435761) % 1000;
      return ha - hb;
    });

  const matchingRight = shuffledRightWithOrigIndex.map((x) => x.text);
  const correctPairs = {};
  shuffledRightWithOrigIndex.forEach((x, newIdx) => {
    correctPairs[x.origIdx] = newIdx;
  });

  return { matchingLeft: left, matchingRight, correctPairs };
};

const stripStepNumberPrefix = (text) => (
  stripOptionLetterPrefix(String(text || ''))
    .replace(/^\d+\s*[.)]\s*/, '')
    .trim()
);

const shuffleWithSeed = (items = [], seedKey = '') => {
  const seed = String(seedKey || '').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return items
    .map((item, idx) => ({ item, idx }))
    .sort((a, b) => {
      const ha = ((seed + a.idx * 17) * 2654435761) % 1000;
      const hb = ((seed + b.idx * 17) * 2654435761) % 1000;
      return ha - hb;
    })
    .map((entry) => entry.item);
};

const QuizCard = ({ question, answer, onChange }) => {
  const isOrdering = Boolean(question?.isOrdering || isQuizOrderingQuestion(question));
  const isMatching = !isOrdering && Boolean(question?.isMatching || isQuizMatchingQuestion(question));
  const isEssay = !isOrdering && !isMatching && isQuizEssayQuestion(question);
  const isTrueFalse = !isOrdering && !isMatching && !isEssay && isQuizTrueFalseQuestion(question);
  const options = isTrueFalse
    ? TRUE_FALSE_OPTIONS
    : (Array.isArray(question?.options) ? question.options : []);
  const [draggingRightIndex, setDraggingRightIndex] = useState(null);
  const [draggingOrderIndex, setDraggingOrderIndex] = useState(null);
  const matchMap = (answer && typeof answer === 'object' && !Array.isArray(answer)) ? answer : {};
  const orderedItems = Array.isArray(answer) && answer.length > 0
    ? answer
    : (question?.options || []);

  useEffect(() => {
    if (!isOrdering) return;
    if (Array.isArray(answer) && answer.length > 0) return;
    if ((question?.options || []).length === 0) return;
    onChange([...(question.options || [])]);
  }, [isOrdering, question?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const setMatch = (leftIndex, rightIndex) => {
    const next = { ...matchMap };
    Object.keys(next).forEach((key) => {
      if (Number(next[key]) === Number(rightIndex) && Number(key) !== Number(leftIndex)) {
        delete next[key];
      }
    });
    next[leftIndex] = rightIndex;
    onChange(next);
  };

  const clearMatch = (leftIndex) => {
    const next = { ...matchMap };
    delete next[leftIndex];
    onChange(next);
  };

  const moveOrderItem = (fromIndex, toIndex) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    const next = [...orderedItems];
    if (fromIndex >= next.length || toIndex >= next.length) return;
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onChange(next);
  };

  return (
    <div className="rounded-[20px] border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold tracking-wide text-emerald-700 mb-2">
        {isOrdering ? 'URUTAN' : isMatching ? 'MATCHING' : isEssay ? 'ESSAY / ISIAN' : isTrueFalse ? 'BENAR / SALAH' : 'PILIHAN GANDA'}
      </p>
      <p className="font-semibold text-gray-800 mb-4 text-lg">{toDisplayText(question?.text) || 'Soal quiz'}</p>

      {isOrdering && orderedItems.length > 0 ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
          <p className="text-xs font-semibold text-emerald-700 mb-2">Geser urutan dari atas ke bawah</p>
          <div className="space-y-2">
            {orderedItems.map((option, idx) => (
              <button
                key={`${question.id}-order-${idx}-${option}`}
                type="button"
                draggable
                onDragStart={() => setDraggingOrderIndex(idx)}
                onDragEnd={() => setDraggingOrderIndex(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggingOrderIndex !== null) {
                    moveOrderItem(draggingOrderIndex, idx);
                  }
                  setDraggingOrderIndex(null);
                }}
                className="w-full inline-flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm text-gray-800 hover:border-emerald-300 cursor-grab active:cursor-grabbing text-left"
              >
                <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0">
                  {idx + 1}
                </span>
                <span>{stripStepNumberPrefix(option)}</span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Tarik kartu lalu lepas di posisi yang diinginkan.</p>
        </div>
      ) : isMatching && question?.matchingLeft?.length > 0 && question?.matchingRight?.length > 0 ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-emerald-700 mb-2">Istilah</p>
              <div className="space-y-2">
                {question.matchingLeft.map((leftItem, leftIndex) => {
                  const selectedRightIndex = matchMap[leftIndex] !== undefined ? Number(matchMap[leftIndex]) : null;
                  const selectedRightText = selectedRightIndex !== null
                    ? question.matchingRight[selectedRightIndex]
                    : '';

                  return (
                    <div
                      key={`${question.id}-left-${leftIndex}`}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        if (draggingRightIndex !== null) {
                          setMatch(leftIndex, draggingRightIndex);
                        }
                        setDraggingRightIndex(null);
                      }}
                      className="rounded-xl border border-emerald-200 bg-white p-3"
                    >
                      <p className="text-sm font-semibold text-gray-800">{stripAnswerMarker(leftItem)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 min-h-10 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/50 px-3 py-2 text-sm">
                          {selectedRightText ? (
                            <span className="font-medium text-emerald-900">{stripAnswerMarker(selectedRightText)}</span>
                          ) : (
                            <span className="text-gray-400">Tarik definisi ke sini</span>
                          )}
                        </div>
                        {selectedRightText && (
                          <button
                            type="button"
                            onClick={() => clearMatch(leftIndex)}
                            className="px-2 py-1 rounded-md border border-emerald-200 text-xs text-emerald-700 hover:bg-emerald-100"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-emerald-700 mb-2">Definisi</p>
              <div className="space-y-2">
                {question.matchingRight.map((rightItem, rightIndex) => {
                  const usedInLeft = Object.values(matchMap).some((value) => Number(value) === Number(rightIndex));
                  return (
                    <button
                      key={`${question.id}-right-${rightIndex}`}
                      type="button"
                      draggable={!usedInLeft}
                      onDragStart={() => {
                        if (!usedInLeft) setDraggingRightIndex(rightIndex);
                      }}
                      onDragEnd={() => setDraggingRightIndex(null)}
                      className={`w-full text-left rounded-xl border px-3 py-2 text-sm transition-all ${
                        usedInLeft
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-emerald-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 cursor-grab active:cursor-grabbing'
                      }`}
                    >
                      {stripAnswerMarker(rightItem)}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-gray-500 mt-2">Tarik definisi dari kanan, lalu lepas di slot istilah kiri.</p>
            </div>
          </div>
        </div>
      ) : isEssay ? (
        <div>
          <label className="block text-xs font-semibold tracking-wide text-emerald-700 mb-2">
            Tulis jawabanmu
          </label>
          <textarea
            value={typeof answer === 'string' ? answer : ''}
            onChange={(event) => onChange(event.target.value)}
            rows={4}
            placeholder="Ketik jawaban di sini..."
            className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 resize-y"
          />
        </div>
      ) : (
        <div className={`space-y-2.5 ${isTrueFalse ? 'grid grid-cols-1 sm:grid-cols-2 gap-2.5 space-y-0' : ''}`}>
          {options.length > 0 ? (
            options.map((opt, idx) => (
              <button
                key={`${question.id}-${idx}`}
                type="button"
                onClick={() => onChange(idx)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  answer === idx
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {isTrueFalse
                  ? stripOptionLetterPrefix(toDisplayText(opt))
                  : `${String.fromCharCode(65 + idx)}. ${stripOptionLetterPrefix(toDisplayText(opt))}`}
              </button>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-500">
              Opsi jawaban belum tersedia untuk soal ini.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StepPill = ({ number, label, active, done, locked = false, onClick, disabled = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled || locked}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-semibold whitespace-nowrap transition-all ${
      locked
        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
        : active
          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm'
          : done
            ? 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50'
            : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
    } disabled:opacity-40 disabled:cursor-not-allowed`}
  >
    {locked ? (
      <Lock size={16} />
    ) : done && !active ? (
      <CheckCircle2 size={16} />
    ) : (
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
        active ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
      }`}>
        {number}
      </span>
    )}
    <span>{label}</span>
  </button>
);

const Callout = ({ type = 'info', title, children }) => {
  const styles = {
    info: {
      icon: Lightbulb,
      box: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    },
    warning: {
      icon: AlertTriangle,
      box: 'bg-amber-50 border-amber-200 text-amber-900',
    },
    summary: {
      icon: Pin,
      box: 'bg-sky-50 border-sky-200 text-sky-900',
    },
  };

  const variant = styles[type] || styles.info;
  const Icon = variant.icon;

  return (
    <div className={`rounded-2xl border p-4 ${variant.box}`}>
      <div className="flex items-start gap-3">
        <Icon size={18} className="mt-0.5" />
        <div>
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-sm mt-1 leading-relaxed">{children}</p>
        </div>
      </div>
    </div>
  );
};

const StudentLearningFlow = ({
  task,
  onBack,
  onSubmitLearningQuiz,
  onCompleteLearningContent,
  onSubmitLearningExercises,
}) => {
  const flow = task?.learningFlow || {};
  const asArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined) return [];
    if (typeof value === 'string') return value ? [value] : [];
    return [value];
  };

  const [screen, setScreen] = useState('materi');
  const [materialIndex, setMaterialIndex] = useState(0);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [practiceMatchingAnswers, setPracticeMatchingAnswers] = useState({});
  const [practiceOrderingAnswers, setPracticeOrderingAnswers] = useState({});
  const [draggingMatchItem, setDraggingMatchItem] = useState(null);
  const [draggingOrderingItem, setDraggingOrderingItem] = useState(null);
  const [practiceTextAnswers, setPracticeTextAnswers] = useState({});
  const [contentCompleted, setContentCompleted] = useState(Boolean(task?.materialCompleted));
  const [isSubmittingExercises, setIsSubmittingExercises] = useState(false);
  const [exerciseSubmitError, setExerciseSubmitError] = useState('');
  const [exerciseApiSummary, setExerciseApiSummary] = useState(null);
  const [showQuizEntryConfirm, setShowQuizEntryConfirm] = useState(false);
  const [quizLocked, setQuizLocked] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const materialDone = Boolean(
    task?.materialCompleted
    || contentCompleted
    || task?.practiceCompleted
    || task?.quizCompleted
    || task?.status === 'selesai',
  );
  const practiceDone = Boolean(
    task?.practiceCompleted
    || task?.quizCompleted
    || task?.status === 'selesai',
  );
  const quizDone = Boolean(task?.quizCompleted || task?.status === 'selesai');

  useEffect(() => {
    if (task?.materialCompleted) {
      setContentCompleted(true);
    }
  }, [task?.materialCompleted]);

  useEffect(() => {
    if (practiceDone && screen === 'latihan') {
      setScreen('materi');
    }
    if (quizDone && screen === 'quiz') {
      setScreen('materi');
    }
  }, [practiceDone, quizDone, screen]);

  const materialSource = flow.material || { title: task?.title || 'Materi', summary: '', points: [] };
  const practiceSource = flow.practice || { title: 'Latihan', prompts: [] };
  const quizSource = flow.quiz || { title: 'Quiz', questions: [] };

  const material = {
    title: materialSource.title || task?.title || 'Materi',
    summary: materialSource.summary || task?.title || 'Materi pembelajaran',
    points: asArray(materialSource.points).filter(Boolean),
    sections: asArray(materialSource.sections).filter(Boolean),
  };

  const materialSections = useMemo(() => {
    if (material.sections.length > 0) {
      return material.sections.map((section, index) => {
        if (typeof section === 'string') {
          return {
            id: `material-${index + 1}`,
            title: `Bagian ${index + 1}`,
            content: section,
            imageUrl: null,
            imagePrompt: null,
            createdAt: null,
          };
        }

        return {
          id: section?.id || `material-${index + 1}`,
          title: section?.title || section?.name || `Bagian ${index + 1}`,
          content: section?.content || section?.text || section?.description || '',
          imageUrl: section?.imageUrl || section?.image_url || null,
          imagePrompt: section?.imagePrompt || section?.image_prompt || null,
          createdAt: section?.createdAt || section?.created_at || null,
        };
      });
    }

    if (material.points.length > 0) {
      return material.points.map((point, index) => ({
        id: `material-point-${index + 1}`,
        title: `Bagian ${index + 1}`,
        content: point,
        imagePrompt: null,
        createdAt: null,
      }));
    }

    return [{ id: 'material-default', title: material.title, content: material.summary, imageUrl: null, imagePrompt: null, createdAt: null }];
  }, [material.points, material.sections, material.summary, material.title]);

  const quiz = useMemo(() => ({
    title: quizSource.title || 'Quiz',
    questions: asArray(quizSource.questions)
      .map((question, index) => {
        if (typeof question === 'string') {
          const base = { id: `quiz-${index + 1}`, text: question, options: [] };
          return {
            ...base,
            isMatching: isQuizMatchingQuestion(base),
            isEssay: isQuizEssayQuestion(base),
            isTrueFalse: isQuizTrueFalseQuestion(base),
          };
        }

        const options = asArray(
          question?.options || question?.choices || question?.answers || [question?.option_a, question?.option_b, question?.option_c, question?.option_d].filter(Boolean),
        )
          .map((option) => stripOptionLetterPrefix(toDisplayText(option).trim()))
          .filter(Boolean);

        const text = toDisplayText(
          question?.text || question?.question_text || question?.question || question?.prompt || question?.content || `Soal ${index + 1}`,
        );

        const normalized = {
          ...question,
          id: question?.id || `quiz-${index + 1}`,
          text,
          question_text: text,
          options,
          type: question?.question_type || question?.type || question?.exercise_type || null,
          correctAnswer: question?.correct_answer ?? question?.correctAnswer ?? question?.answer ?? null,
          matchingLeft: question?.matchingLeft || [],
          matchingRight: question?.matchingRight || [],
        };

        const isOrdering = isQuizOrderingQuestion(normalized);
        const isMatching = !isOrdering && isQuizMatchingQuestion(normalized);
        const isTrueFalse = !isOrdering && !isMatching && isQuizTrueFalseQuestion(normalized);
        const isEssay = !isOrdering && !isMatching && !isTrueFalse && isQuizEssayQuestion(normalized);

        if (isOrdering) {
          const correctOrder = options.map((opt) => stripStepNumberPrefix(opt));
          const shuffled = shuffleWithSeed(correctOrder, normalized.id);
          // Avoid identical order after shuffle when already sequential.
          const displayOptions = shuffled.join('|') === correctOrder.join('|')
            ? [...correctOrder].reverse()
            : shuffled;

          return {
            ...normalized,
            isOrdering: true,
            isMatching: false,
            isEssay: false,
            isTrueFalse: false,
            options: displayOptions,
            correctOrder,
          };
        }

        if (isMatching) {
          const terms = (normalized.matchingLeft?.length ? normalized.matchingLeft : options);
          const enriched = (
            normalized.matchingLeft?.length && normalized.matchingRight?.length
          )
            ? {
              matchingLeft: normalized.matchingLeft,
              matchingRight: normalized.matchingRight,
              correctPairs: normalized.correctPairs || null,
            }
            : enrichMatchingFromMaterial(terms, materialSections, normalized.id);

          return {
            ...normalized,
            isMatching: true,
            isEssay: false,
            isTrueFalse: false,
            matchingLeft: enriched.matchingLeft,
            matchingRight: enriched.matchingRight,
            correctPairs: enriched.correctPairs,
            options: enriched.matchingLeft,
          };
        }

        return {
          ...normalized,
          isOrdering: false,
          isMatching: false,
          isTrueFalse,
          isEssay,
          options: isTrueFalse ? TRUE_FALSE_OPTIONS : options,
        };
      })
      .filter(Boolean),
  }), [quizSource.title, quizSource.questions, materialSections]);

  const practice = useMemo(() => {
    const rawPrompts = asArray(practiceSource.prompts)
      .map((prompt, index) => normalizeExerciseForPractice(prompt, index))
      .filter((item) => item?.text || item?.question_text);

    return {
      title: practiceSource.title || 'Latihan',
      prompts: rawPrompts.map((item) => {
        if (item.isMatching && (!item.matchingLeft?.length || !item.matchingRight?.length)) {
          const terms = (
            item.matchingLeft?.length
              ? item.matchingLeft
              : (item.options || [])
          )
            .map((opt) => stripAnswerMarker(String(opt)).replace(/^[A-Z]\.\s*/i, '').trim())
            .filter(Boolean);

          if (terms.length === 0) return item;

          const left = [...terms];
          const fullMaterialText = materialSections
            .map((sec) => `${sec.title || ''}. ${sec.content || ''}`)
            .join(' ');

          const right = terms.map((term) => {
            const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const patterns = [
              new RegExp(`${escaped}\\s+(?:adalah|merupakan|ialah|yaitu)\\s+([^.!?\\n]+)`, 'i'),
              new RegExp(`(?:adalah|merupakan|ialah|yaitu)\\s+${escaped}[^.!?\\n]*`, 'i'),
              new RegExp(`([^.!?\\n]*\\b${escaped}\\b[^.!?\\n]*)`, 'i'),
            ];

            for (const pattern of patterns) {
              const match = fullMaterialText.match(pattern);
              if (match) {
                const sentence = String(match[1] || match[0] || '').trim();
                if (sentence && sentence.length > term.length + 3) {
                  return /[.!?]$/.test(sentence) ? sentence : `${sentence}.`;
                }
              }
            }

            const matchingSection = materialSections.find(
              (sec) =>
                String(sec.title).toLowerCase().includes(term.toLowerCase()) ||
                String(sec.content).toLowerCase().includes(term.toLowerCase()),
            );
            if (matchingSection) {
              const content = String(matchingSection.content).trim();
              const sentences = content.split(/[.!?]/).map((s) => s.trim()).filter(Boolean);
              const defSentence = sentences.find(
                (s) =>
                  s.toLowerCase().includes(term.toLowerCase()) ||
                  s.toLowerCase().includes('adalah') ||
                  s.toLowerCase().includes('merupakan') ||
                  s.toLowerCase().includes('ialah') ||
                  s.toLowerCase().includes('yaitu'),
              );
              if (defSentence) return `${defSentence}.`;
              if (sentences[0]) return `${sentences[0]}.`;
            }

            return `Definisi terkait: ${term}`;
          });

          // Stable shuffle based on exercise id so refresh doesn't reshuffle mid-answer.
          const seed = String(item.id || '').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
          const shuffledRightWithOrigIndex = right
            .map((text, idx) => ({ text, origIdx: idx }))
            .sort((a, b) => {
              const ha = ((seed + a.origIdx * 17) * 2654435761) % 1000;
              const hb = ((seed + b.origIdx * 17) * 2654435761) % 1000;
              return ha - hb;
            });

          const shuffledRight = shuffledRightWithOrigIndex.map((x) => x.text);
          const origToNewIndex = {};
          shuffledRightWithOrigIndex.forEach((x, newIdx) => {
            origToNewIndex[x.origIdx] = newIdx;
          });

          const correctPairs = {};
          left.forEach((_, idx) => {
            correctPairs[idx] = origToNewIndex[idx];
          });

          return {
            ...item,
            matchingLeft: left,
            matchingRight: shuffledRight,
            correctPairs,
            correctAnswer: correctPairs,
          };
        }
        return item;
      }),
    };
  }, [practiceSource.prompts, practiceSource.title, materialSections]);

  const currentMaterialSection = materialSections[Math.min(materialIndex, materialSections.length - 1)] || {
    title: material.title,
    content: material.summary,
    imageUrl: null,
    imagePrompt: null,
    createdAt: null,
  };

  const currentSectionImageUrl = resolveMediaUrl(currentMaterialSection.imageUrl);

  const currentQuestion = quiz.questions[quizIndex];
  const currentPractice = practice.prompts[Math.min(practiceIndex, Math.max(practice.prompts.length - 1, 0))];
  const hasPracticeOptions = Boolean(
    (Array.isArray(currentPractice?.options) && currentPractice.options.length > 0)
    || currentPractice?.isMatching,
  );
  const practiceType = String(currentPractice?.type || '').toLowerCase();
  const needsPracticeTextInput = Boolean(
    currentPractice && (
      (!hasPracticeOptions && (
        ['fill_blank', 'short_answer', 'essay', 'text'].includes(practiceType)
        || /_{2,}|_\s+_|\.{3,}/.test(String(currentPractice?.text || ''))
      )) ||
      (currentPractice.isMatching && (!currentPractice.matchingLeft?.length || !currentPractice.matchingRight?.length))
    )
  );
  const studyMinutes = Math.max(10, Math.round((materialSections.length * 4) + (practice.prompts.length * 2) + (quiz.questions.length * 2.5)));

  const practiceEvaluation = useMemo(() => {
    let score = 0;
    let total = 0;

    practice.prompts.forEach((item) => {
      if (!item) return;

      if (item.isMatching) {
        const expectedMap = parseMatchingAnswerMap(item.correctPairs || item.correctAnswer, item.matchingLeft || []);
        if (!expectedMap) return;

        total += 1;
        const selectedMap = practiceMatchingAnswers[item.id] || {};
        const isCorrect = (item.matchingLeft || []).every((_, index) => {
          const selectedIndex = selectedMap[index];
          if (selectedIndex === undefined || selectedIndex === null) return false;
          const selectedText = toDisplayText(item.matchingRight?.[selectedIndex]);
          const expectedRaw = expectedMap[index];
          const expectedAsIndex = Number(expectedRaw);
          const expectedText = Number.isInteger(expectedAsIndex) && String(expectedAsIndex) === String(expectedRaw).trim()
            ? toDisplayText(item.matchingRight?.[expectedAsIndex])
            : toDisplayText(expectedRaw);
          return normalizeCompareText(selectedText) === normalizeCompareText(expectedText);
        });
        if (isCorrect) score += 1;
        return;
      }

      if (item.isOrdering) {
        const expectedOrder = (item.correctOrder || []).map((value) => normalizeCompareText(value));
        if (expectedOrder.length === 0) return;

        total += 1;
        const currentOrder = (practiceOrderingAnswers[item.id] || item.options || []).map((value) => normalizeCompareText(value));
        const isCorrect = currentOrder.length === expectedOrder.length
          && currentOrder.every((value, index) => value === expectedOrder[index]);
        if (isCorrect) score += 1;
        return;
      }

      if (item.options?.length > 0) {
        const rawExpected = item.correctAnswer;
        if (rawExpected === null || rawExpected === undefined || rawExpected === '') return;

        total += 1;
        const selectedIndex = practiceAnswers[item.id];
        if (selectedIndex === undefined) return;

        const expectedText = normalizeCompareText(rawExpected);
        const selectedLetter = String.fromCharCode(65 + selectedIndex).toLowerCase();
        const selectedText = normalizeCompareText(item.options[selectedIndex]);
        const correctIndex = item.options.findIndex((option) => normalizeCompareText(option) === expectedText);
        const isCorrect = expectedText === selectedLetter || expectedText === selectedText || correctIndex === selectedIndex;
        if (isCorrect) score += 1;
        return;
      }

      const rawExpected = item.correctAnswer;
      if (rawExpected === null || rawExpected === undefined || rawExpected === '') return;

      total += 1;
      const selectedText = normalizeCompareText(practiceTextAnswers[item.id]);
      const expectedText = normalizeCompareText(rawExpected);
      if (selectedText && selectedText === expectedText) {
        score += 1;
      }
    });

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    return {
      score,
      total,
      percentage,
      passed: percentage >= 80,
      hasScorable: total > 0,
    };
  }, [practice.prompts, practiceAnswers, practiceMatchingAnswers, practiceOrderingAnswers, practiceTextAnswers]);

  const checkpointPracticeSummary = exerciseApiSummary || practiceEvaluation;

  const buildExerciseSubmitPayload = () => {
    const answersPayload = (practice.prompts || [])
      .map((item) => {
        if (!item?.id) return null;

        if (item.isMatching) {
          const selectedMap = practiceMatchingAnswers[item.id] || {};
          const leftItems = item.matchingLeft || [];
          const matchingPairs = leftItems.reduce((acc, leftItem, leftIndex) => {
            const rightIndex = selectedMap[leftIndex];
            if (rightIndex !== undefined && rightIndex !== null) {
              const rightText = toDisplayText(item.matchingRight?.[rightIndex]).trim();
              const leftText = toDisplayText(leftItem).trim();
              if (rightText && leftText) {
                // Backend temporary format expects a single string answer for matching.
                acc.push(`${rightText}${leftText}`);
              }
            }
            return acc;
          }, []);

          if (matchingPairs.length === 0) {
            const textAnswer = practiceTextAnswers[item.id];
            if (textAnswer && String(textAnswer).trim()) {
              return {
                exercise_id: item.id,
                answer: String(textAnswer).trim(),
              };
            }
            return null;
          }

          return {
            exercise_id: item.id,
            answer: matchingPairs.join(';'),
          };
        }

        if (item.isOrdering) {
          const ordering = practiceOrderingAnswers[item.id] || item.options || [];
          const serializedOrdering = serializeOrderingAnswer(ordering, item.options || []);
          if (!serializedOrdering) return null;

          return {
            exercise_id: item.id,
            answer: serializedOrdering,
          };
        }

        if (item.options?.length > 0) {
          const selectedIndex = practiceAnswers[item.id];
          if (selectedIndex === undefined || selectedIndex === null) return null;

          const selectedOption = item.options[selectedIndex];
          return {
            exercise_id: item.id,
            answer: toDisplayText(selectedOption).trim(),
          };
        }

        const textAnswer = practiceTextAnswers[item.id];
        if (!textAnswer || !String(textAnswer).trim()) return null;

        return {
          exercise_id: item.id,
          answer: String(textAnswer).trim(),
        };
      })
      .filter(Boolean);

    return { answers: answersPayload };
  };

  const markContentComplete = async () => {
    if (contentCompleted) return;
    if (!onCompleteLearningContent) {
      setContentCompleted(true);
      return;
    }

    try {
      await onCompleteLearningContent(task);
    } catch {
      // Keep flow uninterrupted if API completion fails.
    } finally {
      setContentCompleted(true);
    }
  };

  const submitExercises = async () => {
    setExerciseSubmitError('');
    if (!onSubmitLearningExercises) return { ok: true, skipped: true };

    setIsSubmittingExercises(true);
    try {
      const payload = buildExerciseSubmitPayload();
      const response = await onSubmitLearningExercises(payload, task);
      const apiSummary = extractExerciseSummary(response);
      if (apiSummary) {
        setExerciseApiSummary(apiSummary);
      }
      return { ok: true };
    } catch (error) {
      const isUnauthorized = error?.response?.status === 401;
      setExerciseSubmitError(
        isUnauthorized
          ? 'Sesi login kamu habis (401). Silakan login ulang, lalu submit latihan lagi.'
          : 'Gagal mengirim jawaban latihan ke server. Periksa koneksi lalu coba lagi.'
      );
      return { ok: false, unauthorized: isUnauthorized };
    } finally {
      setIsSubmittingExercises(false);
    }
  };

  const handleQuizAnswer = (value) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleQuizNext = () => {
    if (quizIndex < quiz.questions.length - 1) {
      setQuizIndex((prev) => prev + 1);
      return;
    }
    onSubmitLearningQuiz?.(answers, task, {
      practiceSummary: checkpointPracticeSummary,
      quizQuestions: quiz.questions,
    });
  };

  const handlePrev = () => {
    if (screen === 'materi') {
      setMaterialIndex((index) => Math.max(0, index - 1));
      return;
    }

    if (screen === 'latihan') {
      if (practiceIndex > 0) {
        setPracticeIndex((index) => Math.max(0, index - 1));
        return;
      }
      setScreen('material-complete');
      return;
    }

    if (screen === 'material-complete') {
      setMaterialIndex(Math.max(materialSections.length - 1, 0));
      setScreen('materi');
      return;
    }

    if (screen === 'checkpoint') {
      setScreen('latihan');
      return;
    }

    if (quizIndex > 0) {
      setQuizIndex((index) => Math.max(0, index - 1));
      return;
    }

    if (!quizLocked) {
      setScreen('latihan');
      setPracticeIndex(Math.max(practice.prompts.length - 1, 0));
    }
  };

  const handlePracticeNext = async () => {
    if (practiceIndex < practice.prompts.length - 1) {
      setPracticeIndex((index) => index + 1);
      return;
    }

    const submitResult = await submitExercises();
    if (!submitResult?.ok) {
      return;
    }

    setScreen('checkpoint');
  };

  const handleStartQuiz = () => {
    setShowQuizEntryConfirm(false);
    setQuizLocked(true);
    setScreen('quiz');
    setQuizIndex(0);
  };

  const handlePracticeAnswer = (exerciseId, optionIndex) => {
    if (!exerciseId && exerciseId !== 0) return;
    setPracticeAnswers((prev) => ({
      ...prev,
      [exerciseId]: optionIndex,
    }));
  };

  const handlePracticeTextAnswer = (exerciseId, textValue) => {
    if (!exerciseId && exerciseId !== 0) return;
    setPracticeTextAnswers((prev) => ({
      ...prev,
      [exerciseId]: textValue,
    }));
  };

  const handlePracticeMatchingAnswer = (exerciseId, leftIndex, rightIndex) => {
    if (!exerciseId && exerciseId !== 0) return;

    setPracticeMatchingAnswers((prev) => ({
      ...prev,
      [exerciseId]: Object.entries(prev[exerciseId] || {}).reduce((acc, [key, value]) => {
        const sameLeft = Number(key) === Number(leftIndex);
        const sameRightElsewhere = Number(value) === Number(rightIndex) && Number(key) !== Number(leftIndex);
        if (!sameLeft && !sameRightElsewhere) {
          acc[key] = value;
        }
        return acc;
      }, { [leftIndex]: rightIndex }),
    }));
  };

  const handlePracticeMatchingClear = (exerciseId, leftIndex) => {
    if (!exerciseId && exerciseId !== 0) return;
    setPracticeMatchingAnswers((prev) => {
      const current = { ...(prev[exerciseId] || {}) };
      delete current[leftIndex];
      return {
        ...prev,
        [exerciseId]: current,
      };
    });
  };

  const handleOrderingDragStart = (exerciseId, fromIndex) => {
    setDraggingOrderingItem({ exerciseId, fromIndex });
  };

  const handleOrderingDrop = (exerciseId, toIndex, defaultOptions) => {
    if (!draggingOrderingItem || draggingOrderingItem.exerciseId !== exerciseId) return;

    setPracticeOrderingAnswers((prev) => {
      const currentOrder = Array.isArray(prev[exerciseId]) && prev[exerciseId].length > 0
        ? [...prev[exerciseId]]
        : [...defaultOptions];

      const fromIndex = draggingOrderingItem.fromIndex;
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= currentOrder.length || toIndex >= currentOrder.length) {
        return prev;
      }

      const [moved] = currentOrder.splice(fromIndex, 1);
      currentOrder.splice(toIndex, 0, moved);

      return {
        ...prev,
        [exerciseId]: currentOrder,
      };
    });

    setDraggingOrderingItem(null);
  };

  const handleNext = async () => {
    if (screen === 'materi') {
      if (materialIndex < materialSections.length - 1) {
        setMaterialIndex((index) => index + 1);
        return;
      }
      await markContentComplete();
      setScreen('material-complete');
      return;
    }

    if (screen === 'material-complete') {
      if (practiceDone) {
        setScreen('materi');
        return;
      }
      setPracticeIndex(0);
      setScreen('latihan');
      return;
    }

    if (screen === 'latihan') {
      await handlePracticeNext();
      return;
    }

    if (screen === 'checkpoint') {
      setShowQuizEntryConfirm(true);
      return;
    }

    handleQuizNext();
  };

  const navMeta = {
    prevLabel:
      screen === 'materi'
        ? 'Previous'
        : screen === 'material-complete'
          ? 'Kembali ke Materi'
        : screen === 'latihan'
          ? practiceIndex > 0
            ? 'Latihan Sebelumnya'
            : 'Kembali ke Materi'
          : screen === 'checkpoint'
            ? 'Kembali ke Latihan'
          : quizIndex > 0
            ? 'Soal Sebelumnya'
            : 'Latihan Terkunci',
    nextLabel:
      screen === 'materi'
        ? materialIndex < materialSections.length - 1
          ? 'Next'
          : 'Selesaikan Materi'
        : screen === 'material-complete'
          ? practiceDone
            ? 'Kembali ke Materi'
            : 'Masuk ke Latihan'
        : screen === 'latihan'
          ? practiceIndex < practice.prompts.length - 1
            ? 'Latihan Berikutnya'
            : 'Selesai Belajar'
          : screen === 'checkpoint'
            ? 'Lanjut ke Quiz'
          : quizIndex < quiz.questions.length - 1
            ? 'Soal Berikutnya'
            : 'Selesai Quiz',
    prevDisabled: (screen === 'materi' && materialIndex === 0) || (screen === 'quiz' && quizIndex === 0 && quizLocked),
    nextDisabled: isSubmittingExercises || (screen === 'quiz' && currentQuestion
      ? (
        currentQuestion.isOrdering || isQuizOrderingQuestion(currentQuestion)
          ? !(Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length > 0)
          : currentQuestion.isMatching || isQuizMatchingQuestion(currentQuestion)
            ? !((currentQuestion.matchingLeft || []).every((_, idx) => answers[currentQuestion.id]?.[idx] !== undefined))
            : currentQuestion.isEssay || isQuizEssayQuestion(currentQuestion)
              ? !String(answers[currentQuestion.id] || '').trim()
              : answers[currentQuestion.id] === undefined
      )
      : false),
  };
  const showBottomNavigation = screen !== 'material-complete' && screen !== 'checkpoint';

  const activeStage = screen === 'quiz'
    ? 'quiz'
    : screen === 'latihan' || screen === 'checkpoint'
      ? 'latihan'
      : 'materi';
  const lockLearningStages = quizLocked && !quizDone;

  const isStageDone = (stageId) => {
    if (stageId === 'materi') return materialDone;
    if (stageId === 'latihan') return practiceDone;
    if (stageId === 'quiz') return quizDone;
    return false;
  };

  const handleStageClick = (stageId) => {
    if (lockLearningStages && stageId !== 'quiz') {
      return;
    }

    if (stageId === 'materi') {
      setScreen('materi');
      return;
    }

    if (stageId === 'latihan') {
      if (!materialDone || practiceDone) return;
      setPracticeIndex(0);
      setScreen('latihan');
      return;
    }

    if (stageId === 'quiz') {
      if (quizDone || !practiceDone) return;
      if (quizLocked) {
        setScreen('quiz');
        return;
      }
      setShowQuizEntryConfirm(true);
    }
  };

  const rightPanel = (
    <aside className="rounded-[20px] border border-gray-200 bg-white p-5 shadow-sm space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Informasi Pembelajaran</h3>
      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex items-center gap-2"><UserRound size={16} className="text-emerald-700" /> Guru: {task?.guru || 'Guru'}</div>
        <div className="flex items-center gap-2"><BookOpenText size={16} className="text-emerald-700" /> Mata Pelajaran: {task?.subject || 'Umum'}</div>
        <div className="flex items-center gap-2"><School size={16} className="text-emerald-700" /> Kelas: {task?.classroom_name || task?.classroomName || 'Kelas aktif'}</div>
        <div className="flex items-center gap-2"><Clock3 size={16} className="text-emerald-700" /> Estimasi belajar: {studyMinutes} menit</div>
      </div>
      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-900">
        <p className="font-semibold mb-2">Ilustrasi Section</p>
        {currentSectionImageUrl ? (
          <img
            src={currentSectionImageUrl}
            alt={currentMaterialSection.title}
            className="w-full rounded-lg border border-emerald-100 object-cover max-h-40"
          />
        ) : (
          <div className="rounded-lg border border-dashed border-emerald-200 bg-white/70 px-3 py-4 text-center text-emerald-800">
            <p className="font-medium">Gambar belum tersedia</p>
            {currentMaterialSection.imagePrompt && (
              <p className="mt-1 text-[11px] text-emerald-700/80">Prompt: {currentMaterialSection.imagePrompt}</p>
            )}
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <main className="w-full min-h-[calc(100dvh-4rem)] bg-[#F8FAFC] pb-28 md:pb-8">
      <div className="px-4 md:px-8 py-6 max-w-[1320px] mx-auto">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-emerald-700 font-semibold mb-5 hover:text-emerald-800 transition-colors"
        >
          <ChevronLeft size={18} /> Kembali
        </button>

        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-[20px] border border-gray-200 bg-white p-6 md:p-8 shadow-sm mb-5"
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <BookOpenText size={20} />
            </div>
            <div>
              <p className="text-sm text-emerald-700 font-semibold">Materi Pembelajaran</p>
              <h1 className="text-[32px] leading-tight font-bold text-gray-900">{task?.title || 'Materi'}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1.5"><BookOpenText size={15} /> {task?.subject || 'Umum'}</span>
                <span className="inline-flex items-center gap-1.5"><UserRound size={15} /> {task?.guru || 'Guru'}</span>
                <span className="inline-flex items-center gap-1.5"><Clock3 size={15} /> {studyMinutes} menit</span>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="flex items-center gap-2 sm:gap-3 mb-5 overflow-x-auto pb-1">
          <StepPill
            number={1}
            label="Materi"
            active={activeStage === 'materi'}
            done={isStageDone('materi')}
            locked={lockLearningStages}
            onClick={() => handleStageClick('materi')}
          />
          <div className="w-6 sm:w-10 h-px bg-gray-200 shrink-0" />
          <StepPill
            number={2}
            label="Latihan"
            active={activeStage === 'latihan'}
            done={isStageDone('latihan')}
            locked={practiceDone || lockLearningStages}
            onClick={() => handleStageClick('latihan')}
            disabled={!materialDone}
          />
          <div className="w-6 sm:w-10 h-px bg-gray-200 shrink-0" />
          <StepPill
            number={3}
            label="Quiz"
            active={activeStage === 'quiz'}
            done={quizDone}
            locked={quizDone}
            onClick={() => handleStageClick('quiz')}
            disabled={!practiceDone}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,900px)_320px] gap-6 items-start">
          <div className="space-y-5">
            <AnimatePresence mode="wait">
              {screen === 'materi' && (
                <motion.section
                  key={`materi-${materialIndex}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-[20px] border border-gray-200 bg-white p-6 md:p-10 shadow-sm"
                >
                  {currentSectionImageUrl ? (
                    <div className="w-full rounded-2xl overflow-hidden border border-emerald-100 mb-6 bg-emerald-50">
                      <img
                        src={currentSectionImageUrl}
                        alt={currentMaterialSection.title}
                        className="w-full max-h-80 object-cover"
                      />
                      <div className="p-5 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-emerald-700">Section {materialIndex + 1} dari {materialSections.length}</p>
                          <h2 className="text-[22px] font-bold text-gray-900 mt-1">{currentMaterialSection.title}</h2>
                        </div>
                        <Sparkles className="text-emerald-600 shrink-0" size={26} />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 mb-6 p-5">
                      <p className="text-sm font-semibold text-emerald-700">Section {materialIndex + 1} dari {materialSections.length}</p>
                      <h2 className="text-[22px] font-bold text-gray-900 mt-1">{currentMaterialSection.title}</h2>
                      {currentMaterialSection.imagePrompt && (
                        <p className="text-sm text-emerald-800/80 mt-2">Ilustrasi modul belum dihasilkan untuk section ini.</p>
                      )}
                    </div>
                  )}

                  <article className="text-[17px] leading-[1.8] text-gray-700 space-y-4">
                    <p>{wrapTerms(currentMaterialSection.content || material.summary)}</p>
                  </article>

                  <div className="mt-6">
                    <Callout type="warning" title="Perlu Diingat">
                      Baca materi sampai tuntas sebelum lanjut ke latihan dan quiz.
                    </Callout>
                  </div>

                </motion.section>
              )}

              {screen === 'latihan' && (
                <motion.section
                  key={`latihan-${practiceIndex}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-[20px] border border-gray-200 bg-white p-6 md:p-10 shadow-sm"
                >
                  <div className="w-full h-36 rounded-2xl bg-gradient-to-r from-amber-100 via-orange-50 to-white border border-amber-100 mb-6 p-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-amber-700">Tahap 2 dari 3</p>
                      <h2 className="text-[22px] font-bold text-gray-900 mt-1">{practice.title}</h2>
                      <p className="text-sm text-gray-600 mt-1">Asah pemahaman dengan latihan sebelum lanjut quiz.</p>
                    </div>
                    <Lightbulb className="text-amber-600" size={26} />
                  </div>

                  {practice.prompts.length > 0 && (
                    <div className="mb-5">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>Progres Latihan</span>
                        <span>{practiceIndex + 1}/{practice.prompts.length}</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                          style={{ width: `${((practiceIndex + 1) / Math.max(practice.prompts.length, 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <article className="text-[17px] leading-[1.8] text-gray-700">
                    <p>Kerjakan latihan untuk memperkuat pemahaman sebelum quiz.</p>
                  </article>

                  <div className="mt-5 space-y-3">
                    {currentPractice ? (
                      <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4 md:p-5 text-[17px] leading-[1.7] text-gray-700">
                        <p className="text-xs font-semibold tracking-wide text-amber-700 mb-2">
                          LATIHAN {practiceIndex + 1}
                          {currentPractice.type && currentPractice.type !== 'text' ? ` • ${String(currentPractice.type).replace(/_/g, ' ')}` : ''}
                        </p>
                        <p>{wrapTerms(currentPractice.text)}</p>
                        {currentPractice.isMatching && currentPractice.matchingLeft?.length > 0 && currentPractice.matchingRight?.length > 0 && (
                          <div className="mt-4 rounded-xl border border-amber-200 bg-white p-3">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-semibold text-amber-700 mb-2">Istilah</p>
                                <div className="space-y-2">
                                  {currentPractice.matchingLeft.map((leftItem, leftIndex) => {
                                    const matchMap = practiceMatchingAnswers[currentPractice.id] || {};
                                    const selectedRightIndex = matchMap[leftIndex] !== undefined ? Number(matchMap[leftIndex]) : null;
                                    const selectedRightText = selectedRightIndex !== null
                                      ? currentPractice.matchingRight[selectedRightIndex]
                                      : '';

                                    return (
                                      <div
                                        key={`${currentPractice.id}-left-${leftIndex}`}
                                        onDragOver={(event) => event.preventDefault()}
                                        onDrop={(event) => {
                                          event.preventDefault();
                                          if (draggingMatchItem && draggingMatchItem.exerciseId === currentPractice.id) {
                                            handlePracticeMatchingAnswer(currentPractice.id, leftIndex, draggingMatchItem.rightIndex);
                                          }
                                          setDraggingMatchItem(null);
                                        }}
                                        className="rounded-xl border border-amber-200 bg-amber-50/60 p-3"
                                      >
                                        <p className="text-sm font-semibold text-gray-800">{stripAnswerMarker(leftItem)}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                          <div className="flex-1 min-h-10 rounded-lg border border-dashed border-amber-300 bg-white px-3 py-2 text-sm">
                                            {selectedRightText ? (
                                              <span className="font-medium text-amber-900">{stripAnswerMarker(selectedRightText)}</span>
                                            ) : (
                                              <span className="text-gray-400">Tarik definisi ke sini</span>
                                            )}
                                          </div>
                                          {selectedRightText && (
                                            <button
                                              type="button"
                                              onClick={() => handlePracticeMatchingClear(currentPractice.id, leftIndex)}
                                              className="px-2 py-1 rounded-md border border-amber-200 text-xs text-amber-700 hover:bg-amber-100"
                                            >
                                              Reset
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              <div>
                                <p className="text-xs font-semibold text-amber-700 mb-2">Definisi</p>
                                <div className="space-y-2">
                                  {currentPractice.matchingRight.map((rightItem, rightIndex) => {
                                    const matchMap = practiceMatchingAnswers[currentPractice.id] || {};
                                    const usedInLeft = Object.values(matchMap).some((value) => Number(value) === Number(rightIndex));

                                    return (
                                      <button
                                        key={`${currentPractice.id}-right-${rightIndex}`}
                                        type="button"
                                        draggable={!usedInLeft}
                                        onDragStart={() => {
                                          if (!usedInLeft) {
                                            setDraggingMatchItem({ exerciseId: currentPractice.id, rightIndex });
                                          }
                                        }}
                                        onDragEnd={() => setDraggingMatchItem(null)}
                                        className={`w-full text-left rounded-xl border px-3 py-2 text-sm transition-all ${
                                          usedInLeft
                                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'border-amber-200 bg-white text-gray-700 hover:border-amber-300 hover:bg-amber-50 cursor-grab active:cursor-grabbing'
                                        }`}
                                      >
                                        {stripAnswerMarker(rightItem)}
                                      </button>
                                    );
                                  })}
                                </div>
                                <p className="text-[11px] text-gray-500 mt-2">Tarik definisi dari kanan, lalu lepas di slot istilah kiri.</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {currentPractice.isOrdering && currentPractice.options?.length > 0 && (
                          <div className="mt-4 rounded-xl border border-amber-200 bg-white p-3">
                            <p className="text-xs font-semibold text-amber-700 mb-2">Geser urutan dalam satu baris (kiri ke kanan)</p>
                            <div className="overflow-x-auto pb-1">
                              <div className="flex items-center gap-2 min-w-max">
                                {(practiceOrderingAnswers[currentPractice.id] || currentPractice.options).map((option, idx) => (
                                  <button
                                    key={`${currentPractice.id}-order-${idx}-${option}`}
                                    type="button"
                                    draggable
                                    onDragStart={() => handleOrderingDragStart(currentPractice.id, idx)}
                                    onDragEnd={() => setDraggingOrderingItem(null)}
                                    onDragOver={(event) => event.preventDefault()}
                                    onDrop={(event) => {
                                      event.preventDefault();
                                      handleOrderingDrop(currentPractice.id, idx, currentPractice.options);
                                    }}
                                    className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-gray-800 hover:border-amber-300 cursor-grab active:cursor-grabbing"
                                  >
                                    <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-amber-200 text-amber-800 text-xs font-bold">{idx + 1}</span>
                                    <span className="whitespace-nowrap">{stripAnswerMarker(option)}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-2">Tarik kartu lalu lepas di posisi yang diinginkan.</p>
                          </div>
                        )}

                        {!currentPractice.isMatching && !currentPractice.isOrdering && currentPractice.options?.length > 0 && (
                          <div className="mt-4 grid gap-2">
                            {currentPractice.options.map((option, idx) => (
                              <button
                                key={`${currentPractice.id}-${idx}`}
                                type="button"
                                onClick={() => handlePracticeAnswer(currentPractice.id, idx)}
                                className={`text-left rounded-xl border px-3 py-2 text-sm transition-all ${
                                  practiceAnswers[currentPractice.id] === idx
                                    ? 'border-amber-500 bg-amber-100 text-amber-900 font-semibold'
                                    : 'border-amber-200 bg-white text-gray-700 hover:border-amber-300 hover:bg-amber-50'
                                }`}
                              >
                                {String.fromCharCode(65 + idx)}. {stripOptionLetterPrefix(option)}
                              </button>
                            ))}
                          </div>
                        )}
                        {currentPractice.isPlaceholderOptions && (
                          <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                            Opsi latihan ini masih berupa template dari AI. Minta guru memperbarui atau generate ulang modul agar pilihan jawaban lebih spesifik.
                          </p>
                        )}
                        {!currentPractice.isMatching && !currentPractice.isOrdering && currentPractice.options?.length > 0 && practiceAnswers[currentPractice.id] !== undefined && (
                          <p className="mt-3 text-xs font-semibold text-amber-700">
                            Jawaban dipilih: {String.fromCharCode(65 + practiceAnswers[currentPractice.id])}
                          </p>
                        )}
                        {currentPractice.isMatching && (
                          <p className="mt-3 text-xs font-semibold text-amber-700">
                            Pasangkan item kiri ke jawaban kanan yang paling sesuai.
                          </p>
                        )}
                        {currentPractice.isOrdering && (
                          <p className="mt-3 text-xs font-semibold text-amber-700">
                            Susun item dari kiri ke kanan sesuai urutan yang benar.
                          </p>
                        )}
                        {currentPractice.isMatching && (!currentPractice.matchingLeft?.length || !currentPractice.matchingRight?.length) && currentPractice.options?.length > 0 && (
                          <div className="mt-4 bg-amber-50/50 border border-amber-100 rounded-xl p-3">
                            <p className="text-xs font-semibold text-amber-800 mb-2">Daftar Istilah:</p>
                            <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-700">
                              {currentPractice.options.map((option, idx) => (
                                <li key={`matching-term-${idx}`}>{stripAnswerMarker(option)}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {needsPracticeTextInput && (
                          <div className="mt-4">
                            <label className="block text-xs font-semibold tracking-wide text-amber-700 mb-2">
                              Isi jawaban
                            </label>
                            <input
                              type="text"
                              value={practiceTextAnswers[currentPractice.id] || ''}
                              onChange={(event) => handlePracticeTextAnswer(currentPractice.id, event.target.value)}
                              placeholder="Contoh: _ _ __"
                              className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
                            />
                          </div>
                        )}
                        {needsPracticeTextInput && practiceTextAnswers[currentPractice.id]?.trim() && (
                          <p className="mt-2 text-xs font-semibold text-amber-700">
                            Isian tersimpan: {practiceTextAnswers[currentPractice.id]}
                          </p>
                        )}
                        {currentPractice.points !== null && currentPractice.points !== undefined && (
                          <p className="mt-3 text-xs font-semibold text-amber-700">Bobot: {currentPractice.points} poin</p>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-gray-500">
                        Latihan belum tersedia untuk materi ini.
                      </div>
                    )}
                  </div>

                  <div className="mt-6 grid gap-3">
                    <Callout type="summary" title="Target Latihan">
                      Selesaikan semua latihan agar saat quiz kamu lebih cepat mengenali pola jawaban yang benar.
                    </Callout>
                  </div>
                </motion.section>
              )}

              {screen === 'quiz' && (
                <motion.section
                  key="quiz"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-[20px] border border-gray-200 bg-white p-6 md:p-10 shadow-sm"
                >
                  <div className="w-full h-36 rounded-2xl bg-gradient-to-r from-sky-100 via-cyan-50 to-white border border-sky-100 mb-6 p-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-sky-700">Tahap 3 dari 3</p>
                      <h2 className="text-[22px] font-bold text-gray-900 mt-1">{quiz.title}</h2>
                      <p className="text-sm text-gray-600 mt-1">Uji pemahaman kamu lewat soal pilihan ganda.</p>
                    </div>
                    <Sparkles className="text-sky-600" size={26} />
                  </div>

                  {quiz.questions.length > 0 && (
                    <div className="mb-5">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>Progres Quiz</span>
                        <span>{quizIndex + 1}/{quiz.questions.length}</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full transition-all"
                          style={{ width: `${((quizIndex + 1) / Math.max(quiz.questions.length, 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {currentQuestion ? (
                    <>
                      <QuizCard question={currentQuestion} answer={answers[currentQuestion.id]} onChange={handleQuizAnswer} />
                      <div className="mt-5 grid gap-3">
                        <Callout type="info" title="Tips Menjawab">
                          {currentQuestion.isOrdering || isQuizOrderingQuestion(currentQuestion)
                            ? 'Susun langkah dari atas ke bawah sesuai urutan yang benar. Tarik kartu untuk memindahkan posisi.'
                            : currentQuestion.isMatching || isQuizMatchingQuestion(currentQuestion)
                              ? 'Tarik setiap definisi ke istilah yang paling sesuai. Semua pasangan harus terisi sebelum lanjut.'
                              : currentQuestion.isEssay || isQuizEssayQuestion(currentQuestion)
                                ? 'Isi jawaban dengan kata atau kalimat yang paling sesuai. Perhatikan petunjuk blank (______) pada soal.'
                                : currentQuestion.isTrueFalse || isQuizTrueFalseQuestion(currentQuestion)
                                  ? 'Tentukan apakah pernyataan itu Benar atau Salah berdasarkan materi yang sudah dipelajari.'
                                  : 'Baca semua opsi hingga selesai. Hilangkan jawaban yang jelas salah, lalu pilih yang paling sesuai konteks materi.'}
                        </Callout>
                      </div>
                      <p className="text-xs text-gray-500 mt-4">Soal {quizIndex + 1} dari {quiz.questions.length}</p>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-gray-500">
                      Quiz belum tersedia dari API untuk modul ini.
                    </div>
                  )}
                </motion.section>
              )}

              {screen === 'material-complete' && (
                <motion.section
                  key="material-complete"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-[20px] border border-gray-200 bg-white p-6 md:p-10 shadow-sm"
                >
                  <div className="w-full rounded-2xl bg-gradient-to-r from-emerald-100 via-teal-50 to-white border border-emerald-100 mb-6 p-5">
                    <p className="text-sm font-semibold text-emerald-700">Materi Selesai</p>
                    <h2 className="text-[24px] font-bold text-gray-900 mt-1">Selamat, kamu sudah melalui seluruh pembelajaran materi</h2>
                    <p className="text-sm text-gray-600 mt-1">Selanjutnya kamu bisa masuk ke form latihan untuk menguji pemahamanmu.</p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 mb-5">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-xs text-emerald-700 font-semibold">Section</p>
                      <p className="text-2xl font-bold text-emerald-900">{materialSections.length}</p>
                      <p className="text-xs text-emerald-700">materi tuntas</p>
                    </div>
                    <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
                      <p className="text-xs text-sky-700 font-semibold">Estimasi</p>
                      <p className="text-2xl font-bold text-sky-900">{studyMinutes}m</p>
                      <p className="text-xs text-sky-700">waktu belajar</p>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-xs text-amber-700 font-semibold">Status</p>
                      <p className="text-lg font-bold text-amber-900">Siap Latihan</p>
                      <p className="text-xs text-amber-700">lanjut ke soal latihan</p>
                    </div>
                  </div>

                  <Callout type="info" title="Langkah Selanjutnya">
                    Klik tombol Masuk ke Latihan untuk mulai menjawab soal latihan satu per satu.
                  </Callout>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setMaterialIndex(Math.max(materialSections.length - 1, 0));
                        setScreen('materi');
                      }}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50"
                    >
                      Cek Materi Lagi
                    </button>
                    {practiceDone ? (
                      <div className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 font-semibold flex items-center justify-center gap-2">
                        <Lock size={16} />
                        Latihan sudah selesai
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setPracticeIndex(0);
                          setScreen('latihan');
                        }}
                        className="flex-1 px-4 py-3 rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800"
                      >
                        Masuk ke Latihan
                      </button>
                    )}
                  </div>
                </motion.section>
              )}

              {screen === 'checkpoint' && (
                <motion.section
                  key="checkpoint"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-[20px] border border-gray-200 bg-white p-6 md:p-10 shadow-sm"
                >
                  <div className="w-full rounded-2xl bg-gradient-to-r from-emerald-100 via-lime-50 to-white border border-emerald-100 mb-6 p-5">
                    <p className="text-sm font-semibold text-emerald-700">Pembelajaran Tuntas</p>
                    <h2 className="text-[24px] font-bold text-gray-900 mt-1">Selamat, kamu sudah menuntaskan materi dan latihan</h2>
                    <p className="text-sm text-gray-600 mt-1">Pilih lanjut ke quiz atau ulang belajar untuk memperdalam lagi.</p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 mb-5">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-xs text-emerald-700 font-semibold">Materi</p>
                      <p className="text-2xl font-bold text-emerald-900">{materialSections.length}</p>
                      <p className="text-xs text-emerald-700">section dipelajari</p>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-xs text-amber-700 font-semibold">Latihan Benar</p>
                      <p className="text-2xl font-bold text-amber-900">{checkpointPracticeSummary.score}/{checkpointPracticeSummary.total || practice.prompts.length}</p>
                      <p className="text-xs text-amber-700">akurasi {checkpointPracticeSummary.total > 0 ? `${checkpointPracticeSummary.percentage}%` : 'belum bisa dinilai'}</p>
                    </div>
                    <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
                      <p className="text-xs text-sky-700 font-semibold">Status</p>
                      <p className="text-lg font-bold text-sky-900">{checkpointPracticeSummary.total > 0 ? (checkpointPracticeSummary.passed ? 'Siap Quiz' : 'Perlu Review') : 'Siap Quiz'}</p>
                      <p className="text-xs text-sky-700">target minimal 80%</p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {checkpointPracticeSummary.total > 0 ? (
                      <Callout type={checkpointPracticeSummary.passed ? 'info' : 'warning'} title={checkpointPracticeSummary.passed ? 'Latihan Bagus!' : 'Latihan Belum Maksimal'}>
                        {checkpointPracticeSummary.passed
                          ? 'Skor latihan kamu sudah di atas 80. Kamu bisa langsung lanjut ke quiz.'
                          : 'Nilai latihan kamu belum 80. Disarankan ulang materi dulu sebelum lanjut quiz.'}
                      </Callout>
                    ) : (
                      <Callout type="summary" title="Info Penilaian Latihan">
                        Kunci jawaban latihan tidak tersedia dari API, jadi nilai latihan belum bisa dihitung otomatis.
                      </Callout>
                    )}
                    {exerciseSubmitError && (
                      <Callout type="warning" title="Sinkronisasi Latihan">
                        {exerciseSubmitError}
                      </Callout>
                    )}
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setScreen('materi');
                        setMaterialIndex(0);
                        setPracticeIndex(0);
                        setQuizIndex(0);
                        setQuizLocked(false);
                      }}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50"
                    >
                      Belajar Lagi
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowQuizEntryConfirm(true)}
                      disabled={isSubmittingExercises}
                      className="flex-1 px-4 py-3 rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 disabled:opacity-60"
                    >
                      {isSubmittingExercises ? 'Memproses Latihan...' : 'Lanjut ke Quiz'}
                    </button>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {showBottomNavigation && (
              <div className="hidden md:flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={navMeta.prevDisabled}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft size={18} /> {navMeta.prevLabel}
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={navMeta.nextDisabled}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 disabled:opacity-50"
                >
                  {navMeta.nextLabel} <ChevronRight size={18} />
                </button>
              </div>
            )}

            <div className="lg:hidden">{rightPanel}</div>
          </div>

          <div className="hidden lg:block lg:sticky lg:top-24">
            {rightPanel}
          </div>
        </div>
      </div>

      {showBottomNavigation && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 z-40">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={navMeta.prevDisabled}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold disabled:opacity-50"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={navMeta.nextDisabled}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-700 text-white font-semibold disabled:opacity-50"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {showQuizEntryConfirm && (
        <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Konfirmasi Masuk Quiz</h3>
            <p className="text-sm text-gray-600 mt-2">
              Setelah masuk quiz, kamu tidak bisa kembali ke materi maupun latihan. Yakin ingin lanjut?
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowQuizEntryConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              >
                Tidak
              </button>
              <button
                type="button"
                onClick={handleStartQuiz}
                className="px-4 py-2 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800"
              >
                Ya, masuk Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default StudentLearningFlow;
