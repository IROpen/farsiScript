#!/usr/bin/env node

const readline = require('readline');
const FS = require('../index');
var program = require('commander');
const f2f = {};
const { exec } = require('child_process');

program
  .version('0.2.0')
  .option('-f, --fingilish', 'use finglish instead of farsi')
  .parse(process.argv);

if (program.fingilish){
    f2f.fa2fi = require('fingilish').jomle;
}

try{
    const nof = require('notify-send');
    FS.FSI.tasklist.set('چاپ',x => nof.notify('فارسی اسکریپت',x));
}catch(e){
    console.log('notify-send is not supported');
}

FS.FSI.tasklist.set('بیپ-بیپ',async ()=>(await exec('spd-say "beep beep"')));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

process.stdout.write('\x1b[36m>>> \x1b[0m');

const while1 = async (input) => {
    if (program.fingilish){
	input = f2f.fa2fi(input);
    }
    console.log(await FS.eval(input));
    rl.question('\x1b[36m>>> \x1b[0m',while1);
};

rl.question('\x1b[36m>>> \x1b[0m',while1);

