#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

if (process.argv.length < 3) {
  console.error(`Project name must be provided`);
  process.exit(1);
}

const projectName = process.argv[2];
const projectPath = path.join(process.cwd(), projectName);

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
