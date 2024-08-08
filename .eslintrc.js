/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["config-eslint/index.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
};
