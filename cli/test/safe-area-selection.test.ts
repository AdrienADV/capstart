import assert from "node:assert/strict";
import test from "node:test";
import {
  chooseSafeArea,
  type SafeAreaPrompts,
} from "../src/core/safe-area-selection.js";

test("uses an explicitly requested safe area choice", async () => {
  assert.equal(
    await chooseSafeArea({
      interactive: false,
      requested: true,
    }),
    true,
  );
});

test("does not add safe area padding outside an interactive terminal by default", async () => {
  assert.equal(await chooseSafeArea({ interactive: false }), false);
});

test("asks about safe area padding in an interactive terminal", async () => {
  let promptCalls = 0;
  const prompts: SafeAreaPrompts = {
    async confirmSafeArea() {
      promptCalls += 1;
      return true;
    },
  };

  assert.equal(
    await chooseSafeArea({
      interactive: true,
      prompts,
    }),
    true,
  );
  assert.equal(promptCalls, 1);
});
