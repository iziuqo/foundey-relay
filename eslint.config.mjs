import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: ["dist/**", ".next/**", ".next-test/**", "plan/**"],
  },
  {
    ignores: ["lib/time.ts"],
    rules: {
      // No inline `style` for color, shadow, or background — components/ui is token
      // only. Plan §9.2 (P1 9-11): inline styles are how v1 lost focus rings, hover,
      // and elevation. Genuine dynamic geometry (e.g. an SVG arc's stroke-dasharray)
      // is a narrow, documented eslint-disable-next-line, not the default.
      "react/forbid-dom-props": [
        "error",
        {
          forbid: [
            {
              propName: "style",
              message:
                "Style with token utility classes (e.g. bg-(--surface-1)), not inline style (plan §9.2 P1 9-11).",
            },
          ],
        },
      ],
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
