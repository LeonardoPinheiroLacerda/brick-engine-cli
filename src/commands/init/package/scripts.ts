import { Answers, Scripts } from "../types";

export default function scripts(answers: Answers): Scripts[] {
  return [
    {
      name: "format",
      command: 'prettier --write "src/**/*.ts"',
      shouldInstall: answers.usePrettier,
    },
    {
      name: "lint",
      command: 'eslint "src/**/*.ts"',
      shouldInstall: answers.useESLint,
    },
    {
      name: "build:bundle",
      command: "webpack --mode production --env bundle=bundle",
      shouldInstall: true,
    },
    {
      name: "build:standalone",
      command: "webpack --mode production --env bundle=standalone",
      shouldInstall: true,
    },
    {
      name: "start",
      command: "webpack serve --open --env bundle=standalone",
      shouldInstall: true,
    },
    {
      name: "serve",
      command: "npx http-server ./dist --cors",
      shouldInstall: true,
    },
  ];
}
