
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

const TOKEN_KEY = "rubricai_access_token";
const USER_KEY = "rubricai_user";

export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Login failed. Please try again.");
  }

  if (!data.access_token || !data.user) {
    throw new Error("Invalid login response from the server.");
  }

  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));

  return data.user;
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const storedUser = localStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export async function getCurrentUser() {
  const token = getAccessToken();

  if (!token) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/api/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    logoutUser();
    return null;
  }

  const data = await response.json();

  if (!data.user) {
    logoutUser();
    return null;
  }

  localStorage.setItem(USER_KEY, JSON.stringify(data.user));

  return data.user;
}

export function logoutUser() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
