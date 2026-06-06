import assert from "node:assert/strict";
import test from "node:test";
import {
  getCapacitorRuntimePackages,
  recommendedCapacitorPlugins,
} from "../src/capacitor/install.js";

test("minimal setup only includes Capacitor core and platforms", () => {
  assert.deepEqual(
    getCapacitorRuntimePackages(["ios", "android"], "minimal"),
    ["@capacitor/core", "@capacitor/ios", "@capacitor/android"],
  );
});

test("recommended setup includes the baseline Capacitor plugins", () => {
  assert.deepEqual(
    getCapacitorRuntimePackages(["ios"], "recommended"),
    ["@capacitor/core", "@capacitor/ios", ...recommendedCapacitorPlugins],
  );
  assert.deepEqual(recommendedCapacitorPlugins, [
    "@capacitor/keyboard",
    "@capacitor/network",
    "@capacitor/device",
    "@capacitor/splash-screen",
    "@capacitor/status-bar",
  ]);
});
