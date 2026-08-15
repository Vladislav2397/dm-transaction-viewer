import { useEffect, useMemo, useState } from "react"

import { CsvDropzone } from "./CsvDropzone"
import { parseCsvText } from "./csv"
import { FiltersBar } from "./FiltersBar"
import { formatMoney } from "./format"
import {
    collectFilterOptions,
    filterTransactions,
    sortTransactions,
    summarize,
} from "./query"
import { clearDataset, loadDataset, saveDataset } from "./storage"
import {
    DEFAULT_FILTERS,
    DEFAULT_SORT,
    type PageSize,
    type SortKey,
    type Transaction,
    type TransactionFilters,
} from "./transaction"
import { TransactionTable } from "./TransactionTable"
import { readViewFromUrl, writeViewToUrl } from "./urlState"

import "./App.css"

function App() {
    const [rows, setRows] = useState<Transaction[]>([])
    const [fileName, setFileName] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [view, setView] = useState(readViewFromUrl)

    const { filters, columns, sort, page, pageSize } = view

    useEffect(() => {
        let cancelled = false

        loadDataset()
            .then(dataset => {
                if (cancelled || !dataset) {
                    return
                }

                setRows(dataset.rows)
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

    useEffect(() => {
        function syncFromUrl() {
            setView(readViewFromUrl())
        }

        window.addEventListener("popstate", syncFromUrl)
        return () => window.removeEventListener("popstate", syncFromUrl)
    }, [])

    useEffect(() => {
        writeViewToUrl(view)
    }, [view])

    const options = useMemo(() => collectFilterOptions(rows), [rows])
    const filtered = useMemo(
        () => filterTransactions(rows, filters),
        [rows, filters],
    )
    const sorted = useMemo(
        () => sortTransactions(filtered, sort),
        [filtered, sort],
    )
    const summary = useMemo(() => summarize(filtered), [filtered])
    const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
    const currentPage = Math.min(page, pageCount)
    const pageRows = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        return sorted.slice(start, start + pageSize)
    }, [sorted, currentPage, pageSize])

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

    function patchView(next: Partial<typeof view>) {
        setView(current => ({ ...current, ...next }))
    }

    function handleFilters(next: TransactionFilters) {
        patchView({ filters: next, page: 1 })
    }

    function handleSort(key: SortKey) {
        let direction: "asc" | "desc" = key === "payer" ? "asc" : "desc"
        if (sort.key === key) {
            direction = sort.direction === "asc" ? "desc" : "asc"
        }

        patchView({ sort: { key, direction }, page: 1 })
    }

    function handlePageSize(size: PageSize) {
        patchView({ pageSize: size, page: 1 })
    }

    return (
        <div className="app">
            <header className="header">
                <div>
                    <h1>DM Transaction Viewer</h1>
                    <p>
                        Загрузите CSV из приложения ДзенМани.
                    </p>
                </div>
                {rows.length > 0 ? (
                    <dl className="stats">
                        <div>
                            <dt>Строк</dt>
                            <dd>{summary.count}</dd>
                        </div>
                        <div>
                            <dt>Доход</dt>
                            <dd className="income">
                                {summary.income.map(item => (
                                    <span key={`in-${item.currency}`}>
                                        {formatMoney(
                                            item.amount,
                                            item.currency,
                                        )}
                                    </span>
                                ))}
                            </dd>
                        </div>
                        <div>
                            <dt>Расход</dt>
                            <dd className="expense">
                                {summary.expense.map(item => (
                                    <span key={`ex-${item.currency}`}>
                                        {formatMoney(
                                            item.amount,
                                            item.currency,
                                        )}
                                    </span>
                                ))}
                            </dd>
                        </div>
                    </dl>
                ) : null}
            </header>

            <CsvDropzone
                fileName={fileName}
                error={error}
                onFile={handleFile}
                onClear={handleClear}
            />

            {rows.length > 0 ? (
                <>
                    <FiltersBar
                        filters={filters}
                        columns={columns}
                        options={options}
                        onChange={handleFilters}
                        onColumnsChange={next => patchView({ columns: next })}
                    />
                    <TransactionTable
                        rows={pageRows}
                        columns={columns}
                        total={sorted.length}
                        page={currentPage}
                        pageSize={pageSize}
                        pageCount={pageCount}
                        sort={sort}
                        onSort={handleSort}
                        onPage={nextPage => patchView({ page: nextPage })}
                        onPageSize={handlePageSize}
                    />
                </>
            ) : null}
        </div>
    )
}

export default App
