import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import inquirer from "inquirer";

export async function initCommand(projectName: string) {
  const targetDir = path.resolve(process.cwd(), projectName);
  const templateDir = path.resolve(__dirname, "../../templates");

  if (fs.existsSync(targetDir)) {
    throw new Error(`Directory ${projectName} already exists.`);
  }

  const answers = await inquirer.prompt([
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
  await fs.copy(templateDir, targetDir, {
    filter: (src) => {
      const basename = path.basename(src);
      if (basename === ".prettierrc" && !answers.usePrettier) return false;
      if (basename === "eslint.config.mjs" && !answers.useESLint) return false;
      return true;
    },
  });

  // Update package.json
  const pkgPath = path.join(targetDir, "package.json");
  if (await fs.pathExists(pkgPath)) {
    const pkg = await fs.readJson(pkgPath);
    pkg.name = projectName;
    pkg.version = "1.0.0";
    delete pkg.private;

    // Add optional dependencies
    if (answers.usePrettier) {
      pkg.devDependencies = {
        ...pkg.devDependencies,
        prettier: "^3.1.0",
      };
      pkg.scripts = {
        ...pkg.scripts,
        format: 'prettier --write "src/**/*.ts"',
      };
    }

    if (answers.useESLint) {
      pkg.devDependencies = {
        ...pkg.devDependencies,
        eslint: "^9.20.0",
        "typescript-eslint": "^8.24.0",
        "@eslint/js": "^9.20.0",
        globals: "^15.15.0",
      };
      pkg.scripts = {
        ...pkg.scripts,
        lint: 'eslint "src/**/*.ts"',
      };
      // Force safe ajv version to resolve audit warnings
      pkg.overrides = {
        ajv: "^8.18.0",
      };
    }

    await fs.writeJson(pkgPath, pkg, { spaces: 2 });
  }

  console.log(chalk.green(`\nSuccess! Created ${projectName} at ${targetDir}`));
  console.log("\nNext steps:");
  console.log(chalk.cyan(`  cd ${projectName}`));
  console.log(chalk.cyan("  npm install"));
  if (answers.useESLint) console.log(chalk.cyan("  npm run lint"));
  console.log(chalk.cyan("  npm start"));
}
