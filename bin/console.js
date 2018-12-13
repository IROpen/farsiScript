#!/usr/bin/env node

const readline = require('readline');
const FS = require('../index');
var program = require('commander');
const f2f = {};
const { exec } = require('child_process');
const { promisify } = require('util');
const readFile = promisify(require('fs').readFile);
let scriptFile = "";

process.on('unhandledRejection', up => { throw up });

program
    .version('0.2.0')
    .arguments('<file>').action(file=>(scriptFile=file))
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
FS.FSI.tasklist.set('ترمینال',async (x)=>(await exec(x)));

if (scriptFile == ""){
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
}else{
    try{
	readFile(scriptFile).then(async data=>{
	    console.log(data);
	    data = data.toString().replace(/./g,'.#').replace(/\?/g,'?#').split('#');
	    console.log(data);
	    /*for (let i = 0; i < data.length ; i++){
		console.log(data[i]);
		await FS.eval(data[i]);
	    }*/
	}).catch(e =>{throw e});
    }catch(e){
	console.log(e);
    }
}
