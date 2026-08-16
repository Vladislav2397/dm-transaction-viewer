import { zenmoneyRequest } from "./http"
import { getAccessToken } from "./token"
import type { ZenMoneyDiff } from "./types"

export async function fetchDiff(
    serverTimestamp = 0,
): Promise<ZenMoneyDiff> {
    const token = getAccessToken()
    if (!token) {
        throw new Error("Нет токена ZenMoney")
    }

    const response = await zenmoneyRequest("/v8/diff/", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            currentClientTimestamp: Math.floor(Date.now() / 1000),
            serverTimestamp,
        }),
    })

    return (await response.json()) as ZenMoneyDiff
}
