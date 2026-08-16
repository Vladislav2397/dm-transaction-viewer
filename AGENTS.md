# AGENTS.md

Инструкции для любого агента (Cursor, Codex и др.). Не дублировать README: там запуск, OAuth и деплой.

## Стек

React 19 + TypeScript + Vite 8. UI: HeroUI + Tailwind 4. Роутинг: TanStack Router. Запросы: TanStack Query. Алиас `@` → `src/`. `base` приложения: `/dm-transaction-viewer/`.

Формат: oxfmt (`semi: false`, tab 4, printWidth 80, `arrowParens: avoid`). Линт: oxlint. Не ставить Prettier/ESLint.

UI-тексты — на русском.

## FSD

Слои сверху вниз: `app` → `pages` → `widgets` → `features` → `entities` → `shared`. Импорт только вниз. Слайс наружу — через `index.ts`, не из глубоких путей.

| Слой | Здесь лежит |
| --- | --- |
| `app` | `router.tsx`, layout, стили, `main.tsx` |
| `pages` | страницы-композиторы без бизнес-логики |
| `widgets` | `transaction-workspace`: таблица, фильтры, URL-состояние |
| `features` | `csv-import`, `zenmoney-sync` |
| `entities/transaction` | тип операции, фильтры, сортировка, сводка, IndexedDB |
| `shared` | API ZenMoney, UI-примитивы, `format` |

Новый экран: `pages/<name>/ui` + реэкспорт в `index.ts` + маршрут в `src/app/router.tsx`. Новый слайс: те же сегменты `ui` / `model` / `lib`.

## Данные

Один набор операций в IndexedDB (`entities/transaction/lib/storage.ts`). CSV и ZenMoney **заменяют** его целиком, не мержат.

- Модель: `Transaction` в `entities/transaction/model/types.ts`.
- Фильтрация/сорт/итоги: `entities/transaction/lib/query.ts`.
- Фильтры, колонки, sort, page — query-string через `useViewSearch` / `urlState.ts`. Не заводить отдельный глобальный стор.
- Токен ZenMoney: `localStorage` (`shared/api/zenmoney/token.ts`). Тема: `heroui-theme`.
- Маппинг API → `Transaction`: `features/zenmoney-sync/lib/map.ts`. HTTP: `shared/api/zenmoney`. В dev прокси `/api/zenmoney`, в prod прямой `api.zenmoney.ru`.
- CSV-шапка на русском: `features/csv-import/lib/parse.ts`.

Операции с API подтягиваются только по кнопке «Обновить», не при логине.

## UI

Браться к существующим HeroUI (`Button`, `Table`, `Input`, …) и примитивам из `shared/ui` (`Select`, `MultiSelect`, `SearchField`, `DateRangeField`). Не плодить сырые `<button>`/`<select>`, если уже есть обёртка.

Стили приложения: `src/app/styles`. Не тащить CSS-in-JS.

## Ограничения

- Не коммитить `.env`, токены, секреты.
- Не расширять OAuth/CORS «на всякий случай»: client id/secret — `VITE_*`, redirect `{origin}{BASE_URL}/auth/callback`.
- Не добавлять зависимости, если задачу закрывает текущий стек.
- Не переписывать README под шаблон Vite.
