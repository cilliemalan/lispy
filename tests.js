const { read } = require('./lispy');
const assert = require('assert');

const tests = {
    'read parses simple number': () => assert.strictEqual(read("123"), 123),
    'read parses a number with decimal': () => assert.strictEqual(read("123.123"), 123.123),
    'read parses a number starting with decimal': () => assert.strictEqual(read(".123"), .123),
    'read parses a negative simple number': () => assert.strictEqual(read("-123"), -123),
    'read parses a positive simple number': () => assert.strictEqual(read("+123"), +123),
    'read ignores leading spaces': () => assert.strictEqual(read("  123"), 123),

    'read reads a symbol': () => assert.strictEqual(read("hello"), Symbol.for('hello')),
    'read reads a symbol with leading spaces': () => assert.strictEqual(read("  helloA"), Symbol.for('helloA')),

    'read reads a string': () => assert.strictEqual(read('"hello"'), "hello"),
    'read reads a string with escapes': () => assert.strictEqual(read('"hello\\n"'), "hello\n"),
    'read reads a string with double escapes': () => assert.strictEqual(read('"hello\\\\n"'), "hello\\n"),
    'read reads a string with escaped quotes': () => assert.strictEqual(read('"hello\\""'), "hello\""),
    'read reads a string with escaped confusion': () => assert.strictEqual(read('"he\\\\llo\\\\\\"\\""'), "he\\llo\\\"\""),

    'read reads a list with strings': () => assert.deepStrictEqual(read('("a" "b" "c")'), ["a", "b", "c"]),
    'read reads a list numbers': () => assert.deepStrictEqual(read('(1 2 3)'), [1, 2, 3]),
    'read reads a list symbols': () => assert.deepStrictEqual(read('(a b c)'), [Symbol.for('a'), Symbol.for('b'), Symbol.for('c')]),
    'read reads a list numbers and spaces': () => assert.deepStrictEqual(read('( 1 \t 2 \n 3 )'), [1, 2, 3]),
    'read reads a list numbers and more spaces': () => assert.deepStrictEqual(read(' ( 1 \t 2 \n 3 )\t'), [1, 2, 3]),
    'read reads a list with one number': () => assert.deepStrictEqual(read('(1)'), [1]),
    'read reads empty list as null': () => assert.deepStrictEqual(read('()'), null),
    'read reads empty list as null with spaces': () => assert.deepStrictEqual(read('  (  )  '), null),
    'read reads nested lists': () => assert.deepStrictEqual(read('(1 (2 3) 4)'), [1, [2, 3], 4]),
    'read reads nested lists without spaces': () => assert.deepStrictEqual(read('(1(2 3)4)'), [1, [2, 3], 4]),
    'read reads nested lists with symbols without spaces': () => assert.deepStrictEqual(read('(a(b c)d)'), [Symbol.for('a'), [Symbol.for('b'), Symbol.for('c')], Symbol.for('d')]),
    'read reads nested lists with different brackets': () => assert.deepStrictEqual(read('(1 [2 {3}] 4)'), [1, [2, [3]], 4]),
    'read expects matching brackets': () => assert.throws(() => read('(1 2 3}'), /does not correspond/),
    'read reads multi line forms': () => assert.deepStrictEqual(read('(\n1\n(2 \n 3)\n\t 4 \n)'), [1, [2, 3], 4]),

    'read supports slashes single line comments': () => assert.deepStrictEqual(read('(\n // this is a comment \n 1 (2 3) 4)'), [1, [2, 3], 4]),
    'read supports slashes multi line comments': () => assert.deepStrictEqual(read('(\n /* this \n is \n a comment */ 1 (2 3) 4)'), [1, [2, 3], 4]),
    'read supports semicolon comments': () => assert.deepStrictEqual(read('(\n ; this is a comment \n 1 (2 3) 4)'), [1, [2, 3], 4]),
    'read supports pipe comments': () => assert.deepStrictEqual(read('(\n #| this \n is \n a comment |# 1 (2 3) 4)'), [1, [2, 3], 4]),
}


Object.keys(tests).forEach(t => {
    process.stdout.write(`${t}: `);
    try {
        tests[t]();
        process.stdout.write(`OK\n`);
    } catch (e) {
        process.stdout.write(`FAIL\n`);
        if (e.message) console.error(e.message);
        else console.error(e);
    }
});