import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import MainContent from './components/MainContent';
import FruitModal from './components/FruitModal';
import SubjectDetail from './components/SubjectDetail';
import TreeMap from './components/TreeMap';
import TeacherSidebar from './components/teacher/TeacherSidebar';
import TeacherLogin from './components/teacher/TeacherLogin';
import StudentLogin from './components/student/StudentLogin';
import StudentTaskSummary from './components/student/StudentTaskSummary';
import TeacherPage from './pages/TeacherPage';
import StudentPage from './pages/StudentPage';
import { loginTeacher, loginStudent, getCurrentUser, logoutTeacher, logoutStudent, getAuthRole } from './services/authService';
import { getOrCreateClassroom, generateQuizDraft, publishQuiz, regenerateQuestion, deleteQuestion } from './services/quizService';
import { getClassrooms } from './services/classroomService';
import {
  getStudentModules,
  getStudentModuleDetail,
  completeStudentModuleContent,
  submitStudentModuleExercises,
} from './services/studentService';
import StudentBottomNav from './components/student/StudentBottomNav';
import { saveLastOpenedModule } from './utils/studentDashboardUtils';
import { sanitizeModuleRecord, stripTeacherInstructions } from './utils/sanitizeModuleContent';
import { normalizeExerciseForPractice, cleanOptionsForDisplay, stripAnswerMarker, isQuizEssayQuestion, isQuizTrueFalseQuestion, isQuizMatchingQuestion, isQuizOrderingQuestion, TRUE_FALSE_OPTIONS } from './utils/exerciseNormalize';

