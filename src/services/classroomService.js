import axiosClient from '../api/axiosClient';

export async function getClassrooms(limit = 50, offset = 0) {
  const response = await axiosClient.get('/classrooms', { params: { limit, offset } });
  return response.data;
}

export async function createClassroom(name) {
  const response = await axiosClient.post('/classrooms', { name });
  return response.data;
}

const unwrapStudentList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

export async function getClassroomStudents({ classroomId, limit = 100, offset = 0 } = {}) {
  const params = { limit, offset };
  if (classroomId) {
    params.classroom_id = classroomId;
  }
  const response = await axiosClient.get('/classrooms/students', { params });
  return unwrapStudentList(response.data);
}

export async function bulkEnrollStudents(classroomId, studentIds) {
  const response = await axiosClient.post(`/classrooms/${classroomId}/students/bulk`, {
    student_ids: studentIds,
  });
  return response.data;
}
