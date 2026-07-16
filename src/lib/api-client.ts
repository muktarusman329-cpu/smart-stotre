export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || 'Request failed',
      };
    }

    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export async function apiGet<T>(url: string): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, { method: 'GET' });
}

export async function apiPost<T>(
  url: string,
  body?: any
): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function apiPut<T>(
  url: string,
  body?: any
): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function apiDelete<T>(url: string): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, { method: 'DELETE' });
}
