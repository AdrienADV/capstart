import assert from "node:assert/strict";
import test from "node:test";
import {
  offerGithubStar,
  type GithubStarPrompt,
} from "../src/core/github-star.js";

test("skips the star prompt outside an interactive terminal", async () => {
  let promptCalls = 0;
  const result = await offerGithubStar({
    cwd: ".",
    interactive: false,
    isGhInstalled: async () => true,
    prompt: {
      async confirmStar() {
        promptCalls += 1;
        return true;
      },
    },
  });

  assert.equal(result, "skipped");
  assert.equal(promptCalls, 0);
});

test("skips the star prompt when GitHub CLI is not installed", async () => {
  let promptCalls = 0;
  const result = await offerGithubStar({
    cwd: ".",
    interactive: true,
    isGhInstalled: async () => false,
    prompt: {
      async confirmStar() {
        promptCalls += 1;
        return true;
      },
    },
  });

  assert.equal(result, "skipped");
  assert.equal(promptCalls, 0);
});

test("does not star the repository when the user declines", async () => {
  let starCalls = 0;
  const result = await offerGithubStar({
    cwd: ".",
    interactive: true,
    isGhInstalled: async () => true,
    prompt: createPrompt(false),
    starRepository: async () => {
      starCalls += 1;
    },
  });

  assert.equal(result, "declined");
  assert.equal(starCalls, 0);
});

test("stars the repository after explicit confirmation", async () => {
  let starCalls = 0;
  const result = await offerGithubStar({
    cwd: ".",
    interactive: true,
    isGhInstalled: async () => true,
    prompt: createPrompt(true),
    starRepository: async () => {
      starCalls += 1;
    },
  });

  assert.equal(result, "starred");
  assert.equal(starCalls, 1);
});

test("does not fail initialization when starring fails", async () => {
  const result = await offerGithubStar({
    cwd: ".",
    interactive: true,
    isGhInstalled: async () => true,
    prompt: createPrompt(true),
    starRepository: async () => {
      throw new Error("Not authenticated");
    },
  });

  assert.equal(result, "failed");
});

function createPrompt(value: boolean): GithubStarPrompt {
  return {
    async confirmStar() {
      return value;
    },
  };
}
