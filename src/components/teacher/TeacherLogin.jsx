import React, { useState } from 'react';

const TeacherLogin = ({ onLogin, errorMessage, isLoading, onSwitchRole }) => {
  const [form, setForm] = useState({
    email: 'teacher@school.com',
    password: 'password123',
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin(form);
  };

  return (
    <main className="min-h-screen p-6 md:p-10 flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(21,94,68,0.08),_transparent_45%),linear-gradient(180deg,_#f7faf7_0%,_#eef6ef_100%)]">
      <div className="w-full max-w-md glass-panel rounded-[32px] p-8 md:p-10 border-2 border-primary-container/20 shadow-ambient-tier-2 bg-white/95 backdrop-blur-sm">
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed/30 text-primary text-label-sm font-bold mb-3">
            <span className="material-symbols-outlined text-base">lock</span>
            Login Guru
          </span>
          <h1 className="font-headline-md text-2xl text-primary font-bold">Masuk ke panel teacher</h1>
          <p className="text-on-surface-variant mt-2">Gunakan akun Teacherware yang sudah disiapkan oleh admin.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex flex-col gap-2">
            <span className="font-label-md text-primary font-bold">Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) => update('email', event.target.value)}
              className="px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-label-md text-primary font-bold">Password</span>
            <input
              type="password"
              required
              value={form.password}
              onChange={(event) => update('password', event.target.value)}
              className="px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </label>

          {errorMessage ? (
            <div className="rounded-2xl border border-error/30 bg-error-container/30 px-4 py-3 text-sm text-error font-semibold">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-ambient-tier-3 hover:bg-primary-container active:scale-95 transition-all disabled:opacity-60"
          >
            {isLoading ? 'Memeriksa akun...' : 'Masuk'}
          </button>
        </form>

        <p className="text-sm text-on-surface-variant mt-4">
          Default akun backend: <span className="font-semibold text-primary">teacher@school.com</span> / <span className="font-semibold text-primary">password123</span>
        </p>

        {onSwitchRole ? (
          <button
            type="button"
            onClick={onSwitchRole}
            className="mt-5 w-full px-6 py-3 rounded-2xl border border-primary/20 text-primary font-bold hover:bg-primary-fixed/20 transition-all"
          >
            Kembali ke Mode Anak
          </button>
        ) : null}
      </div>
    </main>
  );
};

export default TeacherLogin;
