import { program } from "commander";
import { initCommand } from "./commands/init";
import { publishCommand } from "./commands/publish";
import chalk from "chalk";
import { readFileSync } from "fs";
import path from "path";

export function run() {
  const pkg = JSON.parse(
    readFileSync(path.join(__dirname, "../package.json"), "utf-8"),
  );

  program
    .name("brick-engine-cli")
    .description("CLI to scaffold Brick Engine projects")
    .version(pkg.version);

  program
    .command("init <name>")
    .description("Initialize a new Brick Engine project")
    .action(async (name) => {
      try {
        await initCommand(name);
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  program
    .command("publish")
    .description("Publish your game to the Brick Engine Artifactory")
    .option("-u, --url <url>", "Supabase URL")
    .option("-k, --key <key>", "Supabase Anon Key")
    .action(async (options) => {
      try {
        await publishCommand(options);
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  program.parse(process.argv);
}
