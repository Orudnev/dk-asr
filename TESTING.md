# Unit Tests

## Run all tests

```bash
npm test
```

## Run only settings tests

```bash
npm test -- Src/db/tblSettings.test.ts
```

## What is covered

- `setProperty` saves a setting in the `Settings` table as a JSON string.
- `getProperty` reads and parses the JSON string from the mocked database.
- `getProperty` falls back to the default value when the row is missing or JSON is invalid.
