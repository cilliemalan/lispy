const { read } = require('./lispy');
const assert = require('assert');

assert.jsonEqual = (a, b) => assert.strictEqual(JSON.stringify(a), JSON.stringify(b));

const tests = {
    'read parses simple number': () => assert.strictEqual(read("123"), 123),
    'read parses a number with decimal': () => assert.strictEqual(read("123.123"), 123.123),
    'read parses a number starting with decimal': () => assert.strictEqual(read(".123"), .123),
    'read parses a negative simple number': () => assert.strictEqual(read("-123"), -123),
    'read parses a positive simple number': () => assert.strictEqual(read("+123"), +123),
    'read ignores leading spaces': () => assert.strictEqual(read("  123"), 123),

    'read reads a symbol': () => assert.strictEqual(read("hello"), Symbol.for('hello')),
    'read reads a symbol with leading spaces': () => assert.strictEqual(read("  helloA"), Symbol.for(' helloA')),
}


Object.keys(tests).forEach(t => {
    process.stdout.write(`${t}: `);
    try {
        tests[t]();
        process.stdout.write(`OK\n`);
    } catch (e) {
        process.stdout.write(`FAIL\n`);
        if(e.message) console.error(e.message);
        else console.error(e);
    }
});