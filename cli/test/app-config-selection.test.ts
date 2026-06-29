import assert from "node:assert/strict";
import test from "node:test";
import {
  chooseAppId,
  chooseAppName,
  type AppConfigPrompts,
} from "../src/core/app-config-selection.js";

test("uses explicitly requested app config values", async () => {
  assert.equal(
    await chooseAppId({
      defaultValue: "com.capstart.example",
      interactive: false,
      requested: "com.example.app",
    }),
    "com.example.app",
  );
  assert.equal(
    await chooseAppName({
      defaultValue: "example",
      interactive: false,
      requested: "Example App",
    }),
    "Example App",
  );
});

test("uses default app config values outside an interactive terminal", async () => {
  assert.equal(
    await chooseAppId({
      defaultValue: "com.capstart.example",
      interactive: false,
    }),
    "com.capstart.example",
  );
  assert.equal(
    await chooseAppName({
      defaultValue: "example",
      interactive: false,
    }),
    "example",
  );
});

test("asks for app config values in an interactive terminal", async () => {
  const prompts: AppConfigPrompts = {
    async enterAppId(defaultValue) {
      assert.equal(defaultValue, "com.capstart.example");
      return "com.example.mobile";
    },
    async enterAppName(defaultValue) {
      assert.equal(defaultValue, "example");
      return "Example Mobile";
    },
  };

  assert.equal(
    await chooseAppId({
      defaultValue: "com.capstart.example",
      interactive: true,
      prompts,
    }),
    "com.example.mobile",
  );
  assert.equal(
    await chooseAppName({
      defaultValue: "example",
      interactive: true,
      prompts,
    }),
    "Example Mobile",
  );
});
