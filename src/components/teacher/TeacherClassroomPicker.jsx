import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getClassrooms, createClassroom, getClassroomStudents, bulkEnrollStudents } from '../../services/classroomService';
import { generateModule, getModule, listModules, publishModule, deleteModule, updateModule, generateModuleImages } from '../../services/moduleService';
import { getApiErrorMessage } from '../../services/authService';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import ModuleGenerateForm from './ModuleGenerateForm';
import {
  buildGenerateModuleRequest,
  createDefaultGenerateDraft,
  normalizeGenerateDraft,
} from '../../utils/moduleGenerateDraft';
import { sanitizeModuleRecord } from '../../utils/sanitizeModuleContent';

const CARD_GRADIENTS = [
  'from-orange-500 to-orange-400',
  'from-teal-700 to-teal-500',
  'from-slate-700 to-blue-800',
  'from-green-600 to-emerald-500',
  'from-blue-600 to-indigo-700',
  'from-purple-600 to-pink-500',
  'from-rose-500 to-red-400',
  'from-amber-600 to-yellow-500',
  'from-cyan-600 to-teal-400',
];

const SUBJECT_OPTIONS = ['Bahasa Indonesia', 'Matematika', 'IPA', 'IPS', 'PPKn', 'Bahasa Inggris'];

const emptyModuleDraft = createDefaultGenerateDraft();
const MODULE_OVERRIDES_KEY = 'teacher_module_content_overrides';

const buildModuleEditDraft = (module) => {
  if (!module) {
    return { title: '', topic: '', sections: [], exercises: [], quizQuestions: [] };
  }

  const sections = (module.sections?.length ? module.sections : module.learningFlow?.material?.points || []).map((section, index) => {
    if (typeof section === 'string') {
      return { id: `section-${index}`, title: section, content: '' };
    }
    return {
      id: section.id || `section-${index}`,
      title: section.title || section.name || section.text || `Section ${index + 1}`,
      content: section.content || section.text || section.description || '',
      image_url: section.image_url || section.imageUrl || null,
      image_prompt: section.image_prompt || section.imagePrompt || null,
    };
  });

  const exerciseSource = module.exercises?.length
    ? module.exercises
    : module.learningFlow?.practice?.prompts || [];

  const exercises = exerciseSource.map((exercise, index) => {
    if (typeof exercise === 'string') {
      return { id: `exercise-${index}`, question_text: exercise, correct_answer: '', exercise_type: 'text' };
    }
    return {
      id: exercise.id || `exercise-${index}`,
      question_text: exercise.question_text || exercise.question || exercise.text || exercise.prompt || '',
      correct_answer: exercise.correct_answer || exercise.answer || '',
      exercise_type: exercise.exercise_type || exercise.type || 'text',
    };
  });

  const quizSource = module.learningFlow?.quiz?.questions || [];
  const quizQuestions = quizSource.map((question, index) => {
    if (typeof question === 'string') {
      return { id: `quiz-${index}`, text: question, optionsText: '', answer: 'A' };
    }
    const options = Array.isArray(question.options) ? question.options : [];
    return {
      id: question.id || `quiz-${index}`,
      text: question.text || question.question || '',
      optionsText: options.join('\n'),
      answer: question.answer || question.correct_answer || 'A',
    };
  });

  return {
    title: module.title || '',
    topic: module.prompt || module.topic || '',
    sections,
    exercises,
    quizQuestions,
  };
};

const applyModuleEditDraft = (module, draft) => {
  const sections = draft.sections.map((section, index) => {
    const source = (module.sections || [])[index];
    if (!source || typeof source === 'string') {
      return {
        id: section.id,
        title: section.title,
        content: section.content,
        image_url: section.image_url || null,
        image_prompt: section.image_prompt || null,
      };
    }
    return {
      ...source,
      id: section.id || source.id,
      title: section.title,
      content: section.content,
      image_url: section.image_url ?? source.image_url ?? source.imageUrl ?? null,
      image_prompt: section.image_prompt ?? source.image_prompt ?? source.imagePrompt ?? null,
    };
  });

  const exercises = draft.exercises.map((exercise, index) => {
    const source = (module.exercises || [])[index] || {};
    return {
      ...source,
      id: exercise.id || source.id,
      question_text: exercise.question_text,
      correct_answer: exercise.correct_answer,
      exercise_type: exercise.exercise_type || source.exercise_type,
    };
  });

  const quizQuestions = draft.quizQuestions.map((question, index) => ({
    id: question.id || index + 1,
    text: question.text,
    question: question.text,
    options: (question.optionsText || '').split('\n').map((item) => item.trim()).filter(Boolean),
    answer: question.answer,
    correct_answer: question.answer,
  }));

  return normalizeModule({
    ...module,
    title: draft.title,
    topic: draft.topic,
    prompt: draft.topic,
    sections,
    exercises,
    learning_flow: {
      ...(module.learning_flow || module.learningFlow || {}),
      quiz: {
        ...((module.learning_flow || module.learningFlow || {})?.quiz || {}),
        questions: quizQuestions,
      },
    },
  });
};

