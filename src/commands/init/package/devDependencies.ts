import { Answers, Dependency } from "../types";

export default function devDependencies(answers: Answers): Dependency[] {
  return [
    {
      name: "prettier",
      version: "^3.1.0",
      shouldInstall: answers.usePrettier,
    },
    {
      name: "eslint",
      version: "^9.20.0",
      shouldInstall: answers.useESLint,
    },
    {
      name: "typescript-eslint",
      version: "^8.24.0",
      shouldInstall: answers.useESLint,
    },
    {
      name: "@eslint/js",
      version: "^9.20.0",
      shouldInstall: answers.useESLint,
    },
    {
      name: "globals",
      version: "^15.15.0",
      shouldInstall: answers.useESLint,
    },
    {
      name: "copy-webpack-plugin",
      version: "^13.0.1",
      shouldInstall: true,
    },
    {
      name: "css-loader",
      version: "^7.1.4",
      shouldInstall: true,
    },
    {
      name: "html-webpack-plugin",
      version: "^5.6.6",
      shouldInstall: true,
    },
    {
      name: "mini-css-extract-plugin",
      version: "^2.10.0",
      shouldInstall: true,
    },
    {
      name: "ts-loader",
      version: "^9.5.4",
      shouldInstall: true,
    },
    {
      name: "typescript",
      version: "^5.9.3",
      shouldInstall: true,
    },
    {
      name: "webpack",
      version: "^5.105.2",
      shouldInstall: true,
    },
    {
      name: "webpack-cli",
      version: "^6.0.1",
      shouldInstall: true,
    },
    {
      name: "webpack-dev-server",
      version: "^5.2.3",
      shouldInstall: true,
    },
  ];
}
