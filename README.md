# tankerkoenig-js

A JavaScript API client for the [Tankerkönig](https://creativecommons.tankerkoenig.de/) gas prices API. Zero dependencies, requires Node.js 18+.

[![NPM Version](https://img.shields.io/npm/v/tankerkoenig-js)](https://www.npmjs.com/package/tankerkoenig-js)
[![NPM Downloads](https://img.shields.io/npm/dt/tankerkoenig-js)](https://www.npmjs.com/package/tankerkoenig-js)
![GitHub Branch Check Runs](https://img.shields.io/github/check-runs/creeperkatze/tankerkoenig-js/main)
![Codecov](https://img.shields.io/codecov/c/github/creeperkatze/tankerkoenig-js)
![GitHub Issues](https://img.shields.io/github/issues/creeperkatze/tankerkoenig-js)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/creeperkatze/tankerkoenig-js)
![GitHub Repo stars](https://img.shields.io/github/stars/creeperkatze/tankerkoenig-js?style=flat)

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
```

You can get an API key at [creativecommons.tankerkoenig.de](https://creativecommons.tankerkoenig.de/).

## 📖 API

### `client.list(options)`: Radius search

Returns all stations within a given radius, with current prices.

```ts
const stations = await client.list({
  lat: 52.521,   // latitude
  lng: 13.438,   // longitude
  rad: 5,        // radius in km (max 25)
  type: 'diesel', // 'e5' | 'e10' | 'diesel' | 'all'
  sort: 'price', // 'price' | 'dist' (optional, default: 'dist')
});
```

### `client.prices(ids)`: Bulk price check

Returns current prices for up to 10 stations by ID.

```ts
const prices = await client.prices([
  '4429a7d9-fb2d-4c29-8cfe-2ca90323f9f8',
  '446bdcf5-9f75-47fc-9cfa-2c3d6fda1c3b',
]);

// {
//   '4429a7d9-...': { status: 'open', e5: 1.409, e10: 1.389, diesel: 1.129 },
//   '446bdcf5-...': { status: 'closed' },
// }
```

### `client.detail(id)`: Station details

Returns full station info including opening times.

```ts
const station = await client.detail('24a381e3-0d72-416d-bfd8-b2f65f6e5802');

station.openingTimes; // [{ text: 'Mo-Fr', start: '06:00:00', end: '22:30:00' }, ...]
station.overrides;    // ['13.04.2017, 15:00:00 - 13.11.2017, 15:00:00: geschlossen']
```

### `client.complaint(options)`: Report incorrect data

Reports wrong station data to the MTS-K via the Tankerkönig API.

```ts
await client.complaint({
  id: 'station-uuid',
  type: 'wrongPriceDiesel',
  correction: 1.234,
});
```

Available complaint types: `wrongPetrolStationName`, `wrongStatusOpen`, `wrongStatusClosed`, `wrongPriceE5`, `wrongPriceE10`, `wrongPriceDiesel`, `wrongPetrolStationBrand`, `wrongPetrolStationStreet`, `wrongPetrolStationHouseNumber`, `wrongPetrolStationPostcode`, `wrongPetrolStationPlace`, `wrongPetrolStationLocation`.

## ⚠️ Error handling

All methods throw a `TankerkoenigError` on API errors (`ok: false`) or non-2xx HTTP responses.

```ts
import { TankerkoenigClient, TankerkoenigError } from 'tankerkoenig-js';

try {
  const stations = await client.list({ ... });
} catch (err) {
  if (err instanceof TankerkoenigError) {
    console.error(err.message);
  }
}
```

## 👨‍💻 Development

```sh
pnpm build

pnpm test
```

## 📜 License

AGPL-3.0
