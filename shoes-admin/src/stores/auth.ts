import { computed, ref } from 'vue';
import { API_BASE_URL } from '../utils/api';

const AUTH_TOKEN_KEY = 'shoe_factory_admin_token';
const AUTH_USER_KEY = 'shoe_factory_admin_user';

const token = ref(localStorage.getItem(AUTH_TOKEN_KEY) || '');
const username = ref(localStorage.getItem(AUTH_USER_KEY) || '');
const isAuthenticated = computed(() => Boolean(token.value));

export function getAuthHeaders() {
  return token.value ? { Authorization: `Bearer ${token.value}` } : {};
}

export function hasAuthToken() {
  return Boolean(token.value);
}

export async function login(usernameValue: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: usernameValue.trim(), password }),
  });
  const data = await response.json() as { token?: string; user?: { username?: string }; error?: string };
  if (!response.ok || !data.token) {
    throw new Error(data.error || '登录失败');
  }

  token.value = data.token;
  username.value = data.user?.username || usernameValue.trim();
  localStorage.setItem(AUTH_TOKEN_KEY, token.value);
  localStorage.setItem(AUTH_USER_KEY, username.value);
}

export function logout() {
  token.value = '';
  username.value = '';
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function useAuth() {
  return {
    token,
    username,
    isAuthenticated,
    login,
    logout,
  };
}
