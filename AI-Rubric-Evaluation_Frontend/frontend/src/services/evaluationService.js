
const API_BASE_URL = "http://127.0.0.1:8000";

export async function evaluateWithAgents(payload) {
  const response = await fetch(
    `${API_BASE_URL}/api/multi-agent-evaluate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
