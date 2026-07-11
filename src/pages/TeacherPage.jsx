import React from 'react';
import TeacherLogin from '../components/teacher/TeacherLogin';
import TeacherInputCriteria from '../components/teacher/TeacherInputCriteria';
import TeacherAIGenerating from '../components/teacher/TeacherAIGenerating';
import TeacherReviewDraft from '../components/teacher/TeacherReviewDraft';
import TeacherPublishAssign from '../components/teacher/TeacherPublishAssign';
import TeacherPublishSuccess from '../components/teacher/TeacherPublishSuccess';
import TeacherClassroomPicker from '../components/teacher/TeacherClassroomPicker';

const TeacherPage = ({
  teacherStep,
  teacherCriteria,
  draftQuestions,
  draftQuiz,
  backendError,
  isSyncing,
  publishedAssignment,
  onLogin,
  onGenerate,
  onPublish,
  onRegenerate,
  onRegenerateQuestion,
  onDeleteQuestion,
  onUpdateQuestion,
  onBack,
  onDone,
  onSelectClassroom,
  onClassroomsLoaded,
  selectedClassroom,
  createClassRequest,
}) => {
  switch (teacherStep) {
    case 'login':
      return <TeacherLogin onLogin={onLogin} errorMessage={backendError} isLoading={isSyncing} />;
    case 'classrooms':
      return (
        <TeacherClassroomPicker
          onSelectClassroom={onSelectClassroom}
          onClassroomsLoaded={onClassroomsLoaded}
          selectedClassroom={selectedClassroom}
          createClassRequest={createClassRequest}
        />
      );
    case 'input':
      return <TeacherInputCriteria onGenerate={onGenerate} errorMessage={backendError} isSyncing={isSyncing} />;
    case 'generating':
      return <TeacherAIGenerating criteria={teacherCriteria} />;
    case 'review':
      return (
        <TeacherReviewDraft
          criteria={teacherCriteria}
          questions={draftQuestions}
          backendStatus={draftQuiz ? 'Tersinkronisasi dengan Teacherware' : null}
          onPublish={onPublish}
          onRegenerate={onRegenerate}
          onRegenerateQuestion={onRegenerateQuestion}
          onDeleteQuestion={onDeleteQuestion}
          onUpdateQuestion={onUpdateQuestion}
          isSaving={isSyncing}
        />
      );
    case 'publish':
      return (
        <TeacherPublishAssign
          criteria={teacherCriteria}
          draftQuiz={draftQuiz}
          quizTitle={draftQuiz?.title || teacherCriteria?.prompt || ''}
          questionCount={draftQuestions.length || 3}
          backendStatus={draftQuiz ? 'Tersinkronisasi dengan Teacherware' : null}
          isSaving={isSyncing}
          onPublish={onPublish}
          onBack={onBack}
        />
      );
    case 'success':
      return <TeacherPublishSuccess assignment={publishedAssignment} onDone={onDone} />;
    default:
      return (
        <TeacherClassroomPicker
          onSelectClassroom={onSelectClassroom}
          onClassroomsLoaded={onClassroomsLoaded}
          selectedClassroom={selectedClassroom}
          createClassRequest={createClassRequest}
        />
      );
  }
};

export default TeacherPage;
