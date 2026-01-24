// Aegis API Client

const API_BASE = '';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

class ApiClient {
  private getAuthToken(): string | null {
    try {
      const authData = localStorage.getItem('aegis-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.tokens?.accessToken || null;
      }
    } catch {
      return null;
    }
    return null;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown
  ): Promise<T> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const json: ApiResponse<T> = await response.json();

    if (!response.ok || !json.success) {
      const error = new Error(json.error?.message || 'Request failed') as any;
      error.response = { data: json, status: response.status };
      throw error;
    }

    return json.data as T;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>('PUT', endpoint, data);
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }
}

export const api = new ApiClient();