const loadModuleOverride = (moduleId) => {
  try {
    const all = JSON.parse(localStorage.getItem(MODULE_OVERRIDES_KEY) || '{}');
    return all[moduleId] || null;
  } catch {
    return null;
  }
};

const saveModuleOverride = (moduleId, draft) => {
  try {
    const all = JSON.parse(localStorage.getItem(MODULE_OVERRIDES_KEY) || '{}');
    all[moduleId] = {
      sections: draft.sections,
      exercises: draft.exercises,
      quizQuestions: draft.quizQuestions,
    };
    localStorage.setItem(MODULE_OVERRIDES_KEY, JSON.stringify(all));
  } catch {
    // ignore storage errors
  }
};

const clearModuleOverride = (moduleId) => {
  try {
    const all = JSON.parse(localStorage.getItem(MODULE_OVERRIDES_KEY) || '{}');
    delete all[moduleId];
    localStorage.setItem(MODULE_OVERRIDES_KEY, JSON.stringify(all));
  } catch {
    // ignore storage errors
  }
};

const withModuleOverride = (module) => {
  const normalized = normalizeModule(module);
  const override = loadModuleOverride(normalized.id);
  if (!override) return normalized;
  return applyModuleEditDraft(normalized, {
    ...buildModuleEditDraft(normalized),
    ...override,
    title: normalized.title,
    topic: normalized.prompt || normalized.topic,
  });
};

const normalizeModule = (module) => {
  const classroomId = module?.classroom_id || module?.classroomId || module?.classroom?.id || module?.classroom?.classroom_id || null;
  const topic = module?.topic || module?.prompt || module?.title || '';
  const rawSections = module?.sections || module?.learning_flow?.sections || module?.learningFlow?.sections || [];
  const exercises = module?.exercises || module?.learning_flow?.exercises || module?.learningFlow?.exercises || [];

  const sections = rawSections.map((section, index) => {
    if (typeof section === 'string') {
      return {
        id: `section-${index + 1}`,
        title: section,
        content: section,
        image_url: null,
        image_prompt: null,
      };
    }
    return {
      ...section,
      id: section?.id || `section-${index + 1}`,
      title: section?.title || section?.name || `Section ${index + 1}`,
      content: section?.content || section?.text || section?.description || '',
      image_url: section?.image_url || section?.imageUrl || null,
      image_prompt: section?.image_prompt || section?.imagePrompt || null,
    };
  });

  const sourceFlow = module?.learningFlow || module?.learning_flow || {};

  return sanitizeModuleRecord({
    ...module,
    id: module?.id,
    title: module?.title || topic || 'Modul AI',
    prompt: module?.prompt || topic,
    topic: module?.topic || topic,
    subject: module?.subject || module?.classroom?.name || '',
    classroomId,
    status: module?.status || 'generated',
    sections,
    exercises,
    quiz_id: module?.quiz_id || module?.quizId || null,
    publishedAt: module?.published_at || module?.publishedAt || null,
    learningFlow: {
      ...sourceFlow,
      material: {
        title: sourceFlow?.material?.title || `${module?.title || topic || 'Modul AI'} - Materi`,
        summary: sourceFlow?.material?.summary || module?.description || module?.summary || sections[0]?.content || topic || '',
        points: sections.map((section) => section.title).filter(Boolean),
        sections,
      },
      practice: {
        title: sourceFlow?.practice?.title || `${module?.title || topic || 'Modul AI'} - Latihan`,
        prompts: exercises.map((exercise) => {
          if (typeof exercise === 'string') return exercise;
          return {
            id: exercise?.id,
            exercise_type: exercise?.exercise_type || exercise?.type,
            question_text: exercise?.question_text || exercise?.question || exercise?.text || exercise?.prompt,
            options: exercise?.options,
            correct_answer: exercise?.correct_answer || exercise?.answer,
            explanation: exercise?.explanation,
            points: exercise?.points,
          };
        }),
      },
      quiz: {
        title: sourceFlow?.quiz?.title || `${module?.title || topic || 'Modul AI'} - Quiz`,
        questions: exercises.map((exercise, index) => ({
          id: exercise.id || index + 1,
          text: exercise.question_text || exercise.question || exercise.text || exercise.prompt || `Soal ${index + 1}`,
          options: exercise.options || ['A', 'B', 'C', 'D'],
          answer: exercise.correct_answer || exercise.answer || 'A',
          correct_answer: exercise.correct_answer || exercise.answer || 'A',
        })),
      },
    },
  });
};

