import {
    COLUMN_IDS,
    COLUMN_ID_SET,
    type ColumnId,
} from "./columns"
import {
    PAGE_SIZES,
    type PageSize,
    type SortKey,
    type SortState,
    type TransactionFilters,
} from "./transaction"

export type ViewState = {
    filters: TransactionFilters
    columns: ColumnId[] | null
    sort: SortState
    page: number
    pageSize: PageSize
}

const SORT_KEYS = new Set<SortKey>(["date", "income", "expense", "payer"])

export function readViewFromUrl(search = window.location.search): ViewState {
    const params = new URLSearchParams(search)
    const typesParam = params.get("types")
    const columnsParam = params.get("cols")
    const sortKey = params.get("sort")
    const direction = params.get("dir")
    const pageSize = Number(params.get("size"))
    const page = Number(params.get("page"))

    return {
        filters: {
            query: params.get("q") ?? "",
            types: typesParam === null ? null : splitList(typesParam),
            category: params.get("category") ?? "",
            account: params.get("account") ?? "",
            dateFrom: params.get("from") ?? "",
            dateTo: params.get("to") ?? "",
        },
        columns:
            columnsParam === null
                ? null
                : parseColumns(splitList(columnsParam)),
        sort: {
            key: isSortKey(sortKey) ? sortKey : "date",
            direction: direction === "asc" ? "asc" : "desc",
        },
        page: Number.isInteger(page) && page > 1 ? page : 1,
        pageSize: isPageSize(pageSize) ? pageSize : 20,
    }
}

export function writeViewToUrl(view: ViewState) {
    const params = serializeView(view)
    const query = params.toString()
    const next = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`

    if (next !== current) {
        window.history.replaceState(null, "", next)
    }
}

export function serializeView(view: ViewState): URLSearchParams {
    const params = new URLSearchParams()
    const { filters, columns, sort, page, pageSize } = view

    if (filters.query) {
        params.set("q", filters.query)
    }
    if (filters.types !== null) {
        params.set("types", filters.types.join(","))
    }
    if (filters.category) {
        params.set("category", filters.category)
    }
    if (filters.account) {
        params.set("account", filters.account)
    }
    if (filters.dateFrom) {
        params.set("from", filters.dateFrom)
    }
    if (filters.dateTo) {
        params.set("to", filters.dateTo)
    }
    if (columns !== null) {
        params.set("cols", columns.join(","))
    }
    if (sort.key !== "date") {
        params.set("sort", sort.key)
    }
    if (sort.direction !== "desc") {
        params.set("dir", sort.direction)
    }
    if (pageSize !== 20) {
        params.set("size", String(pageSize))
    }
    if (page > 1) {
        params.set("page", String(page))
    }

    return params
}

export function toggleType(
    current: string[] | null,
    type: string,
    allTypes: string[],
): string[] | null {
    return toggleList(current, type, allTypes)
}

export function toggleColumn(
    current: ColumnId[] | null,
    column: ColumnId,
): ColumnId[] | null {
    const next = toggleList(current, column, COLUMN_IDS)
    if (next !== null && next.length === 0) {
        return current
    }

    return next
}

export function isTypeEnabled(types: string[] | null, type: string): boolean {
    return types === null || types.includes(type)
}

export function isColumnEnabled(
    columns: ColumnId[] | null,
    column: ColumnId,
): boolean {
    return columns === null || columns.includes(column)
}

function toggleList<T extends string>(
    current: T[] | null,
    item: T,
    all: readonly T[],
): T[] | null {
    const enabled = new Set(current ?? all)

    if (enabled.has(item)) {
        enabled.delete(item)
    } else {
        enabled.add(item)
    }

    if (all.length > 0 && all.every(value => enabled.has(value))) {
        return null
    }

    return all.filter(value => enabled.has(value))
}

function parseColumns(values: string[]): ColumnId[] | null {
    const columns = values.filter((value): value is ColumnId =>
        COLUMN_ID_SET.has(value as ColumnId),
    )

    return columns.length === 0 ? null : columns
}

function splitList(value: string): string[] {
    return value
        .split(",")
        .map(item => item.trim())
        .filter(Boolean)
}

function isSortKey(value: string | null): value is SortKey {
    return value !== null && SORT_KEYS.has(value as SortKey)
}

function isPageSize(value: number): value is PageSize {
    return (PAGE_SIZES as number[]).includes(value)
}
