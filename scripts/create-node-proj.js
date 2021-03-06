#!/usr/bin/env node

const { execSync } = require("child_process");
const https = require("https");
const fs = require("fs");
const path = require("path");

if (process.argv.length < 3) {
  console.error(`Project name must be provided`);
  process.exit(1);
}

const projectName = process.argv[2];
const projectPath = path.join(process.cwd(), projectName);

main();

async function main() {
  try {
    fs.mkdirSync(projectPath);
  } catch (e) {
    if (e.code !== "EEXIST") throw e;

    const stat = fs.statSync(projectPath);
    if (!stat.isDirectory()) {
      console.error(
        `Error: cannot create project dir. ${projectPath} already exists.`
      );
      process.exit(1);
    }

    const files = fs.readdirSync(projectPath);
    if (files.length !== 0) {
      console.error(`Error: dir at ${projectPath} is not empty.`);
      process.exit(1);
    }
  }

  process.chdir(projectPath);

  // TODO: install yarn if not installed
  execSync(`yarn init -y`);
  execSync(`yarn add dotenv`);
  execSync(`yarn add eslint prettier --dev`);

  execSync(`echo node_modules > .gitignore`);
  execSync(`echo .env >> .gitignore`);

  execSync(`mkdir .vscode`);
  const vscodeLaunchConfPath = `https://gist.githubusercontent.com/ackinc/af49e11baffbc581caf9c52ae7bd131d/raw/35d37352b549e04ab7ad3e940c7cc831b6260fa1/vscode-launch.json`;
  await downloadFile(
    vscodeLaunchConfPath,
    path.join(projectPath, ".vscode/launch.conf")
  );

  const eslintConfPath = `https://gist.githubusercontent.com/ackinc/088d2a8f431fa2b65241bda0384862db/raw/f8248774a9dba435f3a4a1ccfbb0c2d0cc06c20a/eslintrc`;
  await downloadFile(eslintConfPath, path.join(projectPath, ".eslintrc.js"));

  execSync(`echo "require('dotenv').config();" > index.js`);

  execSync(`git init`);
  execSync(`git add .`);
  execSync(`git commit -m "Initial commit"`);
}

function downloadFile(url, savepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error("Failed to retrieve eslint conf"));
      }

      const writestream = fs.createWriteStream(savepath);
      writestream.on("close", resolve);

      res.on("aborted", () =>
        reject(new Error("Failed to retrieve eslint conf"))
      );
      res.pipe(writestream);
    });
  });
}

process.on("unhandledRejection", (e) => {
  fs.rmdirSync(projectPath, { recursive: true });
  console.error(`\n\nFailed to create node project ${projectName}`);
  console.error(e.stack);
  process.exit(1);
});
