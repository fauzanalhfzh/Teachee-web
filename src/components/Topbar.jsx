import React, { useState, useRef, useEffect } from 'react';
import avatarImg from '../assets/avatar_adventurer.png';
import ChangePasswordForm from './ChangePasswordForm';

const CoinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#fdb913" />
    <circle cx="12" cy="12" r="8" fill="none" stroke="#fff" strokeWidth="1.5" />
    <text x="12" y="16.5" fontSize="13" fontWeight="900" textAnchor="middle" fill="#fff">$</text>
  </svg>
);

const Topbar = ({ coins = 1240, onToggleMenu, role = 'student', onLogout, onCreateClass }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center h-16 px-4 bg-white border-b border-gray-100 shadow-sm transition-[padding-left] duration-300 pl-4 md:pl-[var(--sidebar-offset)]">
      <button
        type="button"
        className={`p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors shrink-0 ${role === 'student' ? 'hidden md:inline-flex' : ''}`}
        onClick={onToggleMenu}
        aria-label="Toggle sidebar"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {role === 'student' && (
        <span className="text-base font-semibold text-gray-800">Teacherware</span>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-1 sm:gap-2">

        {role === 'teacher' && (
          <button
            type="button"
            onClick={onCreateClass}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Buat Kelas
          </button>
        )}

        {role === 'teacher' ? (
          <div className="relative ml-1" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((p) => !p)}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-200 hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            >
              <img src={avatarImg} alt="Profile" className="w-full h-full object-cover" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-xs text-gray-500">Masuk sebagai</p>
                  <p className="text-sm font-semibold text-gray-800">Guru</p>
                </div>
                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => { setDropdownOpen(false); setShowChangePassword(true); }}
                >
                  <span className="material-symbols-outlined text-base text-gray-500">lock</span>
                  Ganti Password
                </button>
                <hr className="my-1 border-gray-100" />
                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  onClick={() => { setDropdownOpen(false); onLogout?.(); }}
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  Keluar
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-200 ml-1">
            <img src={avatarImg} alt="Profile" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Ganti Password</h3>
              <button
                type="button"
                onClick={() => setShowChangePassword(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <ChangePasswordForm
              compact
              onCancel={() => setShowChangePassword(false)}
              onSuccess={() => setShowChangePassword(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Topbar;
