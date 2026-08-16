import {
    EMPTY_VALUE,
    type SortKey,
    type SortState,
    type Transaction,
    type TransactionFilters,
} from "../model/types"

export type FilterOptions = {
    types: string[]
    categories: { value: string; label: string }[]
    accounts: string[]
    dateMin: string
    dateMax: string
}

export type MoneyTotal = {
    amount: number
    currency: string
}

export type TransactionSummary = {
    count: number
    income: MoneyTotal[]
    expense: MoneyTotal[]
}

export function collectFilterOptions(rows: Transaction[]): FilterOptions {
    const types = new Set<string>()
    const categories = new Set<string>()
    const accounts = new Set<string>()
    let hasEmptyCategory = false
    let dateMin = ""
    let dateMax = ""

    for (const row of rows) {
        if (row.date) {
            if (!dateMin || row.date < dateMin) {
                dateMin = row.date
            }
            if (!dateMax || row.date > dateMax) {
                dateMax = row.date
            }
        }

        if (row.type) {
            types.add(row.type)
        }

        if (row.category) {
            categories.add(row.category)
        } else {
            hasEmptyCategory = true
        }

        if (row.fromAccount) {
            accounts.add(row.fromAccount)
        }
        if (row.toAccount) {
            accounts.add(row.toAccount)
        }
    }

    const categoryOptions = [...categories]
        .sort((a, b) => a.localeCompare(b, "ru"))
        .map(value => ({ value, label: value }))

    if (hasEmptyCategory) {
        categoryOptions.unshift({
            value: EMPTY_VALUE,
            label: "Без категории",
        })
    }

    return {
        types: [...types].sort((a, b) => a.localeCompare(b, "ru")),
        categories: categoryOptions,
        accounts: [...accounts].sort((a, b) => a.localeCompare(b, "ru")),
        dateMin,
        dateMax,
    }
}

export function filterTransactions(
    rows: Transaction[],
    filters: TransactionFilters,
): Transaction[] {
    const query = filters.query.trim().toLowerCase()
    const result: Transaction[] = []

    for (const row of rows) {
        if (filters.types !== null && !filters.types.includes(row.type)) {
            continue
        }

        if (filters.dateFrom && (!row.date || row.date < filters.dateFrom)) {
            continue
        }

        if (filters.dateTo && (!row.date || row.date > filters.dateTo)) {
            continue
        }

        if (filters.categories !== null) {
            const category = row.category || EMPTY_VALUE
            if (!filters.categories.includes(category)) {
                continue
            }
        }

        if (
            filters.accounts !== null &&
            !filters.accounts.includes(row.fromAccount) &&
            !filters.accounts.includes(row.toAccount)
        ) {
            continue
        }

        if (query) {
            const haystack =
                `${row.payer} ${row.comment} ${row.fromAccount} ${row.toAccount}`.toLowerCase()
            if (!haystack.includes(query)) {
                continue
            }
        }

        result.push(row)
    }

    return result
}

export function sortTransactions(
    rows: Transaction[],
    sort: SortState,
): Transaction[] {
    const copy = rows.slice()
    const direction = sort.direction === "asc" ? 1 : -1

    copy.sort((a, b) => {
        const compared = compareByKey(a, b, sort.key, direction)
        if (compared !== 0) {
            return compared
        }

        return a.createdAt.localeCompare(b.createdAt) * direction
    })

    return copy
}

export function summarize(rows: Transaction[]): TransactionSummary {
    return {
        count: rows.length,
        income: sumByCurrency(rows, "income", "incomeCurrency"),
        expense: sumByCurrency(rows, "expense", "expenseCurrency"),
    }
}

function sumByCurrency(
    rows: Transaction[],
    amountKey: "income" | "expense",
    currencyKey: "incomeCurrency" | "expenseCurrency",
): MoneyTotal[] {
    const totals = new Map<string, number>()

    for (const row of rows) {
        const amount = row[amountKey]
        if (amount === null) {
            continue
        }

        const currency = row[currencyKey].trim().toUpperCase()
        totals.set(currency, (totals.get(currency) ?? 0) + amount)
    }

    if (totals.size === 0) {
        return [{ amount: 0, currency: "RUB" }]
    }

    return [...totals.entries()].map(([currency, amount]) => ({
        currency,
        amount,
    }))
}

function compareByKey(
    a: Transaction,
    b: Transaction,
    key: SortKey,
    direction: number,
): number {
    if (key === "date") {
        return a.date.localeCompare(b.date) * direction
    }

    if (key === "payer") {
        if (!a.payer && !b.payer) {
            return 0
        }
        if (!a.payer) {
            return 1
        }
        if (!b.payer) {
            return -1
        }

        return (
            a.payer.localeCompare(b.payer, "ru", { sensitivity: "base" }) *
            direction
        )
    }

    return compareAmount(a[key], b[key], direction)
}

function compareAmount(
    a: number | null,
    b: number | null,
    direction: number,
): number {
    if (a === null && b === null) {
        return 0
    }
    if (a === null) {
        return 1
    }
    if (b === null) {
        return -1
    }

    return (a - b) * direction
}
