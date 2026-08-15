import { TABLE_COLUMNS, type ColumnId } from "./columns"
import { formatDate, formatMoney } from "./format"
import type { PageSize, SortKey, SortState, Transaction } from "./transaction"
import { PAGE_SIZES } from "./transaction"
import { isColumnEnabled } from "./urlState"

type TableColumn = (typeof TABLE_COLUMNS)[number]

type TransactionTableProps = {
    rows: Transaction[]
    columns: ColumnId[] | null
    total: number
    page: number
    pageSize: PageSize
    pageCount: number
    sort: SortState
    onSort: (key: SortKey) => void
    onPage: (page: number) => void
    onPageSize: (size: PageSize) => void
}

export function TransactionTable({
    rows,
    columns,
    total,
    page,
    pageSize,
    pageCount,
    sort,
    onSort,
    onPage,
    onPageSize,
}: TransactionTableProps) {
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1
    const to = Math.min(page * pageSize, total)
    const visible = TABLE_COLUMNS.filter(column =>
        isColumnEnabled(columns, column.id),
    )

    return (
        <div className="table-wrap">
            <div className="table-scroll">
                <table>
                    <thead>
                        <tr>
                            {visible.map(column => (
                                <ColumnHeader
                                    key={column.id}
                                    column={column}
                                    sort={sort}
                                    onSort={onSort}
                                />
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={visible.length} className="empty">
                                    Нет операций по выбранным фильтрам
                                </td>
                            </tr>
                        ) : (
                            rows.map(row => (
                                <tr key={row.id}>
                                    {visible.map(column => (
                                        <td
                                            key={column.id}
                                            className={cellClass(column)}>
                                            {renderCell(column.id, row)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="pagination">
                <span>
                    {from}–{to} из {total}
                </span>
                <label>
                    Строк
                    <select
                        value={pageSize}
                        onChange={event =>
                            onPageSize(Number(event.target.value) as PageSize)
                        }>
                        {PAGE_SIZES.map(size => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </label>
                <div className="pager">
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => onPage(page - 1)}>
                        Назад
                    </button>
                    <span>
                        {page} / {Math.max(pageCount, 1)}
                    </span>
                    <button
                        type="button"
                        disabled={page >= pageCount}
                        onClick={() => onPage(page + 1)}>
                        Вперёд
                    </button>
                </div>
            </div>
        </div>
    )
}

function ColumnHeader({
    column,
    sort,
    onSort,
}: {
    column: TableColumn
    sort: SortState
    onSort: (key: SortKey) => void
}) {
    if (!("sortKey" in column)) {
        return <th>{column.label}</th>
    }

    const active = sort.key === column.sortKey
    const marker = !active ? "" : sort.direction === "asc" ? " ↑" : " ↓"

    return (
        <th className={"align" in column ? "num" : undefined}>
            <button type="button" onClick={() => onSort(column.sortKey)}>
                {column.label}
                {marker}
            </button>
        </th>
    )
}

function cellClass(column: TableColumn): string | undefined {
    if (column.id === "comment") {
        return "comment"
    }
    if (column.id === "expense") {
        return "num expense"
    }
    if (column.id === "income") {
        return "num income"
    }

    return undefined
}

function renderCell(column: ColumnId, row: Transaction) {
    if (column === "date") {
        return formatDate(row.date)
    }
    if (column === "type") {
        return (
            <span className={`badge badge-${typeClass(row.type)}`}>
                {row.type || "—"}
            </span>
        )
    }
    if (column === "category") {
        return row.category || "—"
    }
    if (column === "expense") {
        return formatMoney(row.expense, row.expenseCurrency)
    }
    if (column === "income") {
        return formatMoney(row.income, row.incomeCurrency)
    }
    if (column === "fromAccount") {
        return row.fromAccount || "—"
    }
    if (column === "toAccount") {
        return row.toAccount || "—"
    }
    if (column === "payer") {
        return row.payer || "—"
    }

    return row.comment || "—"
}

function typeClass(type: string): string {
    if (type === "Доход") {
        return "income"
    }
    if (type === "Расход") {
        return "expense"
    }
    return "transfer"
}
