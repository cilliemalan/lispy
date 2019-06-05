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
}


Object.keys(tests).forEach(t => {
    process.stdout.write(`${t}: `);
    try {
        tests[t]();
        process.stdout.write(`OK\n`);
    } catch (e) {
        process.stdout.write(`FAIL\n`);
        console.error(e);
    }
});