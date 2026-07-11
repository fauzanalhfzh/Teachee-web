import React from 'react';
import { motion } from 'framer-motion';

const ClassroomInsights = ({ insights = [] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {insights.map((item, index) => (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06, duration: 0.35 }}
        whileHover={{ y: -3 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
      >
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${item.accent}`}>
          <span className="material-symbols-outlined text-xl">{item.icon}</span>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{item.label}</p>
        <p className="text-xl font-bold text-gray-900 mt-1">{item.value}</p>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.detail}</p>
      </motion.div>
    ))}
  </div>
);

export default ClassroomInsights;
