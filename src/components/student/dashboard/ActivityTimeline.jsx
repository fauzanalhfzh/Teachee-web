import React from 'react';
import { motion } from 'framer-motion';

const ActivityTimeline = ({ items = [], onOpenTask }) => (
  <section>
    <h2 className="text-lg font-bold text-gray-900 mb-5">Aktivitas Hari Ini</h2>
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6">
      <ul className="space-y-0">
        {items.map((item, index) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08, duration: 0.35 }}
          >
            <button
              type="button"
              onClick={() => item.task && onOpenTask?.(item.task)}
              disabled={!item.task}
              className={`w-full flex items-start gap-4 py-4 text-left ${item.task ? 'hover:bg-gray-50 rounded-2xl px-2 -mx-2 transition-colors' : ''}`}
            >
              <div className="flex flex-col items-center shrink-0 pt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                {index < items.length - 1 && <span className="w-px flex-1 min-h-[28px] bg-gray-200 mt-2" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 leading-snug">{item.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{item.subtitle}</p>
              </div>
              <span className="text-xs font-medium text-gray-400 shrink-0 pt-1">{item.when}</span>
            </button>
            {index < items.length - 1 && <div className="border-b border-gray-100 ml-6" />}
          </motion.li>
        ))}
      </ul>
    </div>
  </section>
);

export default ActivityTimeline;
