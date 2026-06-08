import assert from "node:assert/strict";
import test from "node:test";
import { nextjsAdapter } from "../src/adapters/nextjs.js";
import { nuxtAdapter } from "../src/adapters/nuxt.js";
import { tanstackStartAdapter } from "../src/adapters/tanstack-start.js";
import { vueAdapter } from "../src/adapters/vue.js";
import {
  chooseAdapter,
  type FrameworkPrompts,
} from "../src/core/framework-selection.js";

test("uses the detected framework after confirmation", async () => {
  const prompts = createPrompts({ confirm: true, selected: "tanstack-start" });
  const adapter = await chooseAdapter({
    acceptDetected: false,
    detected: [nextjsAdapter],
    interactive: true,
    prompts,
  });

  assert.equal(adapter.id, "nextjs");
  assert.equal(prompts.confirmCalls, 1);
  assert.equal(prompts.selectCalls, 0);
});

test("offers all frameworks when the detected framework is refused", async () => {
  const prompts = createPrompts({ confirm: false, selected: "tanstack-start" });
  const adapter = await chooseAdapter({
    acceptDetected: false,
    detected: [nextjsAdapter],
    interactive: true,
    prompts,
  });

  assert.equal(adapter.id, "tanstack-start");
  assert.equal(prompts.confirmCalls, 1);
  assert.equal(prompts.selectCalls, 1);
  assert.deepEqual(prompts.lastOptions, [
    "nextjs",
    "nuxt",
    "tanstack-start",
    "vue",
  ]);
});

test("selects a framework when detection finds nothing", async () => {
  const prompts = createPrompts({ confirm: false, selected: "nextjs" });
  const adapter = await chooseAdapter({
    acceptDetected: false,
    detected: [],
    interactive: true,
    prompts,
  });

  assert.equal(adapter.id, "nextjs");
  assert.equal(prompts.confirmCalls, 0);
  assert.equal(prompts.selectCalls, 1);
});

test("accepts a single detected framework with --yes", async () => {
  const adapter = await chooseAdapter({
    acceptDetected: true,
    detected: [tanstackStartAdapter],
    interactive: false,
  });

  assert.equal(adapter.id, "tanstack-start");
});

test("accepts a detected Nuxt project with --yes", async () => {
  const adapter = await chooseAdapter({
    acceptDetected: true,
    detected: [nuxtAdapter],
    interactive: false,
  });

  assert.equal(adapter.id, "nuxt");
});

test("accepts a detected Vue project with --yes", async () => {
  const adapter = await chooseAdapter({
    acceptDetected: true,
    detected: [vueAdapter],
    interactive: false,
  });

  assert.equal(adapter.id, "vue");
});

test("requires an explicit choice outside an interactive terminal", async () => {
  await assert.rejects(
    chooseAdapter({
      acceptDetected: false,
      detected: [nextjsAdapter],
      interactive: false,
    }),
    /Pass --yes to accept it or --framework to choose explicitly/,
  );
});

function createPrompts(options: {
  confirm: boolean;
  selected: "nextjs" | "nuxt" | "tanstack-start" | "vue";
}): FrameworkPrompts & {
  confirmCalls: number;
  lastOptions: string[];
  selectCalls: number;
} {
  return {
    confirmCalls: 0,
    lastOptions: [],
    selectCalls: 0,
    async confirmDetected() {
      this.confirmCalls += 1;
      return options.confirm;
    },
    async selectFramework(adapters) {
      this.selectCalls += 1;
      this.lastOptions = adapters.map((adapter) => adapter.id);
      return options.selected;
    },
  };
}
