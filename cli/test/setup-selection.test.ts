import assert from "node:assert/strict";
import test from "node:test";
import {
  chooseSetup,
  type SetupPrompts,
} from "../src/core/setup-selection.js";

test("uses an explicitly requested setup", async () => {
  const setup = await chooseSetup({
    interactive: false,
    requested: "recommended",
  });

  assert.equal(setup, "recommended");
});

test("keeps the minimal setup outside an interactive terminal", async () => {
  const setup = await chooseSetup({
    interactive: false,
  });

  assert.equal(setup, "minimal");
});

test("asks for a setup in an interactive terminal", async () => {
  let promptCalls = 0;
  const prompts: SetupPrompts = {
    async selectSetup() {
      promptCalls += 1;
      return "recommended";
    },
  };

  const setup = await chooseSetup({
    interactive: true,
    prompts,
  });

  assert.equal(setup, "recommended");
  assert.equal(promptCalls, 1);
});
