
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

type RequestOptions = RequestInit & {
    token?: string;
};

class ApiClient {
    private static async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        // Auto-inject token if available in localStorage
        const token = options.token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);

        const headers: HeadersInit = {
            "Content-Type": "application/json",
            ...options.headers as any,
        };

        if (token) {
            (headers as any)["Authorization"] = `Bearer ${token}`;
        }

        const config: RequestInit = {
            ...options,
            headers,
        };

        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        // Handle 401 Unauthorized globally
        if (response.status === 401 && typeof window !== 'undefined') {
            // Optional: redirect to login or clear token
            // localStorage.removeItem("token");
            // window.location.href = "/login"; 
            // Commented out to avoid aggressive redirects during development
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || `API Error: ${response.statusText}`);
        }

        return data as T;
    }

    static async get<T>(endpoint: string, options?: RequestOptions) {
        return this.request<T>(endpoint, { ...options, method: "GET" });
    }

    static async post<T>(endpoint: string, body: any, options?: RequestOptions) {
        return this.request<T>(endpoint, { ...options, method: "POST", body: JSON.stringify(body) });
    }

    static async put<T>(endpoint: string, body: any, options?: RequestOptions) {
        return this.request<T>(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) });
    }

    static async patch<T>(endpoint: string, body: any, options?: RequestOptions) {
        return this.request<T>(endpoint, { ...options, method: "PATCH", body: JSON.stringify(body) });
    }

    static async delete<T>(endpoint: string, options?: RequestOptions) {
        return this.request<T>(endpoint, { ...options, method: "DELETE" });
    }
}

export { ApiClient };
