import React from 'react';

const NAV_ITEMS = [
  { id: 'beranda', icon: 'home', label: 'Beranda' },
  { id: 'tugas', icon: 'assignment', label: 'Tugas' },
  { id: 'pengaturan', icon: 'settings', label: 'Pengaturan' },
];

const StudentBottomNav = ({ activeTab, onTabChange, taskBadge = 0 }) => (
  <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] px-2 pb-[env(safe-area-inset-bottom)]">
    <div className="grid grid-cols-3">
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={`relative flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors ${
              isActive ? 'text-primary' : 'text-gray-500'
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
            {item.id === 'tugas' && taskBadge > 0 && (
              <span className="absolute top-2 right-[calc(50%-22px)] w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {taskBadge > 9 ? '9+' : taskBadge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  </nav>
);

export default StudentBottomNav;
