import React from 'react';
import { motion } from 'framer-motion';

const AnnouncementsCard = ({ announcements = [] }) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5"
  >
    <h3 className="font-bold text-gray-900 mb-4">Pengumuman</h3>
    <ul className="space-y-0">
      {announcements.map((item, index) => (
        <li key={item.id} className="relative">
          <div className="flex gap-3 py-3">
            <span className="text-lg shrink-0">📢</span>
            <div className="min-w-0">
              <p className="text-sm text-gray-800 leading-snug">{item.title}</p>
              <p className="text-xs text-gray-400 mt-1">{item.time}</p>
            </div>
          </div>
          {index < announcements.length - 1 && <div className="border-b border-gray-100" />}
        </li>
      ))}
    </ul>
  </motion.section>
);

export default AnnouncementsCard;
