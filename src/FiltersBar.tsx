import { TABLE_COLUMNS, type ColumnId } from "./columns"
import type { FilterOptions } from "./query"
import type { TransactionFilters } from "./transaction"
import { DEFAULT_FILTERS } from "./transaction"
import {
    isColumnEnabled,
    isTypeEnabled,
    toggleColumn,
    toggleType,
} from "./urlState"

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
        filters.category !== "" ||
        filters.account !== "" ||
        filters.dateFrom !== "" ||
        filters.dateTo !== ""

    return (
        <div className="filters">
            <div className="toggle-group">
                <span className="filters-caption">Типы</span>
                <div className="type-toggles" role="group" aria-label="Типы">
                    {options.types.map(type => {
                        const enabled = isTypeEnabled(filters.types, type)

                        return (
                            <button
                                key={type}
                                type="button"
                                className="type-toggle"
                                aria-pressed={enabled}
                                onClick={() =>
                                    onChange({
                                        ...filters,
                                        types: toggleType(
                                            filters.types,
                                            type,
                                            options.types,
                                        ),
                                    })
                                }>
                                {type}
                            </button>
                        )
                    })}
                </div>
            </div>
            <div className="toggle-group">
                <span className="filters-caption">Колонки</span>
                <div className="type-toggles" role="group" aria-label="Колонки">
                    {TABLE_COLUMNS.map(column => {
                        const enabled = isColumnEnabled(columns, column.id)
                        const visibleCount =
                            columns === null
                                ? TABLE_COLUMNS.length
                                : columns.length

                        return (
                            <button
                                key={column.id}
                                type="button"
                                className="type-toggle"
                                aria-pressed={enabled}
                                disabled={enabled && visibleCount === 1}
                                onClick={() =>
                                    onColumnsChange(
                                        toggleColumn(columns, column.id),
                                    )
                                }>
                                {column.label}
                            </button>
                        )
                    })}
                </div>
            </div>
            <div className="filters-row">
                <label>
                    С
                    <input
                        type="date"
                        value={filters.dateFrom}
                        min={options.dateMin}
                        max={filters.dateTo || options.dateMax}
                        onChange={event =>
                            onChange({
                                ...filters,
                                dateFrom: event.target.value,
                            })
                        }
                    />
                </label>
                <label>
                    По
                    <input
                        type="date"
                        value={filters.dateTo}
                        min={filters.dateFrom || options.dateMin}
                        max={options.dateMax}
                        onChange={event =>
                            onChange({
                                ...filters,
                                dateTo: event.target.value,
                            })
                        }
                    />
                </label>
                <label>
                    Поиск
                    <input
                        type="search"
                        value={filters.query}
                        placeholder="Плательщик, комментарий, счёт"
                        onChange={event =>
                            onChange({ ...filters, query: event.target.value })
                        }
                    />
                </label>
                <label>
                    Категория
                    <select
                        value={filters.category}
                        onChange={event =>
                            onChange({
                                ...filters,
                                category: event.target.value,
                            })
                        }>
                        <option value="">Все категории</option>
                        {options.categories.map(category => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Счёт
                    <select
                        value={filters.account}
                        onChange={event =>
                            onChange({
                                ...filters,
                                account: event.target.value,
                            })
                        }>
                        <option value="">Все счета</option>
                        {options.accounts.map(account => (
                            <option key={account} value={account}>
                                {account}
                            </option>
                        ))}
                    </select>
                </label>
                {hasActive ? (
                    <button
                        type="button"
                        className="ghost"
                        onClick={() => onChange(DEFAULT_FILTERS)}>
                        Сбросить
                    </button>
                ) : null}
            </div>
        </div>
    )
}
