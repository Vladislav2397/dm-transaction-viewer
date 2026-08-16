export type ZenMoneyInstrument = {
    id: number
    changed: number
    title: string
    shortTitle: string
    symbol: string
    rate: number
}

export type ZenMoneyAccount = {
    id: string
    changed: number
    user: number
    instrument: number | null
    type: string
    title: string
    archive: boolean
}

export type ZenMoneyTag = {
    id: string
    changed: number
    user: number
    title: string
    parent: string | null
}

export type ZenMoneyTransaction = {
    id: string
    changed: number
    created: number
    user: number
    deleted: boolean
    incomeInstrument: number
    incomeAccount: string
    income: number
    outcomeInstrument: number
    outcomeAccount: string
    outcome: number
    tag: string[] | null
    payee: string | null
    comment: string | null
    date: string
}

export type ZenMoneyDeletion = {
    id: string
    object: string
    stamp: number
    user: number
}

export type ZenMoneyDiff = {
    currentClientTimestamp?: number
    serverTimestamp: number
    instrument?: ZenMoneyInstrument[]
    account?: ZenMoneyAccount[]
    tag?: ZenMoneyTag[]
    transaction?: ZenMoneyTransaction[]
    deletion?: ZenMoneyDeletion[]
}

export type ZenMoneyToken = {
    access_token: string
    token_type: string
    expires_in: number
    refresh_token?: string
}

export class ZenMoneyApiError extends Error {
    status: number

    constructor(message: string, status: number) {
        super(message)
        this.name = "ZenMoneyApiError"
        this.status = status
    }
}
