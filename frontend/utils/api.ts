export const API_BASE_URL = "http://localhost:5001/api"; // Replace with actual API URL

export async function apiRequest<T>(
  endpoint: string,
  method: string = "GET",
  body?: any,
  headers: HeadersInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
