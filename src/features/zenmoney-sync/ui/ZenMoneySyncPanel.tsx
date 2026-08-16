import { Button, Input } from "@heroui/react"
import { useState } from "react"

import { createAuthorizeUrl, isOAuthConfigured } from "@/shared/api/zenmoney"

type ZenMoneySyncPanelProps = {
    hasToken: boolean
    isPending: boolean
    onSaveToken: (token: string) => void
    onRefresh: () => void
    onLogout: () => void
}

export function ZenMoneySyncPanel({
    hasToken,
    isPending,
    onSaveToken,
    onRefresh,
    onLogout,
}: ZenMoneySyncPanelProps) {
    const [tokenInput, setTokenInput] = useState("")
    const [authError, setAuthError] = useState<string | null>(null)

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

        onSaveToken(value)
        setAuthError(null)
        setTokenInput("")
    }

    if (!hasToken) {
        return (
            <section className="auth-panel">
                <strong>ZenMoney API</strong>
                <span>
                    Войдите через OAuth или вставьте access token. Токен можно
                    получить, например, на{" "}
                    <a
                        href="https://zerro.app"
                        target="_blank"
                        rel="noreferrer">
                        Zerro.app
                    </a>
                    . Данные подтянутся только по кнопке «Обновить».
                </span>
                {isOAuthConfigured() ? (
                    <Button onPress={handleOAuth}>Войти через ZenMoney</Button>
                ) : null}
                <Input
                    fullWidth
                    variant="secondary"
                    type="password"
                    placeholder="access_token"
                    value={tokenInput}
                    onChange={event => setTokenInput(event.target.value)}
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

    return (
        <section className="auth-panel">
            <strong>ZenMoney API</strong>
            <span>
                По кнопке операции запрашиваются из API и заменяют сохранённые
                данные в этом браузере.
            </span>
            <div className="zenmoney-actions">
                <Button
                    variant="secondary"
                    isPending={isPending}
                    onPress={onRefresh}>
                    Обновить
                </Button>
                <Button variant="tertiary" onPress={onLogout}>
                    Выйти
                </Button>
            </div>
        </section>
    )
}
