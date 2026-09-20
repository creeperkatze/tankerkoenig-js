# Error Handling

All request failures (non-2xx HTTP responses and API errors where `ok: false`) throw a `TankerkoenigError`.

## Catching errors

```ts
import TankerkoenigClient, { TankerkoenigError } from 'tankerkoenig-js';

try {
  await client.list({ lat: 52.521, lng: 13.438, rad: 5, type: 'diesel' });
} catch (err) {
  if (err instanceof TankerkoenigError) {
    console.error(err.message);
  }
}
```

## TankerkoenigError properties

| Property | Type | Description |
|---|---|---|
| `message` | `string` | Human-readable description |
| `response` | `Response \| undefined` | The raw fetch `Response` if available |

## Validation errors

Invalid input (a bad coordinate, an out-of-range radius, an unknown fuel type, a malformed complaint correction, and so on) throws a `TypeError` or `RangeError` synchronously, before any request is sent. These are not `TankerkoenigError`s:

```ts
try {
  await client.list({ lat: 52.521, lng: 13.438, rad: 30, type: 'diesel' }); // rad > 25
} catch (err) {
  if (err instanceof RangeError) {
    // rad, or another numeric constraint, was out of range
  } else if (err instanceof TankerkoenigError) {
    // the request reached the API and failed there
  }
}
```
