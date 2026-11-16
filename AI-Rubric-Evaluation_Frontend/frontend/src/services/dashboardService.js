
import { getAccessToken, logoutUser } from "./authService";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

export async function getMySubmissions() {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Your session has expired. Please log in again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/submissions/me`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 401) {
    logoutUser();
    throw new Error("Your session has expired. Please log in again.");
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Unable to retrieve your assessment history."
    );
  }

  return data;
}
