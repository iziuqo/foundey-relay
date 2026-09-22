import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: ["dist/**", ".next/**", "plan/**"],
  },
  {
    ignores: ["lib/time.ts"],
    rules: {
      // Site time must come from lib/time.ts (`timeZone: 'America/Los_Angeles'`), never the
      // browser clock or an unzoned formatter. Plan §8.3 / README P0 6.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MemberExpression[property.name=/^(getHours|getMinutes|getDay)$/]",
          message:
            "Use lib/time.ts instead of reading the local Date directly (README P0 6).",
        },
        {
          selector:
            "CallExpression[callee.property.name='toLocaleTimeString']",
          message:
            "toLocaleTimeString without an explicit timeZone belongs in lib/time.ts only (README P0 6).",
        },
      ],
    },
  },
];

export default eslintConfig;
