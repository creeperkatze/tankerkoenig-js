# Stations & Prices

## Radius search

Returns all stations within a given radius, with current prices.

```ts
const stations = await client.list({
  lat: 52.521,
  lng: 13.438,
  rad: 5, // radius in km (max 25)
  type: 'diesel', // 'e5' | 'e10' | 'diesel' | 'all'
  sort: 'price', // 'price' | 'dist' (optional, default: 'dist')
});
```

## Bulk price check

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

## Station detail

Returns full station info including opening times.

```ts
const station = await client.detail('24a381e3-0d72-416d-bfd8-b2f65f6e5802');

station.openingTimes; // [{ text: 'Mo-Fr', start: '06:00:00', end: '22:30:00' }, ...]
station.overrides; // ['13.04.2017, 15:00:00 - 13.11.2017, 15:00:00: geschlossen']
```

## Fuel price fields

A missing fuel price at a station is represented as `false`, not `undefined` or `null`. Always check for `false` before using a price value:

```ts
if (station.diesel !== false) {
  console.log(`Diesel: ${station.diesel} €`);
}
```
