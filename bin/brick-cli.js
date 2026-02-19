#!/usr/bin/env node

// Try to load the compiled index.js
let main;
try {
    main = require('../dist/index.js');
} catch (e) {
    console.error('Error: CLI not built. Please run "npm run build" in the CLI package.');
    process.exit(1);
}

main.run();
