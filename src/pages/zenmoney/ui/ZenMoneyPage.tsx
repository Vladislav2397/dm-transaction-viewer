import { Button, Input } from "@heroui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { mapDiffToTransactions } from "@/features/zenmoney-sync"
import {
    clearToken,
    createAuthorizeUrl,
    fetchDiff,
    isAuthenticated,
    isOAuthConfigured,
    saveToken,
    ZenMoneyApiError,
} from "@/shared/api/zenmoney"
import {
    TransactionWorkspace,
    useViewSearch,
} from "@/widgets/transaction-workspace"

export function ZenMoneyPage() {
    const queryClient = useQueryClient()
    const { view, patchView } = useViewSearch()
    const [hasToken, setHasToken] = useState(() => isAuthenticated())
    const [tokenInput, setTokenInput] = useState("")
    const [authError, setAuthError] = useState<string | null>(null)

    const query = useQuery({
        queryKey: ["zenmoney", "diff"],
        enabled: hasToken,
        staleTime: Infinity,
        queryFn: () => fetchDiff(0).then(mapDiffToTransactions),
    })

    useEffect(() => {
        if (
            query.error instanceof ZenMoneyApiError &&
            query.error.status === 401 &&
            hasToken
        ) {
            clearToken()
            setHasToken(false)
        }
    }, [hasToken, query.error])

    function handleOAuth() {
        try {
            window.location.assign(createAuthorizeUrl())
        } catch (error) {
            setAuthError(
                error instanceof Error
                    ? error.message
                    : "Не удалось начать авторизацию",
            )
        }
    }

    function handleSaveToken() {
        const value = tokenInput.trim()
        if (!value) {
            setAuthError("Вставьте access token")
            return
        }

        saveToken({ access_token: value })
        setHasToken(true)
        setAuthError(null)
        setTokenInput("")
    }

    function handleLogout() {
        clearToken()
        setHasToken(false)
        queryClient.removeQueries({ queryKey: ["zenmoney"] })
    }

    const rows = query.data ?? []

    return (
        <TransactionWorkspace
            title="ZenMoney"
            description="Операции из API ДзенМани с теми же фильтрами, что и для CSV."
            rows={rows}
            view={view}
            onViewChange={patchView}
            actions={
                hasToken ? (
                    <div className="zenmoney-actions">
                        <Button
                            variant="secondary"
                            isPending={query.isFetching}
                            onPress={() => {
                                void query.refetch()
                            }}>
                            Обновить
                        </Button>
                        <Button variant="tertiary" onPress={handleLogout}>
                            Выйти
                        </Button>
                    </div>
                ) : null
            }
            toolbar={
                hasToken ? (
                    query.isError ? (
                        <p className="dropzone-error">
                            {query.error instanceof Error
                                ? query.error.message
                                : "Не удалось получить операции"}
                        </p>
                    ) : query.isLoading ? (
                        <p>Загрузка операций из ZenMoney…</p>
                    ) : null
                ) : (
                    <section className="auth-panel">
                        <strong>Авторизация ZenMoney</strong>
                        <span>
                            Войдите через OAuth или вставьте access token. Токен
                            можно получить, например, на{" "}
                            <a
                                href="https://zerro.app"
                                target="_blank"
                                rel="noreferrer">
                                Zerro.app
                            </a>
                            .
                        </span>
                        {isOAuthConfigured() ? (
                            <Button onPress={handleOAuth}>
                                Войти через ZenMoney
                            </Button>
                        ) : null}
                        <Input
                            fullWidth
                            variant="secondary"
                            type="password"
                            placeholder="access_token"
                            value={tokenInput}
                            onChange={event =>
                                setTokenInput(event.target.value)
                            }
                        />
                        <Button variant="secondary" onPress={handleSaveToken}>
                            Сохранить токен
                        </Button>
                        {authError ? (
                            <span className="dropzone-error">{authError}</span>
                        ) : null}
                    </section>
                )
            }
        />
    )
}
