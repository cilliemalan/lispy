#!node

const { isArray, isNumber, isBoolean, isString, isSymbol, isNull, isFunction } = require('util');
const { readFileSync } = require('fs');
const { evaluate } = require('./evaluate');
const { readInternal, Pair } = require('./reader');
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

const environmentLookup = (symbol) => prelude[symbol];

const evaluate = (program) => evaluate(program, environmentLookup);

const runCommand = (command) => {
    for (var ix = 0; ix < command.length;) {
        const [program, advance] = readInternal(command, ix);
        ix += advance;
        if (program !== undefined) {
            evaluate(program);
        } else {
            return;
        }
    }
}

const runFile = (file) => runCommand(readFileSync(file));






if (args.length == 0) {
    printUsage();
    process.exit(1);
} else {
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '-c') {
            i++;
            if (i >= args.length) {
                throw "did not specify command to run";
            } else {
                runCommand(args[i]);
            }
        } else {
            runFile(args[i]);
        }
    }
}


module.exports = { evaluate };