const TeacherClassroomPicker = ({ onSelectClassroom, onClassroomsLoaded, selectedClassroom, createClassRequest }) => {
  const [classrooms, setClassrooms] = useState([]);
  const [activeClassroom, setActiveClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [moduleDraftsByClassroom, setModuleDraftsByClassroom] = useState({});
  const [modulesByClassroom, setModulesByClassroom] = useState({});
  const [moduleListLoading, setModuleListLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleError, setModuleError] = useState(null);
  const [moduleEditDraft, setModuleEditDraft] = useState({
    title: '', topic: '', sections: [], exercises: [], quizQuestions: [],
  });
  const [savingModuleEdit, setSavingModuleEdit] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [deletingModuleId, setDeletingModuleId] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState(null);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const previousCreateRequest = useRef(createClassRequest);

  const loadClassrooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClassrooms();
      const list = Array.isArray(data) ? data : [];
      setClassrooms(list);
      onClassroomsLoaded?.(list);
    } catch {
      setError('Gagal memuat kelas. Periksa koneksi jaringan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClassrooms();
  }, []);

  useEffect(() => {
    if (selectedClassroom) {
      setActiveClassroom(selectedClassroom);
    }
  }, [selectedClassroom]);

  const loadModulesForClassroom = async (classroomId) => {
    if (!classroomId) {
      setModulesByClassroom({});
      setSelectedModule(null);
      return;
    }

    try {
      setModuleListLoading(true);
      const modules = await listModules(50, 0);
      const classroomModules = modules
        .map((module) => withModuleOverride(module))
        .filter((module) => String(module.classroomId) === String(classroomId));

      setModulesByClassroom((prev) => ({
        ...prev,
        [classroomId]: classroomModules,
      }));
      setSelectedModule((current) => {
        if (!current) return classroomModules[0] || null;
        return classroomModules.find((module) => module.id === current.id) || classroomModules[0] || null;
      });
    } catch {
      setModuleError('Gagal memuat daftar modul dari server.');
    } finally {
      setModuleListLoading(false);
    }
  };

  useEffect(() => {
    if (previousCreateRequest.current !== createClassRequest) {
      setShowCreate(true);
      setCreateError(null);
      previousCreateRequest.current = createClassRequest;
    }
  }, [createClassRequest]);

  useEffect(() => {
    if (activeClassroom?.id) {
      loadModulesForClassroom(activeClassroom.id);
      loadStudentsForClassroom(activeClassroom.id);
    } else {
      setSelectedModule(null);
      setEnrolledStudents([]);
      setAvailableStudents([]);
      setSelectedStudentIds([]);
    }
  }, [activeClassroom?.id]);

  useEffect(() => {
    if (selectedModule) {
      setModuleEditDraft(buildModuleEditDraft(selectedModule));
    }
  }, [selectedModule?.id]);

  const updateSectionDraft = (index, field, value) => {
    setModuleEditDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((section, idx) => (
        idx === index ? { ...section, [field]: value } : section
      )),
    }));
  };

  const updateExerciseDraft = (index, field, value) => {
    setModuleEditDraft((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise, idx) => (
        idx === index ? { ...exercise, [field]: value } : exercise
      )),
    }));
  };

  const updateQuizDraft = (index, field, value) => {
    setModuleEditDraft((prev) => ({
      ...prev,
      quizQuestions: prev.quizQuestions.map((question, idx) => (
        idx === index ? { ...question, [field]: value } : question
      )),
    }));
  };

  const persistModuleEdit = (module) => {
    setSelectedModule(module);
    if (activeClassroom?.id) {
      setModulesByClassroom((prev) => ({
        ...prev,
        [activeClassroom.id]: (prev[activeClassroom.id] || []).map((item) => (
          item.id === module.id ? module : item
        )),
      }));
    }
  };

  const loadStudentsForClassroom = async (classroomId) => {
    if (!classroomId) return;

    try {
      setStudentLoading(true);
      setStudentError(null);
      const [enrolled, allStudents] = await Promise.all([
        getClassroomStudents({ classroomId }),
        getClassroomStudents({ limit: 200 }),
      ]);
      const enrolledList = Array.isArray(enrolled) ? enrolled : [];
      const allList = Array.isArray(allStudents) ? allStudents : [];
      const enrolledIds = new Set(enrolledList.map((student) => student.id));

      setEnrolledStudents(enrolledList);
      setAvailableStudents(allList.filter((student) => !enrolledIds.has(student.id)));
      setSelectedStudentIds([]);
    } catch {
      setStudentError('Gagal memuat daftar siswa.');
    } finally {
      setStudentLoading(false);
    }
  };

  const activeModules = useMemo(
    () => modulesByClassroom[activeClassroom?.id] || [],
    [activeClassroom, modulesByClassroom]
  );

  const activeModuleDraft = useMemo(() => {
    if (!activeClassroom) return normalizeGenerateDraft(emptyModuleDraft);
    return normalizeGenerateDraft(moduleDraftsByClassroom[activeClassroom.id] || emptyModuleDraft);
  }, [activeClassroom, moduleDraftsByClassroom]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      setCreating(true);
      setCreateError(null);
      const classroom = await createClassroom(newName.trim());
      const updated = [classroom, ...classrooms];
      setClassrooms(updated);
      onClassroomsLoaded?.(updated);
      setActiveClassroom(classroom);
      setNewName('');
      setShowCreate(false);
    } catch {
      setCreateError('Gagal membuat kelas. Coba lagi.');
    } finally {
      setCreating(false);
    }
  };

  const hasSectionImages = (module) => (module?.sections || []).some(
    (section) => section?.image_url || section?.imageUrl,
  );

  const refreshModuleState = (module, classroomId) => {
    setModulesByClassroom((prev) => ({
      ...prev,
      [classroomId]: [module, ...(prev[classroomId] || []).filter((item) => item.id !== module.id)],
    }));
    setSelectedModule(module);
    setModuleEditDraft(buildModuleEditDraft(module));
  };

  const ensureModuleImages = async (module, classroomId) => {
    if (!module?.id || hasSectionImages(module)) return module;

    try {
      setGeneratingImages(true);
      await generateModuleImages(module.id);
      const refreshed = withModuleOverride(await getModule(module.id));
      refreshModuleState(refreshed, classroomId);
      return refreshed;
    } catch {
      return module;
    } finally {
      setGeneratingImages(false);
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();

    const classroomId = activeClassroom?.id;
    if (!classroomId) {
      setModuleError('Kelas aktif belum dipilih.');
      return;
    }

    const request = buildGenerateModuleRequest(activeModuleDraft, classroomId);
    if (!request.topic) {
      setModuleError('Prompt AI harus diisi.');
      return;
    }

    setModuleError(null);
    setModuleListLoading(true);

    try {
      const generatedModule = await generateModule({
        classroomId: request.classroomId,
        topic: request.topic,
        numSections: request.numSections,
        numExercises: request.numExercises,
      });
      let normalized = sanitizeModuleRecord(
        normalizeModule(generatedModule),
        request.displayTopic,
      );

      try {
        const patched = await updateModule(normalized.id, {
          topic: request.displayTopic,
          title: normalized.title,
          sections: normalized.sections,
        });
        normalized = sanitizeModuleRecord(normalizeModule(patched), request.displayTopic);
      } catch {
        // Keep sanitized local copy even if server patch fails.
      }

      refreshModuleState(normalized, classroomId);
      setModuleDraftsByClassroom((prev) => ({
        ...prev,
        [classroomId]: createDefaultGenerateDraft(),
      }));

      if (!hasSectionImages(normalized)) {
        await ensureModuleImages(normalized, classroomId);
      }
    } catch (err) {
      setModuleError(getApiErrorMessage(err, 'Gagal generate modul dari API.'));
    } finally {
      setModuleListLoading(false);
    }
  };

  const handleGenerateModuleImages = async () => {
    if (!selectedModule?.id || !activeClassroom?.id) return;

    try {
      setModuleError(null);
      await ensureModuleImages(selectedModule, activeClassroom.id);
    } catch (err) {
      setModuleError(getApiErrorMessage(err, 'Gagal menghasilkan gambar section.'));
    }
  };

  const handleOpenModule = async (moduleId) => {
    if (!moduleId) return;

    try {
      setModuleError(null);
      const module = withModuleOverride(await getModule(moduleId));
      setSelectedModule(module);
      if (module.classroomId) {
        setModulesByClassroom((prev) => ({
          ...prev,
          [module.classroomId]: [module, ...(prev[module.classroomId] || []).filter((item) => item.id !== module.id)],
        }));
      }
    } catch {
      setModuleError('Gagal memuat detail modul.');
    }
  };

  const handlePublishModule = async (moduleId) => {
    if (!moduleId) return;

    try {
      setModuleError(null);
      await publishModule(moduleId);
      if (activeClassroom?.id) {
        await loadModulesForClassroom(activeClassroom.id);
      }
      if (selectedModule?.id === moduleId) {
        const refreshed = withModuleOverride(await getModule(moduleId));
        setSelectedModule(refreshed);
        setModuleEditDraft(buildModuleEditDraft(refreshed));
      }
    } catch {
      setModuleError('Gagal publish modul.');
    }
  };

  const handleDeleteModule = async (module) => {
    if (!module?.id || module.status === 'published') return;

    const confirmed = window.confirm(
      `Hapus modul "${module.title || 'tanpa judul'}"?\n\nModul yang belum dipublish akan dihapus permanen dari server.`,
    );
    if (!confirmed) return;

    try {
      setDeletingModuleId(module.id);
      setModuleError(null);
      await deleteModule(module.id);
      clearModuleOverride(module.id);

      if (activeClassroom?.id) {
        await loadModulesForClassroom(activeClassroom.id);
      } else {
        setModulesByClassroom((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((classroomId) => {
            next[classroomId] = (next[classroomId] || []).filter((item) => item.id !== module.id);
          });
          return next;
        });
        if (selectedModule?.id === module.id) {
          setSelectedModule(null);
          setModuleEditDraft({ title: '', topic: '', sections: [], exercises: [], quizQuestions: [] });
        }
      }
    } catch (err) {
      setModuleError(getApiErrorMessage(err, 'Gagal menghapus modul.'));
    } finally {
      setDeletingModuleId(null);
    }
  };

  const handleUpdateModule = async (event) => {
    event.preventDefault();
    if (!selectedModule?.id) return;

    try {
      setSavingModuleEdit(true);
      setModuleError(null);

      const draft = {
        ...moduleEditDraft,
        title: moduleEditDraft.title.trim(),
        topic: moduleEditDraft.topic.trim(),
      };

      await updateModule(selectedModule.id, {
        title: draft.title,
        topic: draft.topic,
        sections: draft.sections,
        exercises: draft.exercises,
      });

      saveModuleOverride(selectedModule.id, draft);
      const merged = applyModuleEditDraft(selectedModule, draft);
      persistModuleEdit(merged);
      setModuleEditDraft(buildModuleEditDraft(merged));
    } catch (err) {
      setModuleError(getApiErrorMessage(err, 'Gagal menyimpan perubahan modul.'));
    } finally {
      setSavingModuleEdit(false);
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds((prev) => (
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    ));
  };

  const handleBulkEnroll = async () => {
    if (!activeClassroom?.id || selectedStudentIds.length === 0) return;

    try {
      setEnrollLoading(true);
      setStudentError(null);
      await bulkEnrollStudents(activeClassroom.id, selectedStudentIds);
      await loadStudentsForClassroom(activeClassroom.id);
    } catch (err) {
      setStudentError(getApiErrorMessage(err, 'Gagal enroll siswa.'));
    } finally {
      setEnrollLoading(false);
    }
  };

  const updateActiveDraft = (updates) => {
    if (!activeClassroom) {
      return;
    }

    setModuleDraftsByClassroom((prev) => ({
      ...prev,
      [activeClassroom.id]: normalizeGenerateDraft({
        ...(prev[activeClassroom.id] || createDefaultGenerateDraft()),
        ...updates,
      }),
    }));
  };

  return (
    <main className="w-full min-h-[calc(100dvh-4rem)] bg-gray-50">
      <div className="p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Kelas Saya</h2>
          <p className="text-sm text-gray-500 mt-1">Klik beranda untuk melihat kartu kelas, lalu buka detail kelas untuk membuat modul AI.</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{error}</span>
            <button onClick={loadClassrooms} className="ml-auto text-red-500 hover:underline text-xs font-medium">
              Coba lagi
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <span className="material-symbols-outlined animate-spin text-4xl text-gray-400">progress_activity</span>
          </div>
        ) : !activeClassroom ? (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {classrooms.map((cls, idx) => (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => setActiveClassroom(cls)}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-left"
                >
                  <div className={`relative h-28 bg-gradient-to-br ${CARD_GRADIENTS[idx % CARD_GRADIENTS.length]} p-4 overflow-hidden`}>
                    <p className="text-white font-bold text-lg leading-tight line-clamp-2 pr-12">{cls.name}</p>
                    <p className="text-white/75 text-xs mt-1">Klik untuk membuka detail kelas</p>
                    <div className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/30">
                      <span className="material-symbols-outlined text-white text-xl">school</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{cls.schedule || 'Jadwal belum diatur'}</span>
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">Per Kelas</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveClassroom(cls);
                          onSelectClassroom?.(cls);
                        }}
                        className="flex-1 px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
                      >
                        Buka Detail
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveClassroom(cls);
                          onSelectClassroom?.(cls);
                        }}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Masuk
                      </button>
                    </div>
                  </div>
                </button>
              ))}

              {classrooms.length === 0 && (
                <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-dashed border-gray-200 p-6 text-center text-gray-400 bg-white">
                  <p className="text-sm">Belum ada kelas.</p>
                  <p className="text-xs mt-1">Gunakan tombol Buat Kelas di topbar.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Detail Kelas</p>
                  <h3 className="text-xl font-bold text-gray-800 mt-1">{activeClassroom.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">Satu form aktif untuk kelas ini. Saat pindah kelas lewat sidebar, isinya tetap tersimpan per kelas.</p>
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 mb-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Siswa di Kelas</p>
                    <p className="text-xs text-gray-500 mt-1">Kelola enrollment siswa untuk kelas ini.</p>
                  </div>
                  <span className="text-xs text-gray-400">{enrolledStudents.length} terdaftar</span>
                </div>

                {studentError && <p className="text-sm text-red-600 mb-3">{studentError}</p>}

                {studentLoading ? (
                  <p className="text-sm text-gray-400">Memuat daftar siswa...</p>
                ) : (
                  <>
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1 mb-4">
                      {enrolledStudents.length > 0 ? enrolledStudents.map((student) => (
                        <div key={student.id} className="flex items-center justify-between rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm">
                          <div>
                            <p className="font-medium text-gray-800">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.email}</p>
                          </div>
                          <span className="text-xs text-green-600 font-semibold">Terdaftar</span>
                        </div>
                      )) : (
                        <p className="text-xs text-gray-400">Belum ada siswa terdaftar di kelas ini.</p>
                      )}
                    </div>

                    {availableStudents.length > 0 && (
                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Tambah Siswa</p>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {availableStudents.map((student) => (
                            <label key={student.id} className="flex items-center gap-3 rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50">
                              <input
                                type="checkbox"
                                checked={selectedStudentIds.includes(student.id)}
                                onChange={() => toggleStudentSelection(student.id)}
                                className="rounded border-gray-300 text-primary focus:ring-primary/30"
                              />
                              <div>
                                <p className="font-medium text-gray-800">{student.name}</p>
                                <p className="text-xs text-gray-500">{student.email}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={handleBulkEnroll}
                          disabled={enrollLoading || selectedStudentIds.length === 0}
                          className="mt-3 w-full px-4 py-2.5 rounded-lg border border-primary text-primary text-sm font-semibold hover:bg-primary/5 disabled:opacity-50 transition-colors"
                        >
                          {enrollLoading ? 'Mendaftarkan...' : `Enroll ${selectedStudentIds.length || 0} Siswa`}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 mb-5">
                <p className="text-sm font-semibold text-gray-700">Buat Modul Baru</p>
                <p className="text-xs text-gray-500 mt-1">
                  Kustomisasi section, latihan, dan quiz sebelum AI menghasilkan modul.
                </p>

                <div className="mt-4">
                  <ModuleGenerateForm
                    draft={activeModuleDraft}
                    onChange={updateActiveDraft}
                    onSubmit={handleCreateModule}
                    loading={moduleListLoading || generatingImages}
                    error={moduleError}
                  />
                </div>
              </div>

              {selectedModule && (
                <div className="rounded-xl border border-gray-200 p-4 bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Detail Modul</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${selectedModule.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                      {selectedModule.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <form className="mt-3 space-y-4" onSubmit={handleUpdateModule}>
                    <label className="block">
                      <span className="text-xs font-medium text-gray-600">Judul Modul</span>
                      <input
                        type="text"
                        value={moduleEditDraft.title}
                        onChange={(e) => setModuleEditDraft((prev) => ({ ...prev, title: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-gray-600">Topik / Prompt</span>
                      <textarea
                        value={moduleEditDraft.topic}
                        onChange={(e) => setModuleEditDraft((prev) => ({ ...prev, topic: e.target.value }))}
                        rows={2}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-primary/20"
                      />
                    </label>

                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                      <p className="text-gray-400">Section</p>
                      <p className="font-semibold text-gray-800">{selectedModule.sections?.length || 0}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                      <p className="text-gray-400">Exercise</p>
                      <p className="font-semibold text-gray-800">{selectedModule.exercises?.length || 0}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                      <p className="text-gray-400">Quiz</p>
                      <p className="font-semibold text-gray-800">{moduleEditDraft.quizQuestions?.length || 0}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Isi Section</p>
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {moduleEditDraft.sections.length > 0 ? moduleEditDraft.sections.map((section, index) => (
                          <div key={`${selectedModule.id}-section-edit-${section.id || index}`} className="rounded-lg bg-white border border-gray-200 p-3 space-y-2">
                            <label className="block">
                              <span className="text-[11px] font-medium text-gray-500">Judul Section {index + 1}</span>
                              <input
                                type="text"
                                value={section.title}
                                onChange={(e) => updateSectionDraft(index, 'title', e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                              />
                            </label>
                            <label className="block">
                              <span className="text-[11px] font-medium text-gray-500">Konten</span>
                              <textarea
                                value={section.content}
                                onChange={(e) => updateSectionDraft(index, 'content', e.target.value)}
                                rows={3}
                                className="mt-1 w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-primary/20"
                              />
                            </label>
                            {resolveMediaUrl(section.image_url) ? (
                              <div className="rounded-lg border border-gray-200 overflow-hidden">
                                <img
                                  src={resolveMediaUrl(section.image_url)}
                                  alt={section.title}
                                  className="w-full max-h-36 object-cover"
                                />
                                {section.image_prompt && (
                                  <p className="px-2 py-1.5 text-[11px] text-gray-500 bg-gray-50">{section.image_prompt}</p>
                                )}
                              </div>
                            ) : section.image_prompt ? (
                              <p className="text-[11px] text-gray-500 italic">Prompt gambar: {section.image_prompt}</p>
                            ) : null}
                          </div>
                        )) : (
                          <p className="text-xs text-gray-400">Belum ada section yang dikirim dari API.</p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Isi Exercise</p>
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {moduleEditDraft.exercises.length > 0 ? moduleEditDraft.exercises.map((exercise, index) => (
                          <div key={`${selectedModule.id}-exercise-edit-${exercise.id || index}`} className="rounded-lg bg-white border border-gray-200 p-3 space-y-2">
                            <label className="block">
                              <span className="text-[11px] font-medium text-gray-500">Soal Latihan {index + 1}</span>
                              <textarea
                                value={exercise.question_text}
                                onChange={(e) => updateExerciseDraft(index, 'question_text', e.target.value)}
                                rows={2}
                                className="mt-1 w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-primary/20"
                              />
                            </label>
                            <label className="block">
                              <span className="text-[11px] font-medium text-gray-500">Jawaban Benar</span>
                              <input
                                type="text"
                                value={exercise.correct_answer}
                                onChange={(e) => updateExerciseDraft(index, 'correct_answer', e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                              />
                            </label>
                          </div>
                        )) : (
                          <p className="text-xs text-gray-400">Belum ada exercise yang dikirim dari API.</p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Isi Quiz</p>
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {moduleEditDraft.quizQuestions.length > 0 ? moduleEditDraft.quizQuestions.map((question, index) => (
                          <div key={`${selectedModule.id}-quiz-edit-${question.id || index}`} className="rounded-lg bg-white border border-gray-200 p-3 space-y-2">
                            <label className="block">
                              <span className="text-[11px] font-medium text-gray-500">Pertanyaan Quiz {index + 1}</span>
                              <textarea
                                value={question.text}
                                onChange={(e) => updateQuizDraft(index, 'text', e.target.value)}
                                rows={2}
                                className="mt-1 w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-primary/20"
                              />
                            </label>
                            <label className="block">
                              <span className="text-[11px] font-medium text-gray-500">Opsi (satu baris per opsi)</span>
                              <textarea
                                value={question.optionsText}
                                onChange={(e) => updateQuizDraft(index, 'optionsText', e.target.value)}
                                rows={3}
                                placeholder={'Opsi A\nOpsi B\nOpsi C\nOpsi D'}
                                className="mt-1 w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-primary/20"
                              />
                            </label>
                            <label className="block">
                              <span className="text-[11px] font-medium text-gray-500">Kunci Jawaban</span>
                              <input
                                type="text"
                                value={question.answer}
                                onChange={(e) => updateQuizDraft(index, 'answer', e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                              />
                            </label>
                          </div>
                        )) : (
                          <p className="text-xs text-gray-400">Belum ada soal quiz. Quiz mengikuti exercise jika kosong.</p>
                        )}
                      </div>
                    </div>
                  </div>

                    <button
                      type="submit"
                      disabled={savingModuleEdit}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {savingModuleEdit ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                    </button>
                  </form>

                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    {selectedModule.status !== 'published' && (
                      <button
                        type="button"
                        onClick={() => handlePublishModule(selectedModule.id)}
                        className="px-3 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
                      >
                        Publish Modul
                      </button>
                    )}
                    {selectedModule.status !== 'published' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteModule(selectedModule)}
                        disabled={deletingModuleId === selectedModule.id}
                        className="px-3 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        {deletingModuleId === selectedModule.id ? 'Menghapus...' : 'Hapus Draft'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleGenerateModuleImages}
                      disabled={generatingImages}
                      className="px-3 py-2 rounded-lg border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-50 disabled:opacity-50 transition-colors"
                    >
                      {generatingImages ? 'Menghasilkan gambar...' : 'Generate Gambar Section'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenModule(selectedModule.id)}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Refresh Detail
                    </button>
                  </div>
                </div>
              )}
            </div>

            <aside className="lg:sticky lg:top-20">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Daftar Modul</h4>
                  <span className="text-xs text-gray-400">{activeModules.length} modul</span>
                </div>
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                  {moduleListLoading ? (
                    <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-gray-400">
                      <span className="material-symbols-outlined animate-spin text-2xl block mb-2">progress_activity</span>
                      <p className="text-sm">Memuat modul...</p>
                    </div>
                  ) : activeModules.length > 0 ? activeModules.map((module) => (
                    <div key={module.id} className={`rounded-xl border p-4 bg-white ${selectedModule?.id === module.id ? 'border-primary ring-2 ring-primary/10' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h5 className="font-semibold text-gray-800 mt-1">{module.title}</h5>
                          <p className="text-xs text-gray-400 mt-1">Prompt AI: {module.prompt}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${module.type === 'materi' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                          {module.type === 'materi' ? 'Materi' : 'Kuis'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Isi pembelajaran: materi → latihan → quiz</p>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenModule(module.id)}
                          className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
                        >
                          Detail
                        </button>
                        {module.status !== 'published' && (
                          <button
                            type="button"
                            onClick={() => handlePublishModule(module.id)}
                            className="px-3 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
                          >
                            Publish
                          </button>
                        )}
                        {module.status !== 'published' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteModule(module)}
                            disabled={deletingModuleId === module.id}
                            className="px-3 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors"
                          >
                            {deletingModuleId === module.id ? 'Menghapus...' : 'Hapus'}
                          </button>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-gray-400">
                      <p className="text-sm">Belum ada modul.</p>
                      <p className="text-xs mt-1">Buka kelas lalu buat modul dari prompt AI.</p>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-800">Buat Kelas Baru</h3>
              <button
                onClick={() => { setShowCreate(false); setNewName(''); setCreateError(null); }}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {createError && <p className="mb-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{createError}</p>}

            <form onSubmit={handleCreate}>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Kelas</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Kelas 10 IPA 1"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  autoFocus
                  maxLength={100}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setNewName(''); setCreateError(null); }}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  className="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {creating && <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>}
                  {creating ? 'Membuat...' : 'Buat Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default TeacherClassroomPicker;
