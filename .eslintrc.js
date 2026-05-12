module.exports = {
  "parser": "@typescript-eslint/parser",
  "plugins": [
      "@typescript-eslint",
      "react-hooks"
  ],
  "parserOptions": {
      "ecmaVersion": 2018,
      "sourceType": "module",
      "ecmaFeatures": {},
      "project": "tsconfig.json",
      "createDefaultProgram": true,
      "tsconfigRootDir": "./"
  },
  "extends": [
      "plugin:@typescript-eslint/recommended",
      "plugin:react-hooks/recommended",
      "@eslint-kit/base",
      "@eslint-kit/prettier"
  ],
  "rules": {
      "@typescript-eslint/no-unused-expressions": [
          "warn",
          {
            "allowShortCircuit": true,
            "allowTernary": true
          }
        ],
        "sonarjs/cognitive-complexity": "off",
        "sonarjs/no-identical-functions": "off",
        "sonarjs/no-small-switch": "off",
        "react/destructuring-assignment": "off",
        "import/no-anonymous-default-export": "off",
        "import/no-cycle": "off",
        "react/jsx-props-no-spreading": "off",
        "no-restricted-imports": [
          "warn",
          {
              "patterns": ["../../*"]
          }
        ],
        "import/no-unresolved": "off",
        "import/extensions": "off",
        "no-undef": "off",
        "prettier/prettier": ["warn", {
          "importOrder": ["^@core/(.*)$", "^[./]"],
          "importOrderSeparation": true,
          "importOrderSortSpecifiers": true,
          "semi": false,
          "trailingComma": "all",
          "singleQuote": true,
          "printWidth": 120,
          "tabWidth": 2,
          "endOfLine": "auto",
          "parser": "typescript"
        }],
        "radix": "off",
        "react/jsx-uses-react": "warn",
        "react/jsx-uses-vars": "warn",
        "react/no-access-state-in-setstate": "warn",
        "react/no-deprecated": "error",
        "react/no-direct-mutation-state": "error",
        "react/no-typos": "error",
        "react/no-unsafe": "error",
        "react/no-unknown-property": "error",
        "react/react-in-jsx-scope": "error",
        "react/self-closing-comp": "warn",
        "react/sort-comp": "warn",
        "react/state-in-constructor": ["warn", "never"],
        "react/style-prop-object": "error",
        "react/jsx-key": "off",
        "react/no-array-index-key": "warn",
        "react/jsx-no-bind": [
          "warn",
          {
            "allowArrowFunctions": true
          }
        ],
        "react/jsx-curly-brace-presence": "warn",
        "react/jsx-pascal-case": "warn",
        "react/jsx-no-undef": "error",
        "semi":"off",
        "unicorn/explicit-length-check": "off",
    
        // hooks
        "react-hooks/rules-of-hooks": "error"
  },
  "overrides": [
      {
        "files": ["*.ts", "*.tsx"],
        "rules": {
          // rules from @typescript-eslint
          // it should be there to support mixed codebases
          "@typescript-eslint/adjacent-overload-signatures": "warn",
          "@typescript-eslint/ban-ts-comment": "error",
          "@typescript-eslint/ban-types": "error",
          "@typescript-eslint/naming-convention": [
            "warn",
            {
              "selector": "variable",
              "format": ["camelCase", "UPPER_CASE", "PascalCase"],
              "leadingUnderscore": "allow"
            },
            {
              "selector": "parameter",
              "format": ["camelCase"],
              "leadingUnderscore": "allow",
              "filter": {
                  "regex": ".*Component$",
                  "match": false
                }
            },
            {
              "selector": "typeLike",
              "format": ["PascalCase"]
            }
          ],
          "@typescript-eslint/consistent-type-assertions": "warn",
          "@typescript-eslint/consistent-type-definitions": ["warn", "interface"],
          "@typescript-eslint/no-array-constructor": "warn",
          "@typescript-eslint/no-empty-interface": "warn",
          "@typescript-eslint/no-explicit-any": "off",
          "@typescript-eslint/no-extra-non-null-assertion": "warn",
          "@typescript-eslint/no-for-in-array": "warn",
          "@typescript-eslint/no-inferrable-types": "error",
          "@typescript-eslint/no-misused-new": "error",
          "@typescript-eslint/no-namespace": "error",
          "@typescript-eslint/no-non-null-assertion": "warn",
          "@typescript-eslint/no-unused-vars": [
            "warn",
            {
              "ignoreRestSiblings": true,
              "varsIgnorePattern": "^_",
              "argsIgnorePattern": "^_"
            }
          ],
          "@typescript-eslint/no-unnecessary-condition": "off",
          "@typescript-eslint/no-unused-expressions": "warn",
          "@typescript-eslint/no-useless-constructor": "warn",
          "@typescript-eslint/prefer-for-of": "warn",
          "@typescript-eslint/prefer-includes": "warn",
          "@typescript-eslint/prefer-namespace-keyword": "error",
          "@typescript-eslint/prefer-optional-chain": "warn",
          "@typescript-eslint/prefer-string-starts-ends-with": "warn",
          "@typescript-eslint/require-array-sort-compare": "off",
          "@typescript-eslint/return-await": ["error", "in-try-catch"],
          "@typescript-eslint/triple-slash-reference": "error",
          
  
          // Specific rules that are enabled using @typescript-eslint, but have analogues in common eslint
          "camelcase": "off",
          "no-array-constructor": "off",
          "no-unused-vars": "off",
          "no-unused-expressions": "off",
          "no-useless-constructor": "off",
          "no-return-await": "off",
  
          // Checked by Typescript - ts(2378)
          "getter-return": "off",
          // Checked by Typescript - ts(2300)
          "no-dupe-args": "off",
          // Checked by Typescript - ts(1117)
          "no-dupe-keys": "off",
          // Checked by Typescript - ts(7027)
          "no-unreachable": "off",
          // Checked by Typescript - ts(2367)
          "valid-typeof": "off",
          // Checked by Typescript - ts(2588)
          "no-const-assign": "off",
          // Checked by Typescript - ts(2588)
          "no-new-symbol": "off",
          // Checked by Typescript - ts(2376)
          "no-this-before-super": "off",
          // This is checked by Typescript using the option `strictNullChecks`.
          "no-undef": "off",
          // This is already checked by Typescript.
          "no-dupe-class-members": "off",
          // This is already checked by Typescript.
          "no-redeclare": "off",
  
          // Checked by Typescript
          "import/no-extraneous-dependencies": "off"
        }
      }
    ],
  "settings": {
    "react": {
      "version": "detect"
    },
      "import/resolver": {
          "node": {
              "paths": ["."]
          }
      }
  }
}
