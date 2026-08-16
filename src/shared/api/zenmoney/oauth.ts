import {
    getRedirectUri,
    isOAuthConfigured,
    ZENMONEY_AUTHORIZE_URL,
    ZENMONEY_CLIENT_ID,
    ZENMONEY_CLIENT_SECRET,
} from "./config"
import { zenmoneyRequest } from "./http"
import type { ZenMoneyToken } from "./types"

const OAUTH_STATE_KEY = "zenmoney-oauth-state"

export function createAuthorizeUrl() {
    if (!isOAuthConfigured()) {
        throw new Error("OAuth для ZenMoney не настроен")
    }

    const state = crypto.randomUUID()
    sessionStorage.setItem(OAUTH_STATE_KEY, state)

    const params = new URLSearchParams({
        response_type: "code",
        client_id: ZENMONEY_CLIENT_ID,
        redirect_uri: getRedirectUri(),
        state,
    })

    return `${ZENMONEY_AUTHORIZE_URL}?${params.toString()}`
}

export function consumeOAuthState() {
    const expected = sessionStorage.getItem(OAUTH_STATE_KEY)
    sessionStorage.removeItem(OAUTH_STATE_KEY)
    return expected
}

export async function exchangeCode(code: string): Promise<ZenMoneyToken> {
    const body = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: ZENMONEY_CLIENT_ID,
        client_secret: ZENMONEY_CLIENT_SECRET,
        code,
        redirect_uri: getRedirectUri(),
    })

    const response = await zenmoneyRequest("/oauth2/token/", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
    })

    return (await response.json()) as ZenMoneyToken
}

export async function refreshAccessToken(
    refreshToken: string,
): Promise<ZenMoneyToken> {
    const body = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: ZENMONEY_CLIENT_ID,
        client_secret: ZENMONEY_CLIENT_SECRET,
        refresh_token: refreshToken,
    })

    const response = await zenmoneyRequest("/oauth2/token/", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
    })

    return (await response.json()) as ZenMoneyToken
}
