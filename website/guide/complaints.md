# Complaints

Report incorrect station data to the MTS-K via the Tankerkönig API.

```ts
await client.complaint({
  id: 'station-uuid',
  type: 'wrongPriceDiesel',
  correction: 1.234,
});
```

## Complaint types

Each `type` expects a different `correction` shape:

| Correction shape | Types |
|---|---|
| None | `wrongStatusOpen`, `wrongStatusClosed` |
| Positive number | `wrongPriceE5`, `wrongPriceE10`, `wrongPriceDiesel` |
| `"lat,lng"` string | `wrongPetrolStationLocation` |
| Non-empty string | `wrongPetrolStationName`, `wrongPetrolStationBrand`, `wrongPetrolStationStreet`, `wrongPetrolStationHouseNumber`, `wrongPetrolStationPostcode`, `wrongPetrolStationPlace` |

The client validates `correction` against the chosen `type` before sending anything, and throws a `TypeError` if the shape doesn't match.

## Correcting a location

```ts
await client.complaint({
  id: 'station-uuid',
  type: 'wrongPetrolStationLocation',
  correction: '52.29162,10.06117', // "lat,lng"
});
```

## Backdating a report

Pass `ts` (a Unix timestamp in seconds) to report on a past state instead of right now:

```ts
await client.complaint({
  id: 'station-uuid',
  type: 'wrongStatusClosed',
  ts: 1700000000,
});
```
