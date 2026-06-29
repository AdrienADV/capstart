import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createCommand } from "../src/commands/create.js";

const boilerplatePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../capstart-boilerplate",
);

test("creates an app from a local boilerplate template", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "capstart-create-test-"));
  const target = path.join(root, "mobile-app");

  const originalLog = console.log;
  console.log = () => {};
  try {
    await createCommand({
      appId: "com.example.mobile",
      appName: "Example Mobile",
      directory: target,
      interactive: false,
      template: boilerplatePath,
    });
  } finally {
    console.log = originalLog;
  }

  const packageJson = JSON.parse(
    await readFile(path.join(target, "package.json"), "utf8"),
  ) as { name: string };
  const capacitorConfig = await readFile(
    path.join(target, "capacitor.config.ts"),
    "utf8",
  );
  const androidBuild = await readFile(
    path.join(target, "android/app/build.gradle"),
    "utf8",
  );
  const androidStrings = await readFile(
    path.join(target, "android/app/src/main/res/values/strings.xml"),
    "utf8",
  );
  const mainActivity = await readFile(
    path.join(
      target,
      "android/app/src/main/java/com/example/mobile/MainActivity.java",
    ),
    "utf8",
  );
  const xcodeProject = await readFile(
    path.join(target, "ios/App/App.xcodeproj/project.pbxproj"),
    "utf8",
  );
  const iosInfoPlist = await readFile(
    path.join(target, "ios/App/App/Info.plist"),
    "utf8",
  );

  assert.equal(packageJson.name, "mobile-app");
  assert.match(capacitorConfig, /appId: "com\.example\.mobile"/);
  assert.match(capacitorConfig, /appName: "Example Mobile"/);
  assert.match(androidBuild, /namespace = "com\.example\.mobile"/);
  assert.match(androidBuild, /applicationId "com\.example\.mobile"/);
  assert.match(androidStrings, /<string name="app_name">Example Mobile<\/string>/);
  assert.match(androidStrings, /<string name="package_name">com\.example\.mobile<\/string>/);
  assert.match(mainActivity, /package com\.example\.mobile;/);
  assert.match(xcodeProject, /PRODUCT_BUNDLE_IDENTIFIER = com\.example\.mobile;/);
  assert.match(iosInfoPlist, /<string>Example Mobile<\/string>/);
});

test("refuses to create an app in a non-empty directory", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "capstart-create-test-"));
  await writeFile(path.join(root, "existing.txt"), "existing\n");

  const originalLog = console.log;
  console.log = () => {};
  try {
    await assert.rejects(
      createCommand({
        appId: "com.example.mobile",
        appName: "Example Mobile",
        directory: root,
        interactive: false,
        template: boilerplatePath,
      }),
      /not empty/,
    );
  } finally {
    console.log = originalLog;
  }
});
