import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import inquirer from "inquirer";
import { execSync } from "child_process";

export async function publishCommand(options: { url?: string; key?: string }) {
  const currentDir = process.cwd();
  const pkgPath = path.join(currentDir, "package.json");
  const bundlePath = path.join(currentDir, "dist", "game.bundle.js");

  console.log(
    chalk.bold.blue("\n🧱 Brick Engine CLI") +
      chalk.gray(" - Publishing your masterpiece\n"),
  );

  if (!fs.existsSync(pkgPath)) {
    console.error(
      chalk.red(
        "✖ Error: No package.json found. Are you in a Brick Engine project directory?",
      ),
    );
    process.exit(1);
  }

  // The bundle path will be checked after the build step now

  // Resolve Supabase URL and Key
  let supabaseUrl = options.url || process.env.SUPABASE_URL;
  let supabaseAnonKey = options.key || process.env.SUPABASE_ANON_KEY;

  const prompts = [];
  if (!supabaseUrl) {
    prompts.push({
      type: "input",
      name: "supabaseUrl",
      message: "Enter your Supabase Project URL:",
      validate: (input: string) =>
        input.length > 0 ? true : "Supabase URL is required.",
    });
  }

  if (!supabaseAnonKey) {
    prompts.push({
      type: "password",
      name: "supabaseAnonKey",
      message: "Enter your Supabase Anon Key:",
      validate: (input: string) =>
        input.length > 0 ? true : "Supabase Anon Key is required.",
    });
  }

  prompts.push({
    type: "input",
    name: "gameName",
    message: "Enter your game name:",
  });

  prompts.push({
    type: "input",
    name: "developerEmail",
    message:
      "Enter your developer email (to receive approval/rejection reasons):",
  });

  const pkg = await fs.readJson(pkgPath);
  const gameId = pkg.name;
  const version = pkg.version;

  prompts.push({
    type: "confirm",
    name: "confirmPublish",
    message: `Ready to publish ${chalk.cyan(gameId)} v${version}?`,
    default: true,
  });

  const answers = await inquirer.prompt(prompts);
  const gameName = answers.gameName;

  if (!answers.confirmPublish) {
    console.log(chalk.yellow("\nPublishing cancelled."));
    return;
  }

  supabaseUrl = supabaseUrl || answers.supabaseUrl;
  supabaseAnonKey = supabaseAnonKey || answers.supabaseAnonKey;
  const developerEmail = pkg.author || answers.developerEmail;

  console.log("");
  console.log(
    `${chalk.green("✔")} Preparing to publish ${chalk.cyan(gameName)} v${version}...`,
  );

  const formData = new FormData();
  formData.append("game_id", gameId);
  formData.append("game_name", gameName);
  formData.append("version", version);
  if (developerEmail) {
    formData.append("developer_email", developerEmail);
  }

  console.log(chalk.gray("\n  Running build script..."));
  try {
    execSync("rm -rf dist && npm run build:bundle", {
      stdio: "inherit",
      cwd: currentDir,
    });
    console.log(`${chalk.green("✔")} Build completed successfully.\n`);
  } catch (error) {
    console.error(
      chalk.red(
        "\n✖ Error: Build failed. Please fix the errors in your project before publishing.",
      ),
    );
    process.exit(1);
  }

  if (!fs.existsSync(bundlePath)) {
    console.error(
      chalk.red(
        "✖ Error: Game bundle not found. The build script did not generate 'dist/game.bundle.js'.",
      ),
    );
    process.exit(1);
  }

  const bundleBuffer = await fs.readFile(bundlePath);
  const bundleBlob = new Blob([bundleBuffer], {
    type: "application/javascript",
  });
  formData.append("bundle", bundleBlob, "game.bundle.js");

  const endpoint = `${supabaseUrl}/functions/v1/publish`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorText;
      } catch (e) {
        // use raw text
      }
      throw new Error(
        `Failed to publish: ${response.status} ${response.statusText}\n${errorMessage}`,
      );
    }

    const result = await response.json();
    console.log(`${chalk.green("✔")} Bundle uploaded securely.`);

    console.log(`\n✨ ${chalk.bold.green("Success!")} ${result.message}\n`);

    if (result.request && result.request.id) {
      console.log(chalk.bold("Publish Details:"));
      console.log(chalk.gray("───────────────────────────────────"));
      console.log(`  Request ID: ${chalk.cyan(result.request.id)}`);
      console.log(`  Game ID: ${chalk.cyan(gameId)}`);
      console.log(`  Game Name: ${chalk.cyan(gameName)}`);
      console.log(`  Version: ${chalk.cyan(version)}`);
      console.log(`  Bundle: ${chalk.cyan(result.request.bundle_url)}`);
      console.log(`  Status: ${chalk.yellow("Under Review")}`);
      console.log(chalk.gray("───────────────────────────────────\n"));

      console.log(chalk.blue("ℹ️ Your game is now under review."));
      if (developerEmail) {
        console.log(
          chalk.blue(
            `An email will be sent to ${chalk.bold(
              developerEmail,
            )} informing if it was approved or rejected (with reasons).`,
          ),
        );
      }
    }
  } catch (error: any) {
    console.error(chalk.red(`\n✖ Publish failed: ${error.message}`));
    process.exit(1);
  }
}
