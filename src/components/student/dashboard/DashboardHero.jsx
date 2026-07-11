import React from 'react';
import { motion } from 'framer-motion';
import { getSubjectTheme } from '../../../utils/studentDashboardUtils';

const DashboardHero = ({ studentName, activityCount, continueData, onOpenTask }) => {
  const featured = continueData?.task;
  const theme = featured ? getSubjectTheme(featured) : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-emerald-700 to-teal-700 text-white shadow-lg shadow-primary/15"
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute bottom-0 left-10 w-40 h-40 rounded-full bg-emerald-300/20 blur-2xl" />
      </div>

      <div className="relative p-6 sm:p-8 lg:p-10">
        <div className="min-w-0">
          <p className="text-emerald-100 text-sm font-medium">Ruang Belajar</p>
          <h1 className="text-3xl sm:text-4xl font-bold mt-2 leading-tight">
            Halo, {studentName || 'Pelajar'} 👋
          </h1>
          <p className="text-emerald-50/90 mt-3 text-base sm:text-lg">
            Selamat datang kembali.
          </p>
          <p className="text-white/90 mt-2 text-sm sm:text-base">
            Hari ini kamu memiliki{' '}
            <span className="font-bold">{activityCount}</span>{' '}
            aktivitas belajar.
          </p>

          {featured ? (
            <div className="mt-6 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 max-w-lg">
              <p className="text-xs uppercase tracking-widest text-emerald-100 font-semibold">Modul terakhir</p>
              <p className="font-bold text-lg mt-1 line-clamp-2">{featured.title}</p>
              <p className="text-sm text-emerald-50 mt-1">{theme?.label} · Guru: {featured.guru || 'Guru'}</p>
              <motion.button
                type="button"
                onClick={() => onOpenTask(featured)}
                whileTap={{ scale: 0.98 }}
                className="mt-4 px-5 py-2.5 rounded-xl bg-white text-primary text-sm font-bold hover:bg-emerald-50 transition-colors"
              >
                Lanjutkan Belajar
              </motion.button>
            </div>
          ) : null}
        </div>
      </div>
    </motion.section>
  );
};

export default DashboardHero;
