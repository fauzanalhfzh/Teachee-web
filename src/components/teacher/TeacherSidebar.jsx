import React, { useState } from 'react';

const STEPS = [
  { id: 'input', icon: 'edit_note', label: 'Input Kriteria' },
  { id: 'review', icon: 'fact_check', label: 'Review Soal' },
  { id: 'publish', icon: 'publish', label: 'Publish' },
];

const CIRCLE_COLORS = [
  'bg-orange-500', 'bg-teal-600', 'bg-blue-700',
  'bg-green-600', 'bg-purple-600', 'bg-rose-500',
];

const TeacherSidebar = ({
  activeStep,
  onStepChange,
  onClose,
  onSwitchRole,
  isGenerating,
  unlockedSteps = ['classrooms', 'input'],
  classrooms = [],
  selectedClassroom = null,
  onSelectClassroom,
  isCollapsed = false,
}) => {
  const [teachingOpen, setTeachingOpen] = useState(true);
  const inQuizFlow = selectedClassroom && ['input', 'review', 'publish', 'generating'].includes(activeStep);
  const closeOnMobile = () => {
    if (window.innerWidth < 768) onClose();
  };

  return (
    <>
      <nav className={`flex flex-col h-screen fixed left-0 top-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-20' : 'w-72'}`}>

        {/* Logo Row */}
        <div className={`flex items-center h-16 border-b border-gray-100 shrink-0 ${isCollapsed ? 'justify-center px-2' : 'gap-2 px-4'}`}>
          <div className={`flex items-center ${isCollapsed ? 'gap-0' : 'gap-2 ml-1'}`}>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px]">school</span>
            </div>
            {!isCollapsed && <span className="text-base font-semibold text-gray-700">Teacherware</span>}
          </div>
        </div>

        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
          {/* Beranda */}
          <button
            type="button"
            onClick={() => { onStepChange('classrooms'); closeOnMobile(); }}
            className={`flex items-center ${isCollapsed ? 'justify-center px-0 mx-auto w-12 h-12 rounded-full' : 'gap-4 px-4 py-2.5 w-[calc(100%-12px)] rounded-r-full'} text-left transition-all ${
              activeStep === 'classrooms' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: activeStep === 'classrooms' ? "'FILL' 1" : undefined }}>
              home
            </span>
            {!isCollapsed && <span className="text-sm">Beranda</span>}
          </button>

          {/* Kalender */}
          <button
            type="button"
            className={`flex items-center ${isCollapsed ? 'justify-center px-0 mx-auto w-12 h-12 rounded-full' : 'gap-4 px-4 py-2.5 w-[calc(100%-12px)] rounded-r-full'} text-gray-700 hover:bg-gray-100 transition-all text-left`}
          >
            <span className="material-symbols-outlined text-[22px]">calendar_today</span>
            {!isCollapsed && <span className="text-sm">Kalender</span>}
          </button>

          {!isCollapsed && <div className="my-2 border-t border-gray-100" />}

          {/* Teaching section */}
          <div>
            <button
              onClick={() => setTeachingOpen((p) => !p)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-4 py-2'} text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-50 transition-colors`}
            >
              {!isCollapsed && <span>Teaching</span>}
              {!isCollapsed && (
                <span className="material-symbols-outlined text-base text-gray-400">
                  {teachingOpen ? 'expand_less' : 'expand_more'}
                </span>
              )}
            </button>

            {!isCollapsed && teachingOpen && (
              <div className="mt-0.5 space-y-0.5">
                {classrooms.map((cls, idx) => (
                  <button
                    key={cls.id}
                    onClick={() => { onSelectClassroom?.(cls); closeOnMobile(); }}
                    className={`flex items-center gap-3 px-4 py-2 w-[calc(100%-12px)] rounded-r-full text-left transition-all ${
                      selectedClassroom?.id === cls.id
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${CIRCLE_COLORS[idx % CIRCLE_COLORS.length]}`}>
                      {cls.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm truncate">{cls.name}</span>
                  </button>
                ))}
                <button
                  onClick={() => { onStepChange('classrooms'); closeOnMobile(); }}
                  className="flex items-center gap-3 px-4 py-2 w-[calc(100%-12px)] rounded-r-full text-blue-600 hover:bg-blue-50 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  <span className="text-sm">Kelola Kelas</span>
                </button>
              </div>
            )}
          </div>

          {/* Quiz Steps — shown when class selected and in quiz flow */}
          {inQuizFlow && !isCollapsed && (
            <>
              <div className="my-2 border-t border-gray-100" />
              <div className="px-4 pt-1 pb-0.5">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Buat Kuis</p>
              </div>
              {isGenerating && (
                <div className="flex items-center gap-3 mx-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm">
                  <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                  <span>AI sedang membuat soal...</span>
                </div>
              )}
              {STEPS.map((step) => {
                const isUnlocked = unlockedSteps.includes(step.id);
                const isActive = activeStep === step.id;
                return (
                  <button
                    key={step.id}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => { if (isUnlocked) { onStepChange(step.id); closeOnMobile(); } }}
                    className={`flex items-center gap-4 px-4 py-2.5 w-[calc(100%-12px)] rounded-r-full text-left transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : isUnlocked
                          ? 'text-gray-700 hover:bg-gray-100'
                          : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {!isUnlocked ? 'lock' : step.icon}
                    </span>
                    <span className="text-sm">{step.label}</span>
                    {!isUnlocked && <span className="ml-auto text-xs text-gray-400">Terkunci</span>}
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Bottom */}
        <div className={`border-t border-gray-100 p-3 shrink-0 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button
            type="button"
            onClick={onSwitchRole}
            className={`flex items-center ${isCollapsed ? 'justify-center w-12 h-12 px-0 rounded-full' : 'w-full gap-3 px-3 py-2.5 rounded-lg'} text-gray-700 hover:bg-gray-100 transition-colors text-left`}
          >
            <span className="material-symbols-outlined text-[22px]">child_care</span>
            {!isCollapsed && <span className="text-sm font-medium">Mode Anak</span>}
          </button>
        </div>
      </nav>
    </>
  );
};

export default TeacherSidebar;
