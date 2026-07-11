import React from 'react';
import avatarImg from '../assets/avatar_adventurer.png';

const NAV_ITEMS = [
  { id: 'beranda', icon: 'home', label: 'Beranda' },
  { id: 'tugas', icon: 'assignment', label: 'Tugas' },
  { id: 'pengaturan', icon: 'settings', label: 'Pengaturan' },
];

const Sidebar = ({ activeTab, onTabChange, onClose, taskBadge = 0, onSwitchRole, studentName = 'Petualang Cilik', isCollapsed = false }) => {
  const closeOnMobile = () => {
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <nav className={`hidden md:flex flex-col h-screen fixed left-0 top-0 z-50 bg-white border-r border-gray-100 transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-20' : 'w-72'}`}>
      {/* Brand */}
      <div className={`shrink-0 border-b border-gray-100 ${isCollapsed ? 'px-2 py-4' : 'px-5 py-5'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-white text-[20px]">menu_book</span>
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-base font-bold text-gray-900 leading-tight">Teacherware</p>
              <p className="text-xs text-gray-400 mt-0.5">Ruang Belajar</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className={`space-y-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => { onTabChange(item.id); closeOnMobile(); }}
                className={`flex items-center w-full text-left transition-all duration-200 ${
                  isCollapsed
                    ? `justify-center h-12 rounded-xl ${isActive ? 'bg-emerald-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`
                    : `gap-3 px-4 py-3 rounded-xl ${
                        isActive
                          ? 'bg-emerald-50 text-primary font-semibold'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                }`}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}
                >
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <>
                    <span className="text-sm flex-1">{item.label}</span>
                    {item.id === 'tugas' && taskBadge > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                        {taskBadge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom: profile + mode guru */}
      <div className={`shrink-0 border-t border-gray-100 ${isCollapsed ? 'p-2' : 'p-4'} space-y-3`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-1'}`}>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-100 shrink-0">
            <img src={avatarImg} alt="avatar" className="w-full h-full object-cover" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{studentName}</p>
              <p className="text-xs text-gray-400">Siswa</p>
            </div>
          )}
        </div>

        {onSwitchRole && (
          <button
            type="button"
            onClick={onSwitchRole}
            className={`flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors ${
              isCollapsed
                ? 'justify-center w-12 h-12 mx-auto rounded-xl'
                : 'w-full gap-3 px-3 py-2.5 rounded-xl text-left'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">manage_accounts</span>
            {!isCollapsed && <span className="text-sm font-medium">Mode Guru</span>}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Sidebar;
