import axiosClient from '../api/axiosClient';

export async function loginUser({ email, password, tokenKey = 'auth_token', role = 'teacher' }) {
  const response = await axiosClient.post('/auth/login', { email, password });
  const { access_token } = response.data;
  localStorage.setItem(tokenKey, access_token);
  localStorage.setItem('auth_token', access_token);
  localStorage.setItem('auth_role', role);

  const profile = await axiosClient.get('/auth/me');
  return { access_token, user: profile.data };
}

export async function loginTeacher({ email, password }) {
  return loginUser({ email, password, tokenKey: 'teacher_token', role: 'teacher' });
}

export async function loginStudent({ email, password }) {
  return loginUser({ email, password, tokenKey: 'student_token', role: 'student' });
}

export async function getCurrentUser() {
  const response = await axiosClient.get('/auth/me');
  return response.data;
}

export function logoutTeacher() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_role');
  localStorage.removeItem('teacher_token');
}

export function logoutStudent() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_role');
  localStorage.removeItem('student_token');
}

export function getAuthToken() {
  return localStorage.getItem('auth_token') || localStorage.getItem('teacher_token') || localStorage.getItem('student_token');
}

export function getAuthRole() {
  return localStorage.getItem('auth_role');
}

export async function changePassword({ oldPassword, newPassword }) {
  const response = await axiosClient.post('/auth/change-password', {
    old_password: oldPassword,
    new_password: newPassword,
  });
  return response.data;
}

export function getApiErrorMessage(error, fallback = 'Terjadi kesalahan.') {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const messages = detail.map((item) => item?.msg || item?.message).filter(Boolean);
    if (messages.length > 0) return messages.join(', ');
  }
  return fallback;
}
