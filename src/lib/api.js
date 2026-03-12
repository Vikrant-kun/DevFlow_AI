const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

// ── TOKEN CACHE ─────────────────────────────────────────────────────────────
let _tokenCache = { value: null, expiry: 0 };

async function getCachedToken(getAuthToken) {
    const now = Date.now();

    if (_tokenCache.value && now < _tokenCache.expiry) {
        return _tokenCache.value;
    }

    const token = await getAuthToken();

    _tokenCache = {
        value: token,
        expiry: now + 30000 // 30s safer cache
    };

    return token;
}

// ── API FETCH ───────────────────────────────────────────────────────────────
export async function apiFetch(path, options = {}, getAuthToken) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    const makeRequest = async () => {
        const token = getAuthToken ? await getCachedToken(getAuthToken) : null;

        return fetch(`${API_URL}${normalizedPath}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(options.headers || {})
            }
        });
    };

    let res = await makeRequest();

    // retry once if token expired
    if (res.status === 401 && getAuthToken) {
        console.warn("Token expired, refreshing");
        console.log("API Request:", options.method || "GET", `${API_URL}${normalizedPath}`);

        _tokenCache = { value: null, expiry: 0 };

        res = await makeRequest();
    }

    const contentType = res.headers.get("content-type");

    if (!res.ok) {
        let errorMessage = `API error ${res.status}`;

        try {
            if (contentType && contentType.includes("application/json")) {
                const errorData = await res.json();
                errorMessage = errorData.detail || errorData.message || errorMessage;
            } else {
                const text = await res.text();
                console.error("Non-JSON API error:", text.slice(0, 200));
            }
        } catch (e) {
            console.error("Error parsing API error:", e);
        }

        throw new Error(errorMessage);
    }

    if (contentType && contentType.includes("application/json")) {
        return res.json();
    }

    return res;
}