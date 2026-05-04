# Lab 4 – Layered Architecture (restaurant API)

Курс: архітектура ПЗ. REST-бекенд (Node.js + Express), шари Presentation / Application / Domain / Data.

## Запуск

```bash
npm install
npm start
```

Якщо порт 3000 зайнятий: `set PORT=3010&& npm start` (CMD) або `$env:PORT=3010; npm start` (PowerShell).

Корисні URL: `GET /`, `GET /health`, `GET /api/v1/menu/items`.

## Структура

- `src/presentation` – HTTP, роутери
- `src/application` – сервіси
- `src/domain` – інваріанти (переходи статусів)
- `src/data` – репозиторії в памʼяті

Орієнир за шарами як у прикладі з курсу: https://github.com/nvakulenko/architecture-lab4/
