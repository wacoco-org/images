import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import path from "node:path";
import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isCI = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";

const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const defaultGhPagesBase =
    repo && repo.endsWith(".github.io") ? "/" : repo ? `/${repo}/` : "/";

const base = process.env.VITE_BASE ?? (isCI ? defaultGhPagesBase : "/");

export default defineConfig({
  base,
  plugins: [react()],

  test: {
    projects: [
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(__dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
          setupFiles: [path.join(__dirname, ".storybook", "vitest.setup.js")],
        },
      },
    ],
  },
});
