import React from 'react';
import { motion } from 'framer-motion';
import { getSubjectTheme, getRelativeOpenLabel } from '../../../utils/studentDashboardUtils';

const ContinueLearningCard = ({ continueData, onOpenTask }) => {
  if (!continueData?.task) return null;

  const { task, openedAt } = continueData;
  const theme = getSubjectTheme(task);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Lanjutkan Belajar</p>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mt-2 line-clamp-2">{task.title}</h2>
        <p className="text-sm text-gray-500 mt-1">
          Terakhir dibuka · {getRelativeOpenLabel(openedAt)}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          {theme.label} · Guru: {task.guru || 'Guru'}
        </p>
      </div>

      <motion.button
        type="button"
        onClick={() => onOpenTask(task)}
        whileTap={{ scale: 0.98 }}
        className="mt-5 w-full sm:w-auto px-6 py-3 rounded-2xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        Lanjut
      </motion.button>
    </motion.section>
  );
};

export default ContinueLearningCard;
