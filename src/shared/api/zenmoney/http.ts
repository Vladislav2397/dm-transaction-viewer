import { ZENMONEY_API_BASE } from "./config"
import { ZenMoneyApiError } from "./types"

export async function zenmoneyRequest(
    path: string,
    init: RequestInit = {},
): Promise<Response> {
    const response = await fetch(`${ZENMONEY_API_BASE}${path}`, init)

    if (!response.ok) {
        const details = await response.text().catch(() => "")
        throw new ZenMoneyApiError(
            details || `ZenMoney API error ${response.status}`,
            response.status,
        )
    }

    return response
}
