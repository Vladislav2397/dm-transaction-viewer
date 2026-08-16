# DM Transaction Viewer

Локальное веб-приложение для просмотра финансовых операций. Данные приходят из CSV-экспорта или из [ZenMoney API](https://github.com/zenmoney/ZenPlugins/wiki/ZenMoney-API), сохраняются в IndexedDB этого браузера и показываются в одной таблице с фильтрами и сводкой.

Демо на GitHub Pages: путь приложения — `/dm-transaction-viewer/`.

## Возможности

- Импорт CSV (перетаскивание или выбор файла).
- Загрузка операций из ZenMoney: OAuth или вставка `access_token`.
- Одно хранилище: и CSV, и API пишут в IndexedDB и **заменяют** друг друга.
- Фильтры: поиск по плательщику / комментарию / счёту, типы, категории, счета, период (включая текущую неделю, месяц и год).
- Видимость колонок, сортировка, пагинация.
- Сводка по отфильтрованным строкам: число операций, доход и расход по валютам.
- Светлая и тёмная тема.
- Состояние фильтров, сортировки и страницы в URL — ссылку можно скопировать.

Страницы:

| Путь | Назначение |
| --- | --- |
| `/` | Таблица операций, импорт и синхронизация |
| `/auth/callback` | Возврат OAuth ZenMoney |

## Источники данных

### CSV

Ожидается CSV с русской шапкой в духе экспорта ZenMoney. Распознаются колонки:

`Дата`, `Создана`, `Тип`, `Категория`, `Доп категории`, `Со счёта`, `Расход`, `Валюта -`, `На счёт`, `Доход`, `Валюта +`, `Плательщик`, `Комментарий`.

### ZenMoney API

Токен можно вставить вручную (например, с [Zerro.app](https://zerro.app)) или получить через OAuth, если заданы переменные окружения.

После входа операции **не** подтягиваются сами: нужна кнопка «Обновить». Запрос идёт в `diff`, неудалённые транзакции мапятся в ту же модель, что и CSV.

В development Vite проксирует `/api/zenmoney` на `https://api.zenmoney.ru`. В production запросы идут напрямую на API (нужен CORS на стороне ZenMoney или свой прокси).

## Запуск

Нужны Node.js и npm.

```bash
cp .env.example .env
npm install
npm run dev
```

Приложение откроется с `base` `/dm-transaction-viewer/` (как на GitHub Pages).

| Скрипт | Действие |
| --- | --- |
| `npm run dev` | Dev-сервер Vite |
| `npm run build` | `tsc -b` и production-сборка |
| `npm run preview` | Просмотр `dist` |
| `npm run lint` | Oxlint |
| `npm run format` | Oxfmt |

## OAuth ZenMoney

Необязательно: без `VITE_ZENMONEY_CLIENT_ID` и `VITE_ZENMONEY_CLIENT_SECRET` кнопка «Войти через ZenMoney» скрыта, остаётся вставка токена.

1. Создайте приложение в кабинете ZenMoney API.
2. Redirect URI должен совпадать с тем, что считает клиент:

   `{origin}{BASE_URL}/auth/callback`

   Локально это обычно `http://localhost:5173/dm-transaction-viewer/auth/callback`.  
   На GitHub Pages — `https://<user>.github.io/dm-transaction-viewer/auth/callback`.

3. Пропишите в `.env`:

```env
VITE_ZENMONEY_CLIENT_ID=
VITE_ZENMONEY_CLIENT_SECRET=
```

`VITE_*` попадает в клиентский бандл. Секрет OAuth в SPA виден в браузере; для личного использования это приемлемо, для публичного клиента лучше обмен кода на бэкенде.

## Хранение

- Операции: IndexedDB (`dm-transaction-viewer` / store `dataset`).
- Токен ZenMoney: `localStorage`.
- Тема: `localStorage` (`heroui-theme`).

Данные не уходят на свой сервер. «Очистить данные» удаляет только сохранённый набор операций.

## Деплой

Сборка — статический SPA. Для GitHub Pages в `vite.config.ts` заданы `base: "/dm-transaction-viewer/"` и копирование `index.html` в `404.html` (fallback маршрутов). Workflow `.github/workflows/deploy.yml` собирает проект и публикует `dist` в Pages.

Для OAuth на проде задайте `VITE_ZENMONEY_*` как secrets/variables CI, иначе в бандле их не будет.

## Стек

React 19, TypeScript, Vite 8, HeroUI, Tailwind 4, TanStack Router и Query. Структура каталогов — [Feature-Sliced Design](https://feature-sliced.design/).
