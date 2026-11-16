
import { getAccessToken, logoutUser } from "./authService";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

// Existing individual AI evaluation function.
export async function evaluateWithAgents(payload) {
  const token = getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/api/multi-agent-evaluate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Unable to complete the evaluation."
    );
  }

  if (!data.evaluation || !data.verification) {
    throw new Error("The backend returned an incomplete evaluation.");
  }

  return data;
}

// New persistent assessment submission function.
export async function submitAssessment(answers) {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Your session has expired. Please log in again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/submissions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        assessment_id: 2,
        answers,
      }),
    }
  );

  if (response.status === 401) {
    logoutUser();
    throw new Error("Your session has expired. Please log in again.");
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Unable to submit your assessment."
    );
  }

  return data;
}
