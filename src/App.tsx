import { useMemo, useState } from "react"

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
import {
    DEFAULT_FILTERS,
    DEFAULT_SORT,
    type PageSize,
    type SortKey,
    type SortState,
    type Transaction,
    type TransactionFilters,
} from "./transaction"
import { TransactionTable } from "./TransactionTable"

import "./App.css"

function App() {
    const [rows, setRows] = useState<Transaction[]>([])
    const [fileName, setFileName] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_FILTERS)
    const [sort, setSort] = useState<SortState>(DEFAULT_SORT)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState<PageSize>(20)

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
                setRows([])
                setFileName(file.name)
                return
            }

            setRows(parsed)
            setFileName(file.name)
            setError(null)
            setFilters(DEFAULT_FILTERS)
            setSort(DEFAULT_SORT)
            setPage(1)
        } catch {
            setError("Не удалось прочитать файл")
        }
    }

    function handleFilters(next: TransactionFilters) {
        setFilters(next)
        setPage(1)
    }

    function handleSort(key: SortKey) {
        setSort(current => {
            if (current.key === key) {
                return {
                    key,
                    direction: current.direction === "asc" ? "desc" : "asc",
                }
            }

            return { key, direction: key === "payer" ? "asc" : "desc" }
        })
        setPage(1)
    }

    function handlePageSize(size: PageSize) {
        setPageSize(size)
        setPage(1)
    }

    return (
        <div className="app">
            <header className="header">
                <div>
                    <h1>Операции</h1>
                    <p>
                        Загрузите CSV с колонками даты, типа, категории, дохода
                        и расхода.
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
            />

            {rows.length > 0 ? (
                <>
                    <FiltersBar
                        filters={filters}
                        options={options}
                        onChange={handleFilters}
                    />
                    <TransactionTable
                        rows={pageRows}
                        total={sorted.length}
                        page={currentPage}
                        pageSize={pageSize}
                        pageCount={pageCount}
                        sort={sort}
                        onSort={handleSort}
                        onPage={setPage}
                        onPageSize={handlePageSize}
                    />
                </>
            ) : null}
        </div>
    )
}

export default App
