import React, { useRef } from 'react';
import { motion } from 'framer-motion';

const ExploreCarousel = ({ subjects = [], onSelectSubject }) => {
  const trackRef = useRef(null);

  const scroll = (direction) => {
    if (!trackRef.current) return;
    const amount = direction === 'left' ? -280 : 280;
    trackRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900">Eksplorasi Mandiri</h2>
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600"
            aria-label="Geser kiri"
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600"
            aria-label="Geser kanan"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {subjects.map((subject, index) => (
          <motion.button
            key={subject.id}
            type="button"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35 }}
            whileHover={{ y: -4 }}
            onClick={() => onSelectSubject?.(subject.id)}
            className={`snap-start shrink-0 w-[220px] sm:w-[240px] rounded-3xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-shadow text-left`}
          >
            <div className={`h-32 bg-gradient-to-br ${subject.gradient} p-5 relative overflow-hidden`}>
              <p className="text-white font-bold text-lg">{subject.emoji} {subject.label}</p>
              <p className="text-white/80 text-xs mt-2">Mode eksplorasi interaktif</p>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/15" />
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Mulai belajar mandiri</span>
              <span className="material-symbols-outlined text-gray-400">arrow_forward</span>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
};

export default ExploreCarousel;