function App() {
  const [role, setRole] = useState('student');
  const [activeTab, setActiveTab] = useState('beranda');
  const [coins, setCoins] = useState(1240);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [playActive, setPlayActive] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Teacher flow
  const [teacherStep, setTeacherStep] = useState('login');
  const [teacherCriteria, setTeacherCriteria] = useState(null);
  const [publishedAssignment, setPublishedAssignment] = useState(null);
  const [draftQuestions, setDraftQuestions] = useState([]);
  const [draftQuiz, setDraftQuiz] = useState(null);
  const [backendError, setBackendError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [teacherAuth, setTeacherAuth] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [teacherCreateClassRequest, setTeacherCreateClassRequest] = useState(0);

  // Student flow
  const [studentStep, setStudentStep] = useState('login');
  const [studentAuth, setStudentAuth] = useState(null);
  const [studentProfile, setStudentProfile] = useState({ name: 'Petualang Cilik' });
  const [selectedSummaryTask, setSelectedSummaryTask] = useState(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [taskStartedAt, setTaskStartedAt] = useState(null);

  // Student task flow (from flowchart)
  const [studentTaskFlow, setStudentTaskFlow] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [studentTasks, setStudentTasks] = useState([]);
  const [taskBadge, setTaskBadge] = useState(0);
  const [gradingResult, setGradingResult] = useState(null);

  const GLOBAL_TASKS_KEY = 'global_published_tasks';
  const GLOBAL_LEARNING_KEY = 'global_learning_packages';
  const studentProgressKey = (email) => `student_progress_${email}`;

  const parseOptions = (options) => {
    if (Array.isArray(options)) {
      return options;
    }
    if (typeof options === 'string') {
      try {
        return JSON.parse(options);
      } catch {
        return options.split(',').map((item) => item.trim());
      }
    }

    return [];
  };

  const deriveAnswerLetter = (options = [], correctAnswer = null) => {
    if (!correctAnswer) {
      return 'A';
    }

    if (typeof correctAnswer === 'string' && /^[A-Z]$/.test(correctAnswer.trim())) {
      return correctAnswer.trim();
    }

    const normalizedCorrectAnswer = String(correctAnswer).trim().toLowerCase();
    const optionIndex = (options || []).findIndex((option) => String(option).trim().toLowerCase() === normalizedCorrectAnswer);

    if (optionIndex >= 0) {
      return String.fromCharCode(65 + optionIndex);
    }

    return 'A';
  };

  const normalizeQuestions = (questions = []) =>
    (questions || []).map((question, index) => {
      const options = cleanOptionsForDisplay(parseOptions(question.options));
      const text = question.question_text || question.text || `Soal ${index + 1}`;
      const normalized = {
        id: question.id || index + 1,
        text,
        question_text: text,
        options,
        type: question.question_type || question.type || question.exercise_type || null,
        question_type: question.question_type || question.type || question.exercise_type || null,
        correctAnswerText: question.correct_answer || question.answer || '',
        answer: deriveAnswerLetter(options, question.correct_answer || question.answer),
      };
      const isTrueFalse = isQuizTrueFalseQuestion(normalized);
      const isEssay = isQuizEssayQuestion(normalized);
      return {
        ...normalized,
        isTrueFalse,
        isEssay,
        options: isTrueFalse ? TRUE_FALSE_OPTIONS : options,
        answer: isTrueFalse
          ? deriveAnswerLetter(TRUE_FALSE_OPTIONS, question.correct_answer || question.answer)
          : normalized.answer,
      };
    });

  const normalizeStudentModuleTask = (module) => {
    const asArray = (value) => {
      if (Array.isArray(value)) return value;
      if (value === null || value === undefined) return [];
      if (typeof value === 'string') return value ? [value] : [];
      return [value];
    };

    const moduleId = module?.id || module?.module_id || module?.uuid || `${Date.now()}`;
    const topic = stripTeacherInstructions(module?.topic || module?.prompt || module?.title || '') || 'Modul AI';
    const sourceFlow = module?.learningFlow || module?.learning_flow || {};
    const sourceMaterial = sourceFlow?.material || {};
    const sourcePractice = sourceFlow?.practice || {};
    const sourceQuiz = sourceFlow?.quiz || {};

    const sections = asArray(module?.sections || sourceFlow?.sections || sourceMaterial?.sections || sourceMaterial?.points);
    const sectionItems = sections.map((section, index) => {
      if (typeof section === 'string') {
        return {
          id: `${moduleId}-section-${index + 1}`,
          order: index + 1,
          title: stripTeacherInstructions(section) || `Bagian ${index + 1}`,
          content: stripTeacherInstructions(section),
          imageUrl: null,
          imagePrompt: null,
          createdAt: null,
        };
      }

      return {
        id: section?.id || `${moduleId}-section-${index + 1}`,
        order: section?.section_order || index + 1,
        title: stripTeacherInstructions(section?.title || section?.name || '') || `Bagian ${index + 1}`,
        content: stripTeacherInstructions(section?.content || section?.text || section?.description || section?.summary || ''),
        imageUrl: section?.image_url || section?.imageUrl || null,
        imagePrompt: section?.image_prompt || section?.imagePrompt || null,
        createdAt: section?.created_at || section?.createdAt || null,
      };
    });

    const exercises = asArray(module?.exercises || sourceFlow?.exercises || sourcePractice?.items || sourcePractice?.prompts);
    const quizQuestions = asArray(module?.questions || module?.quiz?.questions || sourceFlow?.questions || sourceQuiz?.questions);
    const builtQuizQuestions = quizQuestions.length > 0
      ? normalizeQuestions(quizQuestions)
      : exercises.map((exercise, index) => {
          const options = parseOptions(exercise?.options || ['A', 'B', 'C', 'D']);
          return {
            id: exercise?.id || index + 1,
            text: exercise?.question_text || exercise?.question || exercise?.text || exercise?.prompt || `Soal ${index + 1}`,
            options,
            correctAnswerText: exercise?.answer || 'A',
            answer: deriveAnswerLetter(options, exercise?.answer || 'A'),
          };
        });
    const builtFromQuiz = quizQuestions.length > 0
      ? normalizeQuestions(quizQuestions)
      : [];
    const finalQuizQuestions = builtFromQuiz.length > 0 ? builtFromQuiz : builtQuizQuestions;

    const normalizedLearningFlow = {
      material: {
        title: sourceMaterial?.title || `${module?.title || topic} - Materi`,
        summary:
          sourceMaterial?.summary
          || module?.summary
          || module?.description
          || sectionItems[0]?.content
          || topic,
        points: (
          sourceMaterial?.points
            ? asArray(sourceMaterial.points)
            : sectionItems.map((section) => section.title)
        ).filter(Boolean),
        sections: sectionItems,
      },
      practice: {
        title: sourcePractice?.title || `${module?.title || topic} - Latihan`,
        prompts: (
          sourcePractice?.prompts
            ? asArray(sourcePractice.prompts)
            : exercises.map((exercise, index) => normalizeExerciseForPractice(exercise, index))
        ).filter(Boolean),
      },
      quiz: {
        title: sourceQuiz?.title || `${module?.title || topic} - Quiz`,
        questions: finalQuizQuestions,
      },
    };

    return sanitizeModuleRecord({
      id: moduleId,
      title: stripTeacherInstructions(module?.title || '') || topic,
      subject: module?.classroom_name || module?.subject || 'Umum',
      guru: module?.teacher_name || module?.teacher?.name || 'Guru',
      deadline: module?.deadline || module?.due_date || module?.published_at || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      soal: finalQuizQuestions.length || exercises.length || 0,
      status: module?.status === 'published' ? 'baru' : module?.status || 'baru',
      isNew: true,
      learningFlow: normalizedLearningFlow,
      questions: finalQuizQuestions,
      sections: sectionItems,
      source: 'student-modules-api',
    }, topic);
  };

  const loadTasksForStudent = (email) => {
    try {
      const published = JSON.parse(localStorage.getItem(GLOBAL_TASKS_KEY) || '[]');
      const learningPackages = JSON.parse(localStorage.getItem(GLOBAL_LEARNING_KEY) || '[]');
      const progress = JSON.parse(localStorage.getItem(studentProgressKey(email)) || '{}');
      return [...learningPackages, ...published].map((task) => ({ ...task, ...(progress[task.id] || {}) }));
    } catch {
      return [];
    }
  };

  const loadTasksForStudentFromApi = async (email) => {
    const progress = (() => {
      try {
        return JSON.parse(localStorage.getItem(studentProgressKey(email)) || '{}');
      } catch {
        return {};
      }
    })();

    try {
      const modules = await getStudentModules(50, 0);
      const apiTasks = (modules || []).map(normalizeStudentModuleTask);
      return apiTasks.map((task) => ({ ...task, ...(progress[task.id] || {}) }));
    } catch {
      return loadTasksForStudent(email);
    }
  };

  const hydrateLearningTaskDetail = async (task) => {
    if (!task?.id || task?.source !== 'student-modules-api') {
      return task;
    }

    try {
      const detail = await getStudentModuleDetail(task.id);
      const normalizedDetail = normalizeStudentModuleTask(detail);
      return {
        ...task,
        ...normalizedDetail,
        id: task.id,
        isNew: task.isNew,
        status: task.status,
        materialCompleted: task.materialCompleted,
        practiceCompleted: task.practiceCompleted,
        quizCompleted: task.quizCompleted,
      };
    } catch {
      return task;
    }
  };

  const savePublishedTask = (task) => {
    try {
      const published = JSON.parse(localStorage.getItem(GLOBAL_TASKS_KEY) || '[]');
      localStorage.setItem(GLOBAL_TASKS_KEY, JSON.stringify([task, ...published]));
    } catch {}
  };

  const saveLearningPackage = (learningPackage) => {
    try {
      const packages = JSON.parse(localStorage.getItem(GLOBAL_LEARNING_KEY) || '[]');
      localStorage.setItem(GLOBAL_LEARNING_KEY, JSON.stringify([learningPackage, ...packages]));
    } catch {}
  };

  const saveStudentProgress = (email, taskId, updates) => {
    try {
      const key = studentProgressKey(email);
      const progress = JSON.parse(localStorage.getItem(key) || '{}');
      progress[taskId] = { ...progress[taskId], ...updates };
      localStorage.setItem(key, JSON.stringify(progress));
    } catch {}
  };

  const saveStudentTasks = (tasks) => {
    setStudentTasks(tasks);
  };

  const handleCorrectAnswer = (reward) => {
    setCoins((prev) => prev + reward);
  };

  const handleSelectFruitFromMap = (fruitName) => {
    setSelectedSubject(fruitName);
    setQuizActive(true);
  };

  const switchToTeacher = () => {
    setRole('teacher');
    setTeacherStep('login');
    setSelectedSummaryTask(null);
    setPracticeMode(false);
    setTaskStartedAt(null);
    setStudentStep('login');
    setBackendError(null);
    setIsSyncing(false);
    setDraftQuestions([]);
    setDraftQuiz(null);
    setTeacherCriteria(null);
    setPublishedAssignment(null);
    setSelectedClassroom(null);
    setClassrooms([]);
    setTeacherCreateClassRequest(0);
      setMobileMenuOpen(false);
  };

  const switchToStudent = () => {
    setRole('student');
    setStudentStep('login');
    setSelectedSummaryTask(null);
    setPracticeMode(false);
    setTaskStartedAt(null);
    setBackendError(null);
    setIsSyncing(false);
    setMobileMenuOpen(true);
  };

  const handleStudentLogin = async ({ email, password }) => {
    setBackendError(null);
    setIsSyncing(true);

    try {
      const auth = await loginStudent({ email, password });
      setStudentAuth(auth);
      setStudentProfile({
        name: auth.user?.name || email.split('@')[0] || 'Siswa',
      });
      setRole('student');
      setStudentStep('home');
      setActiveTab('beranda');
      setStudentTaskFlow(null);
      setActiveTask(null);
      setMobileMenuOpen(false);
      const loadedTasks = await loadTasksForStudentFromApi(auth.user?.email || email);
      setStudentTasks(loadedTasks);
      setTaskBadge(loadedTasks.filter((t) => t.isNew).length);
    } catch (error) {
      setBackendError(error.message || 'Login gagal.');
      setStudentStep('login');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTeacherLogin = async ({ email, password }) => {
    setBackendError(null);
    setIsSyncing(true);

    try {
      const auth = await loginTeacher({ email, password });
      setTeacherAuth(auth);
      setTeacherStep('classrooms');
        setMobileMenuOpen(false);
      getClassrooms().then((d) => setClassrooms(Array.isArray(d) ? d : [])).catch(() => {});
    } catch (error) {
      setBackendError(error.response?.data?.detail || error.message || 'Login gagal.');
      setTeacherStep('login');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateClassRequest = () => {
    setRole('teacher');
    setTeacherStep('classrooms');
    setTeacherCreateClassRequest((count) => count + 1);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    async function restoreAuth() {
      const activeRole = getAuthRole();
      try {
        const user = await getCurrentUser();

        if (activeRole === 'student') {
          setRole('student');
          setStudentAuth({ user, access_token: localStorage.getItem('auth_token') });
          setStudentProfile({ name: user?.name || 'Petualang Cilik' });
          setStudentStep('home');
          setTeacherStep('login');
          setActiveTab('beranda');
          setStudentTaskFlow(null);
          setActiveTask(null);
          setMobileMenuOpen(false);
          const restoredTasks = await loadTasksForStudentFromApi(user.email || '');
          setStudentTasks(restoredTasks);
          setTaskBadge(restoredTasks.filter((t) => t.isNew).length);
        } else {
          setRole('teacher');
          setTeacherAuth({ user, access_token: localStorage.getItem('auth_token') });
          setTeacherStep('classrooms');
            setMobileMenuOpen(false);
          getClassrooms().then((d) => setClassrooms(Array.isArray(d) ? d : [])).catch(() => {});
        }
      } catch {
        logoutTeacher();
        logoutStudent();
      }
    }

    restoreAuth();
  }, []);

  const handleTeacherGenerate = async (criteria) => {
    if (!teacherAuth) {
      setBackendError('Harap login terlebih dahulu.');
      setTeacherStep('login');
      return;
    }

    setTeacherCriteria(criteria);
    setBackendError(null);
    setDraftQuestions([]);
    setDraftQuiz(null);
    setIsSyncing(true);
    setTeacherStep('generating');

    try {
      const classroom = selectedClassroom || await getOrCreateClassroom(teacherAuth.user.id);
      const numMatch = criteria.prompt.match(/(\d+)\s*soal/i);
      const numQuestions = numMatch ? Math.min(Math.max(parseInt(numMatch[1], 10), 1), 20) : 5;
      const quiz = await generateQuizDraft({
        teacherId: teacherAuth.user.id,
        classroomId: classroom.id,
        title: criteria.prompt,
        subject: 'Umum',
        topic: criteria.prompt,
        numQuestions,
      });

      setDraftQuestions(normalizeQuestions(quiz.questions));
      setDraftQuiz(quiz);
      setTeacherStep('review');
    } catch (error) {
      setBackendError(error.response?.data?.detail || error.message || 'Tidak dapat terhubung ke backend.');
      setTeacherStep('input');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTeacherPublish = async (assignment) => {
    if (!teacherAuth) {
      setBackendError('Harap login terlebih dahulu.');
      setTeacherStep('login');
      return;
    }

    setBackendError(null);
    setIsSyncing(true);

    try {
      if (draftQuiz?.id) {
        await publishQuiz(draftQuiz.id);
      }

      const published = {
        ...assignment,
        quizId: draftQuiz?.id || null,
        status: 'published',
        subject: draftQuiz?.subject,
        topic: draftQuiz?.topic,
        questions: draftQuestions,
        guru: teacherAuth.user?.name || 'Guru',
      };

      setPublishedAssignment(published);
      const newTask = {
        id: draftQuiz?.id,
        title: assignment.judul || draftQuiz?.title || `Tugas ${teacherCriteria?.prompt}`,  
        subject: draftQuiz?.subject,
        guru: teacherAuth.user?.name || 'Guru',
        deadline: assignment.deadline || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        soal: draftQuestions.length,
        status: 'baru',
        isNew: true,
        quizId: draftQuiz?.id,
        questions: draftQuestions,
      };
      savePublishedTask(newTask);
      setTeacherStep('success');
    } catch (error) {
      setBackendError(error.response?.data?.detail || error.message || 'Publikasi tugas gagal.');
      setTeacherStep('review');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRegenerateQuestion = async (questionId) => {
    if (!teacherAuth) {
      setBackendError('Harap login terlebih dahulu.');
      setTeacherStep('login');
      return;
    }

    if (!questionId) {
      return;
    }

    setBackendError(null);
    setIsSyncing(true);

    try {
      const updatedQuestion = await regenerateQuestion(questionId);
      setDraftQuestions((prev) => prev.map((q) => (q.id === questionId ? normalizeQuestions([updatedQuestion])[0] : q)));
    } catch (error) {
      setBackendError(error.response?.data?.detail || error.message || 'Regenerasi soal gagal.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateQuestion = (questionId, updates) => {
    if (!questionId) {
      return;
    }

    setDraftQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        const nextQuestion = { ...question, ...updates };
        nextQuestion.answer = deriveAnswerLetter(nextQuestion.options, nextQuestion.correctAnswerText || nextQuestion.answer);
        return nextQuestion;
      })
    );
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!teacherAuth) {
      setBackendError('Harap login terlebih dahulu.');
      setTeacherStep('login');
      return;
    }

    if (!questionId) {
      setDraftQuestions((prev) => prev.filter((q) => q.id !== questionId));
      return;
    }

    setBackendError(null);
    setIsSyncing(true);

    try {
      await deleteQuestion(questionId);
      setDraftQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch (error) {
      setBackendError(error.response?.data?.detail || error.message || 'Hapus soal gagal.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenTask = async (task) => {
    const isLearningModule = Boolean(task?.learningFlow || task?.source === 'student-modules-api');

    if (task?.status === 'selesai' && !isLearningModule) {
      setSelectedSummaryTask(task);
      return;
    }

    const hydratedTask = await hydrateLearningTaskDetail(task);

    setSelectedSummaryTask(null);
    setActiveTask(hydratedTask);
    setPracticeMode(false);
    setTaskStartedAt(Date.now());
    setStudentTaskFlow('assignment');
    const studentEmail = studentAuth?.user?.email || '';
    const lastOpenedAt = saveLastOpenedModule(studentEmail, hydratedTask.id);
    saveStudentProgress(studentEmail, hydratedTask.id, { isNew: false, lastOpenedAt });
    const updated = studentTasks.map((t) => (t.id === hydratedTask.id ? { ...t, ...hydratedTask, isNew: false } : t));
    setStudentTasks(updated);
    setTaskBadge(updated.filter((t) => t.isNew).length);
  };

  const handleSubmitAssignment = (answers, task) => {
    const questions = task?.questions || [];
    const total = questions.length;
    const score = questions.reduce((count, question) => {
      const selected = answers[question.id];
      const correctIndex = question.options.findIndex((opt, idx) => String.fromCharCode(65 + idx) === question.answer);
      return count + (selected === correctIndex ? 1 : 0);
    }, 0);

    const durationMinutes = taskStartedAt ? Math.max(1, Math.round((Date.now() - taskStartedAt) / 60000)) : 0;

    if (task?.id && !practiceMode) {
      const studentEmail = studentAuth?.user?.email || '';
      const progressData = {
        status: 'selesai',
        isNew: false,
        score,
        total,
        xp: score * 40,
        completedAt: new Date().toISOString(),
        durationMinutes,
        rewardLabel: `+${score * 40} Koin`,
      };
      saveStudentProgress(studentEmail, task.id, progressData);
      const enriched = studentTasks.map((t) => (t.id === task.id ? { ...t, ...progressData } : t));
      setStudentTasks(enriched);
      setTaskBadge(enriched.filter((t) => t.isNew).length);
    }

    setGradingResult({ score, total, xp: practiceMode ? 0 : score * 40, practice: practiceMode });
    setStudentTaskFlow('grading');
    setTaskStartedAt(null);
  };

  const handleSubmitLearningQuiz = (answers, task, learningMeta = {}) => {
    const questions = learningMeta?.quizQuestions || task?.learningFlow?.quiz?.questions || [];
    const total = questions.length;
    const normalizeText = (value) => String(value || '')
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const score = questions.reduce((count, question) => {
      const selected = answers[question.id];
      const isOrdering = question.isOrdering || isQuizOrderingQuestion(question);
      const isMatching = question.isMatching || isQuizMatchingQuestion(question);
      const isEssay = question.isEssay || isQuizEssayQuestion(question);
      const isTrueFalse = question.isTrueFalse || isQuizTrueFalseQuestion(question);

      if (isOrdering) {
        const expected = (question.correctOrder || []).map((value) => normalizeText(value));
        const given = (Array.isArray(selected) ? selected : []).map((value) => normalizeText(value));
        if (expected.length === 0 || given.length === 0) return count;
        const isCorrect = given.length === expected.length
          && given.every((value, index) => value === expected[index]);
        return count + (isCorrect ? 1 : 0);
      }

      if (isMatching) {
        const leftItems = question.matchingLeft || [];
        if (leftItems.length === 0) return count;
        const selectedMap = (selected && typeof selected === 'object') ? selected : {};
        const correctPairs = question.correctPairs || {};
        const allFilled = leftItems.every((_, idx) => selectedMap[idx] !== undefined);
        if (!allFilled) return count;

        if (Object.keys(correctPairs).length > 0) {
          const isCorrect = leftItems.every((_, idx) => Number(selectedMap[idx]) === Number(correctPairs[idx]));
          return count + (isCorrect ? 1 : 0);
        }

        return count + 1;
      }

      if (isEssay) {
        const expected = normalizeText(question.correctAnswerText || question.correct_answer || question.answer || '');
        const given = normalizeText(selected);
        if (!expected || !given) return count;
        return count + (given === expected || given.includes(expected) || expected.includes(given) ? 1 : 0);
      }

      const options = isTrueFalse
        ? TRUE_FALSE_OPTIONS
        : (Array.isArray(question.options) ? question.options : []);
      const rawAnswer = question.correctAnswerText || question.correct_answer || question.answer || '';
      const correctIndex = options.findIndex((opt, idx) => {
        const letter = String.fromCharCode(65 + idx);
        const optText = String(opt).trim().toLowerCase();
        const answerText = String(rawAnswer).trim().toLowerCase();
        return letter === String(rawAnswer).trim().toUpperCase()
          || optText === answerText
          || (answerText === 'true' && optText === 'benar')
          || (answerText === 'false' && optText === 'salah')
          || (answerText === 'benar' && optText === 'benar')
          || (answerText === 'salah' && optText === 'salah');
      });
      return count + (selected === correctIndex ? 1 : 0);
    }, 0);
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    const durationMinutes = taskStartedAt ? Math.max(1, Math.round((Date.now() - taskStartedAt) / 60000)) : 0;

    if (task?.id) {
      const studentEmail = studentAuth?.user?.email || '';
      const progressData = {
        status: 'selesai',
        isNew: false,
        quizCompleted: true,
        score,
        total,
        xp: score * 40,
        completedAt: new Date().toISOString(),
        durationMinutes,
        rewardLabel: `+${score * 40} Koin`,
      };
      saveStudentProgress(studentEmail, task.id, progressData);
      const enriched = studentTasks.map((t) => (t.id === task.id ? { ...t, ...progressData } : t));
      setStudentTasks(enriched);
      setTaskBadge(enriched.filter((t) => t.isNew).length);
    }

    setGradingResult({
      score,
      total,
      percentage,
      xp: score * 40,
      practice: false,
      practiceSummary: learningMeta?.practiceSummary || null,
      passed80: percentage >= 80,
    });
    setStudentTaskFlow('grading');
    setTaskStartedAt(null);
  };

  const handleCompleteLearningContent = async (task) => {
    if (!task?.id) return null;

    try {
      const response = await completeStudentModuleContent(task.id);
      const studentEmail = studentAuth?.user?.email || '';
      saveStudentProgress(studentEmail, task.id, { materialCompleted: true });
      const mergeProgress = (t) => (t.id === task.id ? { ...t, materialCompleted: true } : t);
      setStudentTasks((prev) => prev.map(mergeProgress));
      setActiveTask((prev) => (prev?.id === task.id ? { ...prev, materialCompleted: true } : prev));
      return response;
    } catch (error) {
      console.error('Failed to complete learning content:', error);
      return null;
    }
  };

  const handleSubmitLearningExercises = async (payload, task) => {
    if (!task?.id) return null;

    try {
      const response = await submitStudentModuleExercises(task.id, payload);
      const studentEmail = studentAuth?.user?.email || '';
      saveStudentProgress(studentEmail, task.id, { practiceCompleted: true });
      const mergeProgress = (t) => (t.id === task.id ? { ...t, practiceCompleted: true } : t);
      setStudentTasks((prev) => prev.map(mergeProgress));
      setActiveTask((prev) => (prev?.id === task.id ? { ...prev, practiceCompleted: true } : prev));
      return response;
    } catch (error) {
      console.error('Failed to submit learning exercises:', error);
      throw error;
    }
  };

  const renderTeacherContent = () => (
    <TeacherPage
      teacherStep={teacherStep}
      teacherCriteria={teacherCriteria}
      draftQuestions={draftQuestions}
      draftQuiz={draftQuiz}
      backendError={backendError}
      isSyncing={isSyncing}
      publishedAssignment={publishedAssignment}
      onLogin={handleTeacherLogin}
      onGenerate={handleTeacherGenerate}
      onPublish={handleTeacherPublish}
      onRegenerate={() => handleTeacherGenerate(teacherCriteria)}
      onRegenerateQuestion={handleRegenerateQuestion}
      onDeleteQuestion={handleDeleteQuestion}
      onUpdateQuestion={handleUpdateQuestion}
      onBack={() => setTeacherStep('review')}
      onDone={() => {
        setTeacherStep('classrooms');
        switchToStudent();
        setActiveTab('tugas');
        setStudentTaskFlow(null);
      }}
      onSelectClassroom={(cls) => { setSelectedClassroom(cls); setTeacherStep('classrooms'); }}
      onClassroomsLoaded={(list) => setClassrooms(list)}
      selectedClassroom={selectedClassroom}
      createClassRequest={teacherCreateClassRequest}
    />
  );

  const renderStudentContent = () => (
    <StudentPage
      activeTab={activeTab}
      studentTaskFlow={studentTaskFlow}
      activeTask={activeTask}
      gradingResult={gradingResult}
      tasks={studentTasks}
      coins={coins}
      studentName={studentProfile.name}
      studentEmail={studentAuth?.user?.email || ''}
      onSelectSubject={setSelectedSubject}
      onOpenTask={handleOpenTask}
      onSubmitAssignment={handleSubmitAssignment}
      onSubmitLearningQuiz={handleSubmitLearningQuiz}
      onCompleteLearningContent={handleCompleteLearningContent}
      onSubmitLearningExercises={handleSubmitLearningExercises}
      onBack={() => setStudentTaskFlow(null)}
      onTabChange={(tab) => { setActiveTab(tab); setStudentTaskFlow(null); }}
      onContinue={() => {
        setStudentTaskFlow(null);
        setActiveTab('beranda');
        if (!gradingResult?.practice) {
          setCoins((c) => c + (gradingResult?.xp ?? 0));
        }
        setPracticeMode(false);
      }}
      onLearnAgain={() => {
        setPracticeMode(true);
        setTaskStartedAt(Date.now());
        setStudentTaskFlow('assignment');
      }}
      practiceMode={practiceMode}
    />
  );

  const renderTeacherLoginScreen = () => (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(21,94,68,0.08),_transparent_45%),linear-gradient(180deg,_#f7faf7_0%,_#eef6ef_100%)]">
      <TeacherLogin
        onLogin={handleTeacherLogin}
        errorMessage={backendError}
        isLoading={isSyncing}
        onSwitchRole={switchToStudent}
      />
    </div>
  );

  const renderStudentLoginScreen = () => (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(21,94,68,0.08),_transparent_45%),linear-gradient(180deg,_#f7faf7_0%,_#eef6ef_100%)]">
      <StudentLogin
        onLogin={handleStudentLogin}
        errorMessage={backendError}
        isLoading={isSyncing}
        onSwitchRole={switchToTeacher}
      />
    </div>
  );

  return (
    <>
      {role === 'teacher' && teacherStep === 'login' ? (
        renderTeacherLoginScreen()
      ) : role === 'student' && studentStep === 'login' ? (
        renderStudentLoginScreen()
      ) : (
        <div
          className="min-h-screen bg-background text-on-background font-body-md overflow-x-hidden relative flex"
          style={{ '--sidebar-offset': mobileMenuOpen ? '5rem' : '18rem' }}
        >
          {role === 'teacher' ? (
            <TeacherSidebar
              activeStep={teacherStep === 'success' ? 'publish' : teacherStep === 'generating' ? 'input' : teacherStep}
              onStepChange={setTeacherStep}
              isOpen={mobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
              isCollapsed={mobileMenuOpen}
              isGenerating={teacherStep === 'generating'}
              onSwitchRole={switchToStudent}
              classrooms={classrooms}
              selectedClassroom={selectedClassroom}
              onSelectClassroom={(cls) => { setSelectedClassroom(cls); setTeacherStep('classrooms'); }}
              unlockedSteps={[
                'classrooms',
                'input',
                ...(draftQuestions.length > 0 ? ['review'] : []),
                ...(draftQuiz ? ['publish'] : []),
              ]}
            />
          ) : (
            <Sidebar
              activeTab={activeTab}
              studentName={studentProfile.name}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setStudentTaskFlow(null);
              }}
              isOpen={mobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
              isCollapsed={mobileMenuOpen}
              taskBadge={taskBadge}
              onSwitchRole={switchToTeacher}
            />
          )}

          <div className="flex-grow w-full min-w-0 flex flex-col min-h-screen ml-0 md:ml-[var(--sidebar-offset)] transition-[margin-left] duration-300">
            <Topbar
              coins={coins}
              onToggleMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
              role={role}
              onLogout={() => { logoutTeacher(); switchToTeacher(); }}
              onCreateClass={handleCreateClassRequest}
            />
            <div className={`flex-grow w-full min-w-0 pt-16 ${role === 'student' ? 'pb-0' : ''}`}>
              {role === 'teacher' ? renderTeacherContent() : renderStudentContent()}
            </div>
          </div>

          {role === 'student' && !studentTaskFlow && !selectedSubject && (
            <StudentBottomNav
              activeTab={activeTab}
              taskBadge={taskBadge}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setStudentTaskFlow(null);
              }}
            />
          )}

          {role === 'student' && selectedSubject && !playActive && (
            <SubjectDetail
              subjectType={selectedSubject}
              coins={coins}
              onBack={() => setSelectedSubject(null)}
              onPlay={() => setPlayActive(true)}
            />
          )}

          {role === 'student' && selectedSubject && playActive && (
            <TreeMap coins={coins} onBack={() => setPlayActive(false)} onSelectFruit={handleSelectFruitFromMap} />
          )}

          {role === 'student' && quizActive && selectedSubject && (
            <FruitModal
              subjectType={selectedSubject}
              onClose={() => setQuizActive(false)}
              onCorrectAnswer={(reward) => {
                handleCorrectAnswer(reward);
                setQuizActive(false);
              }}
            />
          )}
        </div>
      )}

      {selectedSummaryTask ? (
        <StudentTaskSummary
          task={selectedSummaryTask}
          onClose={() => setSelectedSummaryTask(null)}
          onPracticeAgain={() => {
            setSelectedSummaryTask(null);
            setActiveTask(selectedSummaryTask);
            setPracticeMode(true);
            setTaskStartedAt(Date.now());
            setStudentTaskFlow('assignment');
          }}
        />
      ) : null}
    </>
  );
}

export default App;
