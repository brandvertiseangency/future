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
    // Third-party Aceternity UI components — not our code, skip linting
    "src/components/ui/canvas-reveal-effect.tsx",
    "src/components/ui/card-hover-effect.tsx",
    "src/components/ui/card-spotlight.tsx",
    "src/components/ui/colourful-text.tsx",
    "src/components/ui/file-upload.tsx",
    "src/components/ui/flip-words.tsx",
    "src/components/ui/floating-dock.tsx",
    "src/components/ui/glare-card.tsx",
    "src/components/ui/glowing-effect.tsx",
    "src/components/ui/hover-border-gradient.tsx",
    "src/components/ui/moving-border.tsx",
    "src/components/ui/placeholders-and-vanish-input.tsx",
    "src/components/ui/sparkles.tsx",
    "src/components/ui/text-generate-effect.tsx",
    "src/components/ui/typewriter-effect.tsx",
  ]),
  {
    linterOptions: {
      // Unused eslint-disable directives — warn only
      reportUnusedDisableDirectives: "warn",
    },
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
      // any is acceptable in API/SWR response shapes — warn only
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
]);

export default eslintConfig;
