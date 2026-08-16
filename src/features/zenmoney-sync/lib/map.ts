import type { ZenMoneyDiff } from "@/shared/api/zenmoney"
import type { Transaction } from "@/transaction"

export function mapDiffToTransactions(diff: ZenMoneyDiff): Transaction[] {
    const accounts = new Map(
        (diff.account ?? []).map(account => [account.id, account]),
    )
    const tags = new Map((diff.tag ?? []).map(tag => [tag.id, tag]))
    const instruments = new Map(
        (diff.instrument ?? []).map(instrument => [instrument.id, instrument]),
    )

    return (diff.transaction ?? [])
        .filter(transaction => !transaction.deleted)
        .map(transaction => {
            const tagTitles = (transaction.tag ?? [])
                .map(id => tags.get(id)?.title)
                .filter((title): title is string => Boolean(title))
            const fromAccount = accounts.get(transaction.outcomeAccount)
            const toAccount = accounts.get(transaction.incomeAccount)
            const expenseCurrency =
                instruments.get(transaction.outcomeInstrument)?.shortTitle ?? ""
            const incomeCurrency =
                instruments.get(transaction.incomeInstrument)?.shortTitle ?? ""
            const hasIncome = transaction.income > 0
            const hasExpense = transaction.outcome > 0

            return {
                id: transaction.id,
                date: transaction.date,
                createdAt: formatUnix(transaction.created),
                type: transactionType(hasIncome, hasExpense),
                category: tagTitles[0] ?? "",
                extraCategories: tagTitles.slice(1).join(", "),
                fromAccount: hasExpense ? (fromAccount?.title ?? "") : "",
                toAccount: hasIncome ? (toAccount?.title ?? "") : "",
                expense: hasExpense ? transaction.outcome : null,
                expenseCurrency: hasExpense ? expenseCurrency : "",
                income: hasIncome ? transaction.income : null,
                incomeCurrency: hasIncome ? incomeCurrency : "",
                payer: transaction.payee ?? "",
                comment: transaction.comment ?? "",
            }
        })
}

function transactionType(hasIncome: boolean, hasExpense: boolean) {
    if (hasIncome && !hasExpense) {
        return "Доход"
    }
    if (hasExpense && !hasIncome) {
        return "Расход"
    }

    return "Перевод"
}

function formatUnix(value: number) {
    return new Date(value * 1000).toISOString()
}
