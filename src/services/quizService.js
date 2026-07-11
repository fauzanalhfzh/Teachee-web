import axiosClient from '../api/axiosClient';

export async function getOrCreateClassroom(teacherId) {
  const response = await axiosClient.get(`/classrooms`, {
    params: { teacher_id: teacherId },
  });

  if (Array.isArray(response.data) && response.data.length > 0) {
    return response.data[0];
  }

  const createResponse = await axiosClient.post('/classrooms', {
    name: 'Kelas 10A',
    teacher_id: teacherId,
  });
  return createResponse.data;
}

export async function generateQuizDraft({ teacherId, classroomId, title, subject, topic, numQuestions }) {
  const response = await axiosClient.post('/quizzes/generate', {
    classroom_id: classroomId,
    teacher_id: teacherId,
    title,
    subject,
    topic,
    num_questions: numQuestions,
  });
  return response.data;
}

export async function publishQuiz(quizId) {
  const response = await axiosClient.post(`/quizzes/${quizId}/publish`);
  return response.data;
}

export async function regenerateQuestion(questionId) {
  const response = await axiosClient.put(`/questions/${questionId}/regenerate`);
  return response.data;
}

export async function deleteQuestion(questionId) {
  const response = await axiosClient.delete(`/questions/${questionId}`);
  return response.data;
}
