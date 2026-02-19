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

  // Ask user if they want to use Prettier and ESLint
  const answers: Answers = await inquirer.prompt([
    {
      type: "input",
      name: "description",
      message: "How would you describe your game?",
      default: "",
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

  console.log(
    chalk.blue(`\nInitializing new Brick Game project: ${projectName}...`),
  );

  // Create project directory
  await fs.ensureDir(targetDir);

  // Copy template files (excluding optional configs for now)
  console.log(chalk.gray("Copying template files..."));
  await moveTemplate(templateDir, targetDir, answers);

  // Update package.json
  console.log(chalk.gray("Creating package.json..."));
  const pkgJson = packageJson(projectName, answers);

  console.log(chalk.gray("Writing package.json..."));
  await fs.writeFile(
    path.join(targetDir, "package.json"),
    JSON.stringify(pkgJson, null, 2),
  );

  console.log(chalk.green(`\nProject created at ${targetDir}`));

  console.log("\nNext steps:");
  console.log(chalk.cyan(`  cd ${projectName}`));
  console.log(chalk.cyan("  npm install"));
  console.log(chalk.cyan("  npm start"));

  console.log(chalk.white("\nAnd it'll be running at http://localhost:8080"));

  console.log(
    chalk.white(
      "\nGame API documentation at: https://github.com/LeonardoPinheiroLacerda/brick-engine",
    ),
  );
}
