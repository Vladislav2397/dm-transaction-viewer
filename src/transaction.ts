export type Transaction = {
    id: number
    date: string
    createdAt: string
    type: string
    category: string
    extraCategories: string
    fromAccount: string
    expense: number | null
    expenseCurrency: string
    toAccount: string
    income: number | null
    incomeCurrency: string
    payer: string
    comment: string
}

export type PageSize = 20 | 40 | 100

export type SortKey = "date" | "income" | "expense" | "payer"

export type SortState = {
    key: SortKey
    direction: "asc" | "desc"
}

export type TransactionFilters = {
    query: string
    types: string[] | null
    categories: string[] | null
    accounts: string[] | null
    dateFrom: string
    dateTo: string
}

export const PAGE_SIZES: PageSize[] = [20, 40, 100]

export const EMPTY_VALUE = "__empty__"

export const DEFAULT_FILTERS: TransactionFilters = {
    query: "",
    types: null,
    categories: null,
    accounts: null,
    dateFrom: "",
    dateTo: "",
}

export const DEFAULT_SORT: SortState = {
    key: "date",
    direction: "desc",
}
