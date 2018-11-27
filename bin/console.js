#!/usr/bin/env node

const readline = require('readline');
const FS = require('../index');
try{
    const nof = require('notify-send');
    FS.FSI.tasklist.set('چاپ',x => nof.notify('فارسی اسکریپت',x));
}catch(e){
    console.log('notify-send is not supported');
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

process.stdout.write('\x1b[36m>>> \x1b[0m');

rl.on('line', async (input) => {
    console.log(await FS.eval(input));
    process.stdout.write('\x1b[36m>>> \x1b[0m');
});
