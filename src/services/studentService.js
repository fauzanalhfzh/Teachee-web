import axiosClient from '../api/axiosClient';

export async function getStudentTasks() {
  const response = await axiosClient.get('/quizzes');
  return response.data;
}

const unwrapList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.modules)) {
    return data.modules;
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

  if (Array.isArray(data?.data?.items)) {
    return data.data.items;
  }

  if (Array.isArray(data?.data?.results)) {
    return data.data.results;
  }

  if (Array.isArray(data?.data?.modules)) {
    return data.data.modules;
  }

  return [];
};

export async function getStudentModules(limit = 50, offset = 0) {
  try {
    const response = await axiosClient.get('/student/modules', { params: { limit, offset } });
    return unwrapList(response.data);
  } catch (error) {
    if (error?.response?.status === 400 || error?.response?.status === 422) {
      const response = await axiosClient.get('/student/modules');
      return unwrapList(response.data);
    }
    throw error;
  }
}

export async function getStudentModuleDetail(moduleId) {
  const response = await axiosClient.get(`/student/modules/${moduleId}`);
  return response.data;
}

export async function completeStudentModuleContent(moduleId) {
  const response = await axiosClient.post(`/student/modules/${moduleId}/complete-content`);
  return response.data;
}

export async function submitStudentModuleExercises(moduleId, payload) {
  const response = await axiosClient.post(`/student/modules/${moduleId}/submit-exercises`, payload);
  return response.data;
}
