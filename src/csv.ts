import type { Transaction } from "./transaction"

const HEADER_ALIASES: Record<string, keyof Omit<Transaction, "id">> = {
    дата: "date",
    создана: "createdAt",
    тип: "type",
    категория: "category",
    "доп категории": "extraCategories",
    "со счёта": "fromAccount",
    "со счета": "fromAccount",
    расход: "expense",
    "валюта -": "expenseCurrency",
    "на счёт": "toAccount",
    "на счет": "toAccount",
    доход: "income",
    "валюта +": "incomeCurrency",
    плательщик: "payer",
    комментарий: "comment",
}

export function parseCsvText(text: string): Transaction[] {
    const rows = parseCsvRows(stripBom(text))
    if (rows.length < 2) {
        return []
    }

    const headerMap = mapHeaders(rows[0])
    const transactions: Transaction[] = []

    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i]
        if (!cells.some(cell => cell.trim() !== "")) {
            continue
        }

        transactions.push({
            id: String(i),
            date: cell(cells, headerMap.date),
            createdAt: cell(cells, headerMap.createdAt),
            type: cell(cells, headerMap.type),
            category: cell(cells, headerMap.category),
            extraCategories: cell(cells, headerMap.extraCategories),
            fromAccount: cell(cells, headerMap.fromAccount),
            expense: parseAmount(cell(cells, headerMap.expense)),
            expenseCurrency: cell(cells, headerMap.expenseCurrency),
            toAccount: cell(cells, headerMap.toAccount),
            income: parseAmount(cell(cells, headerMap.income)),
            incomeCurrency: cell(cells, headerMap.incomeCurrency),
            payer: cell(cells, headerMap.payer),
            comment: cell(cells, headerMap.comment),
        })
    }

    return transactions
}

function stripBom(text: string): string {
    return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
}

function parseCsvRows(text: string): string[][] {
    const rows: string[][] = []
    let row: string[] = []
    let field = ""
    let inQuotes = false

    for (let i = 0; i < text.length; i++) {
        const char = text[i]

        if (inQuotes) {
            if (char === '"') {
                if (text[i + 1] === '"') {
                    field += '"'
                    i += 1
                } else {
                    inQuotes = false
                }
            } else {
                field += char
            }
            continue
        }

        if (char === '"') {
            inQuotes = true
        } else if (char === ",") {
            row.push(field)
            field = ""
        } else if (char === "\n") {
            row.push(field)
            rows.push(row)
            row = []
            field = ""
        } else if (char !== "\r") {
            field += char
        }
    }

    if (field.length > 0 || row.length > 0) {
        row.push(field)
        rows.push(row)
    }

    return rows
}

function mapHeaders(
    headerRow: string[],
): Partial<Record<keyof Transaction, number>> {
    const map: Partial<Record<keyof Transaction, number>> = {}

    headerRow.forEach((header, index) => {
        const key = HEADER_ALIASES[header.trim().toLowerCase()]
        if (key) {
            map[key] = index
        }
    })

    return map
}

function cell(row: string[], index: number | undefined): string {
    if (index === undefined) {
        return ""
    }

    return (row[index] ?? "").trim()
}

function parseAmount(value: string): number | null {
    if (!value) {
        return null
    }

    const normalized = value.replace(/\s/g, "").replace(",", ".")
    const amount = Number(normalized)
    return Number.isFinite(amount) ? amount : null
}
