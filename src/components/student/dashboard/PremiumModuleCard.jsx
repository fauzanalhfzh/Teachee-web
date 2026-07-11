import React from 'react';
import { motion } from 'framer-motion';
import { formatDeadline, estimateReadingMinutes } from '../../../utils/studentDashboardUtils';

const PremiumModuleCard = ({ task, onOpenTask, index = 0 }) => {
  const readingMin = estimateReadingMinutes(task);
  const isDone = task.status === 'selesai';
  const hasMaterial = Boolean(task?.learningFlow?.material);
  const hasPractice = Boolean(task?.learningFlow?.practice?.prompts?.length);
  const hasQuiz = Boolean(task?.learningFlow?.quiz?.questions?.length);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col"
    >
      <div className="px-6 pt-6 pb-5 flex-1 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2">
          {task.title}
        </h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-gray-400">person</span>
            {task.guru || 'Guru'}
          </p>
          <p className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-gray-400">schedule</span>
            ~{readingMin} menit baca
          </p>
          <p className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-gray-400">quiz</span>
            {task.soal || 0} pertanyaan
          </p>
          <p className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-gray-400">event</span>
            Deadline {formatDeadline(task.deadline)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {hasMaterial && (
            <span className="px-2.5 py-1 rounded-lg bg-gray-50 text-xs font-medium text-gray-600">📝 Materi</span>
          )}
          {hasPractice && (
            <span className="px-2.5 py-1 rounded-lg bg-gray-50 text-xs font-medium text-gray-600">🧠 Latihan</span>
          )}
          {hasQuiz && (
            <span className="px-2.5 py-1 rounded-lg bg-gray-50 text-xs font-medium text-gray-600">📄 Quiz</span>
          )}
        </div>

        <motion.button
          type="button"
          onClick={() => onOpenTask(task)}
          whileTap={{ scale: 0.98 }}
          className="mt-auto w-full py-3.5 rounded-2xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all duration-300 group-hover:shadow-md"
        >
          {isDone ? 'Lihat Materi' : 'Mulai Belajar'}
        </motion.button>
      </div>
    </motion.article>
  );
};

export default PremiumModuleCard;
