const API = process.env.REACT_APP_API_URL || 'http://localhost:8081';

export function authHeaders(headers = {}) {
    const token = localStorage.getItem('medequi_token');
    return {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
}

export function apiFetch(path, options = {}) {
    return fetch(path.startsWith('http') ? path : `${API}${path}`, {
        ...options,
        headers: authHeaders(options.headers || {})
    }).then(response => {
        if (response.status === 401 && !['/login', '/logout'].includes(path)) {
            localStorage.removeItem('medequi_user');
            localStorage.removeItem('medequi_token');
            if (window.location.pathname !== '/login') window.location.replace('/login');
        }
        return response;
    });
}
