import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

module.exports = {
  extends: ["next", "next/core-web-vitals"],
  rules: {
    // Turn off or warn instead of error:
    "@typescript-eslint/no-explicit-any": "off",
    // OR:
    // "@typescript-eslint/no-explicit-any": "warn",
  },
};

export default eslintConfig;
