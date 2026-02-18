#!/usr/bin/env node
const { program } = require('commander');
const path = require('path');
const fs = require('fs-extra');

// Try to load the compiled index.js
let main;
try {
    main = require('../dist/index.js');
} catch (e) {
    console.log(e)
    // If not compiled yet, try to run via ts-node or just fail gracefully
    console.error('Error: CLI not built. Please run "npm run build" in the CLI package.');
    process.exit(1);
}

main.run();
