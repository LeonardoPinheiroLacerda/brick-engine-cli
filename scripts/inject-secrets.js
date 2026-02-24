import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src/config/constants.ts");
let content = fs.readFileSync(filePath, "utf8");

const secrets = {
  "%%SUPABASE_URL%%": process.env.SUPABASE_URL,
  "%%SUPABASE_ANON_KEY%%": process.env.SUPABASE_ANON_KEY,
};

let replaced = false;
for (const [placeholder, value] of Object.entries(secrets)) {
  if (value) {
    console.log(`Injecting value for ${placeholder}...`);
    content = content.replace(placeholder, value);
    replaced = true;
  } else {
    console.warn(
      `Warning: No value found for ${placeholder}. Skipping injection.`,
    );
  }
}

if (replaced) {
  fs.writeFileSync(filePath, content);
  console.log("Secrets injected successfully.");
} else {
  console.log("No secrets were injected.");
}
