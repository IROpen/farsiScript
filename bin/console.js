#!/usr/bin/env node

const readline = require('readline');
const FS = require('../index');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

process.stdout.write('\x1b[36m>>> \x1b[0m');

rl.on('line', async (input) => {
    console.log(await FS.eval(input));
    process.stdout.write('\x1b[36m>>> \x1b[0m');
});
