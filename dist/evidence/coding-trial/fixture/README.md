# A small order-summary repair task

Requires Node.js 22 or later. No dependency installation, account or network request is needed to run the checks.

Run `node --test test/orders.test.mjs`. The starting implementation is intentionally faulty; failing tests are expected.

Repair only `src/orders.mjs`. Do not change test files. The function accepts an array of order records. Eligible records have status `paid`; ignore other records, even if their amount is malformed. Eligible IDs are strings and must be unique. The task's lexical ordering uses JavaScript string ordering, not locale-dependent sorting.

Return `ids` in lexical order, `count` for paid records only, total `net_cents` as a safe integer, and `highest_id` for the largest amount minus refund. Ties choose the lexically first ID. Empty input returns no IDs, zero count and total, and null highest ID. Do not mutate the input.

Amount and refund are nonnegative decimal strings with zero, one or two fractional digits. No leading zeros except zero itself; no spaces, exponent notation or negative signs. A missing refund means zero. Reject malformed paid values, refunds above the amount, duplicate paid IDs, unsafe integer cents and unsafe aggregate totals. Use exact integer-cent arithmetic.

Review generated changes before running them. Run trials in separate copies. A pass on these twelve public checks is a bounded exercise, not evidence that code is production-ready or a product is generally better.
