import { Button } from "@heroui/react"
import { useNavigate } from "@tanstack/react-router"

export function HomePage() {
    const navigate = useNavigate()

    return (
        <main className="home">
            <h1>DM Transaction Viewer</h1>
            <p>Выберите источник операций.</p>
            <div className="home-cards">
                <section className="home-card">
                    <h2>CSV</h2>
                    <p>Загрузите выгрузку из приложения ДзенМани.</p>
                    <Button onPress={() => void navigate({ to: "/csv" })}>
                        Открыть CSV
                    </Button>
                </section>
                <section className="home-card">
                    <h2>ZenMoney API</h2>
                    <p>
                        Авторизуйтесь и получите операции напрямую из ДзенМани.
                    </p>
                    <Button onPress={() => void navigate({ to: "/zenmoney" })}>
                        Открыть API
                    </Button>
                </section>
            </div>
        </main>
    )
}
