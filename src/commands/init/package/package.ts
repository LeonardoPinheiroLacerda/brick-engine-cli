import { Answers } from "../types";
import devDependencies from "./devDependencies";
import scripts from "./scripts";

export default function packageJson(name: string, answers: Answers) {
  return {
    name,
    description: answers.description,
    version: "1.0.0",
    type: "module",
    main: "index.js",
    keywords: [],
    author: "",
    license: "ISC",
    scripts: scripts(answers).reduce(
      (acc, s) => {
        if (s.shouldInstall) {
          acc[s.name] = s.command;
        }
        return acc;
      },
      {} as Record<string, string>,
    ),
    devDependencies: devDependencies(answers).reduce(
      (acc, d) => {
        if (d.shouldInstall) {
          acc[d.name] = d.version;
        }
        return acc;
      },
      {} as Record<string, string>,
    ),
    overrides: {
      ajv: "^8.18.0",
      minimatch: "^10.2.1",
    },
  };
}
