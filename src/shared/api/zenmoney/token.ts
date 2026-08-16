const ACCESS_TOKEN_KEY = "zenmoney-access-token"
const REFRESH_TOKEN_KEY = "zenmoney-refresh-token"
const EXPIRES_AT_KEY = "zenmoney-token-expires-at"

export function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function saveToken(token: {
    access_token: string
    refresh_token?: string
    expires_in?: number
}) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token.access_token)

    if (token.refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, token.refresh_token)
    }

    if (token.expires_in) {
        localStorage.setItem(
            EXPIRES_AT_KEY,
            String(Date.now() + token.expires_in * 1000),
        )
    }
}

export function clearToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(EXPIRES_AT_KEY)
}

export function isAuthenticated() {
    return Boolean(getAccessToken())
}
