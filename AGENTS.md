# Agent guidance

## Stack

ShopLedger is a Node.js application using Express and `body-parser`. The browser UI is plain HTML, CSS, and JavaScript served from `public/`. The app stores products, orders, customers, settlements, and audit entries in `data/db.json` using synchronous file reads and writes. There is no separate database service or frontend build step.

## Module map

- `server.js` creates the Express app, serves `public/`, mounts the API routers, and serves printable invoice HTML.
- `config.js` holds the port, shop details, tax settings, inventory defaults, coupon definitions, and admin key.
- `routes/products.js` serves products and active coupons.
- `routes/orders.js` handles order lookup, creation, and cancellation.
- `routes/customers.js` serves customer/settlement data and records settlements.
- `routes/reports.js` serves dashboard and GST reports, pricing preview, and admin export.
- `lib/` contains order, inventory, pricing, tax, coupon, ledger, report, invoice, date, and JSON-store logic.
- `public/` contains the browser UI; `data/db.json` contains the application data.

## Commands

- `npm start` starts the app with `node server.js`.
- `npm test` currently exits with an error because `package.json` has a placeholder script and no test suite is defined.

## Change rules

- Before changing behaviour, write characterization tests for the existing behaviour being changed.
- Change only the module the ticket is about.
- Tests must never read or write `data/db.json`.
- Do not add dependencies.
