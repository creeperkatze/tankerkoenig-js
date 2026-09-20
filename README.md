# tankerkoenig-js

A JavaScript API client for the [Tankerkönig](https://creativecommons.tankerkoenig.de/) gas prices API. Zero dependencies, requires Node.js 18+.

[![NPM Version](https://img.shields.io/npm/v/tankerkoenig-js)](https://www.npmjs.com/package/tankerkoenig-js)
[![NPM Downloads](https://img.shields.io/npm/dt/tankerkoenig-js)](https://www.npmjs.com/package/tankerkoenig-js)
[![GitHub Branch Check Runs](https://img.shields.io/github/check-runs/creeperkatze/tankerkoenig-js/main)](https://github.com/creeperkatze/tankerkoenig-js/actions)
[![Codecov](https://img.shields.io/codecov/c/github/creeperkatze/tankerkoenig-js)](https://codecov.io/github/creeperkatze/tankerkoenig-js)
[![GitHub Issues](https://img.shields.io/github/issues/creeperkatze/tankerkoenig-js)](https://github.com/creeperkatze/tankerkoenig-js/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/creeperkatze/tankerkoenig-js)](https://github.com/creeperkatze/tankerkoenig-js/pulls)
[![GitHub Repo stars](https://img.shields.io/github/stars/creeperkatze/tankerkoenig-js?style=flat)](https://github.com/creeperkatze/tankerkoenig-js/stargazers)

[📚 Docs](https://tankerkoenig-js.creeperkatze.dev/) •
[🚀 Getting Started](https://tankerkoenig-js.creeperkatze.dev/guide/getting-started) •
[📖 API Reference](https://tankerkoenig-js.creeperkatze.dev/api) •
[📝 Changelog](https://github.com/creeperkatze/tankerkoenig-js/releases)

## 📦 Installation

```sh
npm install tankerkoenig-js
pnpm add tankerkoenig-js
yarn add tankerkoenig-js
bun add tankerkoenig-js
```

## 🚀 Usage

```ts
import TankerkoenigClient from 'tankerkoenig-js';

const client = new TankerkoenigClient('your-api-key');

const stations = await client.list({
  lat: 52.521,
  lng: 13.438,
  rad: 5,
  type: 'diesel',
});
```

You can get an API key at [creativecommons.tankerkoenig.de](https://creativecommons.tankerkoenig.de/).

## 📖 API

### `new TankerkoenigClient(apiKey)`

```ts
const client = new TankerkoenigClient('your-api-key');
```

### Methods

- `client.list(options)` - radius search, returns stations with current prices
- `client.prices(ids)` - bulk price check for up to 10 stations
- `client.detail(id)` - full station info including opening times
- `client.complaint(options)` - report incorrect station data

See the [guide](https://tankerkoenig-js.creeperkatze.dev/guide/getting-started) and [API reference](https://tankerkoenig-js.creeperkatze.dev/api) for details.

## ⚠️ Error Handling

All request and API errors are thrown as `TankerkoenigError`.

```ts
import TankerkoenigClient, { TankerkoenigError } from 'tankerkoenig-js';

const client = new TankerkoenigClient('your-api-key');

try {
  await client.detail('station-id');
} catch (error) {
  if (error instanceof TankerkoenigError) {
    console.error(error.message);
  }
}
```

## 👨‍💻 Development

```sh
pnpm build

pnpm test
```

## 🤝 Contributing

Contributions are always welcome!

Please ensure you run `pnpm lint:fix` before opening a pull request.

## 📜 License

MIT
