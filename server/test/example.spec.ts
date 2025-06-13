import { test } from "node:test";
const assert = require('node:assert');


test("simple add", async () => {
  const a = 1;
  const b = 2;
  assert.strictEqual(a + b, 3);
});
