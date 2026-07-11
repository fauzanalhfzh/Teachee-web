import React from 'react';
import StudentTaskNotification from '../components/student/StudentTaskNotification';
import StudentAssignment from '../components/student/StudentAssignment';
import StudentGradingResult from '../components/student/StudentGradingResult';
import StudentDashboard from '../components/student/StudentDashboard';
import StudentLearningFlow from '../components/student/StudentLearningFlow';
import ChangePasswordForm from '../components/ChangePasswordForm';

const StudentPage = ({
  activeTab,
  studentTaskFlow,
  activeTask,
  gradingResult,
  tasks,
  coins,
  onSelectSubject,
  onOpenTask,
  onSubmitAssignment,
  onSubmitLearningQuiz,
  onCompleteLearningContent,
  onSubmitLearningExercises,
  onBack,
  onContinue,
  onLearnAgain,
  onTabChange,
  practiceMode = false,
  studentName,
  studentEmail = '',
}) => {
  if (studentTaskFlow === 'assignment' && activeTask?.learningFlow) {
    return (
      <StudentLearningFlow
        task={activeTask}
        onBack={onBack}
        onSubmitLearningQuiz={onSubmitLearningQuiz}
        onCompleteLearningContent={onCompleteLearningContent}
        onSubmitLearningExercises={onSubmitLearningExercises}
      />
    );
  }

  if (studentTaskFlow === 'assignment') {
    return <StudentAssignment task={activeTask} onSubmit={onSubmitAssignment} onBack={onBack} practiceMode={practiceMode} />;
  }

  if (studentTaskFlow === 'grading') {
    return (
      <StudentGradingResult
        score={gradingResult?.score ?? 0}
        total={gradingResult?.total ?? 3}
        percentage={gradingResult?.percentage}
        xpEarned={gradingResult?.xp ?? 0}
        passed80={gradingResult?.passed80}
        practiceSummary={gradingResult?.practiceSummary}
        onContinue={onContinue}
        onLearnAgain={onLearnAgain}
      />
    );
  }

  if (activeTab === 'tugas') {
    return <StudentTaskNotification tasks={tasks} onOpenTask={onOpenTask} />;
  }

  if (activeTab === 'pengaturan') {
    return (
      <main className="w-full min-h-[calc(100dvh-4rem)] bg-gray-50 px-4 py-6 sm:px-6 md:px-8 md:py-10 pb-24 md:pb-10 flex justify-center items-center">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="text-center mb-6">
            <span className="text-5xl mb-4 block">⚙️</span>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Pengaturan</h2>
            <p className="text-gray-500">Kelola akun dan preferensi belajar kamu.</p>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Keamanan Akun</h3>
            <ChangePasswordForm />
          </div>

          <button className="mt-6 w-full px-6 py-3 bg-primary text-white font-bold rounded-xl" onClick={() => onTabChange('beranda')}>
            Kembali ke Beranda
          </button>
        </div>
      </main>
    );
  }

  // default: beranda — show dashboard with task cards
  return (
    <StudentDashboard
      tasks={tasks}
      onOpenTask={onOpenTask}
      onSelectSubject={onSelectSubject}
      onTabChange={onTabChange}
      studentName={studentName}
      studentEmail={studentEmail}
    />
  );
};

export default StudentPage;
