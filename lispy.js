#!/usr/bin/env node

const { readFileSync } = require('fs');
const { evaluate } = require('./evaluate');
const { read } = require('./reader');
const { createPrelude } = require('./prelude');


const args = process.argv.slice(2);

const printUsage = () => {
    console.log(`Lispy v0.1-alpha
Usage:

    Run a script:  lispy file.S

    Run a program: lispy -c '(print "hello world")'
    `);
}

const prelude = createPrelude(evaluate);

const run = (source) => {
    for (var ix = 0; ix < source.length;) {
        const [program, advance] = read(source, ix);
        ix += advance;
        let result;
        if (program !== undefined) {
            result = evaluate(program, prelude);
        } else {
            return result;
        }
    }
}

const runFile = (file) => run(readFileSync(file).toString());

if (require.main === module) {
    if (args.length == 0) {
        printUsage();
        process.exit(1);
    } else {
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg === '-c') {
                i++;
                if (i >= args.length) {
                    throw "did not specify command to run. -c must be followed by a command";
                } else {
                    runCommand(args[i]);
                }
            } else {
                runFile(args[i]);
            }
        }
    }
}


module.exports = { run, runFile };
