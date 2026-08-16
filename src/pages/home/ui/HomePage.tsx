import { Button } from "@heroui/react"
import { useEffect, useState } from "react"

import {
    clearDataset,
    DEFAULT_FILTERS,
    DEFAULT_SORT,
    loadDataset,
    saveDataset,
    type Transaction,
} from "@/entities/transaction"
import { CsvDropzone, parseCsvText } from "@/features/csv-import"
import {
    fetchZenMoneyTransactions,
    ZENMONEY_DATASET_NAME,
    ZenMoneySyncPanel,
} from "@/features/zenmoney-sync"
import {
    clearToken,
    isAuthenticated,
    saveToken,
    ZenMoneyApiError,
} from "@/shared/api/zenmoney"
import {
    TransactionWorkspace,
    useViewSearch,
} from "@/widgets/transaction-workspace"

export function HomePage() {
    const { view, patchView } = useViewSearch()
    const [rows, setRows] = useState<Transaction[]>([])
    const [sourceName, setSourceName] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [hasToken, setHasToken] = useState(() => isAuthenticated())

    useEffect(() => {
        let cancelled = false

        loadDataset()
            .then(dataset => {
                if (cancelled || !dataset) {
                    return
                }

                setRows(dataset.rows.map(normalizeRow))
                setSourceName(dataset.fileName)
            })
            .catch(() => {
                if (!cancelled) {
                    setError("Не удалось прочитать сохранённые данные")
                }
            })

        return () => {
            cancelled = true
        }
    }, [])

    async function persistRows(nextRows: Transaction[], nextSource: string) {
        setRows(nextRows)
        setSourceName(nextSource)
        setError(null)
        patchView({ page: 1 })

        try {
            await saveDataset({ fileName: nextSource, rows: nextRows })
        } catch {
            setError("Данные открыты, но сохранить их в браузере не удалось")
        }
    }

    async function handleFile(file: File) {
        if (!file.name.toLowerCase().endsWith(".csv")) {
            setError("Нужен файл с расширением .csv")
            return
        }

        try {
            const parsed = parseCsvText(await file.text())
            if (parsed.length === 0) {
                setError("В файле нет строк с операциями")
                return
            }

            await persistRows(parsed, file.name)
        } catch {
            setError("Не удалось прочитать файл")
        }
    }

    async function handleRefresh() {
        setIsRefreshing(true)

        try {
            await persistRows(
                await fetchZenMoneyTransactions(),
                ZENMONEY_DATASET_NAME,
            )
        } catch (caught) {
            if (caught instanceof ZenMoneyApiError && caught.status === 401) {
                clearToken()
                setHasToken(false)
                setError("Сессия ZenMoney истекла. Войдите снова.")
                return
            }

            setError(
                caught instanceof Error
                    ? caught.message
                    : "Не удалось получить операции",
            )
        } finally {
            setIsRefreshing(false)
        }
    }

    async function handleClear() {
        setRows([])
        setSourceName(null)
        setError(null)
        patchView({
            filters: DEFAULT_FILTERS,
            columns: null,
            sort: DEFAULT_SORT,
            page: 1,
            pageSize: 20,
        })

        try {
            await clearDataset()
        } catch {
            setError("Не удалось удалить сохранённые данные")
        }
    }

    return (
        <TransactionWorkspace
            title="Операции"
            description="Одна таблица: данные из CSV или из ZenMoney API по кнопке «Обновить». Оба варианта пишут в IndexedDB и могут заменять друг друга."
            rows={rows}
            view={view}
            onViewChange={patchView}
            toolbar={
                <div className="sources">
                    <div className="sources-panels">
                        <CsvDropzone onFile={handleFile} />
                        <ZenMoneySyncPanel
                            hasToken={hasToken}
                            isPending={isRefreshing}
                            onSaveToken={token => {
                                saveToken({ access_token: token })
                                setHasToken(true)
                            }}
                            onRefresh={() => {
                                void handleRefresh()
                            }}
                            onLogout={() => {
                                clearToken()
                                setHasToken(false)
                            }}
                        />
                    </div>
                    {sourceName ? (
                        <p className="sources-meta">
                            Сохранено: {sourceName}
                        </p>
                    ) : null}
                    {error ? (
                        <p className="dropzone-error">{error}</p>
                    ) : null}
                    {sourceName ? (
                        <Button variant="tertiary" onPress={() => void handleClear()}>
                            Очистить данные
                        </Button>
                    ) : null}
                </div>
            }
        />
    )
}

function normalizeRow(row: Transaction): Transaction {
    return {
        ...row,
        id: String(row.id),
    }
}
