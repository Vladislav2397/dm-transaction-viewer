import { useMemo, type ReactNode } from "react"

import {
    collectFilterOptions,
    filterTransactions,
    sortTransactions,
    summarize,
    type PageSize,
    type Transaction,
    type TransactionFilters,
} from "@/entities/transaction"
import { formatMoney } from "@/shared/lib/format"

import type { ViewState } from "../model/urlState"
import { FiltersBar } from "./FiltersBar"
import { TransactionTable } from "./TransactionTable"

type TransactionWorkspaceProps = {
    title: string
    description: string
    rows: Transaction[]
    view: ViewState
    onViewChange: (next: Partial<ViewState>) => void
    toolbar?: ReactNode
    actions?: ReactNode
}

export function TransactionWorkspace({
    title,
    description,
    rows,
    view,
    onViewChange,
    toolbar,
    actions,
}: TransactionWorkspaceProps) {
    const { filters, columns, sort, page, pageSize } = view
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

    return (
        <div className="app">
            <main className="main">
                <header className="header">
                    <div>
                        <h1>{title}</h1>
                        <p>{description}</p>
                    </div>
                    <div className="header-actions">
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
                        {actions}
                    </div>
                </header>

                {toolbar}

                {rows.length > 0 ? (
                    <TransactionTable
                        rows={pageRows}
                        columns={columns}
                        total={sorted.length}
                        page={currentPage}
                        pageSize={pageSize}
                        pageCount={pageCount}
                        sort={sort}
                        onSort={next =>
                            onViewChange({ sort: next, page: 1 })
                        }
                        onPage={nextPage => onViewChange({ page: nextPage })}
                        onPageSize={(size: PageSize) =>
                            onViewChange({ pageSize: size, page: 1 })
                        }
                    />
                ) : null}
            </main>

            <FiltersBar
                filters={filters}
                columns={columns}
                options={options}
                onChange={(next: TransactionFilters) =>
                    onViewChange({ filters: next, page: 1 })
                }
                onColumnsChange={next => onViewChange({ columns: next })}
            />
        </div>
    )
}
