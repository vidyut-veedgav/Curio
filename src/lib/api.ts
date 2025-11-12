class APIError extends Error {
    constructor(public status: number, message: string, public data?: any) {
        super(message);
        this.name = "APIError";
    }
}

class APIClient {
    private baseURL: string;

    constructor(baseURL: string = "/api") {
        this.baseURL = baseURL;
    }

    private async request<T>(
        endpoint: string,
        options?: RequestInit
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        const config: RequestInit = {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
        };

        try {
            const response = await fetch(url, config);

            // Handle non-OK responses
            if (!response.ok) {
                let errorMessage = "Request failed";
                let errorData;

                try {
                    errorData = await response.json();
                    errorMessage =
                        errorData.message || errorData.error || errorMessage;
                } catch {
                    // If response is not JSON, use status text
                    errorMessage = response.statusText || errorMessage;
                }

                throw new APIError(response.status, errorMessage, errorData);
            }

            // Handle 204 No Content
            if (response.status === 204) {
                return undefined as T;
            }

            // Parse and return JSON
            return await response.json();
        } catch (error) {
            // Re-throw APIError as-is
            if (error instanceof APIError) {
                throw error;
            }

            // Wrap other errors (network errors, etc.)
            if (error instanceof Error) {
                throw new APIError(0, error.message);
            }

            // Unknown error
            throw new APIError(0, "An unknown error occurred");
        }
    }

    async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: "GET",
        });
    }

    async post<T, D = unknown>(
        endpoint: string,
        data?: D,
        options?: RequestInit
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: "POST",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T, D = unknown>(
        endpoint: string,
        data?: D,
        options?: RequestInit
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: "PUT",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async patch<T, D = unknown>(
        endpoint: string,
        data?: D,
        options?: RequestInit
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: "PATCH",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: "DELETE",
        });
    }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export error class for error handling
export { APIError };
