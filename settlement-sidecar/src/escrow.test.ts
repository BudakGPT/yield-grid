import assert from "node:assert/strict";
import test from "node:test";
import { orderIdScVal, parseBaseUnits, rupiahToBaseUnits } from "./escrow.js";

test("rupiah maps exactly to seven-decimal YGIDR base units", () => {
  assert.equal(rupiahToBaseUnits("1"), 10_000_000n);
  assert.equal(rupiahToBaseUnits("1.25"), 12_500_000n);
  assert.equal(rupiahToBaseUnits("18000"), 180_000_000_000n);
});

test("base units reject zero and fractional strings", () => {
  assert.throws(() => parseBaseUnits("0"), /positive integer/);
  assert.throws(() => parseBaseUnits("12.5"), /positive integer/);
  assert.equal(parseBaseUnits("12500000"), 12_500_000n);
});

test("order id accepts a UUID and rejects non-16-byte input", () => {
  assert.doesNotThrow(() => orderIdScVal("550e8400-e29b-41d4-a716-446655440000"));
  assert.throws(() => orderIdScVal("not-a-uuid"), /16 bytes/);
});
