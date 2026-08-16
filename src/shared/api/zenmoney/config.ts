export const ZENMONEY_AUTHORIZE_URL =
    "https://api.zenmoney.ru/oauth2/authorize/"

export const ZENMONEY_API_BASE = import.meta.env.DEV
    ? "/api/zenmoney"
    : "https://api.zenmoney.ru"

export const ZENMONEY_CLIENT_ID = import.meta.env.VITE_ZENMONEY_CLIENT_ID ?? ""
export const ZENMONEY_CLIENT_SECRET =
    import.meta.env.VITE_ZENMONEY_CLIENT_SECRET ?? ""

export function getRedirectUri() {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "")
    return `${window.location.origin}${base}/auth/callback`
}

export function isOAuthConfigured() {
    return Boolean(ZENMONEY_CLIENT_ID && ZENMONEY_CLIENT_SECRET)
}
