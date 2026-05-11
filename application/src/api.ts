const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
const ACCESS_TOKEN_STORAGE_KEY = 'access_token'

export function getAccessToken() {
    if (typeof window === 'undefined') {
        return null
    }

    return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
}

export function setAccessToken(accessToken: string) {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken)
}

export function removeAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const accessToken = getAccessToken()

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            ...(options.headers || {}),
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
    })

    if (response.status === 401) {
        removeAccessToken()
        throw new Error('Требуется повторная авторизация')
    }

    if (!response.ok) {
        throw new Error('Ошибка запроса')
    }

    return response.json()
}