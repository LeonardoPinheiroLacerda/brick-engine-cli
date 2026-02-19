import { program } from "commander";
import { initCommand } from "./commands/init";
import chalk from "chalk";

export function run() {
  program
    .name("brick-engine-cli")
    .description("CLI to scaffold Brick Engine projects")
    .version("1.0.0");

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

  program.parse(process.argv);
}
