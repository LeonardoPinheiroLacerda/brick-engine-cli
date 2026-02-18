import { program } from 'commander';
import { initCommand } from './commands/init';
import chalk from 'chalk';

export function run() {
    program.name('brick-game').description('CLI to scaffold Brick Game projects').version('0.1.0');

    program
        .command('init <name>')
        .description('Initialize a new Brick Game project')
        .action(async name => {
            try {
                await initCommand(name);
            } catch (error: any) {
                console.error(chalk.red(`Error: ${error.message}`));
                process.exit(1);
            }
        });

    program.parse(process.argv);
}
