import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import DashboardHero from './dashboard/DashboardHero';
import ContinueLearningCard from './dashboard/ContinueLearningCard';
import ClassroomInsights from './dashboard/ClassroomInsights';
import ActivityTimeline from './dashboard/ActivityTimeline';
import PremiumModuleCard from './dashboard/PremiumModuleCard';
import AnnouncementsCard from './dashboard/AnnouncementsCard';
import PersonalNotesCard from './dashboard/PersonalNotesCard';
import AiAssistantFab from './dashboard/AiAssistantFab';
import {
  getActiveTasks,
  getContinueTask,
  buildClassroomInsights,
  buildActivityTimeline,
  buildAnnouncements,
} from '../../utils/studentDashboardUtils';

const EmptyState = () => (
  <motion.section
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    className="rounded-[2rem] border border-dashed border-gray-200 bg-white p-10 sm:p-12 text-center"
  >
    <div className="text-5xl mb-4">🎉</div>
    <h3 className="text-xl font-bold text-gray-900">Belum ada tugas</h3>
    <p className="text-gray-500 mt-2 max-w-md mx-auto">
      Nikmati waktu belajarmu sambil menunggu guru mengassign modul baru.
    </p>
  </motion.section>
);

const StudentDashboard = ({
  tasks = [],
  onOpenTask,
  onTabChange,
  studentName,
  studentEmail = '',
}) => {
  const activeTasks = useMemo(() => getActiveTasks(tasks), [tasks]);
  const continueData = useMemo(() => getContinueTask(tasks, studentEmail), [tasks, studentEmail]);
  const insights = useMemo(() => buildClassroomInsights(tasks), [tasks]);
  const timeline = useMemo(() => buildActivityTimeline(tasks), [tasks]);
  const announcements = useMemo(() => buildAnnouncements(tasks), [tasks]);

  return (
    <main className="w-full min-h-[calc(100dvh-4rem)] bg-[#F4F6F5] pb-24 md:pb-10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-8">
          <div className="space-y-8 min-w-0">
            <ContinueLearningCard continueData={continueData} onOpenTask={onOpenTask} />

            <DashboardHero
              studentName={studentName}
              activityCount={activeTasks.length}
              continueData={continueData}
              onOpenTask={onOpenTask}
            />

            <ClassroomInsights insights={insights} />

            <ActivityTimeline items={timeline} onOpenTask={onOpenTask} />

            <section id="learning-modules">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">Modul Belajar</h2>
                {tasks.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onTabChange?.('tugas')}
                    className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5"
                  >
                    Lihat Semua
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                )}
              </div>

              {tasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {tasks.map((task, index) => (
                    <PremiumModuleCard
                      key={task.id}
                      task={task}
                      onOpenTask={onOpenTask}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState />
              )}
            </section>

            <div className="xl:hidden space-y-5">
              <PersonalNotesCard studentEmail={studentEmail} />
              <AnnouncementsCard announcements={announcements} />
            </div>
          </div>

          <aside className="hidden xl:block space-y-5">
            <PersonalNotesCard studentEmail={studentEmail} />
            <AnnouncementsCard announcements={announcements} />
          </aside>
        </div>
      </div>

      {continueData?.task && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 px-4">
          <button
            type="button"
            onClick={() => onOpenTask(continueData.task)}
            className="w-full py-3.5 rounded-2xl bg-primary text-white font-semibold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">play_arrow</span>
            Lanjutkan: {continueData.task.title}
          </button>
        </div>
      )}
    </main>
  );
};

export default StudentDashboard;
