# Getting Started

## Installation

::: code-group

```sh [npm]
npm install tankerkoenig-js
```

```sh [pnpm]
pnpm add tankerkoenig-js
```

```sh [yarn]
yarn add tankerkoenig-js
```

```sh [bun]
bun add tankerkoenig-js
```

:::

## Get an API key

You need an API key to use this client. Get one for free at [creativecommons.tankerkoenig.de](https://creativecommons.tankerkoenig.de/).

## Create a client

```ts
import TankerkoenigClient from 'tankerkoenig-js';

const client = new TankerkoenigClient('your-api-key');
```

## Fetch some data

```ts
const stations = await client.list({
  lat: 52.521,
  lng: 13.438,
  rad: 5, // radius in km, max 25
  type: 'diesel',
});
```

## Where to go next

- See [Stations & Prices](/guide/stations) for radius search, bulk price checks, and station detail
- See [Complaints](/guide/complaints) for reporting incorrect station data
- See [Error Handling](/guide/error-handling) for catching and inspecting errors
- See [API Reference](/api/) for the generated public API docs
