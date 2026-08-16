import type { Transaction } from "@/entities/transaction"
import { fetchDiff } from "@/shared/api/zenmoney"

import { mapDiffToTransactions } from "./map"

export const ZENMONEY_DATASET_NAME = "ZenMoney API"

export async function fetchZenMoneyTransactions(): Promise<Transaction[]> {
    const rows = mapDiffToTransactions(await fetchDiff(0))
    if (rows.length === 0) {
        throw new Error("В ответе нет строк с операциями")
    }

    return rows
}
