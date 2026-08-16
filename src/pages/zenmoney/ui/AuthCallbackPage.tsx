import { useQuery } from "@tanstack/react-query"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useEffect } from "react"

import {
    consumeOAuthState,
    exchangeCode,
    saveToken,
} from "@/shared/api/zenmoney"

export function AuthCallbackPage() {
    const navigate = useNavigate()
    const search = useSearch({ from: "/auth/callback" })

    const query = useQuery({
        queryKey: ["zenmoney", "oauth", search.code],
        enabled: Boolean(search.code) && !search.error,
        retry: false,
        queryFn: async () => {
            if (!search.code) {
                throw new Error("В ответе ZenMoney нет кода авторизации")
            }

            const expectedState = consumeOAuthState()
            if (!expectedState || expectedState !== search.state) {
                throw new Error("Некорректный state OAuth")
            }

            const token = await exchangeCode(search.code)
            saveToken(token)
            return true
        },
    })

    useEffect(() => {
        if (query.isSuccess) {
            void navigate({ to: "/" })
        }
    }, [navigate, query.isSuccess])

    if (search.error || query.isError) {
        return (
            <main className="home">
                <h1>Ошибка входа</h1>
                <p>
                    {search.error ||
                        (query.error instanceof Error
                            ? query.error.message
                            : "Не удалось обменять код на токен")}
                </p>
            </main>
        )
    }

    return (
        <main className="home">
            <h1>Вход в ZenMoney</h1>
            <p>Обмениваем код авторизации на токен…</p>
        </main>
    )
}
