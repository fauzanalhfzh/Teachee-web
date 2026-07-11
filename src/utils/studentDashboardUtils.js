const SUBJECT_THEMES = {
  informatika: {
    id: 'informatika',
    label: 'Informatika',
    emoji: '💻',
    gradient: 'from-emerald-600 to-teal-500',
    softBg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    badge: 'bg-emerald-100 text-emerald-800',
    illustration: 'computer',
  },
  matematika: {
    id: 'matematika',
    label: 'Matematika',
    emoji: '📐',
    gradient: 'from-blue-600 to-indigo-500',
    softBg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    badge: 'bg-blue-100 text-blue-800',
    illustration: 'math',
  },
  bahasa: {
    id: 'bahasa',
    label: 'Bahasa Indonesia',
    emoji: '📚',
    gradient: 'from-amber-500 to-orange-400',
    softBg: 'bg-gradient-to-br from-amber-50 to-orange-50',
    badge: 'bg-amber-100 text-amber-800',
    illustration: 'language',
  },
  ipa: {
    id: 'ipa',
    label: 'IPA',
    emoji: '🧪',
    gradient: 'from-green-600 to-emerald-500',
    softBg: 'bg-gradient-to-br from-green-50 to-emerald-50',
    badge: 'bg-green-100 text-green-800',
    illustration: 'science',
  },
  sejarah: {
    id: 'sejarah',
    label: 'Sejarah',
    emoji: '🏛️',
    gradient: 'from-stone-600 to-amber-700',
    softBg: 'bg-gradient-to-br from-stone-50 to-amber-50',
    badge: 'bg-stone-100 text-stone-800',
    illustration: 'history',
  },
  seni: {
    id: 'seni',
    label: 'Seni',
    emoji: '🎨',
    gradient: 'from-purple-600 to-pink-500',
    softBg: 'bg-gradient-to-br from-purple-50 to-pink-50',
    badge: 'bg-purple-100 text-purple-800',
    illustration: 'art',
  },
  default: {
    id: 'default',
    label: 'Umum',
    emoji: '📖',
    gradient: 'from-primary to-emerald-600',
    softBg: 'bg-gradient-to-br from-emerald-50 to-green-50',
    badge: 'bg-emerald-100 text-emerald-800',
    illustration: 'default',
  },
};

const EXPLORE_SUBJECTS = [
  SUBJECT_THEMES.informatika,
  SUBJECT_THEMES.bahasa,
  SUBJECT_THEMES.ipa,
  SUBJECT_THEMES.matematika,
  SUBJECT_THEMES.seni,
];

const SUBJECT_KEYWORDS = [
  { key: 'informatika', words: ['informatika', 'hardware', 'software', 'komputer', 'coding', 'teknologi'] },
  { key: 'matematika', words: ['matematika', 'aljabar', 'geometri', 'bilangan'] },
  { key: 'bahasa', words: ['bahasa', 'sastra', 'membaca', 'menulis'] },
  { key: 'ipa', words: ['ipa', 'sains', 'fisika', 'biologi', 'kimia'] },
  { key: 'sejarah', words: ['sejarah', 'peradaban', 'nasional'] },
  { key: 'seni', words: ['seni', 'musik', 'rupa'] },
];

export const notesKey = (email) => `teacherware_notes_${email || 'guest'}`;
export const lastModuleKey = (email) => `teacherware_last_module_${email || 'guest'}`;

export const getSubjectTheme = (task = {}) => {
  const haystack = `${task?.title || ''} ${task?.subject || ''} ${task?.topic || ''}`.toLowerCase();
  const match = SUBJECT_KEYWORDS.find(({ words }) => words.some((w) => haystack.includes(w)));
  return SUBJECT_THEMES[match?.key] || SUBJECT_THEMES.default;
};

export const getExploreSubjects = () => EXPLORE_SUBJECTS;

export const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDeadline = (value) => {
  const date = parseDate(value);
  if (!date) return '-';
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const formatShortDeadline = (value) => {
  const date = parseDate(value);
  if (!date) return '-';
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

export const isSameDay = (a, b) => {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
};

export const getRelativeDayLabel = (value) => {
  const date = parseDate(value);
  if (!date) return 'Tanpa jadwal';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target - today) / 86400000);

  if (diff === 0) return 'Hari ini';
  if (diff === 1) return 'Besok';
  if (diff === -1) return 'Kemarin';
  if (diff > 1 && diff <= 6) {
    return target.toLocaleDateString('id-ID', { weekday: 'long' });
  }
  return formatShortDeadline(value);
};

export const getRelativeOpenLabel = (iso) => {
  if (!iso) return 'Baru';
  return getRelativeDayLabel(iso);
};

