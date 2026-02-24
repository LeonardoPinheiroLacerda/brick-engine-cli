import { Answers, Dependency } from "../types";

export default function devDependencies(answers: Answers): Dependency[] {
  return [
    {
      name: "brick-engine-js",
      version: "latest",
      shouldInstall: true,
    },
  ];
}
