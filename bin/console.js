#!/usr/bin/env node

const readline = require('readline');
const FS = require('../index');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', async (input) => {
    console.log(await FS.eval(input));
});