export const estimateReadingMinutes = (task = {}) => {
  const sections = task?.learningFlow?.material?.sections || [];
  const text = sections.map((s) => s.content || '').join(' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words > 0) return Math.max(3, Math.ceil(words / 180));
  return Math.max(5, Math.min(20, (task?.soal || 3) * 2));
};

export const getActiveTasks = (tasks = []) => tasks.filter((t) => t.status !== 'selesai');

export const getContinueTask = (tasks = [], email = '') => {
  try {
    const stored = JSON.parse(localStorage.getItem(lastModuleKey(email)) || 'null');
    if (stored?.taskId) {
      const match = tasks.find((t) => t.id === stored.taskId);
      if (match) return { task: match, openedAt: stored.openedAt };
    }
  } catch {}

  const withLastOpened = tasks
    .map((task) => ({ task, openedAt: task.lastOpenedAt }))
    .filter((item) => item.openedAt)
    .sort((a, b) => new Date(b.openedAt) - new Date(a.openedAt));

  if (withLastOpened[0]) return withLastOpened[0];

  const active = getActiveTasks(tasks);
  return active[0] ? { task: active[0], openedAt: null } : null;
};

export const saveLastOpenedModule = (email, taskId) => {
  if (!email || !taskId) return;
  const openedAt = new Date().toISOString();
  localStorage.setItem(lastModuleKey(email), JSON.stringify({ taskId, openedAt }));
  return openedAt;
};

export const loadNotes = (email) => {
  try {
    return JSON.parse(localStorage.getItem(notesKey(email)) || '[]');
  } catch {
    return [];
  }
};

export const persistNotes = (email, notes) => {
  localStorage.setItem(notesKey(email), JSON.stringify(notes));
};

export const buildClassroomInsights = (tasks = []) => {
  const active = getActiveTasks(tasks);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueToday = active.filter((task) => {
    const d = parseDate(task.deadline);
    return d && isSameDay(d, today);
  });

  const upcoming = [...active]
    .filter((task) => parseDate(task.deadline))
    .sort((a, b) => parseDate(a.deadline) - parseDate(b.deadline));

  const nearest = upcoming[0] || null;
  const newMaterials = active.filter((t) => t.isNew);

  return [
    {
      id: 'today',
      icon: 'assignment',
      label: 'Tugas Hari Ini',
      value: dueToday.length > 0 ? `${dueToday.length} aktivitas` : 'Tidak ada',
      detail: dueToday[0]?.title || 'Semua tugas sudah dijadwalkan',
      accent: 'bg-emerald-50 text-primary',
    },
    {
      id: 'deadline',
      icon: 'event',
      label: 'Deadline Terdekat',
      value: nearest ? formatShortDeadline(nearest.deadline) : '-',
      detail: nearest?.title || 'Belum ada deadline',
      accent: 'bg-slate-50 text-slate-700',
    },
    {
      id: 'new',
      icon: 'campaign',
      label: 'Materi Baru',
      value: newMaterials.length > 0 ? `${newMaterials.length} modul` : 'Tidak ada',
      detail: newMaterials[0]?.title || 'Semua materi sudah dilihat',
      accent: 'bg-amber-50 text-amber-800',
    },
  ];
};

export const buildActivityTimeline = (tasks = []) => {
  const active = getActiveTasks(tasks);
  const items = active.map((task) => ({
    id: task.id,
    title: task.title,
    subtitle: getSubjectTheme(task).label,
    when: getRelativeDayLabel(task.deadline),
    deadline: task.deadline,
    task,
  }));

  const sorted = items.sort((a, b) => {
    const da = parseDate(a.deadline)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const db = parseDate(b.deadline)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return da - db;
  });

  if (sorted.length === 0) {
    return [];
  }

  return sorted.slice(0, 5);
};

export const buildAnnouncements = (tasks = []) => {
  const active = getActiveTasks(tasks);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const announcements = [];

  active
    .filter((task) => {
      const d = parseDate(task.deadline);
      return d && isSameDay(d, today);
    })
    .slice(0, 1)
    .forEach((task) => {
      announcements.push({
        id: `quiz-${task.id}`,
        title: `Quiz hari ini: ${task.title}`,
        time: 'Hari ini',
      });
    });

  active
    .filter((t) => t.isNew)
    .slice(0, 2)
    .forEach((task) => {
      announcements.push({
        id: `new-${task.id}`,
        title: `Materi baru tersedia — ${task.title}`,
        time: 'Baru',
      });
    });

  [...active]
    .sort((a, b) => parseDate(a.deadline) - parseDate(b.deadline))
    .slice(0, 1)
    .forEach((task) => {
      announcements.push({
        id: `deadline-${task.id}`,
        title: `Deadline ${formatShortDeadline(task.deadline)} — ${task.title}`,
        time: getRelativeDayLabel(task.deadline),
      });
    });

  if (announcements.length === 0) {
    return [
      { id: 'welcome', title: 'Selamat datang di Teacherware', time: 'Hari ini' },
      { id: 'tip', title: 'Mulai eksplorasi mandiri sambil menunggu tugas guru', time: 'Tips' },
    ];
  }

  return announcements.slice(0, 4);
};
