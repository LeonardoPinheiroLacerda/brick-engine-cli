import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import inquirer from "inquirer";
import { moveTemplate } from "./template";
import { Answers } from "./types";
import packageJson from "./package/package";

export async function initCommand(projectName: string) {
  const targetDir = path.resolve(process.cwd(), projectName);
  const templateDir = path.resolve(__dirname, "../../../templates");

  // Check if directory already exists
  if (fs.existsSync(targetDir)) {
    throw new Error(`Directory ${projectName} already exists.`);
  }

  console.log(
    chalk.bold.blue("\n🧱 Brick Engine CLI") +
      chalk.gray(" - Scaffolding your next masterpiece\n"),
  );

  // Ask user if they want to use Prettier and ESLint
  const answers: Answers = await inquirer.prompt([
    {
      type: "input",
      name: "description",
      message: "How would you describe your game?",
      default: "A fantastic game built with Brick Engine",
    },
    {
      type: "confirm",
      name: "usePrettier",
      message: "Would you like to use Prettier for code formatting?",
      default: true,
    },
    {
      type: "confirm",
      name: "useESLint",
      message: "Would you like to use ESLint for linting?",
      default: true,
    },
  ]);

  try {
    console.log("");

    // Create project directory
    await fs.ensureDir(targetDir);
    console.log(
      `${chalk.green("✔")} Directory ${chalk.cyan(projectName)} created.`,
    );

    await moveTemplate(templateDir, targetDir, answers);
    console.log(`${chalk.green("✔")} Template files copied.`);

    const pkgJson = packageJson(projectName, answers);
    await fs.writeFile(
      path.join(targetDir, "package.json"),
      JSON.stringify(pkgJson, null, 2),
    );
    console.log(`${chalk.green("✔")} package.json created.`);

    console.log(
      `\n✨ ${chalk.bold.green("Success!")} Project ${chalk.cyan(
        projectName,
      )} is ready.\n`,
    );

    console.log(chalk.bold("Next steps:"));
    console.log(chalk.gray("───────────────────────────────────"));
    console.log(`  1. ${chalk.cyan(`cd ${projectName}`)}`);
    console.log(`  2. ${chalk.cyan("npm install")}`);
    console.log(`  3. ${chalk.cyan("npm start")}`);
    console.log(chalk.gray("───────────────────────────────────"));

    console.log(
      `\n🌐 Local URL (after starting): ${chalk.underline.blue(
        "http://localhost:8080",
      )}`,
    );
    console.log(
      `📖 Documentation: ${chalk.underline.gray(
        "https://github.com/LeonardoPinheiroLacerda/brick-engine",
      )}\n`,
    );
  } catch (error) {
    console.error(chalk.red("\n✖ Initialization failed."));
    throw error;
  }
}
