import { Button } from "@heroui/react"

import { DateRangeField } from "@/shared/ui/date-range-field"
import { MultiSelect } from "@/shared/ui/multi-select"
import { SearchField } from "@/shared/ui/search-field"

import { TABLE_COLUMNS, type ColumnId } from "./columns"
import type { FilterOptions } from "./query"
import type { TransactionFilters } from "./transaction"
import { DEFAULT_FILTERS } from "./transaction"

type FiltersBarProps = {
    filters: TransactionFilters
    columns: ColumnId[] | null
    options: FilterOptions
    onChange: (next: TransactionFilters) => void
    onColumnsChange: (next: ColumnId[] | null) => void
}

export function FiltersBar({
    filters,
    columns,
    options,
    onChange,
    onColumnsChange,
}: FiltersBarProps) {
    const hasActive =
        filters.query !== "" ||
        filters.types !== null ||
        filters.categories !== null ||
        filters.accounts !== null ||
        filters.dateFrom !== "" ||
        filters.dateTo !== "" ||
        columns !== null

    const selectedTypes = filters.types ?? options.types
    const selectedCategories =
        filters.categories ?? options.categories.map(category => category.value)
    const selectedAccounts = filters.accounts ?? options.accounts
    const selectedColumns = columns ?? TABLE_COLUMNS.map(column => column.id)

    return (
        <aside className="aside">
            <SearchField
                variant="secondary"
                label="Поиск"
                value={filters.query}
                placeholder="Плательщик, комментарий, счёт"
                onChange={query => onChange({ ...filters, query })}
            />

            <MultiSelect
                variant="secondary"
                label="Типы"
                placeholder="Все типы"
                options={options.types.map(type => ({
                    id: type,
                    label: type,
                }))}
                value={selectedTypes}
                onChange={value =>
                    onChange({
                        ...filters,
                        types: toFilterList(value, options.types),
                    })
                }
            />

            <MultiSelect
                variant="secondary"
                label="Колонки"
                placeholder="Колонки"
                minCount={1}
                options={TABLE_COLUMNS.map(column => ({
                    id: column.id,
                    label: column.label,
                }))}
                value={selectedColumns}
                onChange={value =>
                    onColumnsChange(
                        value.length === TABLE_COLUMNS.length
                            ? null
                            : (value as ColumnId[]),
                    )
                }
            />

            <DateRangeField
                variant="secondary"
                dateFrom={filters.dateFrom}
                dateTo={filters.dateTo}
                onChange={next => onChange({ ...filters, ...next })}
            />

            <MultiSelect
                variant="secondary"
                label="Категории"
                placeholder="Все категории"
                options={options.categories.map(category => ({
                    id: category.value,
                    label: category.label,
                }))}
                value={selectedCategories}
                onChange={value =>
                    onChange({
                        ...filters,
                        categories: toFilterList(
                            value,
                            options.categories.map(category => category.value),
                        ),
                    })
                }
            />

            <MultiSelect
                variant="secondary"
                label="Счета"
                placeholder="Все счета"
                options={options.accounts.map(account => ({
                    id: account,
                    label: account,
                }))}
                value={selectedAccounts}
                onChange={value =>
                    onChange({
                        ...filters,
                        accounts: toFilterList(value, options.accounts),
                    })
                }
            />

            {hasActive ? (
                <Button
                    fullWidth
                    variant="secondary"
                    onPress={() => {
                        onChange(DEFAULT_FILTERS)
                        onColumnsChange(null)
                    }}>
                    Сбросить
                </Button>
            ) : null}
        </aside>
    )
}

function toFilterList(value: string[], all: string[]): string[] | null {
    if (
        value.length === all.length &&
        all.every(item => value.includes(item))
    ) {
        return null
    }

    return value
}
