import React from 'react';

const StudentTaskNotification = ({ tasks = [], onOpenTask }) => {
  const newCount = tasks.filter((t) => t.isNew).length;

  return (
    <main className="w-full min-h-[calc(100dvh-4rem)] p-6 md:p-8 pb-24 md:pb-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-headline-md text-2xl text-primary font-bold">Tugas Baru!</h1>
          <p className="text-on-surface-variant mt-2">
            {newCount > 0 ? `Kamu punya ${newCount} tugas baru dari guru.` : 'Semua tugas sudah dikerjakan.'}
          </p>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => onOpenTask(task)}
              className={`w-full text-left glass-panel rounded-2xl p-5 border-2 transition-all ${
                task.isNew
                  ? 'border-secondary-container/60 bg-secondary-fixed/10 hover:scale-[1.01] shadow-ambient-tier-2 cursor-pointer'
                  : 'border-outline-variant/30 opacity-70 hover:opacity-100 cursor-pointer'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${task.isNew ? 'bg-secondary-container' : 'bg-surface-container'}`}>
                  <span className={`material-symbols-outlined text-2xl ${task.isNew ? 'text-on-secondary-container' : 'text-primary'}`}>{task.isNew ? 'assignment' : 'task_alt'}</span>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-primary">{task.title}</h3>
                    {task.isNew && (
                      <span className="px-2 py-0.5 rounded-full bg-error text-white text-label-sm font-bold">Baru</span>
                    )}
                    {!task.isNew && (
                      <span className="px-2 py-0.5 rounded-full bg-primary-fixed/30 text-primary text-label-sm font-bold">Selesai</span>
                    )}
                  </div>
                  <p className="text-sm text-on-surface-variant">{task.subject} · {task.guru} · {task.soal} soal</p>
                  <p className="text-label-sm text-outline mt-1">Deadline: {task.deadline}</p>
                </div>
                <span className="material-symbols-outlined text-primary">chevron_right</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
};

export default StudentTaskNotification;
