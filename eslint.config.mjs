import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Extend the base configuration from Next.js core and TypeScript
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Add custom rules
  {
    rules: {
      // Add the rule to disallow unused variables and parameters
      "@typescript-eslint/no-unused-vars": [
        "warn", // Set to "warn" or "error" depending on the severity
        {
          vars: "all", // Apply the rule to all variables
          args: "after-used", // Apply the rule to function arguments that are after the last used one
          ignoreRestSiblings: true, // Ignore unused variables that are part of rest elements
          argsIgnorePattern: "^_", // Allow unused function arguments starting with an underscore
          caughtErrors: "none", // Don't flag unused caught errors (e.g., in try-catch)
          ignoreTypeImports: true, // Ignore unused type imports (this is especially useful for TypeScript)
        },
      ],
    },
  },
];

export default eslintConfig;
