# Playwright Test Automation Series

Learn Playwright with TypeScript, step by step. One lesson at a time.

Each lesson follows the Playwright Reels Series: https://qatools.dev/reels

Practice app: https://playground.qatools.dev/

## Setup

```bash
npm install
npx playwright install
```

## Run the tests

```bash
npm test                # run all tests
npm run test:headed     # see the browser
npm run test:ui         # open Playwright UI mode
npm run report          # open the last HTML report
```

## Folder structure

```
tests/          all lessons, one folder per lesson
src/pages/      page objects (coming later)
src/fixtures/   custom fixtures (coming later)
src/utils/      helper functions (coming later)
test-data/      test data files
playwright.config.ts
```

## Lessons

| Lesson | What you learn | Folder |
| --- | --- | --- |
| 01 | Open the app and check the title | `tests/01-fundamentals` |
| 07 | Your first real test - login | `tests/07-first-login-test` |
| 08 | What `await` does | `tests/08-await-explained` |

See [CURRICULUM.md](CURRICULUM.md) for the full list and progress.

## Demo login

- Email: `demo@promptqa.test`
- Password: `Demo@1234`
