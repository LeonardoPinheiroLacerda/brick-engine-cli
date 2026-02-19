import * as fs from "fs-extra";
import * as path from "path";
import { Answers } from "./types";

type Options = {
  [fileName: string]: boolean;
};

export async function moveTemplate(
  templateDir: string,
  targetDir: string,
  answers: Answers,
) {
  const options: Options = {
    ".prettierrc": answers.usePrettier,
    "eslint.config.mjs": answers.useESLint,
  };

  await fs.copy(templateDir, targetDir, {
    filter: (src) => {
      const basename = path.basename(src);

      // If the file is specifically disabled in options, don't copy it
      if (options[basename] === false) {
        return false;
      }

      // Otherwise, return true (copy)
      return true;
    },
  });
}
