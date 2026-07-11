import axiosClient from '../api/axiosClient';

const unwrapModuleList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

export async function listModules(limit = 50, offset = 0) {
  const response = await axiosClient.get('/modules', { params: { limit, offset } });
  return unwrapModuleList(response.data);
}

export async function getModule(moduleId) {
  const response = await axiosClient.get(`/modules/${moduleId}`);
  return response.data;
}

export async function generateModule({ classroomId, topic, numSections = 4, numExercises = 6 }) {
  const response = await axiosClient.post('/modules/generate', {
    classroom_id: classroomId,
    topic,
    num_sections: numSections,
    num_exercises: numExercises,
  }, {
    timeout: 180000,
  });
  return response.data;
}

export async function publishModule(moduleId) {
  const response = await axiosClient.post(`/modules/${moduleId}/publish`);
  return response.data;
}

export async function deleteModule(moduleId) {
  const response = await axiosClient.delete(`/modules/${moduleId}`);
  return response.data;
}

export async function generateModuleImages(moduleId) {
  const response = await axiosClient.post(`/modules/${moduleId}/generate-images`, {}, {
    timeout: 180000,
  });
  return response.data;
}

export async function updateModule(moduleId, { title, topic, sections, exercises }) {
  const payload = {};
  if (title !== undefined) payload.title = title;
  if (topic !== undefined) payload.topic = topic;
  if (sections !== undefined) {
    payload.sections = sections.map((section) => ({
      id: section.id,
      title: section.title,
      content: section.content,
      image_url: section.image_url,
      image_prompt: section.image_prompt,
    }));
  }
  if (exercises !== undefined) {
    payload.exercises = exercises.map((exercise) => ({
      id: exercise.id,
      question_text: exercise.question_text,
      correct_answer: exercise.correct_answer,
      exercise_type: exercise.exercise_type,
    }));
  }
  const response = await axiosClient.patch(`/modules/${moduleId}`, payload);
  return response.data;
}