import { useEffect, useState } from "react"

import {
    DEFAULT_FILTERS,
    DEFAULT_SORT,
    type Transaction,
} from "@/entities/transaction"
import {
    clearDataset,
    CsvDropzone,
    loadDataset,
    parseCsvText,
    saveDataset,
} from "@/features/csv-import"
import {
    TransactionWorkspace,
    useViewSearch,
} from "@/widgets/transaction-workspace"

export function CsvPage() {
    const { view, patchView } = useViewSearch()
    const [rows, setRows] = useState<Transaction[]>([])
    const [fileName, setFileName] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        loadDataset()
            .then(dataset => {
                if (cancelled || !dataset) {
                    return
                }

                setRows(dataset.rows.map(normalizeRow))
                setFileName(dataset.fileName)
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

    async function handleFile(file: File) {
        if (!file.name.toLowerCase().endsWith(".csv")) {
            setError("Нужен файл с расширением .csv")
            return
        }

        try {
            const text = await file.text()
            const parsed = parseCsvText(text)
            if (parsed.length === 0) {
                setError("В файле нет строк с операциями")
                return
            }

            setRows(parsed)
            setFileName(file.name)
            setError(null)
            patchView({ page: 1 })

            try {
                await saveDataset({ fileName: file.name, rows: parsed })
            } catch {
                setError("Файл открыт, но сохранить его в браузере не удалось")
            }
        } catch {
            setError("Не удалось прочитать файл")
        }
    }

    async function handleClear() {
        setRows([])
        setFileName(null)
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
            title="CSV"
            description="Загрузите CSV из приложения ДзенМани."
            rows={rows}
            view={view}
            onViewChange={patchView}
            toolbar={
                <CsvDropzone
                    fileName={fileName}
                    error={error}
                    onFile={handleFile}
                    onClear={handleClear}
                />
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
