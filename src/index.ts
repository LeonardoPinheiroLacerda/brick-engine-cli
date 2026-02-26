import { program } from "commander";
import { initCommand } from "./commands/init";
import { publishCommand } from "./commands/publish";
import chalk from "chalk";
import { readFileSync } from "fs";

export function run() {
  program
    .name("brick-engine-cli")
    .description("CLI to scaffold Brick Engine projects")
    .version("1.0.8");

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
