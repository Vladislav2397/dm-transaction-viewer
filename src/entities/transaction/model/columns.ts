export const TABLE_COLUMNS = [
    { id: "date", label: "Дата", sortKey: "date" },
    { id: "type", label: "Тип" },
    { id: "category", label: "Категория" },
    { id: "expense", label: "Расход", sortKey: "expense", align: "right" },
    { id: "income", label: "Доход", sortKey: "income", align: "right" },
    { id: "fromAccount", label: "Со счёта" },
    { id: "toAccount", label: "На счёт" },
    { id: "payer", label: "Плательщик", sortKey: "payer" },
    { id: "comment", label: "Комментарий" },
] as const

export type ColumnId = (typeof TABLE_COLUMNS)[number]["id"]

export const COLUMN_IDS: ColumnId[] = TABLE_COLUMNS.map(column => column.id)

export const COLUMN_ID_SET = new Set<ColumnId>(COLUMN_IDS)
