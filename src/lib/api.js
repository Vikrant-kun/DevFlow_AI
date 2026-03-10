const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Centralized API fetch helper
 * @param {string} path - API endpoint path (e.g. '/github/repos')
 * @param {object} options - Standard fetch options
 * @param {function} getAuthToken - Function to retrieve Clerk auth token
 */
export async function apiFetch(path, options = {}, getAuthToken) {
    const token = getAuthToken ? await getAuthToken() : null;

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
            ...(options.headers || {})
        }
    });

    // Handle non-JSON responses (like HTML errors from Railway/Vercel)
    const contentType = res.headers.get("content-type");
    if (!res.ok) {
        let errorMessage = `API error ${res.status}`;
        try {
            if (contentType && contentType.includes("application/json")) {
                const errorData = await res.json();
                errorMessage = errorData.detail || errorData.message || errorMessage;
            } else {
                const text = await res.text();
                console.error("Non-JSON API Error:", res.status, text.substring(0, 200));
            }
        } catch (e) {
            console.error("Error parsing API error response:", e);
        }
        throw new Error(errorMessage);
    }

    if (contentType && contentType.includes("application/json")) {
        return res.json();
    }

    return res;
}
