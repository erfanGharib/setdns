// import fs from "fs-extra";
// import { spawn } from "child_process";
// import path from "path";
// import { __dirname } from './dist/global.js'
const path = require('path');
const fs = require('fs-extra');
const { spawn } = require('child_process');

// run package.json scripts faster
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('package.json not found in the current directory.');
  process.exit(1);
}
try {
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  const json = JSON.parse(packageJsonContent);
  if (json.scripts) {
    const scriptName = process.argv[2];
    if (json.scripts[scriptName]) {
      const scriptCommand = json.scripts[scriptName];
      const scriptArgs = process.argv.slice(3); // Extract script arguments
      const child = spawn(scriptCommand, scriptArgs, { stdio: 'inherit', shell: true });
      child.on('exit', (code) => {
        if (code !== 0) {
          process.exit(1);
        }
      });
    }
    else {
      console.error(`Script '${scriptName}' not found in package.json`);
      process.exit(1);
    }
  }
  else {
    console.error("No 'scripts' section found in package.json");
    process.exit(1);
  }
} catch (err) {
   console.error('Error reading or parsing package.json:', err.message);
   process.exit(1);
}