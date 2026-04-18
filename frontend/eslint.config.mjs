import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // macOS resource fork files
    "**/._(.*)",
    "**/_page.tsx",
    "**/._*.tsx",
    "**/._*.ts",
  ]),
  {
    rules: {
      // Allow simple setState calls in useEffect (e.g. mount guards)
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      // Downgrade <img> and <a> warnings — handled per-file with eslint-disable comments where needed
      "@next/next/no-img-element": "warn",
      "@next/next/no-html-link-for-pages": "error",
      // Unused vars — warn only (don't block build)
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      // Allow anonymous default exports in config/utility files
      "import/no-anonymous-default-export": "warn",
    },
  },
]);

export default eslintConfig;
