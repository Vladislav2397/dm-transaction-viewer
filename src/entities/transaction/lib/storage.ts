import type { Transaction } from "../model/types"

const DB_NAME = "dm-transaction-viewer"
const DB_VERSION = 1
const STORE_NAME = "dataset"
const DATASET_KEY = "current"

export type StoredDataset = {
    fileName: string
    rows: Transaction[]
}

export async function loadDataset(): Promise<StoredDataset | null> {
    const db = await openDb()

    try {
        const stored = await storeRequest(
            db,
            "readonly",
            store => store.get(DATASET_KEY),
        )
        if (!isStoredDataset(stored)) {
            return null
        }

        return stored
    } finally {
        db.close()
    }
}

export async function saveDataset(dataset: StoredDataset): Promise<void> {
    const db = await openDb()

    try {
        await storeRequest(db, "readwrite", store =>
            store.put(dataset, DATASET_KEY),
        )
    } finally {
        db.close()
    }
}

export async function clearDataset(): Promise<void> {
    const db = await openDb()

    try {
        await storeRequest(db, "readwrite", store => store.delete(DATASET_KEY))
    } finally {
        db.close()
    }
}

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onupgradeneeded = () => {
            const db = request.result
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME)
            }
        }

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

function storeRequest<T>(
    db: IDBDatabase,
    mode: IDBTransactionMode,
    run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode)
        const request = run(transaction.objectStore(STORE_NAME))

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
        transaction.onerror = () => reject(transaction.error)
    })
}

function isStoredDataset(value: unknown): value is StoredDataset {
    if (!value || typeof value !== "object") {
        return false
    }

    const dataset = value as StoredDataset
    return typeof dataset.fileName === "string" && Array.isArray(dataset.rows)
}
