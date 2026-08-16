import type { SortDescriptor } from "@heroui/react"
import { Chip, Pagination, Table } from "@heroui/react"

import { Select } from "@/shared/ui/select"

import {
    PAGE_SIZES,
    TABLE_COLUMNS,
    type ColumnId,
    type PageSize,
    type SortState,
    type Transaction,
} from "@/entities/transaction"
import { formatDate, formatMoney } from "@/shared/lib/format"

import { isColumnEnabled } from "../model/urlState"

type TableColumn = (typeof TABLE_COLUMNS)[number]

type TransactionTableProps = {
    rows: Transaction[]
    columns: ColumnId[] | null
    total: number
    page: number
    pageSize: PageSize
    pageCount: number
    sort: SortState
    onSort: (next: SortState) => void
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
    const pages = paginationItems(page, pageCount)

    return (
        <Table className="w-full">
            <Table.ScrollContainer>
                <Table.Content
                    aria-label="Операции"
                    className="min-w-[720px]"
                    sortDescriptor={toSortDescriptor(sort)}
                    onSortChange={descriptor => {
                        const next = fromSortDescriptor(descriptor)
                        if (next) {
                            onSort(next)
                        }
                    }}>
                    <Table.Header>
                        {visible.map((column, index) => (
                            <ColumnHeader
                                key={column.id}
                                column={column}
                                isRowHeader={index === 0}
                            />
                        ))}
                    </Table.Header>
                    <Table.Body
                        items={rows}
                        renderEmptyState={() =>
                            "Нет операций по выбранным фильтрам"
                        }>
                        {row => (
                            <Table.Row id={row.id}>
                                {visible.map(column => (
                                    <Table.Cell
                                        key={column.id}
                                        className={cellClass(column)}>
                                        {renderCell(column.id, row)}
                                    </Table.Cell>
                                ))}
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table.Content>
            </Table.ScrollContainer>
            <Table.Footer>
                <Pagination className="w-full" size="sm">
                    <Pagination.Summary>
                        {from}–{to} из {total}
                    </Pagination.Summary>
                    <div className="w-28">
                        <Select
                            label=""
                            value={String(pageSize)}
                            options={PAGE_SIZES.map(size => ({
                                id: String(size),
                                label: String(size),
                            }))}
                            onChange={value =>
                                onPageSize(Number(value) as PageSize)
                            }
                        />
                    </div>
                    <Pagination.Content>
                        <Pagination.Item>
                            <Pagination.Previous
                                isDisabled={page <= 1}
                                onPress={() => onPage(page - 1)}>
                                <Pagination.PreviousIcon />
                                Назад
                            </Pagination.Previous>
                        </Pagination.Item>
                        {pages.map((item, index) =>
                            item === "ellipsis" ? (
                                <Pagination.Item key={`e-${index}`}>
                                    <Pagination.Ellipsis />
                                </Pagination.Item>
                            ) : (
                                <Pagination.Item key={item}>
                                    <Pagination.Link
                                        isActive={item === page}
                                        onPress={() => onPage(item)}>
                                        {item}
                                    </Pagination.Link>
                                </Pagination.Item>
                            ),
                        )}
                        <Pagination.Item>
                            <Pagination.Next
                                isDisabled={page >= pageCount}
                                onPress={() => onPage(page + 1)}>
                                Вперёд
                                <Pagination.NextIcon />
                            </Pagination.Next>
                        </Pagination.Item>
                    </Pagination.Content>
                </Pagination>
            </Table.Footer>
        </Table>
    )
}

function ColumnHeader({
    column,
    isRowHeader,
}: {
    column: TableColumn
    isRowHeader: boolean
}) {
    if (!("sortKey" in column)) {
        return (
            <Table.Column id={column.id} isRowHeader={isRowHeader}>
                {column.label}
            </Table.Column>
        )
    }

    return (
        <Table.Column
            allowsSorting
            id={column.sortKey}
            isRowHeader={isRowHeader}>
            {({ sortDirection }) => (
                <Table.SortableColumnHeader sortDirection={sortDirection}>
                    {column.label}
                </Table.SortableColumnHeader>
            )}
        </Table.Column>
    )
}

function cellClass(column: TableColumn): string | undefined {
    if (column.id === "comment") {
        return "max-w-60 whitespace-normal"
    }
    if (column.id === "expense") {
        return "text-right tabular-nums text-danger"
    }
    if (column.id === "income") {
        return "text-right tabular-nums text-success"
    }

    return undefined
}

function renderCell(column: ColumnId, row: Transaction) {
    if (column === "date") {
        return formatDate(row.date)
    }
    if (column === "type") {
        return (
            <Chip color={typeColor(row.type)} size="sm" variant="soft">
                {row.type || "—"}
            </Chip>
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

function typeColor(type: string): "success" | "danger" | "accent" {
    if (type === "Доход") {
        return "success"
    }
    if (type === "Расход") {
        return "danger"
    }

    return "accent"
}

function toSortDescriptor(sort: SortState): SortDescriptor {
    return {
        column: sort.key,
        direction: sort.direction === "asc" ? "ascending" : "descending",
    }
}

function fromSortDescriptor(descriptor: SortDescriptor): SortState | null {
    const key = String(descriptor.column)
    if (
        key !== "date" &&
        key !== "income" &&
        key !== "expense" &&
        key !== "payer"
    ) {
        return null
    }

    return {
        key,
        direction: descriptor.direction === "ascending" ? "asc" : "desc",
    }
}

function paginationItems(
    current: number,
    total: number,
): Array<number | "ellipsis"> {
    if (total <= 7) {
        return Array.from({ length: total }, (_, index) => index + 1)
    }

    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    const items: Array<number | "ellipsis"> = [1]

    if (start > 2) {
        items.push("ellipsis")
    }

    for (let page = start; page <= end; page += 1) {
        items.push(page)
    }

    if (end < total - 1) {
        items.push("ellipsis")
    }

    items.push(total)
    return items
}
