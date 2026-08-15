import { formatDate, formatDateTime, formatMoney } from "./format"
import type { PageSize, SortKey, SortState, Transaction } from "./transaction"
import { PAGE_SIZES } from "./transaction"

type TransactionTableProps = {
    rows: Transaction[]
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

    return (
        <div className="table-wrap">
            <table>
                    <thead>
                        <tr>
                            <SortableTh
                                label="Дата"
                                column="date"
                                sort={sort}
                                onSort={onSort}
                            />
                            <th>Создана</th>
                            <th>Тип</th>
                            <th>Категория</th>
                            <SortableTh
                                label="Расход"
                                column="expense"
                                sort={sort}
                                onSort={onSort}
                                align="right"
                            />
                            <SortableTh
                                label="Доход"
                                column="income"
                                sort={sort}
                                onSort={onSort}
                                align="right"
                            />
                            <th>Со счёта</th>
                            <th>На счёт</th>
                            <SortableTh
                                label="Плательщик"
                                column="payer"
                                sort={sort}
                                onSort={onSort}
                            />
                            <th>Комментарий</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="empty">
                                    Нет операций по выбранным фильтрам
                                </td>
                            </tr>
                        ) : (
                            rows.map(row => (
                                <tr key={row.id}>
                                    <td>{formatDate(row.date)}</td>
                                    <td className="muted">
                                        {formatDateTime(row.createdAt)}
                                    </td>
                                    <td>
                                        <span
                                            className={`badge badge-${typeClass(row.type)}`}>
                                            {row.type || "—"}
                                        </span>
                                    </td>
                                    <td>{row.category || "—"}</td>
                                    <td className="num expense">
                                        {formatMoney(
                                            row.expense,
                                            row.expenseCurrency,
                                        )}
                                    </td>
                                    <td className="num income">
                                        {formatMoney(
                                            row.income,
                                            row.incomeCurrency,
                                        )}
                                    </td>
                                    <td>{row.fromAccount || "—"}</td>
                                    <td>{row.toAccount || "—"}</td>
                                    <td>{row.payer || "—"}</td>
                                    <td className="comment">
                                        {row.comment || "—"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
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

function SortableTh({
    label,
    column,
    sort,
    onSort,
    align,
}: {
    label: string
    column: SortKey
    sort: SortState
    onSort: (key: SortKey) => void
    align?: "right"
}) {
    const active = sort.key === column
    const marker = !active ? "" : sort.direction === "asc" ? " ↑" : " ↓"

    return (
        <th className={align === "right" ? "num" : undefined}>
            <button type="button" onClick={() => onSort(column)}>
                {label}
                {marker}
            </button>
        </th>
    )
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
