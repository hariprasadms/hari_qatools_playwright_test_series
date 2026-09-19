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
npm run dashboard       # open the local test dashboard at http://localhost:4173
```

## Local test dashboard

Run `npm run dashboard`, then open [http://localhost:4173](http://localhost:4173). The dashboard discovers specs under `tests/`, lets you choose a browser project or headed mode, runs a selected spec locally, and opens the latest Playwright HTML report.

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
| 09 | No sleep needed - Playwright waits for you | `tests/09-goto-auto-wait` |
| 10 | Fill a signup form - fill, select, check, click | `tests/10-signup-form` |
| 11 | Locator types - which one to use when | `tests/11-locators` |

See [CURRICULUM.md](CURRICULUM.md) for the full list and progress.

## Demo login

- Email: `demo@promptqa.test`
- Password: `Demo@1234`

## Spot the bug

Short tests with one bug hidden inside. Find it, then read the answer in the file.

| # | Bug | File |
| --- | --- | --- |
| 01 | Missing `await` on `expect` | `tests/spot-the-bug/01-missing-await.spec.ts` |
| 02 | Await does not affect | `tests/spot-the-bug/02-await-does-not-affect.spec.ts` |
| 03 | Green test, failed login - the negative assertion trap | `tests/spot-the-bug/03-green-but-lying.spec.ts` |
| 04 | Looks right, fails every time | `tests/spot-the-bug/04-looks-right.spec.ts` |
